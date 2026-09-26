"""AI Intent vs package relevance analyzer.

Compares the AI-stated reason with the package name and description
to detect purpose mismatches.
"""
from __future__ import annotations
import re
from typing import Optional, List
from ...schemas import IntentResult, SignalResult

# Intent keyword clusters — maps general purpose keywords to known packages
INTENT_CLUSTERS = {
    "pdf": {
        "keywords": ["pdf", "report", "document", "export", "print", "render", "page", "wkhtml"],
        "known_packages": {
            "pypi": ["reportlab", "fpdf", "fpdf2", "pdfkit", "weasyprint", "pypdf", "pdf2image", "pdfminer"],
            "npm": ["pdf-lib", "pdfmake", "jspdf", "puppeteer", "html-pdf"],
        }
    },
    "http": {
        "keywords": ["http", "request", "fetch", "rest", "api", "client", "web", "url", "network"],
        "known_packages": {
            "pypi": ["requests", "httpx", "aiohttp", "urllib3", "httplib2"],
            "npm": ["axios", "node-fetch", "got", "superagent", "ky"],
        }
    },
    "database": {
        "keywords": ["database", "db", "sql", "orm", "query", "sqlite", "postgres", "mysql", "mongo"],
        "known_packages": {
            "pypi": ["sqlalchemy", "psycopg2", "pymysql", "pymongo", "motor", "databases"],
            "npm": ["mongoose", "sequelize", "typeorm", "prisma", "knex", "pg"],
        }
    },
    "date": {
        "keywords": ["date", "time", "datetime", "calendar", "schedule", "timestamp", "timezone"],
        "known_packages": {
            "pypi": ["arrow", "pendulum", "python-dateutil", "pytz", "dateparser"],
            "npm": ["moment", "dayjs", "date-fns", "luxon"],
        }
    },
    "image": {
        "keywords": ["image", "photo", "picture", "resize", "compress", "crop", "thumbnail"],
        "known_packages": {
            "pypi": ["pillow", "opencv-python", "imageio", "wand"],
            "npm": ["sharp", "jimp", "canvas", "fabric"],
        }
    },
    "crypto": {
        "keywords": ["encrypt", "decrypt", "hash", "crypto", "ssl", "tls", "certificate", "security"],
        "known_packages": {
            "pypi": ["cryptography", "pycryptodome", "bcrypt", "passlib"],
            "npm": ["crypto", "bcrypt", "bcryptjs", "node-forge", "cryptr"],
        }
    },
    "test": {
        "keywords": ["test", "testing", "unit", "mock", "fixture", "assert", "coverage"],
        "known_packages": {
            "pypi": ["pytest", "unittest", "nose", "hypothesis", "faker"],
            "npm": ["jest", "mocha", "chai", "jasmine", "vitest"],
        }
    },
    "cli": {
        "keywords": ["cli", "command", "argument", "terminal", "console", "option", "flag"],
        "known_packages": {
            "pypi": ["click", "typer", "argparse", "docopt"],
            "npm": ["commander", "yargs", "inquirer", "meow"],
        }
    },
    "data": {
        "keywords": ["data", "csv", "excel", "json", "xml", "parse", "table", "dataframe"],
        "known_packages": {
            "pypi": ["pandas", "numpy", "openpyxl", "xlrd", "lxml", "beautifulsoup4"],
            "npm": ["papaparse", "xlsx", "cheerio", "xml2js"],
        }
    },
    "auth": {
        "keywords": ["auth", "login", "jwt", "token", "oauth", "session", "permission", "rbac"],
        "known_packages": {
            "pypi": ["pyjwt", "authlib", "python-jose", "passlib", "oauthlib"],
            "npm": ["jsonwebtoken", "passport", "express-jwt", "oauth2orize"],
        }
    },
    "email": {
        "keywords": ["email", "smtp", "mail", "send", "message", "inbox"],
        "known_packages": {
            "pypi": ["sendgrid", "smtplib", "yagmail", "python-email"],
            "npm": ["nodemailer", "sendgrid", "mailgun-js", "mailchimp"],
        }
    },
    "logging": {
        "keywords": ["log", "logging", "monitor", "trace", "debug", "observability"],
        "known_packages": {
            "pypi": ["loguru", "logging", "structlog", "sentry-sdk"],
            "npm": ["winston", "pino", "bunyan", "debug", "morgan"],
        }
    },
    "mining": {
        "keywords": ["mine", "mining", "coin", "bitcoin", "ethereum", "crypto-currency"],
        "known_packages": {
            "pypi": [],
            "npm": [],
        }
    },
}

