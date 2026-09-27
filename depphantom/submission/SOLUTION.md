# DepPhantom — Solution

## The DepPhantom Approach

> DepPhantom introduces a pre-installation security gate between autonomous coding agents and package installation. Before a dependency is allowed into the environment, DepPhantom verifies its registry identity, analyzes package-name similarity, evaluates metadata and installation behavior, examines dependency signals, and compares the package with the AI agent's stated intent. Based on transparent evidence, the system returns ALLOW, REVIEW, or BLOCK.

---

## How It Works

### 1. Interception

Instead of:
```
AI Agent → pip install <package>
```

DepPhantom inserts itself:
```
AI Agent
    ↓ POST /api/dependencies/verify
DepPhantom Security Gate
    ↓ [analysis]
ALLOW / REVIEW / BLOCK
    ↓ (if ALLOW)
Installation proceeds
```

### 2. Parallel Analysis Pipeline

When a verification request arrives, DepPhantom runs multiple analysis streams in parallel:

```
Registry Check ──────────────────────────────────┐
Typosquatting Detection ─────────────────────────┤
Package Metadata Analysis ───────────────────────┤──→ Risk Engine → Decision
Static Script Analysis ──────────────────────────┤
Dependency Graph Analysis ───────────────────────┤
AI Intent Verification ──────────────────────────┘
```

### 3. Explainable Risk Engine

Every decision is backed by specific evidence. Example output:

```
DEPPHANTOM RISK ANALYSIS

Package: requets / PyPI

Registry existence       ✓  Found (recently registered)
Typosquatting            🔴 94% similar to "requests"
Package age              ⚠  5 days old
Publisher                ⚠  Unknown publisher
Install script           🔴 subprocess execution detected
AI intent                🔴 Package is not "requests"

Overall Risk:   CRITICAL
Confidence:     97%
Decision:       BLOCK

Why:
• Package name is 94% similar to trusted package "requests" — likely typosquatting
• Package was registered only 5 days ago
• Installation script contains dangerous patterns
• This package is not the expected package for HTTP client functionality
```

### 4. Three-State Decision

```
ALLOW   → Package is low-risk; proceed with installation
REVIEW  → Medium risk; requires human confirmation before installation
BLOCK   → High/critical risk; installation prevented automatically
```

### 5. Never Executes Suspicious Packages

All analysis is performed using:
- Static metadata from public registry APIs (PyPI JSON API, npm registry)
- Pattern-based string matching on package metadata
- Fuzzy name similarity algorithms
- Keyword clustering for AI intent analysis

**No suspicious package is ever executed to determine if it is safe.**

### 6. Fail-Closed Security

When registry verification cannot be completed (network failure, rate limits, timeout), DepPhantom does not silently approve the installation. The default policy is to return `REVIEW` or `BLOCK` — configurable via policy settings.

---

## Integration Patterns

### Manual Verification (Web UI)
Developers use the web dashboard to check packages before adding them to a project.

### AI Agent Integration (REST API)
```bash
curl -X POST http://localhost:8000/api/dependencies/verify \
  -H "Content-Type: application/json" \
  -d '{
    "package": "requets",
    "ecosystem": "pypi",
    "version": "latest",
    "reason": "HTTP client for REST API calls",
    "source": "AI_AGENT"
  }'
```

Response:
```json
{
  "decision": "BLOCK",
  "overall_risk": "critical",
  "confidence": 0.97,
  "reasons": [
    "Package name is 94% similar to trusted package 'requests'",
    "Package was registered only 5 days ago",
    "Installation script contains dangerous patterns"
  ]
}
```

### CI/CD Gate
DepPhantom can be called from CI/CD pipelines before any `pip install` or `npm install` is executed, providing a pre-flight security check on all new dependencies.

---

## What Makes DepPhantom Different

| Traditional Approach | DepPhantom |
|---|---|
| Scan after installation | Gate before installation |
| Check for known CVEs | Detect hallucination, impersonation, intent mismatch |
| Package-level analysis only | AI intent + package identity |
| Black-box scores | Transparent per-signal evidence |
| Reactive security | Proactive security |
| General purpose scanner | Purpose-built for AI agents |
