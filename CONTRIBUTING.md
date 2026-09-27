# Contributing to DepPhantom

Thank you for your interest in contributing to DepPhantom.

## Contributors

- Your Name — Contributor

## Development Setup

### Backend

```bash
cd depphantom
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
cp .env.example .env
python startup.py --reload
```

### Frontend

```bash
cd depphantom/frontend
npm install
npm run dev
```

## Running Tests

```bash
cd depphantom
python -m pytest backend/tests/ -v
```

## Code Style

- **Python**: Follow PEP 8. Use type hints throughout. No bare `except` clauses.
- **TypeScript**: Strict mode enabled. No `any` types where avoidable.
- **No secrets in code**: Use environment variables for all configuration.

## Security Guidelines

- Never execute user-supplied package names as shell commands
- Never add code that executes untrusted packages
- All external HTTP calls must have timeouts
- All user inputs must be validated before use

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write tests for your changes
4. Ensure all tests pass: `python -m pytest backend/tests/ -v`
5. Ensure frontend builds: `cd frontend && npm run build`
6. Submit a pull request with a clear description

## Adding a New Analyzer

To add a new analysis module:

1. Create `backend/analyzers/<name>/analyzer.py`
2. Create `backend/analyzers/<name>/__init__.py`
3. Implement the analyzer function with proper typing
4. Add the result type to `backend/schemas.py`
5. Integrate into `backend/services/verification.py`
6. Add the signal to the pipeline steps
7. Add appropriate risk weighting in `backend/risk/engine.py`
8. Write tests in `backend/tests/`

## Adding a New Ecosystem

To add support for a new package registry:

1. Add registry check in `backend/analyzers/registry/checker.py`
2. Add known packages list in `backend/analyzers/typosquatting/detector.py`
3. Add dependency fetching in `backend/analyzers/dependencies/analyzer.py`
4. Add script analysis in `backend/analyzers/scripts/analyzer.py`
5. Add the ecosystem to `EcosystemEnum` in `backend/schemas.py`
6. Add the ecosystem to the frontend dropdown in `VerifyDependency.tsx`