# Suspicious package name patterns that suggest unrelated purpose
SUSPICIOUS_NAME_PATTERNS = [
    "miner", "wallet-steal", "backdoor", "rootkit", "hack", "exploit",
    "keylog", "exfil", "c2", "command-control", "botnet",
]


def _keywords_from_text(text: str) -> List[str]:
    return re.findall(r'\b\w+\b', text.lower())


def analyze_intent(
    package: str,
    ecosystem: str,
    ai_reason: Optional[str],
    package_description: Optional[str],
) -> IntentResult:
    signals: List[SignalResult] = []

    if not ai_reason:
        return IntentResult(
            match_level="UNKNOWN",
            explanation="No AI intent provided. Cannot verify purpose alignment.",
            signals=[SignalResult(
                name="intent_unavailable",
                status="UNKNOWN",
                value=None,
                description="No AI-stated reason provided.",
            )],
        )

    reason_words = _keywords_from_text(ai_reason)
    pkg_lower = package.lower()
    eco = ecosystem.lower()

    # Check for suspicious package name regardless of intent
    for pattern in SUSPICIOUS_NAME_PATTERNS:
        if pattern in pkg_lower:
            signals.append(SignalResult(
                name="suspicious_package_name",
                status="DANGER",
                value=pattern,
                description=f"Package name contains suspicious pattern '{pattern}'.",
            ))

    # Find which intent clusters match the stated reason
    matched_clusters = []
    for cluster_name, cluster in INTENT_CLUSTERS.items():
        overlap = set(reason_words) & set(cluster["keywords"])
        if overlap:
            matched_clusters.append((cluster_name, cluster, overlap))

    if not matched_clusters:
        # Generic reason — can't determine cluster
        signals.append(SignalResult(
            name="intent_cluster",
            status="WARNING",
            value=None,
            description="Could not map AI intent to a known package purpose category.",
        ))
        return IntentResult(
            match_level="UNKNOWN",
            explanation="AI intent could not be mapped to a known package category.",
            signals=signals,
        )

    # Check if package name matches any of the known packages for the matched clusters
    best_cluster_name, best_cluster, _ = matched_clusters[0]
    known_packages = best_cluster["known_packages"].get(eco, [])

    # Does the package name appear in or closely match known packages?
    name_in_known = any(
        pkg_lower == kp.lower() or kp.lower() in pkg_lower or pkg_lower in kp.lower()
        for kp in known_packages
    )

    # Check description match
    desc_match = False
    if package_description:
        desc_words = _keywords_from_text(package_description)
        desc_cluster_overlap = set(desc_words) & set(best_cluster["keywords"])
        desc_match = len(desc_cluster_overlap) > 0

    # Check for mismatch: intent says one thing, package name suggests another
    mismatch_cluster = None
    for cluster_name, cluster in INTENT_CLUSTERS.items():
        for pattern in SUSPICIOUS_NAME_PATTERNS:
            if pattern in pkg_lower and cluster_name != best_cluster_name:
                mismatch_cluster = cluster_name

    if mismatch_cluster or any(pattern in pkg_lower for pattern in SUSPICIOUS_NAME_PATTERNS):
        signals.append(SignalResult(
            name="purpose_mismatch",
            status="DANGER",
            value=pkg_lower,
            description=(
                f"Package name suggests purpose unrelated to stated AI intent "
                f"({best_cluster_name}). Possible mismatch."
            ),
        ))
        return IntentResult(
            match_level="MISMATCH",
            explanation=(
                f"AI intent indicates '{best_cluster_name}' but package name suggests "
                f"an unrelated or suspicious purpose."
            ),
            signals=signals,
        )

    if name_in_known or desc_match:
        signals.append(SignalResult(
            name="intent_match",
            status="OK",
            value=best_cluster_name,
            description=(
                f"Package appears consistent with AI-stated intent ({best_cluster_name})."
            ),
        ))
        return IntentResult(
            match_level="MATCH",
            explanation=(
                f"Package name and description are consistent with AI intent: {ai_reason}."
            ),
            signals=signals,
        )
    else:
        signals.append(SignalResult(
            name="intent_partial",
            status="WARNING",
            value=best_cluster_name,
            description=(
                f"Package may not be the expected package for '{best_cluster_name}' use case."
            ),
        ))
        if known_packages:
            signals.append(SignalResult(
                name="suggested_packages",
                status="OK",
                value=", ".join(known_packages[:3]),
                description=f"Known packages for this use case: {', '.join(known_packages[:3])}.",
            ))
        return IntentResult(
            match_level="PARTIAL",
            explanation=(
                f"Package identity does not clearly match expected packages for the "
                f"stated intent ({ai_reason}). Consider: {', '.join(known_packages[:3])}."
            ),
            signals=signals,
        )
