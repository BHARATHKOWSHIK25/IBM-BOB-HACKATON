# DepPhantom — Problem Statement

## The Emerging Threat: AI Dependency Hallucination

Autonomous coding agents are increasingly capable of writing code, managing dependencies, and executing installation commands without human oversight. While this accelerates development, it introduces a new class of supply-chain vulnerability.

### The Core Problem

> **Autonomous coding agents can hallucinate non-existent dependencies. Attackers can exploit this predictable behavior by registering malicious packages under those hallucinated names, turning AI-generated dependency suggestions into a new software supply-chain attack vector. Existing dependency scanners primarily detect vulnerabilities after a package has entered the environment; they do not prevent an autonomous agent from installing an AI-invented package in the first place.**

### How the Attack Works

1. An AI coding agent is asked to add functionality (e.g., "Add PDF generation")
2. The agent invents a plausible but non-existent package name (e.g., `fast-pdf-renderer`)
3. An attacker monitors AI-generated package names and registers `fast-pdf-renderer` on PyPI
4. The attacker's malicious package contains code that executes on `pip install`
5. The AI agent, now or in the future, executes `pip install fast-pdf-renderer`
6. The malicious code runs silently — exfiltrating credentials, establishing persistence, or corrupting the environment

### Why Existing Tools Don't Solve This

| Tool Category | What It Does | What It Misses |
|---|---|---|
| Vulnerability Scanners (e.g., Dependabot, Snyk) | Checks installed packages for known CVEs | Does not run before installation; cannot detect novel malicious packages |
| Package Verification (e.g., pip-audit) | Audits lock files | Requires package to already be installed or resolved |
| SAST Tools | Scans existing source code | Does not analyze the installation decision |
| Dependency Confusion Detectors | Detects internal vs. public name confusion | Does not address hallucination-generated names |

**The security boundary is in the wrong place.** All existing tools operate after the dependency decision has been made. DepPhantom moves the security boundary to before the decision is executed.

### The Typosquatting Dimension

AI agents are particularly vulnerable to generating names that closely resemble legitimate packages. This is not random — AI models learn common naming patterns and produce statistically plausible variations. This makes AI-hallucinated names especially attractive for typosquatting attacks:

- `requests` → `requets` (AI-plausible HTTP client)
- `lodash` → `loadsh` (AI-plausible utility library)
- `fastapi` → `fast-api` (AI-plausible web framework)

### The Scale of the Problem

- As of 2024, PyPI hosts over 500,000 packages
- New packages can be registered in seconds with no review
- AI coding agents are being deployed in enterprise CI/CD pipelines
- A single compromised agent can affect entire codebases, infrastructure secrets, and production systems

### Scope of DepPhantom's Claims

DepPhantom is a **risk detection system**, not a guarantee of safety. It detects risk signals associated with:
- Packages that do not exist in registries (likely hallucinated)
- Packages that closely resemble known trusted packages (possible impersonation)
- Packages with suspicious metadata, age, or installation behavior
- Packages whose purpose does not match the AI agent's stated need

DepPhantom does **not** claim to detect every malicious package, nor does it replace comprehensive security practices.
