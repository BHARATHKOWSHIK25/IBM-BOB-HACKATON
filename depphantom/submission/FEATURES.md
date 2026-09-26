# DepPhantom — Features

## Implemented Features (MVP)

### 1. Registry Verification
- Real-time lookup against PyPI (pypi.org) and npm (registry.npmjs.org)
- Package existence check
- Latest version retrieval
- Version history
- Publisher/maintainer information
- Package age calculation
- Download count (PyPI stats where available)
- Registry URL and homepage
- License information
- Graceful handling of 404, 429, timeouts, and registry unavailability

### 2. AI Hallucination Detection
- Identifies packages that don't exist in any supported registry
- AI_AGENT source flag applies additional risk weight
- Provides clear explanation: "Package does not exist — likely AI-hallucinated"
- Suggests known alternatives based on AI intent cluster matching
- Distinguishes hallucination from genuine new packages

### 3. Typosquatting Detection
- Multi-metric similarity: ratio, partial ratio, indel normalized similarity, Jaro-Winkler
- Comparison against 100+ well-known PyPI packages
- Comparison against 75+ well-known npm packages
- Configurable similarity threshold (default: 80%)
- Returns top-5 similar packages with scores
- Self-match exclusion (a package is never flagged as similar to itself)

### 4. Package Metadata Analysis
- Package age with configurable "new package" threshold (default: 30 days)
- Version count and release history signals
- Download count signal (where available from PyPI stats)
- Publisher presence check
- Description presence check
- License presence check
- Abandonment detection for very old packages with few versions

### 5. Static Installation Script Analysis
- Fetches npm package.json scripts field
- Fetches PyPI package metadata
- Pattern-based detection of:
  - Shell/subprocess execution
  - Network access during install
  - Credential/environment variable access
  - Obfuscated code (base64, hex escapes)
  - File system manipulation
  - Dynamic code execution (exec, eval)
  - Dangerous deserialization
- Never executes any package code
- Risk levels: LOW, MEDIUM, HIGH, CRITICAL

### 6. Dependency Graph Analysis
- Fetches declared dependencies from PyPI and npm
- Checks for known suspicious name patterns in dependencies
- Flags excessive dependency count
- Reports suspicious transitive dependencies

### 7. AI Intent Verification
- 12 intent clusters: http, pdf, database, date, image, crypto, test, cli, data, auth, email, logging
- Keyword extraction from AI-stated reason
- Package name matching against known packages for each cluster
- Package description matching
- Suspicious package name pattern detection
- Mismatch detection when AI says one thing but package name suggests another
- Concrete suggested alternatives when available

### 8. Explainable Risk Engine
- Per-signal scoring (not a black box)
- Weighted signals: registry (35), typosquatting (up to 40), age (up to 25), script (up to 50), deps (up to 20), intent (up to 30)
- AI_AGENT source multiplier (10% extra weight)
- Confidence scoring based on number of signals
- Human-readable explanation for every decision
- Risk levels: LOW (<25), MEDIUM (25-50), HIGH (50-75), CRITICAL (≥75)

### 9. ALLOW / REVIEW / BLOCK Decision Engine
- Configurable per-threat policies
- Default: BLOCK for HIGH/CRITICAL, REVIEW for MEDIUM, ALLOW for LOW
- Fail-closed: REVIEW when analysis cannot complete
- Human override with full audit trail

### 10. Security Dashboard
- Live statistics from the database (not hardcoded)
- Protected installations count
- Blocked dependencies count
- Review required count
- High-risk packages count
- AI hallucinations detected count
- Recent events table

### 11. Audit Log
- All verification events recorded
- Demo scenario runs recorded
- Human override events recorded
- Filterable by risk, decision, ecosystem, package name
- Timestamped with user/source information

### 12. Policy Configuration
- 7 configurable policies via web UI
- Persisted to database
- Changes take effect immediately
- Policies: unknown package, new package, typosquatting, install script, intent mismatch, AI agent multiplier, fail closed

### 13. Demo Center
- 4 pre-built deterministic scenarios
- Hallucination: `fast-pdf-renderer` → BLOCK
- Typosquatting: `requets` → BLOCK
- Suspicious existing: `crypto-utils-pro` → BLOCK  
- Trusted: `requests` → ALLOW
- All clearly labeled as `[DEMO DATA]`
- Demo runs are logged in audit trail

### 14. REST API
- POST /api/dependencies/verify — main verification endpoint
- GET /api/dependencies/{id} — retrieve previous result
- GET /api/dashboard — dashboard statistics
- GET /api/events — audit log with filtering
- GET /api/policies — current policy configuration
- PUT /api/policies — update a policy
- GET /api/demo/scenarios — list demo scenarios
- POST /api/demo/scenario — run a demo scenario
- POST /api/decisions/override — human override with audit
- GET /api/health — health check

### 15. Professional UI
- Security-focused design language
- Risk level badges (color-coded)
- Decision badges with icons
- Pipeline step visualization
- Evidence panels
- Security event timeline
- Responsive layout

---

## What's Not Implemented (Future Work)

- CLI tool (`depphantom verify <package>`)
- Sandbox-based dynamic analysis
- GitHub Actions integration
- Organization-level analytics
- Policy-as-code (YAML policy files)
- Custom package allowlists/blocklists
- SBOM generation
- Slack/Teams notifications
- Multi-user authentication
- Enterprise SSO
