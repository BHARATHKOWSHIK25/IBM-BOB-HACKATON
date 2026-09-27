"""Static installation-script risk analyzer.

Fetches package source metadata (setup.py, package.json scripts, etc.)
and performs pattern-based static analysis WITHOUT executing the package.
"""
from __future__ import annotations
import re
import asyncio
from typing import List, Optional
import httpx
from ...schemas import ScriptRiskResult, SignalResult

# Danger patterns for static script analysis
DANGER_PATTERNS = [
    (r"subprocess", "Shell subprocess execution detected"),
    (r"os\.system\s*\(", "os.system() shell execution"),
    (r"os\.popen\s*\(", "os.popen() shell execution"),
    (r"exec\s*\(", "Dynamic exec() call detected"),
    (r"eval\s*\(", "Dynamic eval() call detected"),
    (r"__import__\s*\(", "Dynamic import detected"),
    (r"urllib|httplib|http\.client|requests\.get|requests\.post|fetch\s*\(|axios|wget|curl",
     "Network access during installation"),
    (r"socket\s*\.", "Raw socket usage"),
    (r"base64\.b64decode|base64\.decodebytes|atob\s*\(",
     "Base64 decoding (possible obfuscation)"),
    (r"\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}", "Hex/unicode escapes (possible obfuscation)"),
    (r"open\s*\([^)]*['\"][wa]['\"]", "File write operation"),
    (r"shutil\.(copy|move|rmtree|copytree)", "File system manipulation (shutil)"),
    (r"os\.(remove|unlink|rmdir|makedirs|rename|chmod|chown)", "File system manipulation (os)"),
    (r"HOME|AWS_|SECRET|PASSWORD|TOKEN|API_KEY|GITHUB_|CREDENTIALS",
     "Credential or secret environment variable access"),
    (r"ssh|\.ssh|id_rsa|id_ed25519", "SSH key access pattern"),
    (r"\.env|dotenv", "Environment file access"),
    (r"pickle\.loads|marshal\.loads|yaml\.load\s*\(", "Unsafe deserialization"),
    (r"ctypes|cffi|struct\.unpack", "Native/binary access"),
    (r"multiprocessing|threading\.Thread", "Thread/process spawning"),
    (r"pty\.|pexpect\.", "Pseudo-terminal access"),
]

WARNING_PATTERNS = [
    (r"import\s+platform|sys\.platform", "Platform detection"),
    (r"sys\.argv", "Command-line argument access"),
    (r"os\.environ", "Environment variable access"),
    (r"tempfile\.", "Temporary file creation"),
    (r"glob\.|fnmatch\.", "Filesystem glob patterns"),
]


async def _fetch_pypi_setup(package: str) -> Optional[str]:
    """Try to fetch setup.py or pyproject.toml from PyPI."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(f"https://pypi.org/pypi/{package}/json")
            if resp.status_code != 200:
                return None
            data = resp.json()
            # Look for source distribution
            releases = data.get("releases", {})
            latest = data.get("info", {}).get("version")
            if latest and latest in releases:
                for f in releases[latest]:
                    if f.get("packagetype") in ("sdist",):
                        return f"[sdist available: {f.get('filename', '')}]"
            # Fallback: check project URLs
            urls = data.get("info", {}).get("project_urls") or {}
            return str(urls)
    except Exception:
        return None


async def _fetch_npm_scripts(package: str) -> Optional[str]:
    """Fetch npm package.json scripts field."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(f"https://registry.npmjs.org/{package}")
            if resp.status_code != 200:
                return None
            data = resp.json()
            latest = data.get("dist-tags", {}).get("latest")
            if latest:
                pkg_json = data.get("versions", {}).get(latest, {})
                scripts = pkg_json.get("scripts", {})
                return str(scripts)
    except Exception:
        return None


def _scan_text(text: str) -> List[SignalResult]:
    signals: List[SignalResult] = []
    for pattern, description in DANGER_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            signals.append(SignalResult(
                name="script_danger",
                status="DANGER",
                value=pattern,
                description=description,
            ))
    for pattern, description in WARNING_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            signals.append(SignalResult(
                name="script_warning",
                status="WARNING",
                value=pattern,
                description=description,
            ))
    return signals


async def analyze_scripts(package: str, ecosystem: str) -> ScriptRiskResult:
    eco = ecosystem.lower()
    text: Optional[str] = None

    if eco == "pypi":
        text = await _fetch_pypi_setup(package)
    elif eco == "npm":
        text = await _fetch_npm_scripts(package)

    if not text:
        return ScriptRiskResult(
            risk_level="UNKNOWN",
            findings=["Could not retrieve installation scripts for analysis."],
            signals=[SignalResult(
                name="script_access",
                status="UNKNOWN",
                value=None,
                description="Installation script metadata unavailable.",
            )],
        )

    signals = _scan_text(text)
    findings = [s.description for s in signals if s.status == "DANGER"]
    warnings = [s.description for s in signals if s.status == "WARNING"]

    danger_count = len(findings)
    if danger_count >= 3:
        risk_level = "CRITICAL"
    elif danger_count >= 1:
        risk_level = "HIGH"
    elif warnings:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return ScriptRiskResult(
        risk_level=risk_level,
        findings=findings + warnings,
        signals=signals,
    )
