# DepPhantom

**A pre-installation security gate that protects autonomous coding agents from hallucinated, impersonated, suspicious, and intent-mismatched dependencies.**

> Don't let AI invent your next supply-chain attack.

---

## The Problem

Autonomous AI coding agents can **hallucinate package names** — inventing plausible-sounding dependencies that don't exist. Attackers can predict these patterns and register malicious packages under those hallucinated names. When the AI agent installs the package automatically, malicious code executes silently.

**Existing tools scan packages after installation. DepPhantom acts before.**

```
Traditional approach:
  AI Agent → pip install → Package enters environment → Security scan

DepPhantom:
  AI Agent → DepPhantom Security Gate → Verified safe → pip install
                                      → Suspicious → BLOCKED
```

---

## Key Features

| Feature | Description |
|---|---|
| **AI Hallucination Detection** | Identifies packages that don't exist — likely AI-invented |
| **Typosquatting Detection** | Multi-metric fuzzy matching against 175+ known packages |
| **Registry Verification** | Real-time PyPI and npm registry lookup |
| **Metadata Analysis** | Package age, version history, publisher, adoption signals |
| **Static Script Analysis** | Pattern-based install script inspection — no execution |
| **Dependency Graph Analysis** | Transitive dependency risk detection |
| **AI Intent Verification** | Compares AI-stated need vs. package apparent purpose |
| **Explainable Risk Engine** | Transparent scoring — every decision has evidence |
| **ALLOW / REVIEW / BLOCK** | Configurable policy-based decisions |
| **Fail-Closed** | Registry errors → REVIEW/BLOCK, never silent ALLOW |
| **Input Validation** | Package names validated against safe character allowlist |
| **Audit Trail** | Full event log of all verification decisions |
| **Demo Center** | Four built-in attack scenarios for demonstration |

---

## Quick Start

### Option A — Docker Compose (Recommended)

**Prerequisites**: Docker + Docker Compose

```bash
git clone <repo-url>
cd depphantom

# Copy and configure environment (no changes needed for local demo)
cp .env.example .env

# Build and start (first run takes ~2 minutes to build)
docker-compose up --build
```

- Frontend: http://localhost
- API docs: http://localhost/api/docs
- Health: http://localhost/api/health

**For a custom domain deployment:**

```bash
CORS_ORIGINS=https://your-domain.com docker-compose up --build
```

---

### Option B — Local Development

**Prerequisites**: Python 3.11+, Node.js 18+

#### Backend

```bash
cd depphantom

# Create and activate virtual environment
python -m venv .venv

# Linux/macOS:
source .venv/bin/activate

# Windows:
.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Copy environment config (no changes needed for local dev)
cp .env.example .env

# Start the backend
python startup.py
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/api/docs

#### Frontend

In a separate terminal:

```bash
cd depphantom/frontend

npm install
npm run dev
```

Frontend runs at: http://localhost:5173

> The Vite dev server automatically proxies `/api` requests to the backend at `localhost:8000`.

---

## Configuration

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./depphantom.db` | Database connection |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed frontend origins (comma-separated) |
| `REGISTRY_TIMEOUT` | `10.0` | Registry API timeout (seconds) |
| `TYPOSQUATTING_SIMILARITY_THRESHOLD` | `0.80` | Similarity threshold for typosquatting detection (0–1) |
| `NEW_PACKAGE_AGE_DAYS` | `30` | Package age threshold (days) for "new package" signal |
| `DEMO_MODE` | `true` | Enable demo scenarios (does not affect live analysis) |
| `DEBUG` | `false` | Enable debug logging (disable in production) |

---

## Running Tests

```bash
cd depphantom
python -m pytest backend/tests/ -v
```

Expected: **28 tests pass**.

Test coverage includes:
- Typosquatting detection
- Risk engine scoring
- Decision policy
- Intent analysis
- Metadata analysis
- Demo scenarios
- **Registry fail-closed behavior** (registry error → never ALLOW)
- **Input validation** (path traversal, shell metacharacters blocked)

---

## API

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

Response:
```json
{
  "package": "requets",
  "overall_risk": "CRITICAL",
  "decision": "BLOCK",
  "confidence": 0.97,
  "reasons": [
    "Package name is 95% similar to trusted package 'requests'",
    "Package was registered only 5 days ago",
    "Installation script contains dangerous patterns"
  ],
  "explanation": "...",
  "pipeline_steps": [...],
  "typosquat": { "closest_match": "requests", "similarity_score": 0.95 }
}
```

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/dependencies/verify` | Verify a dependency before installation |
| `GET` | `/api/dependencies/{id}` | Get a previous verification result |
| `GET` | `/api/dashboard` | Dashboard statistics |
| `GET` | `/api/events` | Audit log (filterable by risk, decision, ecosystem, package) |
| `GET` | `/api/policies` | Current policy configuration |
| `PUT` | `/api/policies` | Update a policy |
| `GET` | `/api/demo/scenarios` | List demo scenarios |
| `POST` | `/api/demo/scenario` | Run a demo scenario |
| `POST` | `/api/decisions/override` | Human override of a system decision |
| `GET` | `/api/health` | Health check |

Full interactive docs: http://localhost:8000/api/docs

---

## Demo Scenarios

Navigate to **Demo Center** in the UI, or call the API directly:

```bash
# Typosquatting attack (requets → CRITICAL / BLOCK)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "typosquatting"}'

