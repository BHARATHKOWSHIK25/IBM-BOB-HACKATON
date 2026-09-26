"""Dependency graph risk analyzer."""
from __future__ import annotations
import asyncio
from typing import List, Optional, Dict, Any
import httpx
from ...schemas import DependencyRiskResult, SignalResult
from ...config import get_settings

settings = get_settings()

# Suspicious transitive dependency name patterns
SUSPICIOUS_DEP_PATTERNS = [
    "miner", "crypto-miner", "coin", "wallet-stealer",
    "backdoor", "rootkit", "keylogger", "trojan",
    "evil", "malware", "virus", "hack",
]


async def _get_pypi_deps(package: str) -> List[str]:
    try:
        async with httpx.AsyncClient(timeout=settings.registry_timeout) as client:
            resp = await client.get(f"https://pypi.org/pypi/{package}/json")
            if resp.status_code != 200:
                return []
            data = resp.json()
            requires = data.get("info", {}).get("requires_dist") or []
            # Parse dep names (before any extras/version specifiers)
            deps = []
            for req in requires:
                name = req.split(";")[0].split("(")[0].split(">")[0].split("<")[0].split("=")[0].split("!")[0].strip()
                if name:
                    deps.append(name)
            return deps
    except Exception:
        return []


async def _get_npm_deps(package: str) -> List[str]:
    try:
        async with httpx.AsyncClient(timeout=settings.registry_timeout) as client:
            resp = await client.get(f"https://registry.npmjs.org/{package}")
            if resp.status_code != 200:
                return []
            data = resp.json()
            latest = data.get("dist-tags", {}).get("latest")
            if not latest:
                return []
            pkg = data.get("versions", {}).get(latest, {})
            deps = list(pkg.get("dependencies", {}).keys())
            deps += list(pkg.get("devDependencies", {}).keys())
            return deps
    except Exception:
        return []


async def analyze_dependencies(package: str, ecosystem: str) -> DependencyRiskResult:
    eco = ecosystem.lower()

    if eco == "pypi":
        deps = await _get_pypi_deps(package)
    elif eco == "npm":
        deps = await _get_npm_deps(package)
    else:
        deps = []

    signals: List[SignalResult] = []
    suspicious_deps: List[str] = []

    for dep in deps:
        dep_lower = dep.lower()
        for pattern in SUSPICIOUS_DEP_PATTERNS:
            if pattern in dep_lower:
                suspicious_deps.append(dep)
                signals.append(SignalResult(
                    name="suspicious_dependency",
                    status="DANGER",
                    value=dep,
                    description=f"Dependency '{dep}' contains suspicious pattern '{pattern}'.",
                ))
                break

    if len(deps) > 50:
        signals.append(SignalResult(
            name="excessive_dependencies",
            status="WARNING",
            value=len(deps),
            description=f"Package has an unusually high number of dependencies: {len(deps)}.",
        ))

    if not deps and ecosystem:
        signals.append(SignalResult(
            name="no_deps",
            status="OK",
            value=0,
            description="No dependencies declared.",
        ))
    elif deps:
        signals.append(SignalResult(
            name="dependency_count",
            status="OK",
            value=len(deps),
            description=f"{len(deps)} declared {'dependency' if len(deps)==1 else 'dependencies'}.",
        ))

    danger_count = len(suspicious_deps)
    if danger_count >= 2:
        risk_level = "HIGH"
    elif danger_count == 1:
        risk_level = "MEDIUM"
    elif len(deps) > 50:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return DependencyRiskResult(
        risk_level=risk_level,
        suspicious_deps=suspicious_deps,
        signals=signals,
    )
