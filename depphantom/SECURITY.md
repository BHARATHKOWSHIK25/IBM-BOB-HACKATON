# DepPhantom Security Policy

## Security Model

DepPhantom is designed as a security tool. It follows strict principles regarding how it handles untrusted input and package data.

### Core Security Guarantees

#### 1. No Package Execution
DepPhantom **never executes an untrusted package** to determine whether it is safe. All analysis is performed using:
- Static metadata from public registry APIs
- Pattern-based string analysis
- Fuzzy string matching
- Keyword clustering

This means a malicious package cannot exploit DepPhantom's analysis process.

#### 2. No Credential Access
DepPhantom does not:
- Access SSH keys, cloud credentials, or secrets from the host environment
- Require authentication tokens to operate (public registry APIs only)
- Store or transmit API keys, passwords, or secrets

#### 3. Fail-Closed Behavior
When registry verification cannot complete (network failure, rate limits, timeouts), DepPhantom does **not** silently approve the dependency. The default policy is `REVIEW` or `BLOCK`, configurable via policy settings.

#### 4. Input Validation
All API inputs are validated via Pydantic v2 before processing. Malformed inputs are rejected before reaching any analysis logic.

#### 5. No Shell Execution from User Input
DepPhantom never constructs and executes shell commands using user-supplied package names or other input.

---

## Threat Model

### Threats DepPhantom Addresses

| Threat | Detection Method |
|---|---|
| AI-hallucinated non-existent package | Registry existence check |
| Typosquatting / name impersonation | Multi-metric fuzzy similarity |
| Newly registered suspicious package | Package age analysis |
| Malicious install script | Static pattern analysis |
| Suspicious transitive dependencies | Dependency graph analysis |
| AI intent mismatch | Keyword clustering |

### Threats DepPhantom Does Not Address

| Threat | Reason |
|---|---|
| Zero-day vulnerabilities in legitimate packages | DepPhantom is not a CVE scanner |
| Compromised legitimate packages (supply chain attacks after publication) | Requires behavioral analysis of existing trusted packages |
| Packages with no discoverable malicious signals | Cannot detect unknown unknowns |
| Attacks targeting the DepPhantom service itself | Requires separate security review |

---

## Limitations

DepPhantom is a **risk detection system** with the following known limitations:

1. **Not a guarantee**: DepPhantom cannot guarantee that a package is safe. It identifies risk signals.
2. **Not complete**: A malicious package with no detectable signals will not be blocked.
3. **Registry-dependent**: Analysis quality depends on registry API availability.
4. **No runtime analysis**: Without sandbox execution, runtime behavior cannot be observed.
5. **Known package list**: Typosquatting detection is based on a curated list of known packages. Novel packages outside this list may not be compared.
6. **Download stats**: PyPI stats API is an external service; download counts may be unavailable or delayed.

---

## Secret Management

- No secrets or credentials are stored in source code
- All configuration is via environment variables (see `.env.example`)
- The `.env` file is excluded from version control via `.gitignore`
- The database stores analysis results only — no credentials

---

## Reporting Vulnerabilities

If you discover a security vulnerability in DepPhantom:

1. **Do not** open a public GitHub issue
2. Contact the maintainers privately
3. Provide: description, reproduction steps, potential impact
4. Allow reasonable time for a fix before public disclosure

---

## Deployment Security Notes

When deploying DepPhantom in a production environment:

1. Run the backend behind a reverse proxy (nginx/Caddy)
2. Configure `CORS_ORIGINS` to only allow your frontend domain
3. Set `DEBUG=false`
4. Use a persistent database volume (not the container's filesystem)
5. Consider rate-limiting the `/api/dependencies/verify` endpoint
6. The backend does not require internet access other than to registry APIs (pypi.org, registry.npmjs.org)
7. All registry API calls are read-only (GET requests)
