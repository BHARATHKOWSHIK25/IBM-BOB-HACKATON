# DepPhantom — Demo Script

## Hackathon Demo (90 seconds)

This script demonstrates the core value of DepPhantom in a structured sequence.

---

## Prerequisites

1. Backend running: `cd depphantom && python startup.py`
2. Frontend running: `cd depphantom/frontend && npm run dev`
3. Open browser: `http://localhost:5173`

---

## Scene 1 — Dashboard (10 seconds)

Open the DepPhantom dashboard.

**Say:**
> "This is DepPhantom — a pre-installation security gate for AI coding agents. Instead of scanning packages after they're installed, DepPhantom intercepts the AI's dependency request before it reaches the package manager."

Point to the sidebar: Dashboard, Verify Dependency, Demo Center.

---

## Scene 2 — The Attack (20 seconds)

Navigate to: **Demo Center**

Click: **Typosquatting Attack**

**Say:**
> "An AI agent was asked to 'add HTTP request functionality'. It generated the package name 'requets' — a plausible but misspelled variation of 'requests'. An attacker has already registered this name on PyPI with a malicious install script."

Watch the analysis run.

---

## Scene 3 — The Verdict (20 seconds)

The result appears:

```
⛔ INSTALLATION BLOCKED
Risk: CRITICAL
Confidence: 97%
```

**Say:**
> "DepPhantom detected that 'requets' is 94% similar to the trusted package 'requests'. It also found that the package was registered 5 days ago, has a suspicious install script, and doesn't match the expected package for HTTP client functionality."

Point to the pipeline steps:
```
Registry Check      ✓
Name Analysis       ⚠
Typosquatting      🔴
Publisher          ⚠
Package Metadata   ⚠
Install Script     🔴
Intent Analysis    🔴
```

**Say:**
> "Every signal is explained. This is not a black box."

---

## Scene 4 — The Contrast (15 seconds)

Click: **Trusted Package**

Watch the analysis for `requests`.

The result:
```
✓ INSTALLATION ALLOWED
Risk: LOW
```

**Say:**
> "Now let's verify the correct package — 'requests'. DepPhantom finds it's been around for 14 years, has 285 million monthly downloads, no suspicious scripts, and perfectly matches the HTTP client intent. ALLOW."

**Say:**
> "DepPhantom doesn't just block everything. It distinguishes real signals from false positives."

---

## Scene 5 — Live Verification (15 seconds)

Navigate to: **Verify Dependency**

Enter:
- Package: `requets`
- Ecosystem: `Python / PyPI`
- AI Reason: `HTTP client for REST API calls`

Click: **VERIFY DEPENDENCY**

**Say:**
> "This is a live analysis — hitting the real PyPI registry right now."

The analysis completes and shows BLOCK.

---

## Scene 6 — Closing (10 seconds)

Navigate to: **Security Events**

Show the audit log.

**Say:**
> "Every verification is logged. Security teams can audit every AI-generated dependency decision, with full evidence — who requested it, what signals were found, what decision was made."

**Final statement:**
> "AI agents are becoming capable of installing software autonomously. DepPhantom creates the security gate that verifies what the AI is about to install before it enters the environment. Don't let AI invent your next supply-chain attack."

---

## Fallback (if external APIs are unavailable)

If the live PyPI verification fails due to network issues:

1. Use **Demo Center** exclusively — all demo scenarios are pre-computed and deterministic
2. All demo scenarios are clearly labeled as `[DEMO DATA]`
3. Explain: "In a production environment this would hit the real registry — the demo center shows pre-computed results for reliable demonstration"

---

## Key Points to Emphasize

1. **Pre-installation** — not post-installation
2. **Explainable** — every decision has evidence
3. **Not paranoid** — trusted packages get ALLOW
4. **AI-specific** — built for the agent-driven workflow
5. **Fail-closed** — when in doubt, block or review
