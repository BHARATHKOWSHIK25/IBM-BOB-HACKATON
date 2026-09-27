# DepPhantom — Technology Stack

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 8.x | Build tool and dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client (API calls) |
| Lucide React | Latest | Icons |
| date-fns | Latest | Date formatting |
| clsx | Latest | Conditional classnames |

**Architecture Pattern**: Single-page application with client-side routing. No framework-specific SSR. Component-based with inline styles (no CSS-in-JS dependency, no Tailwind runtime).

---

## Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.111+ | REST API framework |
| Uvicorn | 0.29+ | ASGI server |
| SQLAlchemy | 2.0+ (async) | ORM and database layer |
| aiosqlite | 0.20+ | Async SQLite driver |
| Pydantic v2 | 2.7+ | Request/response validation |
| pydantic-settings | 2.x | Environment configuration |
| httpx | 0.27+ | Async HTTP client for registry APIs |
| rapidfuzz | 3.x | Fuzzy string matching for typosquatting |
| Levenshtein | 0.25+ | Edit distance algorithms |
| python-dateutil | 2.9+ | Date parsing from registry metadata |

**Architecture Pattern**: Layered service architecture. Controllers (routes) → Services (orchestration) → Analyzers (domain logic). No business logic in route handlers.

---

## Database

| Technology | Purpose |
|---|---|
| SQLite (default) | Development and single-instance production |
| SQLAlchemy async | ORM layer, supports migration to PostgreSQL |
| Alembic | Database migration framework (available) |

**Migration path**: The `DATABASE_URL` environment variable supports any SQLAlchemy-compatible async database URL. Switch to PostgreSQL by changing `sqlite+aiosqlite://` to `postgresql+asyncpg://`.

---

## Security Analysis

| Component | Method | Purpose |
|---|---|---|
| Registry Checker | httpx + PyPI/npm JSON API | Package existence and metadata |
| Typosquatting Detector | rapidfuzz (ratio, partial_ratio, indel, Jaro-Winkler) | Multi-metric name similarity |
| Metadata Analyzer | Static analysis of registry metadata | Age, versions, publisher signals |
| Script Analyzer | Pattern-based regex scan on metadata | Install script static analysis |
| Dependency Analyzer | httpx + registry API | Transitive dependency risk |
| Intent Analyzer | Keyword clustering + pattern matching | AI-stated need vs. package purpose |
| Risk Engine | Weighted signal aggregation | Transparent scoring |

**Security Constraint**: No package is ever executed to determine if it is safe. All analysis is static.

---

## Infrastructure / Deployment

| Technology | Purpose |
|---|---|
| Docker | Container build for backend and frontend |
| docker-compose | Multi-container orchestration |
| Nginx | Frontend static serving and API reverse proxy |

---

## Testing

| Technology | Purpose |
|---|---|
| pytest | Unit and integration test runner |
| pytest-asyncio | Async test support |

---

## Development Tools

| Technology | Purpose |
|---|---|
| TypeScript strict mode | Frontend type safety |
| Python type hints | Backend type safety |
| Pydantic v2 validators | Request/response validation |
