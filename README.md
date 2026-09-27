# 🛡️ DepPhantom

### 🤖 AI Supply-Chain Security for Autonomous Coding Agents

> **🚨 Stop AI-generated dependencies before they become a security incident.**

[![Status](https://img.shields.io/badge/status-deployment--ready-success)](#-project-status) [![Tests](https://img.shields.io/badge/tests-28%2F28%20passing-success)](#-testing) [![npm Audit](https://img.shields.io/badge/npm%20audit-0%20vulnerabilities-success)](#-security) [![Python](https://img.shields.io/badge/python-3.11%2B-blue)](#-technology-stack) [![React](https://img.shields.io/badge/react-19-61DAFB)](#-technology-stack) [![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688)](#-technology-stack) [![Docker](https://img.shields.io/badge/docker-supported-2496ED)](#-deployment) [![License](https://img.shields.io/badge/license-MIT-blue)](#-license)

> **🛡️ DepPhantom acts as a pre-installation security gate for AI-powered development workflows.**

DepPhantom analyzes dependency requests before they reach the environment, helping teams catch:

* 🤖 AI-hallucinated packages
* 🎭 Typosquatting and package impersonation
* 📦 Suspicious package metadata
* ⚠️ Risky installation behavior
* 🔗 Suspicious dependency relationships
* 🧠 AI intent mismatches
* 🚨 High-risk dependency signals

Instead of asking only:

> ❓ **"Is this package vulnerable?"**

DepPhantom asks the more important question:

> 🛡️ **"Should this AI-generated dependency be trusted before it enters the system?"**

This project is designed for developers, security teams, and AI-assisted engineering workflows that want to prevent supply-chain risk before installation happens.

---

## 📚 Table of Contents

* [🎯 Why DepPhantom?](#-why-depphantom)
* [💡 The Core Idea](#-the-core-idea)
* [🔎 What DepPhantom Detects](#-what-depphantom-detects)
* [⚖️ Decision Model](#️-the-decision-model)
* [🚨 Example Attack](#-example-ai-generated-typosquatting)
* [✨ Key Features](#-key-features)
* [🏗️ Architecture](#️-architecture)
* [🔄 Verification Pipeline](#-verification-pipeline)
* [📊 Risk Scoring](#-risk-scoring)
* [🚀 Quick Start](#-quick-start)
* [💻 Local Development](#-local-development)
* [⚙️ Environment Configuration](#️-environment-configuration)
* [🔌 API](#-api)
* [🎬 Demo Center](#-demo-center)
* [⚡ 90-Second Demo](#-90-second-demo)
* [📁 Project Structure](#-project-structure)
* [🧪 Testing](#-testing)
* [🔐 Security](#-security)
* [🎯 Threat Model](#-threat-model)
* [📈 Project Status](#-project-status)
* [🚀 Deployment](#-deployment)
* [🧰 Technology Stack](#-technology-stack)
* [🌍 Why This Matters](#-why-this-matters)
* [⚠️ Limitations](#️-limitations)
* [🛣️ Roadmap](#️-roadmap)
* [🤝 Contributing](#-contributing)
* [🔒 Security Disclosure](#-security-disclosure)
* [🏆 Hackathon](#-hackathon)
* [📄 License](#-license)

---

## 🎯 Why DepPhantom?

AI coding agents are increasingly capable of writing code, selecting libraries, and executing package installation commands autonomously.

That creates a **new software supply-chain risk**.

### 🚨 The Attack Chain

```text
👨‍💻 Developer
      │
      ▼
🤖 AI Coding Agent
      │
      │ "Install fast-pdf-renderer"
      ▼
📦 Package does not exist
      │
      ▼
😈 Attacker registers the package
      │
      ▼
🤖 AI agent encounters it later
      │
      ▼
⚡ Automatic installation
      │
      ▼
💥 Potential malicious code execution
```

The critical problem is **timing**.

Traditional security tooling often analyzes dependencies after they have already been selected, resolved, or installed.

### 🛡️ DepPhantom moves the security boundary **before installation**.

---

# 💡 The Core Idea

### ❌ Without DepPhantom

```text
🤖 AI Agent
     │
     ▼
📦 pip install / npm install
     │
     ▼
📦 Dependency
     │
     ▼
💻 Development Environment
```

### ✅ With DepPhantom

```text
🤖 AI Agent
     │
     │ Dependency Request
     ▼
┌────────────────────────────┐
│ 🛡️ DepPhantom Gateway      │
│                            │
│ 🔍 Registry Verification   │
│ 🎭 Typosquatting Detection │
│ 📋 Metadata Analysis       │
│ 🔎 Script Analysis         │
│ 🔗 Dependency Analysis     │
│ 🧠 AI Intent Verification │
└─────────────┬──────────────┘
              │
              ▼
        ⚖️ Risk Engine
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
     ✅ ALLOW ⚠️ REVIEW 🚫 BLOCK
       │      │       │
       ▼      ▼       X
    Install  Human    Stop
             Review
```

> 🧠 **AI-generated does not automatically mean trusted.**

---

# 🔎 What DepPhantom Detects

DepPhantom combines multiple security signals before making a decision.

| Security Signal          | What DepPhantom Checks                                       |
| ------------------------ | ------------------------------------------------------------ |
| 🔐 **Registry Identity** | Does the requested package actually exist?                   |
| 🤖 **AI Hallucination**  | Is an AI agent requesting a package that cannot be verified? |
| 🎭 **Typosquatting**     | Does the package name resemble a trusted package?            |
| 📋 **Package Metadata**  | Age, versions, publisher, downloads, and other signals       |
| ⚠️ **Install Behavior**  | Suspicious installation-related code patterns                |
| 🔗 **Dependency Graph**  | Suspicious or unexpected transitive dependencies             |
| 🧠 **AI Intent**         | Does the package match what the AI claims it needs?          |
| ⚖️ **Risk Policy**       | Should the dependency be allowed, reviewed, or blocked?      |

---

# ⚖️ The Decision Model

Every verification produces an explainable security decision.

```text
                 🛡️ DEPTHANTOM
                      │
                      ▼
              🔍 Security Signals
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
        🟢 LOW     🟡 MEDIUM   🔴 HIGH/CRITICAL
          │           │           │
          ▼           ▼           ▼
       ✅ ALLOW     ⚠️ REVIEW    🚫 BLOCK
```

### 🟢 LOW

No significant configured risk signals detected.

```text
LOW → ALLOW
```

### 🟡 MEDIUM

The dependency requires additional review.

```text
MEDIUM → REVIEW
```

### 🔴 HIGH / CRITICAL

Significant risk signals were detected.

```text
HIGH / CRITICAL → BLOCK
```

Every decision includes **human-readable reasoning and the underlying security signals**.

---

# 🚨 Example: AI-Generated Typosquatting

Suppose an AI agent requests:

```text
requets
```

DepPhantom identifies:

```text
📦 Requested package:
   requets

🎯 Potential trusted package:
   requests

📊 Similarity:
   95%

🚨 Risk:
   CRITICAL

🛑 Decision:
   BLOCK
```

Instead of allowing the dependency to enter the environment, DepPhantom stops the installation path and explains why.

> 🛡️ **Detect the impersonation before the package crosses the security boundary.**

---

# ✨ Key Features

## 1. 🌐 Real-Time Registry Verification

Supports:

* 🐍 PyPI
* 📦 npm

Checks available registry information including:

* 📦 Package existence
* 🏷️ Latest version
* 📚 Release history
* 👤 Publisher/maintainer information
* 📅 Package age
* 📈 Download/adoption signals where available
* 📝 Description
* ⚖️ License
* 🔗 Homepage/repository information

### 🔒 Fail-Closed Behavior

Registry failures cannot silently become an `ALLOW`.

```text
Registry Error
      │
      ▼
⚠️ Uncertain
      │
      ▼
🛑 No Silent ALLOW
```

---

## 2. 🤖 AI Hallucination Detection

Detects dependency requests where:

* ❌ The package cannot be found in the registry
* 🧩 The requested name looks plausible but has no registry evidence
* 🤖 The request originated from an AI agent
* 🧠 The package does not align with the stated development task

Example:

```text
🤖 AI Request:
   fast-pdf-renderer

🌐 Registry:
   NOT FOUND

🤖 Source:
   AI_AGENT

🚨 Result:
   HIGH RISK
   BLOCK
```

---

## 3. 🎭 Typosquatting Detection

DepPhantom compares package names using multiple fuzzy similarity techniques.

Current detection uses:

* 🔤 Overall character similarity
* 🔎 Partial similarity
* ➖ Separator-normalized comparison
* ➕ Insertion/deletion similarity
* 🧮 Jaro-Winkler similarity

Example:

```text
requests
   │
   ▼
requets
   │
   ▼
📊 95% similarity
   │
   ▼
🚨 Potential impersonation
   │
   ▼
🛑 BLOCK
```

---

## 4. 📋 Package Metadata Analysis

Analyzes available package metadata for signals such as:

* 📅 Package age
* 🔢 Version count
* 👤 Publisher information
* 📈 Download activity where available
* ❓ Missing metadata
* 💤 Potential abandonment signals

> ⚠️ A new or unpopular package is **not automatically considered malicious**.

These characteristics are supporting signals, not proof of malicious behavior.

---

## 5. 🔎 Static Installation Script Analysis

DepPhantom analyzes installation-related metadata **without executing the package**.

Potentially suspicious patterns include:

* 💻 Shell execution
* ⚡ Dynamic code execution
* 🌐 Network access
* 🔑 Credential/environment access
* 🕵️ Obfuscation
* 📁 File manipulation
* 💾 Unsafe deserialization
* 🔐 SSH key access
* ⚙️ Native-code loading patterns

Example:

```text
🔎 Installation Script Analysis

Shell execution       🔴
Network access        🔴
Credential access     🟡
File modification     🟡

🚨 Risk:
HIGH
```

### 🔒 Important Security Property

> **DepPhantom does not execute untrusted packages during analysis.**

The current implementation uses **static analysis**.

---

## 6. 🔗 Dependency Graph Analysis

DepPhantom examines package dependencies where registry metadata allows it.

It can identify:

* ⚠️ Suspicious dependency names
* 🔗 Unexpected dependency relationships
* 📦 Large dependency sets
* 🚨 Potentially suspicious transitive packages

This helps identify risk hidden beyond the first dependency.

---

## 7. 🧠 AI Intent Verification

One of DepPhantom's key differentiators.

The system compares:

```text
🗣️ WHAT THE AI SAYS IT NEEDS

              VS

📦 WHAT THE PACKAGE APPEARS TO PROVIDE
```

Example:

```text
🤖 AI Intent:
   "HTTP client for REST API calls"

📦 Requested Package:
   crypto-miner-helper

🚨 Result:
   INTENT MISMATCH
```

This adds an **AI-specific trust signal** that conventional dependency scanners do not normally provide.

---

## 8. ⚖️ Explainable Risk Engine

DepPhantom does not rely on an opaque verdict.

Each decision is built from named signals.

```text
🛡️ DEPTHANTOM RISK ANALYSIS

Registry existence       🟢
Package identity         🟡
Typosquatting            🔴
Package age              🟡
Install behavior         🔴
Dependency graph         🟡
AI intent                🔴

🚨 Overall Risk:
CRITICAL

🛑 Decision:
BLOCK
```

Every decision has human-readable reasoning.

---

## 9. 👤 Human Review and Override

Medium-risk dependencies can be sent for review.

The system supports:

```text
✅ APPROVE
🚫 REJECT
```

Overrides are recorded in the audit trail with:

* 📌 Decision
* 🕐 Timestamp
* 👤 User
* 📊 Original risk
* 📝 Override reason

---

## 10. 📊 Security Dashboard

The dashboard provides live statistics from the database.

Examples:

* 📦 Total dependency verifications
* 🚫 Blocked dependencies
* ⚠️ Review-required dependencies
* 🔴 High-risk packages
* 🤖 AI hallucinations detected
* 📝 Recent security events

The dashboard is based on **actual application data rather than hardcoded counters**.

---

## 11. 📝 Security Event Log

Every verification can produce an auditable security event.

Events can be filtered by:

* 🚦 Risk level
* ⚖️ Decision
* 📦 Ecosystem
* 🔎 Package name
* 📄 Pagination

This creates a persistent record of dependency security decisions.

---

## 12. ⚙️ Policy Configuration

Security policies can be configured through the application.

| Policy                      | Available Actions      | Default |
| --------------------------- | ---------------------- | ------- |
| 📦 Unknown package          | BLOCK / REVIEW         | BLOCK   |
| 🆕 New package              | REVIEW / BLOCK / ALLOW | REVIEW  |
| 🎭 Typosquatting            | BLOCK / REVIEW         | BLOCK   |
| 💻 High-risk install script | BLOCK / REVIEW         | BLOCK   |
| 🧠 Intent mismatch          | REVIEW / BLOCK         | REVIEW  |
| 🤖 AI scrutiny multiplier   | ON / OFF               | ON      |
| 🔒 Fail-closed behavior     | ON / OFF               | ON      |

---

# 🏗️ Architecture

```text
                  ┌──────────────────────┐
                  │ 🤖 AI Coding Agent  │
                  │                      │
                  │ Bob / Copilot /      │
                  │ Cursor / Devin / etc │
                  └──────────┬───────────┘
                             │
                             │ 📦 Dependency Request
                             ▼
                  ┌──────────────────────┐
                  │     🛡️ DepPhantom    │
                  │   Security Gateway   │
                  │      FastAPI         │
                  └──────────┬───────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │ 🌐 Registry │ │ 📦 Package  │ │ 🧠 AI Intent│
       │   Analysis  │ │   Analysis  │ │   Analysis  │
       │             │ │             │ │             │
       │ PyPI        │ │ Typosquat   │ │ Intent      │
       │ npm         │ │ Metadata    │ │ Matching    │
       │ Stats       │ │ Scripts     │ │ Mismatch    │
       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                  ┌──────────────────────┐
                  │ ⚖️ Risk Engine       │
                  │                      │
                  │ Signal Aggregation   │
                  │ Confidence           │
                  │ Explanation          │
                  └──────────┬───────────┘
                             │
                    ┌────────┼────────┐
                    ▼        ▼        ▼
                 ✅ ALLOW  ⚠️ REVIEW  🚫 BLOCK
                    │        │        │
                    ▼        ▼        X
                Installation Human   Prevented
                           Approval
```

---

# 🔄 Verification Pipeline

A dependency request follows this pipeline:

```text
POST /api/dependencies/verify
             │
             ▼
      🔐 Input Validation
             │
             ▼
       💾 Save Request
             │
             ▼
    ┌────────┼─────────┐
    ▼        ▼         ▼
 🌐 Registry 🔎 Script  🔗 Dependency
    Check    Analysis   Analysis
    │        │         │
    └────────┼─────────┘
             ▼
       ┌─────┼─────┐
       ▼     ▼     ▼
   🎭 Typosquat 📋 Metadata 🧠 Intent
       │
       ▼
    ⚖️ Risk Engine
       │
       ▼
    🚦 Decision Engine
       │
   ┌───┼────┐
   ▼   ▼    ▼
 ✅ ALLOW ⚠️ REVIEW 🚫 BLOCK
       │
       ▼
    📝 Audit Event
```

---

# 📊 Risk Scoring

The current risk engine uses transparent weighted signals.

| Signal                              | Example Weight |
| ----------------------------------- | -------------: |
| 📦 Package not found                |            +35 |
| 🤖 AI hallucination signal          |            +15 |
| 🌐 Registry unavailable             |            +25 |
| 🎭 Near-identical typosquatting     |            +40 |
| 🔎 High typosquatting similarity    |            +30 |
| 🔍 General typosquatting similarity |            +20 |
| 📅 Package registered today         |            +25 |
| 🆕 Package registered this week     |            +20 |
| 📦 New package                      |            +10 |
| 💻 Critical install-script risk     |            +50 |
| 🚨 High install-script risk         |            +35 |
| ⚠️ Medium install-script risk       |            +15 |
| 🔗 Suspicious dependencies          |            +20 |
| 🧠 Intent mismatch                  |            +30 |
| 🧩 Partial intent alignment         |            +10 |

AI-originated requests can receive additional scrutiny.

### 🚦 Risk Levels

|  Score | Risk        | Default Decision |
| -----: | ----------- | ---------------- |
|   0–24 | 🟢 LOW      | ✅ ALLOW          |
|  25–49 | 🟡 MEDIUM   | ⚠️ REVIEW        |
|  50–74 | 🟠 HIGH     | 🚫 BLOCK         |
| 75–100 | 🔴 CRITICAL | 🚫 BLOCK         |

> ⚠️ The score is an **explainable risk signal**, not a mathematical guarantee of package safety.

---

# 🚀 Quick Start

## 🐳 Option A — Docker Compose

### Prerequisites

* 🐳 Docker
* 🧩 Docker Compose

Clone the repository:

```bash
git clone <repository-url>
cd depphantom
```

Create your environment file:

```bash
cp .env.example .env
```

Start the application:

```bash
docker-compose up --build
```

The application will be available at:

| Service              | URL                           |
| -------------------- | ----------------------------- |
| 🌐 Frontend          | `http://localhost`            |
| 📚 API Documentation | `http://localhost/api/docs`   |
| ❤️ Health Check      | `http://localhost/api/health` |

### 🌍 Custom Domain

Configure the allowed frontend origin:

```bash
CORS_ORIGINS=https://your-domain.com docker-compose up --build -d
```

---

# 💻 Local Development

## 🐍 Backend

Requirements:

* Python 3.11+
* pip

Create a virtual environment:

```bash
python -m venv .venv
```

### 🍎 Linux/macOS

```bash
source .venv/bin/activate
```

### 🪟 Windows

```powershell
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Configure the environment:

```bash
cp .env.example .env
```

Start the backend:

```bash
python startup.py
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/api/docs
```

---

## ⚛️ Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The Vite development server proxies `/api` requests to the backend.

---

# ⚙️ Environment Configuration

Copy:

```bash
cp .env.example .env
```

Example configuration:

| Variable                             | Purpose                   |
| ------------------------------------ | ------------------------- |
| `APP_ENV`                            | Application environment   |
| `DEBUG`                              | Debug behavior            |
| `DATABASE_URL`                       | Database connection       |
| `CORS_ORIGINS`                       | Allowed frontend origins  |
| `REGISTRY_TIMEOUT`                   | Registry request timeout  |
| `TYPOSQUATTING_SIMILARITY_THRESHOLD` | Similarity threshold      |
| `NEW_PACKAGE_AGE_DAYS`               | New-package threshold     |
| `LOW_DOWNLOAD_THRESHOLD`             | Download signal threshold |
| `DEMO_MODE`                          | Enable demo scenarios     |

> 🔐 **Never commit `.env` or real credentials.**

Use `.env.example` as the safe configuration template.

---

# 🔌 API

## 🔍 Verify a Dependency

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

The API:

1. 🔐 Validates the request
2. 🌐 Performs registry analysis
3. 🎭 Checks typosquatting
4. 📋 Analyzes metadata
5. 🔎 Performs static analysis
6. 🔗 Analyzes dependencies
7. 🧠 Checks AI intent
8. ⚖️ Calculates risk
9. 🚦 Applies policy
10. 📝 Records the event
11. 📤 Returns the complete analysis

### 📥 Request Fields

| Field       | Type                            | Required | Description                      |
| ----------- | ------------------------------- | -------- | -------------------------------- |
| `package`   | string                          | ✅        | Package name                     |
| `ecosystem` | `pypi` / `npm`                  | ✅        | Target package registry          |
| `version`   | string                          | ❌        | Version or `latest`              |
| `reason`    | string                          | ❌        | AI-stated dependency requirement |
| `source`    | `AI_AGENT` / `MANUAL` / `CI_CD` | ❌        | Origin of the request            |

### 📤 Example Response

```json
{
  "package": "requets",
  "ecosystem": "pypi",
  "source": "AI_AGENT",
  "overall_risk": "CRITICAL",
  "decision": "BLOCK",
  "confidence": 0.97,
  "explanation": "Potential package impersonation detected.",
  "reasons": [
    "Package name is highly similar to trusted package 'requests'.",
    "Additional package risk signals were detected."
  ]
}
```

> 📝 This is an **illustrative response example**. Actual responses include additional registry, typosquatting, metadata, installation-script, dependency, intent, and pipeline information.

---

# 🔌 API Endpoints

| Method | Endpoint                   | Purpose                                    |
| ------ | -------------------------- | ------------------------------------------ |
| `POST` | `/api/dependencies/verify` | 🔍 Verify a dependency before installation |
| `GET`  | `/api/dependencies/{id}`   | 📄 Retrieve a previous analysis            |
| `GET`  | `/api/dashboard`           | 📊 Dashboard statistics                    |
| `GET`  | `/api/events`              | 📝 Security audit events                   |
| `GET`  | `/api/policies`            | ⚙️ Current policies                        |
| `PUT`  | `/api/policies`            | ✏️ Update policies                         |
| `GET`  | `/api/demo/scenarios`      | 🎬 Available demo scenarios                |
| `POST` | `/api/demo/scenario`       | ▶️ Run a deterministic demo                |
| `POST` | `/api/decisions/override`  | 👤 Record a human decision override        |
| `GET`  | `/api/health`              | ❤️ Application health                      |

Interactive API documentation:

```text
http://localhost:8000/api/docs
```

---

# 🎬 Demo Center

DepPhantom includes deterministic scenarios designed for reliable evaluation and demonstration.

| Scenario                     | Package             | Expected Result     | Demonstrates                  |
| ---------------------------- | ------------------- | ------------------- | ----------------------------- |
| 🤖 AI Hallucination          | `fast-pdf-renderer` | 🔴 CRITICAL / BLOCK | Non-existent dependency       |
| 🎭 Typosquatting             | `requets`           | 🔴 CRITICAL / BLOCK | Similarity to `requests`      |
| 💻 Suspicious Install Script | `crypto-utils-pro`  | 🔴 CRITICAL / BLOCK | Dangerous install behavior    |
| ✅ Trusted Package            | `requests`          | 🟢 LOW / ALLOW      | Avoiding unnecessary blocking |

> 🎬 All demo scenarios are explicitly labeled as **demo data** and kept separate from live registry analysis.

---

# ⚡ 90-Second Demo

For a fast evaluator walkthrough:

```text
1. 🚀 Open the DepPhantom dashboard.

2. 🎬 Open Demo Center.

3. 🎭 Run "Typosquatting Attack".

4. 🚨 Show:
   requets → CRITICAL / BLOCK

5. 🔍 Open the evidence.

6. 🎯 Show the similarity to:
   requests

7. ✅ Run "Trusted Package".

8. Show:
   requests → LOW / ALLOW

9. 🔎 Open Verify Dependency.

10. 🌐 Run a live registry analysis.

11. 📝 Open Security Events.

12. 📊 Show the resulting audit trail.
```

### 🎯 The Key Message

> **DepPhantom does not simply block dependencies. It analyzes why an AI-selected dependency should or should not be trusted.**

---

# 📁 Project Structure

```text
depphantom/
│
├── backend/
│   ├── analyzers/
│   │   ├── registry/
│   │   │   └── checker.py
│   │   ├── typosquatting/
│   │   │   └── detector.py
│   │   ├── metadata/
│   │   │   └── analyzer.py
│   │   ├── scripts/
│   │   │   └── analyzer.py
│   │   ├── dependencies/
│   │   │   └── analyzer.py
│   │   └── intent/
│   │       └── analyzer.py
│   │
│   ├── api/
│   │   └── routes.py
│   ├── risk/
│   │   └── engine.py
│   ├── services/
│   │   └── verification.py
│   ├── demo/
│   │   └── scenarios/
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── config.py
│   ├── main.py
│   └── tests/
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── VerifyDependency.tsx
│       │   ├── AnalysisResult.tsx
│       │   ├── SecurityEvents.tsx
│       │   ├── Policies.tsx
│       │   └── DemoCenter.tsx
│       ├── components/
│       ├── services/
│       └── types/
│
├── submission/
├── startup.py
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── .env.example
├── SECURITY.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

# 🧪 Testing

Run the backend test suite:

```bash
python -m pytest backend/tests/ -v
```

Current validation:

```text
🧪 28 tests
✅ 28 passed
❌ 0 failed
```

The test suite covers:

* 🎭 Typosquatting detection
* ⚖️ Risk scoring
* 🚦 Decision policies
* 🧠 AI intent analysis
* 📋 Metadata analysis
* 🎬 Demo scenarios
* 🔒 Registry fail-closed behavior
* 🛡️ Input validation

Security-related validation includes rejection of:

```text
../etc/passwd
```

and shell metacharacters such as:

```text
; | & $
```

---

# 🔐 Security

See [`SECURITY.md`](SECURITY.md) for the full threat model and responsible disclosure process.

## 🛡️ Security Properties

| Property                | Implementation                                   |
| ----------------------- | ------------------------------------------------ |
| 🚫 No package execution | Static analysis only                             |
| 🔒 Fail-closed          | Registry errors cannot silently produce ALLOW    |
| 🛡️ Input validation    | Package names restricted to an allowlist         |
| 🔑 Secret management    | Environment-based configuration                  |
| 🌐 CORS control         | Configurable through `CORS_ORIGINS`              |
| 📦 Container isolation  | Backend container uses a dedicated non-root user |
| 📝 Auditability         | Security decisions and overrides are recorded    |
| 🧹 Error sanitization   | Internal stack traces are not exposed            |

### ✅ Security Validation

Current project validation includes:

* ✅ **28/28 backend tests passing**
* ✅ **0 npm audit vulnerabilities**
* ✅ No secrets committed to source
* ✅ No untrusted package execution during analysis
* ✅ Input validation for path traversal and shell metacharacters
* ✅ Registry fail-closed behavior
* ✅ Production frontend build without TypeScript errors

---

# 🎯 Threat Model

| Threat                              | DepPhantom                          |
| ----------------------------------- | ----------------------------------- |
| 🤖 AI-hallucinated package          | ✅ Detects registry absence          |
| 🎭 Typosquatting                    | ✅ Fuzzy package-name analysis       |
| 🆕 Newly registered package         | ✅ Metadata signal                   |
| 💻 Suspicious installation behavior | ✅ Static pattern analysis           |
| 🔗 Suspicious transitive dependency | ✅ Dependency analysis               |
| 🧠 AI intent mismatch               | ✅ Intent analysis                   |
| 🛡️ Known CVEs                      | ⚠️ Not a CVE scanner                |
| 📦 Compromised trusted package      | ⚠️ Limited without runtime analysis |
| 🕵️ Zero-signal novel malware       | ⚠️ Cannot guarantee detection       |

> ⚠️ DepPhantom is a **risk detection and decision-support system**, not a guarantee that a package is safe or malicious.

---

# 📈 Project Status

## 🚀 Deployment-Ready Hackathon Build

The current implementation has been validated for public evaluator access.

### ✅ Verified

* ✅ Backend imports successfully
* ❤️ Health endpoint operational
* 🌐 Live PyPI/npm verification operational
* 🟢 Trusted package → `LOW / ALLOW`
* 🔴 Suspicious package → `HIGH / BLOCK`
* 🚨 Typosquatting → `CRITICAL / BLOCK`
* 🎬 All four demo scenarios functional
* 📊 Dashboard statistics sourced from actual verification data
* 📝 Security audit events persisted
* 🛡️ Input validation active
* 🔒 Registry failures fail closed
* 🔎 Static package analysis only
* 🧪 28/28 backend tests passing
* ⚛️ Frontend production build successful
* 🔐 0 npm audit vulnerabilities
* 🔑 No committed secrets
* 🚫 `.env` excluded from Git
* 🐳 Docker deployment configuration included

### ⚙️ Deployment Notes

The default deployment is designed for a **single-instance environment**.

For larger production deployments, PostgreSQL and an appropriate API gateway/security layer should be used.

---

# 🚀 Deployment

## 🐳 Docker

Build and start:

```bash
docker-compose up --build
```

Run detached:

```bash
docker-compose up --build -d
```

For a custom frontend domain:

```bash
CORS_ORIGINS=https://your-domain.com docker-compose up --build -d
```

After deployment, verify:

```text
❤️ /api/health
```

Then perform a live dependency verification.

---

# 🧰 Technology Stack

## ⚛️ Frontend

| Technology   | Purpose           |
| ------------ | ----------------- |
| React 19     | UI framework      |
| TypeScript   | Type safety       |
| Vite         | Build tooling     |
| React Router | Routing           |
| Axios        | API communication |
| Lucide React | Icons             |
| date-fns     | Date formatting   |

## 🐍 Backend

| Technology        | Purpose               |
| ----------------- | --------------------- |
| Python 3.11+      | Runtime               |
| FastAPI           | REST API              |
| Uvicorn           | ASGI server           |
| SQLAlchemy        | ORM                   |
| aiosqlite         | Async SQLite          |
| Pydantic          | Validation            |
| pydantic-settings | Configuration         |
| httpx             | Registry API requests |
| RapidFuzz         | Fuzzy matching        |
| Levenshtein       | Similarity analysis   |
| python-dateutil   | Date parsing          |

## ☁️ Infrastructure

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| Docker         | Containerization                 |
| Docker Compose | Multi-container deployment       |
| nginx          | Frontend serving + reverse proxy |
| SQLite         | Default single-instance database |
| PostgreSQL     | Optional production database     |

---

# 🌍 Why This Matters

Autonomous software engineering changes the traditional trust model.

### 👨‍💻 Traditional Workflow

```text
Developer
   ↓
Chooses dependency
   ↓
Reviews dependency
   ↓
Installs dependency
```

### 🤖 Autonomous Workflow

```text
Developer
   ↓
AI Agent
   ↓
AI chooses dependency
   ↓
AI may install dependency
```

The agent becomes part of the software supply chain.

That creates a **new security boundary**.

### 🛡️ DepPhantom is designed specifically for that boundary:

```text
             🤖 AI DECISION
                    │
                    ▼
          ┌─────────────────┐
          │   🛡️ DEPTHANTOM │
          │                 │
          │ "Should this    │
          │ dependency be   │
          │ trusted?"       │
          └────────┬────────┘
                   │
              ┌────┼────┐
              ▼    ▼    ▼
           ✅ ALLOW ⚠️ REVIEW 🚫 BLOCK
```

---

# ⚠️ Limitations

DepPhantom should be treated as a **risk signal detection system**, not a security guarantee.

Important limitations:

* 🟢 `ALLOW` means no significant configured risk signals were detected; it does not prove a package is safe.
* 🚫 `BLOCK` means significant risk signals were detected; it does not prove that a package is malicious.
* 🎭 Typosquatting detection relies partly on curated known-package references.
* 🔎 Static analysis cannot identify every runtime-only malicious behavior.
* 🌐 Registry metadata availability can vary.
* 🖥️ The current deployment model is optimized for a single instance.
* 🔐 Enterprise authentication and centralized identity management are not currently part of the core implementation.
* 🛡️ DepPhantom is not intended to replace CVE scanners such as Dependabot, Snyk, or pip-audit.
* 🕵️ A sophisticated attacker may produce a package that generates few or no detectable signals.

> 💡 These limitations are intentionally documented so that security decisions remain transparent.

---

# 🛣️ Roadmap

## 🔜 Next

### 🤖 Agent / CLI Integration

```bash
depphantom verify requests pypi
```

Allow autonomous agents and CI pipelines to invoke the security gate directly.

### 🔄 CI/CD Integration

Add a GitHub Actions gate that can prevent suspicious dependency changes from progressing through CI.

### 🌎 More Ecosystems

Expand support to:

* ☕ Maven
* 🦀 Cargo
* 🟣 NuGet
* 💎 RubyGems

### ⚙️ Policy as Code

Allow teams to define organization-specific dependency policies using version-controlled configuration.

### 📋 Organization Allow/Block Lists

Support trusted and explicitly blocked package lists.

### 📦 SBOM Integration

Generate Software Bills of Materials from verified dependency sets.

### 🏢 Enterprise Identity

Add:

* 🔐 SSO
* 🔑 OIDC
* 👥 Role-based access control
* 🏢 Organization-level policy management

### 🔔 Alerting

Integrate security events with:

* 💬 Slack
* 🟦 Microsoft Teams
* 📧 Email
* 🛡️ SIEM platforms

### 🧪 Advanced Sandbox Analysis

Future versions can introduce isolated dynamic analysis for deeper behavioral inspection while maintaining strict host and credential isolation.

---

# 🤝 Contributing

Contributions are welcome.

## Contributors

- Your Name — Contributor
- Project Maintainers — Review and support

Before opening a pull request:

1. 🌿 Create a focused branch.
2. ✏️ Make the smallest necessary change.
3. 🧪 Add or update tests.
4. ✅ Run the complete test suite.
5. 🏗️ Verify frontend production builds.
6. 📚 Update documentation when behavior changes.
7. 🔐 Never commit secrets or local environment files.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

# 🔒 Security Disclosure

If you discover a security vulnerability in DepPhantom, please follow the responsible disclosure process described in [`SECURITY.md`](SECURITY.md).

> ⚠️ Please do not publicly disclose exploitable vulnerabilities before the maintainers have had an opportunity to investigate.

---

# 🏆 Hackathon

DepPhantom was built for the **IBM Bob 2.0 Hackathon** under the **AI-Assisted & Autonomous Software Engineering** theme.

The project focuses on a specific emerging security problem:

> 🤖 **How do we secure the moment when an autonomous AI agent decides what software to install?**

### 🛡️ DepPhantom's answer:

> **Verify the dependency before it crosses the security boundary.**

---

# 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

# 🛡️ DepPhantom

### 🤖 Don't let AI invent your next supply-chain attack.

**Verify → 🔍 Analyze → ⚖️ Decide → 🛡️ Protect**

</div>
