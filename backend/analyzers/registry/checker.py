"""Registry analyzer — checks whether a package exists in PyPI or npm.

Uses a module-level shared httpx.AsyncClient (connection pool reuse) and
a short TTL in-memory cache so repeated lookups of the same package are free.
"""
from __future__ import annotations
import logging
import time
from datetime import datetime
from typing import Optional
import httpx
from ...schemas import RegistryResult
from ...config import get_settings

settings = get_settings()
logger = logging.getLogger("depphantom.registry")

PYPI_BASE = "https://pypi.org/pypi/{name}/json"
NPM_BASE  = "https://registry.npmjs.org/{name}"

# ── Shared connection pool (reused across requests) ──────────────────────────
_TIMEOUT = httpx.Timeout(connect=3.0, read=6.0, write=3.0, pool=1.0)
_LIMITS  = httpx.Limits(max_keepalive_connections=20, max_connections=40)
_client: Optional[httpx.AsyncClient] = None

def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(timeout=_TIMEOUT, limits=_LIMITS, http2=False)
    return _client


# ── Simple TTL cache (avoid re-hitting registry for same package) ─────────────
_cache: dict[str, tuple[RegistryResult, float]] = {}
_CACHE_TTL = 120  # seconds

def _cache_key(package: str, ecosystem: str) -> str:
    return f"{ecosystem}:{package.lower()}"

def _cache_get(key: str) -> Optional[RegistryResult]:
    entry = _cache.get(key)
    if entry and (time.monotonic() - entry[1]) < _CACHE_TTL:
        return entry[0]
    return None

def _cache_set(key: str, result: RegistryResult) -> None:
    _cache[key] = (result, time.monotonic())
    # Evict old entries if cache grows large
    if len(_cache) > 500:
        cutoff = time.monotonic() - _CACHE_TTL
        expired = [k for k, (_, ts) in _cache.items() if ts < cutoff]
        for k in expired:
            _cache.pop(k, None)


async def check_pypi(package: str, version: Optional[str]) -> RegistryResult:
    client = _get_client()
    url = PYPI_BASE.format(name=package)
    try:
        resp = await client.get(url)
        if resp.status_code == 404:
            logger.info("PyPI: '%s' not found (404)", package)
            return RegistryResult(exists=False)
        if resp.status_code != 200:
            logger.warning("PyPI: status %d for '%s'", resp.status_code, package)
            return RegistryResult(exists=False, registry_error=True)

        data = resp.json()
        info = data.get("info", {})
        releases = data.get("releases", {})
        versions = list(releases.keys())

        # First published date from earliest release
        published_at = None
        for ver in sorted(versions):
            for f in releases.get(ver, []):
                ts = f.get("upload_time_iso_8601") or f.get("upload_time")
                if ts:
                    try:
                        published_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                        break
                    except Exception:
                        pass
            if published_at:
                break

        maintainers = [info["author"]] if info.get("author") else []

        # Download stats — fire separately, don't block on failure
        download_count = None
        try:
            stats_url = f"https://pypistats.org/api/packages/{package.lower()}/recent"
            stats_resp = await client.get(stats_url, timeout=httpx.Timeout(3.0))
            if stats_resp.status_code == 200:
                download_count = stats_resp.json().get("data", {}).get("last_month")
        except Exception:
            pass

        logger.info("PyPI: '%s' found, v=%s", package, info.get("version"))
        return RegistryResult(
            exists=True,
            registry_url=f"https://pypi.org/project/{package}/",
            latest_version=info.get("version"),
            all_versions=versions,
            published_at=published_at,
            publisher=info.get("author") or info.get("maintainer"),
            maintainers=maintainers,
            description=info.get("summary"),
            homepage=info.get("home_page") or info.get("project_url"),
            license=info.get("license"),
            download_count=download_count,
        )

    except (httpx.TimeoutException, httpx.ConnectError, httpx.RemoteProtocolError) as exc:
        logger.warning("PyPI: network error for '%s': %s", package, exc)
        return RegistryResult(exists=False, registry_error=True)
    except Exception as exc:
        logger.warning("PyPI: unexpected error for '%s': %s", package, exc)
        return RegistryResult(exists=False, registry_error=True)


async def check_npm(package: str, version: Optional[str]) -> RegistryResult:
    client = _get_client()
    url = NPM_BASE.format(name=package)
    try:
        resp = await client.get(url)
        if resp.status_code == 404:
            logger.info("npm: '%s' not found (404)", package)
            return RegistryResult(exists=False)
        if resp.status_code != 200:
            logger.warning("npm: status %d for '%s'", resp.status_code, package)
            return RegistryResult(exists=False, registry_error=True)

        data = resp.json()
        versions = list(data.get("versions", {}).keys())
        time_data = data.get("time", {})
        published_at = None
        created_str = time_data.get("created")
        if created_str:
            try:
                published_at = datetime.fromisoformat(created_str.replace("Z", "+00:00"))
            except Exception:
                pass

        latest = data.get("dist-tags", {}).get("latest")
        maintainers_raw = data.get("maintainers", [])
        maintainers = [
            m.get("name", "") if isinstance(m, dict) else str(m)
            for m in maintainers_raw
        ]
        latest_info = data.get("versions", {}).get(latest, {})
        description = latest_info.get("description") or data.get("description")
        lic = latest_info.get("license")

        logger.info("npm: '%s' found, latest=%s", package, latest)
        return RegistryResult(
            exists=True,
            registry_url=f"https://www.npmjs.com/package/{package}",
            latest_version=latest,
            all_versions=versions,
            published_at=published_at,
            publisher=maintainers[0] if maintainers else None,
            maintainers=maintainers,
            description=description,
            homepage=latest_info.get("homepage"),
            license=str(lic) if lic else None,
        )

    except (httpx.TimeoutException, httpx.ConnectError, httpx.RemoteProtocolError) as exc:
        logger.warning("npm: network error for '%s': %s", package, exc)
        return RegistryResult(exists=False, registry_error=True)
    except Exception as exc:
        logger.warning("npm: unexpected error for '%s': %s", package, exc)
        return RegistryResult(exists=False, registry_error=True)


async def check_registry(
    package: str, ecosystem: str, version: Optional[str] = None
) -> RegistryResult:
    eco = ecosystem.lower()
    key = _cache_key(package, eco)

    # Cache hit — return immediately
    cached = _cache_get(key)
    if cached is not None:
        logger.debug("Registry cache hit: %s", key)
        return cached

    if eco == "pypi":
        result = await check_pypi(package, version)
    elif eco == "npm":
        result = await check_npm(package, version)
    else:
        logger.warning("Unsupported ecosystem '%s'", ecosystem)
        result = RegistryResult(exists=False, registry_error=True)

    # Only cache successful (non-error) results
    if not result.registry_error:
        _cache_set(key, result)
    return result
