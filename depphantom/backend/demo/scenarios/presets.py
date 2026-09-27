"""Demo scenarios — pre-configured attack scenarios for the hackathon demo."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Dict, Any
from ...schemas import (
    RegistryResult, TyposquatResult, MetadataResult, ScriptRiskResult,
    DependencyRiskResult, IntentResult, SignalResult,
    AnalysisResponse, RiskLevel, DecisionEnum,
)

# ── Scenario definitions ───────────────────────────────────────────────────────

DEMO_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "hallucinated": {
        "label": "AI Hallucination",
        "description": "AI agent requests a package that does not exist in any registry.",
        "request": {
            "package": "fast-pdf-renderer",
            "ecosystem": "pypi",
            "version": "1.2.0",
            "reason": "Generate PDF reports from HTML templates",
            "source": "AI_AGENT",
        },
        "registry": {
            "exists": False,
        },
        "typosquat": {
            "closest_match": None,
            "similarity_score": 0.0,
            "is_suspicious": False,
            "all_matches": [],
        },
        "metadata": {
            "package_age_days": None,
            "version_count": 0,
            "is_new": False,
            "is_abandoned": False,
            "signals": [
                {"name": "registry", "status": "DANGER", "value": None,
                 "description": "Package does not exist in PyPI."},
            ],
        },
        "script_risk": {
            "risk_level": "UNKNOWN",
            "findings": ["Package not found — no scripts available for analysis."],
            "signals": [],
        },
        "dependency_risk": {
            "risk_level": "UNKNOWN",
            "suspicious_deps": [],
            "signals": [],
        },
        "intent": {
            "match_level": "UNKNOWN",
            "explanation": "Package does not exist — intent cannot be verified.",
            "signals": [
                {"name": "hallucination_signal", "status": "DANGER", "value": None,
                 "description": "AI-generated package name with no registry presence. High hallucination probability."},
            ],
        },
        "overall_risk": "CRITICAL",
        "confidence": 0.92,
        "decision": "BLOCK",
        "reasons": [
            "Package does not exist in PyPI registry.",
            "Package was requested by an AI agent and does not exist — likely hallucinated.",
            "Known alternatives for PDF generation: reportlab, fpdf2, weasyprint.",
        ],
        "explanation": (
            "DepPhantom classified 'fast-pdf-renderer' as CRITICAL risk (score: 90/100). "
            "The package does not exist in any registry. This is a strong indicator of "
            "AI hallucination. Installation has been blocked. Consider using: "
            "reportlab, fpdf2, or weasyprint for PDF generation."
        ),
    },

    "typosquatting": {
        "label": "Typosquatting Attack",
        "description": "AI agent requests 'requets' — a near-identical misspelling of 'requests'.",
        "request": {
            "package": "requets",
            "ecosystem": "pypi",
            "version": "latest",
            "reason": "HTTP client for REST API calls",
            "source": "AI_AGENT",
        },
        "registry": {
            "exists": True,
            "registry_url": "[DEMO] https://pypi.org/project/requets/",
            "latest_version": "0.0.1",
            "all_versions": ["0.0.1"],
            "published_at": "2025-01-15T00:00:00+00:00",
            "publisher": "unknown-user-4872",
            "maintainers": ["unknown-user-4872"],
            "description": "HTTP utilities",
            "homepage": None,
            "license": None,
            "download_count": 12,
            "is_demo": True,
        },
        "typosquat": {
            "closest_match": "requests",
            "similarity_score": 0.94,
            "is_suspicious": True,
            "all_matches": [
                {"package": "requests", "score": 0.94},
                {"package": "requestss", "score": 0.87},
            ],
        },
        "metadata": {
            "package_age_days": 5,
            "version_count": 1,
            "is_new": True,
            "is_abandoned": False,
            "signals": [
                {"name": "package_age", "status": "DANGER", "value": 5,
                 "description": "Package was created only 5 days ago — very new."},
                {"name": "version_history", "status": "WARNING", "value": 1,
                 "description": "Only one version ever published."},
                {"name": "download_count", "status": "WARNING", "value": 12,
                 "description": "Very low download count: 12."},
            ],
        },
        "script_risk": {
            "risk_level": "HIGH",
            "findings": [
                "Network access during installation",
                "Shell subprocess execution detected",
                "Credential or secret environment variable access",
            ],
            "signals": [
                {"name": "script_danger", "status": "DANGER", "value": "subprocess",
                 "description": "Shell subprocess execution detected"},
                {"name": "script_danger", "status": "DANGER", "value": "urllib",
                 "description": "Network access during installation"},
                {"name": "script_danger", "status": "DANGER", "value": "HOME|AWS_",
                 "description": "Credential or secret environment variable access"},
            ],
        },
        "dependency_risk": {
            "risk_level": "LOW",
            "suspicious_deps": [],
            "signals": [
                {"name": "dependency_count", "status": "OK", "value": 0,
                 "description": "No dependencies declared."},
            ],
        },
        "intent": {
            "match_level": "MISMATCH",
            "explanation": (
                "AI stated HTTP client need. The package 'requets' is not the "
                "expected 'requests' package. Possible impersonation."
            ),
            "signals": [
                {"name": "purpose_mismatch", "status": "DANGER", "value": "requets",
                 "description": "This is likely an impersonation of 'requests', not a legitimate HTTP client."},
                {"name": "suggested_packages", "status": "OK", "value": "requests",
                 "description": "The correct package for HTTP client functionality is: requests"},
            ],
        },
        "overall_risk": "CRITICAL",
        "confidence": 0.97,
        "decision": "BLOCK",
        "reasons": [
            "Package name is 94% similar to trusted package 'requests' — near-identical typosquatting detected.",
            "Package was registered only 5 days ago.",
            "Installation script attempts network access and subprocess execution.",
            "Package is not the expected package for HTTP client functionality.",
        ],
        "explanation": (
            "DepPhantom classified 'requets' as CRITICAL risk (score: 97/100). "
            "Primary concerns: near-identical name to trusted package 'requests' (94% similarity), "
            "package registered only 5 days ago, installation script contains dangerous patterns. "
            "This is a classic typosquatting attack targeting AI-generated dependency requests."
        ),
    },

    "suspicious_existing": {
        "label": "Malicious Install Script",
        "description": "Package exists but contains dangerous installation behavior.",
        "request": {
            "package": "crypto-utils-pro",
            "ecosystem": "npm",
            "version": "2.1.0",
            "reason": "Cryptographic utilities for data encryption",
            "source": "AI_AGENT",
        },
        "registry": {
            "exists": True,
            "registry_url": "[DEMO] https://www.npmjs.com/package/crypto-utils-pro",
            "latest_version": "2.1.0",
            "all_versions": ["1.0.0", "1.0.1", "2.0.0", "2.1.0"],
            "published_at": "2025-03-01T00:00:00+00:00",
            "publisher": "dev-npm-4421",
            "maintainers": ["dev-npm-4421"],
            "description": "Cryptographic utility functions",
            "homepage": None,
            "license": "MIT",
            "download_count": 234,
            "is_demo": True,
        },
        "typosquat": {
            "closest_match": "crypto",
            "similarity_score": 0.72,
            "is_suspicious": False,
            "all_matches": [
                {"package": "crypto", "score": 0.72},
            ],
        },
        "metadata": {
            "package_age_days": 12,
            "version_count": 4,
            "is_new": True,
            "is_abandoned": False,
            "signals": [
                {"name": "package_age", "status": "DANGER", "value": 12,
                 "description": "Package was created only 12 days ago."},
                {"name": "version_history", "status": "WARNING", "value": 4,
                 "description": "4 versions published in a short period — rapid version changes."},
                {"name": "download_count", "status": "WARNING", "value": 234,
                 "description": "Low download count: 234."},
            ],
        },
        "script_risk": {
            "risk_level": "CRITICAL",
            "findings": [
                "postinstall script executes shell command",
                "Network download during installation",
                "Credential environment variable access (HOME, AWS_SECRET_ACCESS_KEY)",
                "Base64-encoded payload detected (possible obfuscation)",
                "Writes to filesystem outside package directory",
            ],
            "signals": [
                {"name": "script_danger", "status": "DANGER", "value": "postinstall",
                 "description": "postinstall script executes shell command"},
                {"name": "script_danger", "status": "DANGER", "value": "network",
                 "description": "Network download during installation"},
                {"name": "script_danger", "status": "DANGER", "value": "credentials",
                 "description": "Credential environment variable access"},
                {"name": "script_danger", "status": "DANGER", "value": "obfuscation",
                 "description": "Base64-encoded payload (possible obfuscation)"},
            ],
        },
        "dependency_risk": {
            "risk_level": "MEDIUM",
            "suspicious_deps": [],
            "signals": [
                {"name": "dependency_count", "status": "WARNING", "value": 3,
                 "description": "3 dependencies including recently created packages."},
            ],
        },
        "intent": {
            "match_level": "PARTIAL",
            "explanation": "Package name suggests crypto utilities, but installation behavior is inconsistent with a legitimate utility library.",
            "signals": [
                {"name": "intent_partial", "status": "WARNING", "value": "crypto",
                 "description": "Package claims crypto functionality but install behavior is suspicious."},
            ],
        },
        "overall_risk": "CRITICAL",
        "confidence": 0.95,
        "decision": "BLOCK",
        "reasons": [
            "Installation script executes shell commands during postinstall.",
            "Network access during installation (possible payload download).",
            "Credential environment variable access detected.",
            "Base64-encoded content suggests obfuscation.",
            "Package is only 12 days old with limited adoption.",
        ],
        "explanation": (
            "DepPhantom classified 'crypto-utils-pro' as CRITICAL risk (score: 95/100). "
            "The package exists in the npm registry but contains highly suspicious installation behavior. "
            "The postinstall script executes shell commands, makes network requests, and accesses "
            "credential environment variables. Base64-encoded content indicates possible obfuscation. "
            "Installation has been blocked."
        ),
    },

    "trusted": {
        "label": "Trusted Package",
        "description": "Well-known, established package with strong trust evidence.",
        "request": {
            "package": "requests",
            "ecosystem": "pypi",
            "version": "2.31.0",
            "reason": "HTTP client for REST API calls",
            "source": "AI_AGENT",
        },
        "registry": {
            "exists": True,
            "registry_url": "https://pypi.org/project/requests/",
            "latest_version": "2.31.0",
            "all_versions": ["2.28.0", "2.29.0", "2.30.0", "2.31.0"],
            "published_at": "2011-02-13T00:00:00+00:00",
            "publisher": "kennethreitz",
            "maintainers": ["kennethreitz", "nate.prewitt", "sethmlarson"],
            "description": "Python HTTP for Humans.",
            "homepage": "https://requests.readthedocs.io",
            "license": "Apache 2.0",
            "download_count": 285000000,
            "is_demo": True,
        },
        "typosquat": {
            "closest_match": None,
            "similarity_score": 0.0,
            "is_suspicious": False,
            "all_matches": [],
        },
        "metadata": {
            "package_age_days": 5200,
            "version_count": 47,
            "is_new": False,
            "is_abandoned": False,
            "signals": [
                {"name": "package_age", "status": "OK", "value": 5200,
                 "description": "Package has been available for over 14 years."},
                {"name": "version_history", "status": "OK", "value": 47,
                 "description": "47 versions published — active maintenance."},
                {"name": "download_count", "status": "OK", "value": 285000000,
                 "description": "285M+ monthly downloads."},
            ],
        },
        "script_risk": {
            "risk_level": "LOW",
            "findings": [],
            "signals": [
                {"name": "script_safe", "status": "OK", "value": None,
                 "description": "No dangerous installation script patterns detected."},
            ],
        },
        "dependency_risk": {
            "risk_level": "LOW",
            "suspicious_deps": [],
            "signals": [
                {"name": "dependency_count", "status": "OK", "value": 5,
                 "description": "5 well-known dependencies (urllib3, certifi, charset-normalizer, idna, chardet)."},
            ],
        },
        "intent": {
            "match_level": "MATCH",
            "explanation": "Package 'requests' is the standard HTTP client for Python. Matches AI intent perfectly.",
            "signals": [
                {"name": "intent_match", "status": "OK", "value": "http",
                 "description": "Package is the canonical Python HTTP client library."},
            ],
        },
        "overall_risk": "LOW",
        "confidence": 0.99,
        "decision": "ALLOW",
        "reasons": [
            "Package is a well-established, widely-trusted library.",
            "14+ years of active maintenance.",
            "285M+ monthly downloads.",
            "No suspicious installation scripts.",
            "Matches AI-stated intent for HTTP client functionality.",
        ],
        "explanation": (
            "DepPhantom classified 'requests' as LOW risk (score: 2/100). "
            "The package is a well-established library with 14+ years of active maintenance, "
            "285M+ monthly downloads, 3 known maintainers, and no suspicious installation patterns. "
            "Package identity and AI intent are aligned. Installation is approved."
        ),
    },
}


def get_demo_scenario(scenario_id: str) -> Dict[str, Any]:
    """Return a demo scenario by ID."""
    return DEMO_SCENARIOS.get(scenario_id)


def list_demo_scenarios():
    return [
        {"id": k, "label": v["label"], "description": v["description"]}
        for k, v in DEMO_SCENARIOS.items()
    ]
