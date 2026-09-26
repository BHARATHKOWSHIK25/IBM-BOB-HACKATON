"""Registry analyzer — checks whether a package exists in PyPI or npm."""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from typing import Optional
import httpx
from ...schemas import RegistryResult
from ...config import get_settings

settings = get_settings()

PYPI_BASE = "https://pypi.org/pypi/{name}/json"
NPM_BASE = "https://registry.npmjs.org/{name}"


async def check_pypi(package: str, version: Optional[str]) -> RegistryResult:
    url = PYPI_BASE.format(name=package)
    try:
        async with httpx.AsyncClient(timeout=settings.registry_timeout) as client:
            resp = await client.get(url)
            if resp.status_code == 404:
                return RegistryResult(exists=False)
            if resp.status_code != 200:
                return RegistryResult(exists=False)
            data = resp.json()
            info = data.get("info", {})
            releases = data.get("releases", {})
            versions = list(releases.keys())

            # Find published date from earliest release
            published_at = None
            for ver in sorted(versions):
                files = releases.get(ver, [])
                for f in files:
                    upload_time = f.get("upload_time_iso_8601") or f.get("upload_time")
                    if upload_time:
                        try:
                            published_at = datetime.fromisoformat(
                                upload_time.replace("Z", "+00:00")
                            )
                            break
                        except Exception:
                            pass
                if published_at:
                    break

            maintainers = []
            if info.get("author"):
                maintainers.append(info["author"])

            # Download stats not directly in JSON API, use bigquery proxy
            download_count = None
            try:
                stats_url = f"https://pypistats.org/api/packages/{package.lower()}/recent"
                stats_resp = await client.get(stats_url, timeout=5.0)
                if stats_resp.status_code == 200:
                    stats_data = stats_resp.json()
                    download_count = stats_data.get("data", {}).get("last_month")
            except Exception:
                pass

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
    except httpx.TimeoutException:
        return RegistryResult(exists=False)
    except Exception:
        return RegistryResult(exists=False)


async def check_npm(package: str, version: Optional[str]) -> RegistryResult:
    url = NPM_BASE.format(name=package)
    try:
        async with httpx.AsyncClient(timeout=settings.registry_timeout) as client:
            resp = await client.get(url)
            if resp.status_code == 404:
                return RegistryResult(exists=False)
            if resp.status_code != 200:
                return RegistryResult(exists=False)
            data = resp.json()

            versions = list(data.get("versions", {}).keys())
            time_data = data.get("time", {})
            created_str = time_data.get("created")
            published_at = None
            if created_str:
                try:
                    published_at = datetime.fromisoformat(
                        created_str.replace("Z", "+00:00")
                    )
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
            homepage = latest_info.get("homepage")
            lic = latest_info.get("license")

            return RegistryResult(
                exists=True,
                registry_url=f"https://www.npmjs.com/package/{package}",
                latest_version=latest,
                all_versions=versions,
                published_at=published_at,
                publisher=maintainers[0] if maintainers else None,
                maintainers=maintainers,
                description=description,
                homepage=homepage,
                license=str(lic) if lic else None,
            )
    except httpx.TimeoutException:
        return RegistryResult(exists=False)
    except Exception:
        return RegistryResult(exists=False)


async def check_registry(
    package: str, ecosystem: str, version: Optional[str] = None
) -> RegistryResult:
    eco = ecosystem.lower()
    if eco == "pypi":
        return await check_pypi(package, version)
    elif eco == "npm":
        return await check_npm(package, version)
    return RegistryResult(exists=False)