# AI hallucination (fast-pdf-renderer → CRITICAL / BLOCK)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "hallucinated"}'

# Trusted package (requests → LOW / ALLOW)
curl -X POST http://localhost:8000/api/demo/scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_id": "trusted"}'
```

| Scenario ID | Package | Expected Result |
|---|---|---|
| `hallucinated` | `fast-pdf-renderer` | BLOCK / CRITICAL |
| `typosquatting` | `requets` | BLOCK / CRITICAL |
| `suspicious_existing` | `crypto-utils-pro` | BLOCK / CRITICAL |
| `trusted` | `requests` | ALLOW / LOW |

> All demo scenarios are clearly labeled as `[DEMO DATA]` in the UI.

---

## Architecture

```
AI Coding Agent
      ↓ POST /api/dependencies/verify
DepPhantom Security Gateway (FastAPI)
      ↓
  ┌─────────────────────────────────────┐
  │  Registry Check  → PyPI / npm       │
  │  Typosquatting   → rapidfuzz        │
  │  Metadata        → age/version/pub  │
  │  Script Analysis → static patterns  │
  │  Dep Graph       → transitive deps  │
  │  AI Intent       → keyword cluster  │
  └─────────────────────────────────────┘
      ↓
  Risk Engine (transparent scoring)
      ↓
  ALLOW | REVIEW | BLOCK
```

**Security Principle**: No package is ever executed to determine if it is safe. All analysis is static.

---

## Project Structure

```
depphantom/
├── backend/
│   ├── analyzers/          Six analysis modules (run concurrently)
│   │   ├── registry/       PyPI + npm registry verification
│   │   ├── typosquatting/  Fuzzy name similarity detection
│   │   ├── metadata/       Package age, versions, publisher
│   │   ├── scripts/        Static install script analysis
│   │   ├── dependencies/   Transitive dependency risk
│   │   └── intent/         AI intent vs package purpose
│   ├── api/routes.py       REST API endpoints
│   ├── risk/engine.py      Explainable weighted risk scoring
│   ├── services/           Orchestration layer
│   ├── demo/scenarios/     Pre-built demo fixtures
│   ├── models.py           Database ORM models
│   ├── schemas.py          API request/response schemas
│   └── main.py             Application entry point
├── frontend/src/
│   ├── pages/              Dashboard, Verify, Events, Policies, Demo
│   ├── components/         Layout, shared UI components
│   └── services/api.ts     API client
├── submission/             Hackathon submission documents
├── startup.py              Backend launch script
├── docker-compose.yml      Production deployment
├── Dockerfile.backend      Backend container
├── Dockerfile.frontend     Frontend container (nginx)
├── nginx.conf              nginx reverse proxy config
├── .env.example            Environment template
├── SECURITY.md             Security policy and threat model
├── CONTRIBUTING.md         Development guide
└── README.md               This file
```

---

## Security

See [SECURITY.md](SECURITY.md) for the full security model, threat model, and responsible disclosure policy.

**Key security properties**:
- DepPhantom never executes untrusted packages
- All analysis is static (metadata + pattern matching)
- **Fail-closed**: registry failures result in REVIEW/BLOCK, never silent ALLOW
- **Input validation**: package names validated against safe character allowlist; path traversal and shell metacharacters blocked (HTTP 422)
- No secrets stored in source code
- CORS configurable per deployment

---

## Limitations

DepPhantom is a risk detection system. It does not:
- Guarantee that an ALLOW decision is safe
- Detect every malicious package
- Replace CVE scanning (use Dependabot/Snyk for that)
- Prevent all supply-chain attacks
- Perform runtime sandbox analysis

It detects risk signals associated with AI-hallucinated, impersonated, and suspicious packages.

---

## Future Work

- CLI tool for direct agent integration
- CI/CD pipeline gate (GitHub Actions)
- More ecosystems (Maven, Cargo, NuGet)
- Sandbox-based dynamic analysis
- Organization analytics and policy-as-code

See [submission/FUTURE_SCOPE.md](submission/FUTURE_SCOPE.md) for details.

---

## License

[MIT](LICENSE)

---

*Built for the IBM Bob 2.0 Hackathon*
