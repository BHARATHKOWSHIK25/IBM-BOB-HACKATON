# DepPhantom

### AI Supply-Chain Security for Autonomous Coding Agents

> **Don't let AI invent your next supply-chain attack.**

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [How It Works](#how-it-works)
- [Features In Depth](#features-in-depth)
- [API Reference](#api-reference)
- [Demo Scenarios](#demo-scenarios)
- [Architecture](#architecture)
- [Running Tests](#running-tests)
- [Security](#security)
- [Tech Stack](#tech-stack)
- [Limitations](#limitations)
- [Future Work](#future-work)

---

## The Problem

Autonomous AI coding agents — IBM Bob, GitHub Copilot Workspace, Cursor, Devin, and similar tools — can now write code, choose dependencies, and execute `pip install` or `npm install` without human intervention.

This creates a new class of attack that existing security tools do not address: **AI Dependency Hallucination.**

### How the attack works

```
Step 1 — Developer asks an AI agent:
          "Add PDF generation to this project"

Step 2 — AI agent hallucinates a package name:
          pip install fast-pdf-renderer
          (this package does not exist)

Step 3 — Attacker pre-registers that name on PyPI:
          fast-pdf-renderer now exists with a malicious postinstall script

Step 4 — AI agent installs it (now or in a future session):
          pip install fast-pdf-renderer
                  ↓
          Credentials exfiltrated. Backdoor installed. Done.
```

The AI agent never knew it invented the name. The package appeared completely legitimate. No CVE scanner caught it — because there was no CVE. The attack worked because the package was new, named plausibly, and installed silently.

### Why existing tools miss this

| Tool                           | What it does                               | Gap                                                                 |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| Dependabot / Snyk              | Scans installed packages for known CVEs    | Runs **after** installation — cannot catch novel malicious packages |
| pip-audit                      | Audits lock files                          | Requires the package to already be installed or resolved            |
| SAST tools                     | Scans existing source code                 | Does not analyze the installation decision                          |
| Dependency confusion detectors | Detects internal vs. public name confusion | Does not address AI-hallucinated names                              |

**The security boundary is in the wrong place.** All existing tools operate after the dependency has entered the environment. DepPhantom moves the boundary to _before_ installation.

### The typosquatting dimension

AI models learn common naming patterns and produce statistically plausible variations. This makes AI-hallucinated names especially useful for typosquatting:

```
requests  →  requets      (AI-plausible HTTP client — 95% similar)
lodash    →  loadsh        (AI-plausible utility — 91% similar)
fastapi   →  fast-api      (AI-plausible web framework)
express   →  expres        (AI-plausible Node server)
```

---

## The Solution

DepPhantom is a **pre-installation security gate** that sits between an AI coding agent and the package manager.

```
WITHOUT DepPhantom:
  AI Agent → pip install <hallucinated-package> → Malicious code executes silently

WITH DepPhantom:
  AI Agent → DepPhantom Security Gate → Verified safe → pip install
                                      → Suspicious    → ⛔ BLOCKED
```

Before any package enters the environment, DepPhantom:

1. **Verifies existence** in the real registry (PyPI / npm)
2. **Detects typosquatting** — is this a misspelling of a known trusted package?
3. **Analyzes metadata** — age, version history, publisher, adoption signals
4. **Inspects install scripts** — static pattern analysis for dangerous behaviors
5. **Examines dependencies** — transitive dependency risk
6. **Compares AI intent** — does the package actually do what the AI claimed?
7. **Scores all signals** — transparent, explainable risk score
8. **Returns a decision** — `ALLOW`, `REVIEW`, or `BLOCK`

---

## Quick Start

### Option A — Docker Compose (Recommended)

**Prerequisites**: Docker + Docker Compose

```bash
git clone <repo-url>
cd depphantom

# Copy environment config (defaults work for local demo — no changes needed)
cp .env.example .env

# Build and start (first build ~2 minutes)
docker-compose up --build
```

| URL                         | Service                       |
| --------------------------- | ----------------------------- |
| http://localhost            | Frontend dashboard            |
| http://localhost/api/docs   | Interactive API documentation |
| http://localhost/api/health | Health check                  |

**Deploying to a custom domain:**

```bash
CORS_ORIGINS=https://your-domain.com docker-compose up --build -d
```

---

### Option B — Local Development

**Prerequisites**: Python 3.12.x (recommended and verified on Windows), Node.js 18+

> Python 3.13 currently fails during native dependency builds for this project on Windows because packages such as `pydantic-core` and `Levenshtein` require Visual C++ toolchain support that is not available in the default environment. Use Python 3.12 for local development and testing.

#### 1. Backend

```bash
cd depphantom

# Create a virtual environment with Python 3.12
python3.12 -m venv .venv

# Activate — Linux/macOS:
source .venv/bin/activate

# Activate — Windows:
.venv\Scripts\activate

# Install Python dependencies
pip install -r backend/requirements.txt

# Copy environment config
cp .env.example .env

# Start the backend
python startup.py
```

- Backend: http://localhost:8000
- API docs: http://localhost:8000/api/docs

#### 2. Frontend

In a separate terminal:

```bash
cd depphantom/frontend

npm install
npm run dev
```

- Frontend: http://localhost:5173

> The Vite dev server proxies `/api` requests to the backend automatically — no CORS configuration needed for local development.

---

## Environment Configuration

Copy `.env.example` to `.env`. For a local demo, no changes are required.

```bash
cp .env.example .env
```

| Variable                             | Default                               | Description                                                                        |
| ------------------------------------ | ------------------------------------- | ---------------------------------------------------------------------------------- |
| `APP_ENV`                            | `development`                         | `development` or `production`                                                      |
| `DEBUG`                              | `false`                               | Enable debug logging — set `false` in production                                   |
| `DATABASE_URL`                       | `sqlite+aiosqlite:///./depphantom.db` | SQLite by default; swap to `postgresql+asyncpg://user:pass@host/db` for production |
| `CORS_ORIGINS`                       | `http://localhost:5173,...`           | Comma-separated allowed frontend origins                                           |
| `REGISTRY_TIMEOUT`                   | `10.0`                                | Registry API timeout in seconds                                                    |
| `TYPOSQUATTING_SIMILARITY_THRESHOLD` | `0.80`                                | Similarity threshold for typosquatting flag (0.0–1.0)                              |
| `NEW_PACKAGE_AGE_DAYS`               | `30`                                  | Days threshold to classify a package as "new"                                      |
| `LOW_DOWNLOAD_THRESHOLD`             | `100`                                 | Monthly downloads below this triggers a supporting signal                          |
| `DEMO_MODE`                          | `true`                                | Enable demo scenarios — does not affect live analysis                              |

---

## Deploy to Vercel

The Vercel configuration deploys the FastAPI backend as a Python Function and builds the Vite frontend into the same deployment. The frontend calls the API through `/api`, so no frontend API URL or cross-origin configuration is needed.

1. Import this repository into Vercel and keep the project root set to the repository root.
2. Add a managed PostgreSQL database and set these Vercel environment variables for Production (and Preview if needed):

    | Variable | Value |
    |---|---|
    | `DATABASE_URL` | `postgresql+asyncpg://...` from your database provider |
    | `APP_ENV` | `production` |
    | `DEBUG` | `false` |
    | `DEMO_MODE` | `true` only when demo scenarios are required |

3. Deploy. Vercel runs `vercel_build.py`, which installs frontend dependencies from the lockfile and builds the frontend; Python routes `/api/*` to FastAPI and serves the frontend for browser routes.

Do not use the default SQLite database for a Vercel deployment: function filesystems are ephemeral, so data can disappear between invocations. Use a persistent PostgreSQL database. The API docs are available at `/api/docs` after deployment.

---

## How It Works

### The verification pipeline

Every dependency request passes through 6 analyzers, then a risk engine:

```
POST /api/dependencies/verify
  { package, ecosystem, version, reason, source }
           │
           ▼
  ┌─────────────────────────────────────────────────┐
  │             Concurrent Analysis                 │
  │                                                 │
  │  ① Registry Check   ② Script Analysis  ③ Deps  │
  │    PyPI / npm API     Install scripts   Graph   │
  └────────────────────────┬────────────────────────┘
                           │
  ┌────────────────────────▼────────────────────────┐
  │             Sequential Analysis                 │
  │                                                 │
  │  ④ Typosquatting  ⑤ Metadata  ⑥ Intent         │
  │    rapidfuzz        Age/pub     Keyword cluster │
  └────────────────────────┬────────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │   Risk Engine   │
                 │ Signal scoring  │
                 │ Confidence calc │
                 │ Explanation gen │
                 └────────┬────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
        ALLOW           REVIEW         BLOCK
```

### The risk scoring model

Every signal contributes named points to a 0–100 score. Nothing is a black box.

| Signal                        | Points | Triggers when                         |
| ----------------------------- | ------ | ------------------------------------- |
| Package not found in registry | +35    | 404 from PyPI or npm                  |
| AI hallucination penalty      | +15    | Not found AND source is `AI_AGENT`    |
| Registry unreachable          | +25    | Timeout / network error (fail-closed) |
| Near-identical typosquatting  | +40    | ≥95% similarity to known package      |
| High typosquatting similarity | +30    | ≥90% similarity                       |
| Typosquatting                 | +20    | ≥80% similarity                       |
| Package registered today      | +25    | Age < 1 day                           |
| Package registered this week  | +20    | Age < 7 days                          |
| Package new                   | +10    | Age < 30 days                         |
| Install script CRITICAL       | +50    | 3+ dangerous patterns                 |
| Install script HIGH           | +35    | 1–2 dangerous patterns                |
| Install script MEDIUM         | +15    | Warning patterns only                 |
| Suspicious transitive deps    | +20    | Malicious-named dependencies          |
| Intent mismatch               | +30    | AI need ≠ package purpose             |
| Intent partial                | +10    | Unclear alignment                     |
| AI agent multiplier           | ×1.1   | Source is `AI_AGENT` and score > 10   |

| Score  | Risk level   | Default decision |
| ------ | ------------ | ---------------- |
| 0–24   | **LOW**      | ✅ ALLOW         |
| 25–49  | **MEDIUM**   | ⚠️ REVIEW        |
| 50–74  | **HIGH**     | ⛔ BLOCK         |
| 75–100 | **CRITICAL** | ⛔ BLOCK         |

---

## Features In Depth

### ① Registry Verification

- Real-time lookup against **PyPI** and **npm**
- Package existence, latest version, full version history
- Publisher / maintainer names
- Package age from first release date
- Download counts via PyPI Stats API (where available)
- License, homepage, description
- **Fail-closed**: timeouts and network errors → `registry_error=true` → risk elevated, never silent ALLOW
- Distinguishes confirmed 404 (not found) from network failure

### ② AI Hallucination Detection

- Identifies packages that don't exist in any supported registry
- AI-sourced requests receive extra risk weight
- Clear explanation: _"Package does not exist — likely AI-hallucinated"_
- Suggests known alternatives based on intent cluster matching

### ③ Typosquatting Detection

Five similarity metrics combined per comparison:

- `fuzz.ratio` — overall character similarity
- `fuzz.partial_ratio` — substring similarity
- Normalized ratio on separator-stripped names
- `Indel.normalized_similarity` — insertion/deletion distance
- `JaroWinkler.normalized_similarity` — prefix-biased similarity

Comparison set:

- **100+ well-known PyPI packages** (requests, numpy, django, flask, etc.)
- **75+ well-known npm packages** (lodash, react, express, axios, etc.)

Returns: top-5 matches with scores, self-match excluded.

### ④ Package Metadata Analysis

- Package age with configurable "new" threshold (default: 30 days)
- Version count — very few releases is a signal
- Download count signal (where available)
- Publisher, description, license presence checks
- Abandonment detection for very old packages with few versions

### ⑤ Static Installation Script Analysis

Fetches and scans install-related metadata — **zero code execution**.

Patterns detected:

| Category               | What it catches                                          |
| ---------------------- | -------------------------------------------------------- |
| Shell execution        | `subprocess`, `os.system()`, `os.popen()`                |
| Dynamic execution      | `exec()`, `eval()`, `__import__()`                       |
| Network during install | `urllib`, `requests.get`, `fetch`, `curl`, `wget`        |
| Credential access      | `HOME`, `AWS_`, `SECRET`, `PASSWORD`, `TOKEN`, `API_KEY` |
| Obfuscation            | `base64.b64decode`, `\x` / `\u` hex escapes              |
| File operations        | `open(…,'w')`, `shutil`, `os.remove`, `os.makedirs`      |
| Unsafe deserialization | `pickle.loads`, `marshal.loads`, `yaml.load`             |
| SSH key access         | `.ssh`, `id_rsa`, `id_ed25519`                           |
| Native code            | `ctypes`, `cffi`, `struct.unpack`                        |

Risk levels: `LOW` → `MEDIUM` → `HIGH` → `CRITICAL`

### ⑥ Dependency Graph Analysis

- Fetches declared dependencies from PyPI (`requires_dist`) and npm
- Pattern-matches dependency names against suspicious terms
- Flags packages with >50 dependencies (unusual for most tools)
- Reports names containing: `miner`, `backdoor`, `rootkit`, `keylogger`, `hack`, `exploit`

### ⑦ AI Intent Verification

12 intent clusters with known-package matching:

| Cluster    | Example AI reason                | Known packages                   |
| ---------- | -------------------------------- | -------------------------------- |
| `http`     | "HTTP client for REST API calls" | requests, httpx, axios, got      |
| `pdf`      | "Generate PDF reports"           | reportlab, fpdf2, pdf-lib, jspdf |
| `database` | "Store data in SQL database"     | sqlalchemy, pymongo, prisma      |
| `auth`     | "JWT authentication"             | pyjwt, authlib, jsonwebtoken     |
| `image`    | "Resize uploaded photos"         | pillow, sharp, canvas            |
| `crypto`   | "Encrypt sensitive data"         | cryptography, bcrypt, node-forge |
| `test`     | "Write unit tests"               | pytest, jest, vitest, mocha      |
| `cli`      | "Build a command-line tool"      | click, typer, commander, yargs   |
| `data`     | "Parse CSV files"                | pandas, numpy, papaparse, xlsx   |
| `logging`  | "Structured logging"             | loguru, winston, pino            |
| `email`    | "Send email notifications"       | sendgrid, nodemailer             |
| `date`     | "Handle timezone conversion"     | arrow, dayjs, date-fns, pendulum |

When AI says "HTTP client" but the package is named `crypto-miner-helper` — that's a `MISMATCH` signal (+30 points).

### ⑧ Explainable Risk Engine

- Named weighted signals — every point is traceable to a specific finding
- Human-readable explanation for every decision
- Confidence score (0.0–1.0) based on number of signals fired
- AI source multiplier (×1.1) for extra scrutiny on agent requests
- No magic numbers exposed to users — every reason is readable prose

### ⑨ ALLOW / REVIEW / BLOCK Decision Engine

- 7 configurable policies via the web UI, persisted to database
- Default policies: BLOCK for HIGH/CRITICAL, REVIEW for MEDIUM, ALLOW for LOW
- Human override with full audit trail (user, timestamp, reason recorded)
- Fail-closed: when analysis cannot complete → REVIEW, never ALLOW

### ⑩ Security Dashboard

Live statistics from the database (never hardcoded):

- Protected installations (total verifications)
- Blocked dependencies
- Review required
- High-risk packages detected
- AI hallucinations detected
- Recent security events table

### ⑪ Security Event Log

- All verifications, demo runs, and human overrides recorded
- Filterable by: risk level, decision, ecosystem, package name
- Paginated with limit/offset
- Full timestamp, source, and user attribution

### ⑫ Policy Configuration

Configurable through the web UI:

| Policy                                  | Options                | Default |
| --------------------------------------- | ---------------------- | ------- |
| Unknown package (not found in registry) | BLOCK / REVIEW         | BLOCK   |
| New package (< 30 days old)             | REVIEW / BLOCK / ALLOW | REVIEW  |
| Typosquatting detected                  | BLOCK / REVIEW         | BLOCK   |
| High-risk install script                | BLOCK / REVIEW         | BLOCK   |
| Intent mismatch                         | REVIEW / BLOCK         | REVIEW  |
| AI agent scrutiny multiplier            | enabled / disabled     | enabled |
| Fail-closed behavior                    | enabled / disabled     | enabled |

### ⑬ Demo Center

Four deterministic pre-computed scenarios for reliable demonstration:

| Scenario                 | Package             | Expected           | Demonstrates                   |
| ------------------------ | ------------------- | ------------------ | ------------------------------ |
| AI Hallucination         | `fast-pdf-renderer` | `CRITICAL / BLOCK` | Package doesn't exist          |
| Typosquatting Attack     | `requets`           | `CRITICAL / BLOCK` | 95% similar to `requests`      |
| Malicious Install Script | `crypto-utils-pro`  | `CRITICAL / BLOCK` | Dangerous postinstall behavior |
| Trusted Package          | `requests`          | `LOW / ALLOW`      | Product doesn't over-block     |

All demo results are clearly labeled `[DEMO DATA]` in the UI — never mixed with live analysis.

---

## API Reference

### Verify a Dependency

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

#### Request fields

| Field       | Type                                  | Required | Description                                  |
| ----------- | ------------------------------------- | -------- | -------------------------------------------- |
| `package`   | `string`                              | ✅       | Package name — only `[a-zA-Z0-9._-]` allowed |
| `ecosystem` | `"pypi"` or `"npm"`                   | ✅       | Package registry                             |
| `version`   | `string`                              | —        | Specific version or `"latest"`               |
| `reason`    | `string`                              | —        | AI-stated reason — used in intent analysis   |
| `source`    | `"AI_AGENT"` / `"MANUAL"` / `"CI_CD"` | —        | Who requested the dependency                 |

#### Response (abbreviated)

```json
{
  "request_id": 7,
  "analysis_id": 7,
  "package": "requets",
  "ecosystem": "pypi",
  "version": "latest",
  "source": "AI_AGENT",
  "overall_risk": "CRITICAL",
  "decision": "BLOCK",
  "confidence": 0.97,
  "explanation": "DepPhantom classified 'requets' as CRITICAL risk (score: 97/100). Primary concerns: Package name is 95% similar to trusted package 'requests'; Package was registered only 5 days ago; Installation script contains dangerous patterns.",
  "reasons": [
    "Package name is 95% similar to trusted package 'requests' — near-identical typosquatting detected.",
    "Package was registered only 5 days ago.",
    "Installation script contains dangerous patterns."
  ],
  "pipeline_steps": [
    {
      "name": "Registry Check",
      "status": "OK",
      "description": "Package found in registry."
    },
    {
      "name": "Typosquatting",
      "status": "DANGER",
      "description": "Resembles 'requests' (95%)"
    },
    {
      "name": "Publisher Analysis",
      "status": "WARNING",
      "description": "Publisher: unknown-user-4872"
    },
    {
      "name": "Package Metadata",
      "status": "DANGER",
      "description": "Package age: 5 days."
    },
    {
      "name": "Install Script",
      "status": "DANGER",
      "description": "Script risk: HIGH."
    },
    {
      "name": "Intent Analysis",
      "status": "DANGER",
      "description": "MISMATCH — likely impersonation of 'requests'"
    },
    {
      "name": "Dependency Graph",
      "status": "OK",
      "description": "Dependency risk: LOW."
    }
  ],
  "typosquat": {
    "is_suspicious": true,
    "closest_match": "requests",
    "similarity_score": 0.95,
    "all_matches": [{ "package": "requests", "score": 0.95 }]
  },
  "registry": {
    "exists": true,
    "registry_error": false,
    "latest_version": "0.0.1",
    "published_at": "2025-01-15T00:00:00Z",
    "publisher": "unknown-user-4872"
  },
  "metadata": {
    "package_age_days": 5,
    "version_count": 1,
    "is_new": true
  },
  "script_risk": {
    "risk_level": "HIGH",
    "findings": [
      "Shell subprocess execution detected",
      "Network access during installation"
    ]
  },
  "intent": {
    "match_level": "MISMATCH",
    "explanation": "AI stated HTTP client need. 'requets' is not the expected 'requests' package."
  },
  "timestamp": "2025-07-15T14:32:01Z"
}
```

### All Endpoints

| Method | Endpoint                   | Description                                                   |
| ------ | -------------------------- | ------------------------------------------------------------- |
| `POST` | `/api/dependencies/verify` | **Main endpoint** — verify a dependency before installation   |
| `GET`  | `/api/dependencies/{id}`   | Retrieve a previous verification result by ID                 |
| `GET`  | `/api/dashboard`           | Dashboard statistics (live from database)                     |
| `GET`  | `/api/events`              | Security event audit log with filtering                       |
| `GET`  | `/api/policies`            | Current policy configuration                                  |
| `PUT`  | `/api/policies`            | Update a policy value                                         |
| `GET`  | `/api/demo/scenarios`      | List available demo scenarios                                 |
| `POST` | `/api/demo/scenario`       | Run a pre-built demo scenario                                 |
| `POST` | `/api/decisions/override`  | Human override of a system decision (audited)                 |
| `GET`  | `/api/health`              | `{"status":"healthy","service":"DepPhantom","database":"ok"}` |

**Event log filters** (`GET /api/events`):

| Parameter       | Description                                 |
| --------------- | ------------------------------------------- |
| `limit` (1–200) | Events to return (default: 50)              |
| `offset`        | Pagination offset                           |
| `risk`          | Filter: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `decision`      | Filter: `ALLOW`, `REVIEW`, `BLOCK`          |
| `ecosystem`     | Filter: `pypi`, `npm`                       |
| `package`       | Substring search on package name            |

Full interactive docs: http://localhost:8000/api/docs

---

## Demo Scenarios

Navigate to **Demo Center** in the UI, or call the API directly:

```bash
# Scenario 1 — AI Hallucination (fast-pdf-renderer → CRITICAL / BLOCK)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "hallucinated"}'

# Scenario 2 — Typosquatting Attack (requets → CRITICAL / BLOCK)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "typosquatting"}'

# Scenario 3 — Malicious Install Script (crypto-utils-pro → CRITICAL / BLOCK)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "suspicious_existing"}'

# Scenario 4 — Trusted Package (requests → LOW / ALLOW)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "trusted"}'
```

### 90-second hackathon demo flow

```
1. Open dashboard     → Metrics: protected installs, blocked, hallucinations detected
2. Demo Center        → Click "Typosquatting Attack"
3. Result appears     → requets → CRITICAL / BLOCK
4. Inspect evidence   → 95% similar to 'requests', 5-day-old package, dangerous script
5. Demo Center        → Click "Trusted Package"
6. Result appears     → requests → LOW / ALLOW
7. Contrast           → "Same technology. One is safe. One is an attack."
8. Verify Dependency  → Live analysis: type "fast-pdf-renderer" in the real form
9. Security Events    → Show the full filterable audit log
```

---

## Architecture

### System diagram

```
                  ┌─────────────────────┐
                  │   AI Coding Agent   │
                  │ (Bob, Copilot,      │
                  │  Cursor, Devin...)  │
                  └──────────┬──────────┘
                             │
                             │ POST /api/dependencies/verify
                             │ {package, ecosystem, version, reason, source}
                             ▼
                  ┌─────────────────────┐
                  │     DepPhantom      │
                  │  Security Gateway   │
                  │   (FastAPI/Python)  │
                  └──────────┬──────────┘
                             │
         ┌───────────────────┼──────────────────────┐
         ▼                   ▼                      ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Registry Check  │ │ Package Analysis│ │ AI Intent Check │
│ PyPI JSON API   │ │ Typosquatting   │ │ Keyword Cluster │
│ npm Registry    │ │ Metadata Age    │ │ Name Matching   │
│ PyPI Stats      │ │ Script Patterns │ │ Mismatch Detect │
│                 │ │ Dep Graph       │ │                 │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         └───────────────────┼────────────────────┘
                             ▼
                   ┌─────────────────────┐
                   │    Risk Engine      │
                   │ Per-signal scoring  │
                   │ Confidence calc     │
                   │ Explanation gen     │
                   └──────────┬──────────┘
                              │
                   ┌──────────┼──────────┐
                   ▼          ▼          ▼
                 ALLOW      REVIEW      BLOCK
                   │          │          │
                   │          │          └─ Installation prevented
                   │          └─ Human approval required
                   └─ Installation proceeds
```

### Data flow

```
1. Request arrives → Pydantic validates input (invalid chars → HTTP 422)
2. DependencyRequest saved to database
3. Three analyzers run concurrently (asyncio.create_task):
   • Registry check  → pypi.org or registry.npmjs.org
   • Script analysis → package install metadata
   • Dep graph       → requires_dist / package dependencies
4. Three analyzers run synchronously (fast, in-memory):
   • Typosquatting   → rapidfuzz against known package list
   • Metadata        → derived from registry result
   • Intent          → keyword cluster matching
5. Risk engine aggregates all signals → score, risk level, confidence
6. Decision engine applies policy → ALLOW / REVIEW / BLOCK
7. PackageAnalysis + Decision + AuditEvent saved to database
8. Full AnalysisResponse returned to client
```

### Database schema

```
DependencyRequest         PackageAnalysis           Decision
─────────────────         ───────────────           ────────
id                        id                        id
package_name              dependency_request_id     analysis_id
ecosystem                 exists                    decision
requested_version         package_age_days          user
ai_reason                 publisher                 timestamp
source                    version_count             override_reason
timestamp                 download_count            is_override
                          similarity_score
                          closest_package           AuditEvent
                          install_script_risk       ──────────
                          dependency_risk           id
                          intent_match              event_type
                          overall_risk              package_name
                          confidence                ecosystem
                          raw_signals (JSON)        risk_level
                          explanation               decision
                          timestamp                 user
                                                    timestamp
PolicyConfig              details (JSON)
────────────
id / key / value / description / updated_at
```

### Project structure

```
depphantom/
├── backend/
│   ├── analyzers/
│   │   ├── registry/checker.py       PyPI + npm lookup (fail-closed)
│   │   ├── typosquatting/detector.py Multi-metric fuzzy name similarity
│   │   ├── metadata/analyzer.py      Age, versions, publisher signals
│   │   ├── scripts/analyzer.py       Static install script analysis
│   │   ├── dependencies/analyzer.py  Transitive dependency risk
│   │   └── intent/analyzer.py        AI intent vs. package purpose
│   ├── api/routes.py                 All REST endpoints
│   ├── risk/engine.py                Weighted signal aggregation
│   ├── services/verification.py      Orchestration pipeline
│   ├── demo/scenarios/presets.py     Pre-built demo fixtures
│   ├── models.py                     SQLAlchemy ORM models
│   ├── schemas.py                    Pydantic schemas + input validation
│   ├── database.py                   Async SQLAlchemy + auto table creation
│   ├── config.py                     Environment-based settings
│   ├── main.py                       FastAPI app + CORS + error handlers
│   └── tests/test_core.py            28 unit tests
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx         Security metrics
│       │   ├── VerifyDependency.tsx  Live verification form
│       │   ├── AnalysisResult.tsx    Full security report
│       │   ├── SecurityEvents.tsx    Filterable audit log
│       │   ├── Policies.tsx          Policy configuration
│       │   └── DemoCenter.tsx        Demo scenario runner
│       ├── components/
│       │   ├── Layout.tsx            Navigation sidebar
│       │   └── ui.tsx                RiskBadge, DecisionBadge, SignalRow, etc.
│       ├── services/api.ts           Axios API client
│       └── types/index.ts            TypeScript interfaces
├── submission/                       Hackathon submission documents
├── startup.py                        Backend launch script
├── docker-compose.yml                Multi-container deployment
├── Dockerfile.backend                Python container (non-root user)
├── Dockerfile.frontend               React build + nginx
├── nginx.conf                        Static serving + API proxy
├── .env.example                      Environment template (safe to commit)
├── SECURITY.md                       Security policy and threat model
├── CONTRIBUTING.md                   Development guide
└── README.md                         This file
```

---

## Running Tests

```bash
cd depphantom
python -m pytest backend/tests/ -v
```

## Contributors

- Your Name — Contributor

**28 tests — all pass.**

| Test class                  | What it tests                                                             |
| --------------------------- | ------------------------------------------------------------------------- |
| `TestTyposquattingDetector` | `requets`→`requests`, `loadsh`→`lodash`, no false positives on `requests` |
| `TestRiskEngine`            | Non-existent package → HIGH/CRITICAL, trusted package → LOW               |
| `TestDecisionEngine`        | LOW→ALLOW, MEDIUM→REVIEW, HIGH→BLOCK, CRITICAL→BLOCK                      |
| `TestIntentAnalyzer`        | HTTP intent matches requests; suspicious name produces mismatch           |
| `TestMetadataAnalyzer`      | New packages flagged DANGER; old packages get OK signal                   |
| `TestDemoScenarios`         | All 4 scenarios have correct risk level and decision                      |
| `TestRegistryFailClosed`    | Registry error → never produces ALLOW; risk elevated to MEDIUM+           |
| `TestInputValidation`       | Path traversal (`../etc/passwd`) → 422; shell metacharacters → 422        |

---

## Security

See [SECURITY.md](SECURITY.md) for the complete security model, threat model, and responsible disclosure policy.

### Security properties

| Property                 | Implementation                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No package execution** | All analysis is static — registry metadata and pattern matching only                                                                                                 |
| **Fail-closed**          | Network errors raise risk, never produce silent ALLOW. `registry_error` flag distinguishes unavailability from confirmed 404                                         |
| **Input validation**     | Package names validated against `[a-zA-Z0-9._-]` allowlist. Path traversal (`../`), shell metacharacters (`;`, `\|`, `&`, `$`, backtick), and empty names → HTTP 422 |
| **No secrets in code**   | All configuration via environment variables; `.env` is gitignored                                                                                                    |
| **CORS controlled**      | Configurable per deployment via `CORS_ORIGINS` environment variable                                                                                                  |
| **Non-root container**   | Docker backend runs as dedicated `depphantom` user                                                                                                                   |
| **Audit everything**     | Every decision and human override is logged with evidence                                                                                                            |
| **Error sanitization**   | Global exception handler prevents stack traces / internal details leaking in 500 errors                                                                              |

### Threat model

| Threat                               | Status                                     |
| ------------------------------------ | ------------------------------------------ |
| AI-hallucinated non-existent package | ✅ Detected by registry check              |
| Typosquatting / name impersonation   | ✅ Detected by fuzzy similarity            |
| Newly registered suspicious package  | ✅ Detected by age metadata                |
| Malicious install scripts            | ✅ Detected by static pattern analysis     |
| Suspicious transitive dependencies   | ✅ Detected by dep graph analysis          |
| AI intent mismatch                   | ✅ Detected by keyword clustering          |
| Known CVEs in legitimate packages    | ❌ Not a CVE scanner — use Dependabot/Snyk |
| Compromised trusted packages         | ❌ No runtime analysis                     |
| Zero-signal novel malware            | ❌ Cannot detect unknown unknowns          |

---

## Tech Stack

### Frontend

| Technology       | Version | Purpose                   |
| ---------------- | ------- | ------------------------- |
| React            | 19.x    | UI framework              |
| TypeScript       | 5.x     | Type safety               |
| Vite             | 8.x     | Build tool and dev server |
| React Router DOM | 7.x     | Client-side routing       |
| Axios            | 1.x     | HTTP client (API calls)   |
| Lucide React     | Latest  | Icons                     |
| date-fns         | Latest  | Date formatting           |

### Backend

| Technology         | Version | Purpose                             |
| ------------------ | ------- | ----------------------------------- |
| Python             | 3.11+   | Runtime                             |
| FastAPI            | 0.111+  | REST API framework                  |
| Uvicorn            | 0.29+   | ASGI server                         |
| SQLAlchemy (async) | 2.0+    | ORM                                 |
| aiosqlite          | 0.20+   | Async SQLite driver                 |
| Pydantic v2        | 2.7+    | Validation and serialization        |
| pydantic-settings  | 2.x     | Environment configuration           |
| httpx              | 0.27+   | Async HTTP for registry API calls   |
| rapidfuzz          | 3.x     | Multi-metric fuzzy string matching  |
| Levenshtein        | 0.25+   | Edit distance algorithms            |
| python-dateutil    | 2.9+    | Date parsing from registry metadata |

### Infrastructure

| Technology            | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| Docker                | Container images for backend and frontend                           |
| docker-compose        | Multi-container orchestration                                       |
| nginx                 | Frontend static serving + API reverse proxy                         |
| SQLite (default)      | Zero-config database for development and single-instance deployment |
| PostgreSQL (optional) | Production multi-instance — change `DATABASE_URL`                   |

---

## Limitations

DepPhantom is a **risk signal detection system** — not a security guarantee.

- An `ALLOW` decision means no risk signals were found — not that the package is provably safe
- A `BLOCK` decision means risk signals were found — not that the package is provably malicious
- Typosquatting detection compares against a curated list; novel packages outside the list are not compared
- Static script analysis cannot detect runtime-only obfuscation or purely behavioral malware
- Download stats depend on the PyPI Stats API; unavailability degrades confidence, not correctness
- No authentication on the API — suitable for internal/demo use; add an API gateway for public deployment
- Single-instance SQLite; swap to PostgreSQL for multi-replica production

---

## Future Work

- **CLI integration** — `depphantom verify requests pypi` for direct agent/pipeline use
- **CI/CD gate** — GitHub Actions step that blocks PRs with suspicious dependencies
- **More ecosystems** — Maven (Java), Cargo (Rust), NuGet (.NET), RubyGems
- **Sandbox dynamic analysis** — isolated execution for deeper behavioral inspection
- **Policy-as-code** — YAML policy files committed to repositories
- **Custom allowlists/blocklists** — organization-specific trusted and blocked packages
- **SBOM generation** — Software Bill of Materials from verified dependency sets
- **Enterprise authentication** — SSO / OIDC for multi-user deployments
- **Alerting** — Slack/Teams notifications on BLOCK decisions

See [submission/FUTURE_SCOPE.md](submission/FUTURE_SCOPE.md) for the full roadmap.

---

## License

[MIT](LICENSE)

---

_Built for the IBM Bob 2.0 Hackathon_
