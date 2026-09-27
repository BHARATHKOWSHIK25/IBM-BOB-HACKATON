# DepPhantom — Project Overview

## Project Name
**DepPhantom**

## Hackathon
IBM Bob 2.0 Hackathon

## Category
AI-Assisted & Autonomous Software Engineering / Supply Chain Security

## Tagline
> Don't let AI invent your next supply-chain attack.

---

## The Problem

Autonomous AI coding agents — like those powered by IBM Bob, GitHub Copilot Workspace, Cursor, Devin, and similar tools — are increasingly capable of deciding, installing, and managing software dependencies without human intervention.

This creates a new attack vector: **AI dependency hallucination**.

An AI agent may confidently request a package that:
- Does not exist
- Has been plausibly named but never registered
- Resembles a legitimate package
- Was recently registered by an attacker who predicted the hallucination pattern

When an attacker registers a package under a commonly hallucinated name, the AI agent installs it automatically — bringing malicious code into the development environment, CI/CD pipeline, or production system.

**Existing tools don't solve this.** Traditional dependency scanners check for known vulnerabilities in packages that are already installed. They operate after the fact. DepPhantom operates *before installation*.

---

## The Innovation

DepPhantom introduces a **pre-installation security gate** between the AI agent and the package manager.

Instead of:
```
AI Agent → pip install <hallucinated-package> → Malicious Code Executes
```

DepPhantom enforces:
```
AI Agent → DepPhantom Security Gate → Verified Safe → Installation
                                    → Suspicious → BLOCKED
```

The key insight is that **AI-generated dependency names must be treated as untrusted until verified** — regardless of how confident the AI appears.

---

## Implemented Features

| Feature | Status | Description |
|---|---|---|
| Registry Verification | ✅ Live | Real-time PyPI and npm registry lookup |
| AI Hallucination Detection | ✅ Live | Detects packages that don't exist in registries |
| Typosquatting Detection | ✅ Live | Fuzzy matching against 100+ known packages |
| Package Metadata Analysis | ✅ Live | Age, version history, publisher, adoption signals |
| Static Script Analysis | ✅ Live | Pattern-based install script inspection (no execution) |
| Dependency Graph Analysis | ✅ Live | Transitive dependency risk detection |
| AI Intent Verification | ✅ Live | Compares AI-stated need vs. package purpose |
| Explainable Risk Engine | ✅ Live | Transparent scoring with per-signal evidence |
| ALLOW / REVIEW / BLOCK | ✅ Live | Configurable policy-based decisions |
| Audit Trail | ✅ Live | Full event log with filtering |
| Policy Configuration | ✅ Live | Per-scenario configurable thresholds |
| Demo Center | ✅ Demo | Four pre-built attack scenarios |
| Security Dashboard | ✅ Live | Real-time statistics from actual verifications |
| REST API | ✅ Live | Agent-callable verification endpoint |

---

## Technical Architecture

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Python 3.11+ + FastAPI + SQLAlchemy (async)
- **Database**: SQLite (SQLAlchemy — production-ready migration to PostgreSQL)
- **Analysis**: rapidfuzz, httpx, pattern-based static analysis
- **Deployment**: Docker + docker-compose, or direct Python/Node

---

## Impact

DepPhantom directly addresses the emerging threat of AI-driven supply chain attacks by:

1. **Intercepting AI decisions before they reach the package manager**
2. **Explaining why a package was blocked** — not just blocking it
3. **Never executing suspicious code** to determine if it is safe
4. **Working with the AI agent** rather than just scanning after the fact
5. **Providing a configurable security policy** for different risk tolerances

As AI coding agents become more capable and autonomous, the surface area for AI-hallucination attacks grows. DepPhantom provides the infrastructure to manage this risk systematically.
