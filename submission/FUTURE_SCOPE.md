# DepPhantom — Future Scope

## Planned Features (Not Yet Implemented)

### Short-Term (Post-Hackathon)

#### CLI Tool
```bash
depphantom verify requests
depphantom verify requets --reason "HTTP client" --ecosystem pypi
```
Would allow direct integration with AI agent shell execution flows.

#### Enhanced Static Script Analysis
- Download and extract package source distributions (sdist) from PyPI
- Analyze `setup.py`, `pyproject.toml`, `__init__.py` for dangerous patterns
- npm: Analyze `preinstall`/`postinstall` scripts in detail
- Content-addressable caching to avoid repeated downloads

#### Sandbox Dynamic Analysis (Optional/Isolated)
- Isolated container environment for executing install in a completely sandboxed environment
- Network-restricted (no outbound connections)
- File-system restricted
- Credential-isolated
- Results fed back as additional signals
- **Never run on the host system**

---

### Medium-Term

#### GitHub Actions Integration
```yaml
- uses: depphantom/verify-action@v1
  with:
    package: ${{ env.NEW_PACKAGE }}
    ecosystem: pypi
    reason: ${{ env.AI_REASON }}
    fail-on: HIGH
```

#### CI/CD Pipeline Gate
- Pre-commit hook
- Pre-merge check for new dependencies in requirements.txt / package.json
- Lock file analysis

#### Agent CLI Integration
Standard interface for AI coding agents:
```bash
# Before any pip/npm install, call DepPhantom
depphantom check-before-install pip install <package>
```

---

### Long-Term

#### More Package Ecosystems
- Maven (Java)
- Cargo (Rust)
- NuGet (.NET)
- RubyGems
- Hex (Elixir)
- Go modules

#### Organization-Level Analytics
- Team-wide statistics
- Trend analysis of blocked packages
- Common hallucination patterns by model/agent
- Risk posture reporting

#### Policy-as-Code
```yaml
# depphantom-policy.yaml
rules:
  - name: block-unknown-packages
    condition: registry.exists == false
    action: BLOCK
  - name: warn-new-packages
    condition: metadata.age_days < 7
    action: REVIEW
```

#### Enterprise Features
- SSO / SAML authentication
- Role-based access control
- Multi-tenant organization support
- Custom allowed/blocked package lists
- Private registry support (Artifactory, Nexus)
- Audit export (SIEM integration)
- Slack/Teams alerts for blocked packages

#### AI Agent Ecosystem Integration
- IBM Bob plugin/hook
- GitHub Copilot Workspace integration
- Cursor extension
- Devin integration
- OpenHands integration

#### SBOM Integration
- Generate SBOMs from verified dependency decisions
- Track approved packages over time
- Compliance reporting (NTIA minimum elements)

---

## Research Directions

### AI Hallucination Pattern Analysis
- Study which AI models are more prone to specific hallucination patterns
- Build a predictive model for likely hallucination targets
- Pre-register defensive packages for predicted hallucination targets

### Registry Intelligence
- Community-contributed package intelligence
- Historical malicious package database
- Cross-ecosystem supply chain graph analysis

### Behavioral Verification
- Lightweight semantic analysis of package code
- Comparison against stated package purpose
- Anomaly detection for packages that don't do what they claim
