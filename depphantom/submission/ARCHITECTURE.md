# DepPhantom — Architecture

## System Architecture

```
                    ┌─────────────────────┐
                    │   AI Coding Agent   │
                    │  (Bob, Copilot,     │
                    │   Cursor, Devin...) │
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
         ┌─────────────────────┼──────────────────────┐
         ▼                     ▼                      ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Registry Check  │  │ Package Analysis│  │ AI Intent Check │
│                 │  │                 │  │                 │
│ PyPI JSON API   │  │ Typosquatting   │  │ Keyword Cluster │
│ npm Registry    │  │ Metadata Age    │  │ Name Matching   │
│ PyPI Stats      │  │ Script Patterns │  │ Mismatch Detect │
│                 │  │ Dep Graph       │  │                 │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                     │
         └────────────────────┼─────────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │    Risk Engine      │
                    │                    │
                    │ Per-signal scoring  │
                    │ Transparent weights │
                    │ Confidence calc     │
                    └──────────┬──────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
                  ALLOW      REVIEW      BLOCK
                    │          │          │
                    │          │          └── Installation prevented
                    │          └── Human approval required
                    └── Installation proceeds
```

## Component Architecture

```
depphantom/
├── backend/                    FastAPI application
│   ├── api/
│   │   └── routes.py           REST API endpoints
│   ├── analyzers/              Analysis modules (run in parallel)
│   │   ├── registry/           PyPI + npm registry lookup
│   │   ├── typosquatting/      Fuzzy name similarity
│   │   ├── metadata/           Age, versions, publisher
│   │   ├── scripts/            Install script static analysis
│   │   ├── dependencies/       Transitive dependency analysis
│   │   └── intent/             AI intent vs. package purpose
│   ├── risk/
│   │   └── engine.py           Weighted signal aggregation
│   ├── services/
│   │   └── verification.py     Orchestration layer
│   ├── demo/
│   │   └── scenarios/          Pre-built demo fixtures
│   ├── models.py               SQLAlchemy ORM models
│   ├── schemas.py              Pydantic request/response schemas
│   ├── database.py             Async SQLAlchemy setup
│   ├── config.py               Environment-based configuration
│   └── main.py                 FastAPI app + middleware
│
├── frontend/                   React + TypeScript SPA
│   └── src/
│       ├── pages/              Route-level components
│       │   ├── Dashboard.tsx
│       │   ├── VerifyDependency.tsx
│       │   ├── AnalysisResult.tsx
│       │   ├── SecurityEvents.tsx
│       │   ├── Policies.tsx
│       │   └── DemoCenter.tsx
│       ├── components/
│       │   ├── Layout.tsx      Navigation sidebar
│       │   └── ui.tsx          Shared UI primitives
│       ├── services/
│       │   └── api.ts          Axios API client
│       └── types/
│           └── index.ts        TypeScript interfaces
│
├── startup.py                  Backend launch script
├── docker-compose.yml          Multi-container deployment
├── Dockerfile.backend          Backend container
├── Dockerfile.frontend         Frontend container + Nginx
└── nginx.conf                  Frontend serving + API proxy
```

## Data Flow

### Verification Request

```
1. Frontend or AI Agent sends:
   POST /api/dependencies/verify
   {package: "requets", ecosystem: "pypi", reason: "HTTP client", source: "AI_AGENT"}

2. Route handler validates input via Pydantic

3. DependencyRequest persisted to database

4. Parallel async analysis:
   - Registry check (httpx → pypi.org)
   - Script analysis (httpx → pypi.org metadata)
   - Dependency analysis (httpx → pypi.org requires_dist)

5. Synchronous analysis:
   - Typosquatting detection (rapidfuzz against known package list)
   - Metadata analysis (from registry result)
   - Intent analysis (keyword matching)

6. Risk engine aggregates all signals into score + risk level

7. Decision engine applies policy to produce ALLOW/REVIEW/BLOCK

8. PackageAnalysis + Decision persisted to database

9. AuditEvent persisted

10. Full AnalysisResponse returned to client
```

## Database Schema

```
DependencyRequest
  id, package_name, ecosystem, requested_version,
  ai_reason, source, timestamp

PackageAnalysis
  id, dependency_request_id,
  exists, package_age_days, publisher, version_count,
  download_count, similarity_score, closest_package,
  install_script_risk, dependency_risk, intent_match,
  overall_risk, confidence, raw_signals, explanation, timestamp

Decision
  id, analysis_id, decision (ALLOW/REVIEW/BLOCK),
  user, timestamp, override_reason, is_override

AuditEvent
  id, event_type, package_name, ecosystem,
  risk_level, decision, user, timestamp, details

PolicyConfig
  id, key, value, description, updated_at
```

## Security Design Principles

1. **Never execute untrusted code** — all analysis is static
2. **Fail closed** — registry unavailability → REVIEW/BLOCK
3. **No secrets in code** — all configuration via environment variables
4. **Input validation** — all inputs validated via Pydantic before processing
5. **Audit everything** — all decisions and overrides logged
6. **CORS controlled** — configurable allowed origins
7. **Transparent scoring** — every decision has supporting evidence
