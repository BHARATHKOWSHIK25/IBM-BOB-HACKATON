"""Typosquatting detection analyzer."""
from __future__ import annotations
from typing import List, Dict, Any
from rapidfuzz import fuzz, process
from ...schemas import TyposquatResult
from ...config import get_settings

settings = get_settings()

# Well-known popular packages per ecosystem — used for similarity checks
KNOWN_PYPI_PACKAGES = [
    "requests", "numpy", "pandas", "flask", "django", "fastapi", "sqlalchemy",
    "pydantic", "pytest", "boto3", "pillow", "scipy", "matplotlib", "tensorflow",
    "torch", "scikit-learn", "celery", "redis", "httpx", "aiohttp", "click",
    "typer", "rich", "loguru", "python-dotenv", "cryptography", "paramiko",
    "paramiko", "pyserial", "beautifulsoup4", "selenium", "playwright",
    "alembic", "uvicorn", "gunicorn", "starlette", "jinja2", "markupsafe",
    "pyyaml", "toml", "orjson", "ujson", "msgpack", "protobuf", "grpcio",
    "openssl", "certifi", "charset-normalizer", "urllib3", "six", "attrs",
    "setuptools", "pip", "wheel", "twine", "black", "flake8", "mypy",
    "pylint", "bandit", "safety", "virtualenv", "tox", "nox",
    "stripe", "twilio", "sendgrid", "psycopg2", "pymysql", "motor",
    "pymongo", "elasticsearch", "opensearch-py", "anthropic", "openai",
    "langchain", "transformers", "datasets", "huggingface-hub",
    "pdf2image", "pypdf", "reportlab", "weasyprint", "fpdf2", "pdfkit",
    "openpyxl", "xlrd", "xlwt", "csv23", "tabulate", "arrow", "pendulum",
    "dateutil", "python-dateutil", "pytz", "humanize",
    "colorama", "termcolor", "tqdm", "alive-progress",
    "jsonschema", "marshmallow", "cerberus", "voluptuous",
    "passlib", "bcrypt", "argon2-cffi", "itsdangerous",
    "jwt", "python-jose", "pyjwt", "oauthlib", "authlib",
    "fabric", "invoke", "sh", "subprocess32", "psutil", "py-cpuinfo",
    "apscheduler", "schedule", "rq", "dramatiq", "huey",
    "scrapy", "mechanize", "lxml", "html5lib", "pyquery",
    "nltk", "spacy", "textblob", "gensim", "fasttext",
    "sympy", "statsmodels", "xgboost", "lightgbm", "catboost",
]

KNOWN_NPM_PACKAGES = [
    "lodash", "react", "react-dom", "vue", "angular", "axios", "express",
    "typescript", "webpack", "babel-core", "eslint", "prettier",
    "jest", "mocha", "chai", "sinon", "supertest",
    "moment", "dayjs", "date-fns", "luxon",
    "underscore", "ramda", "immutable", "rxjs",
    "redux", "mobx", "zustand", "recoil",
    "next", "nuxt", "gatsby", "remix",
    "tailwindcss", "styled-components", "emotion",
    "mongoose", "sequelize", "typeorm", "prisma", "knex",
    "socket.io", "ws", "fastify", "koa", "hapi",
    "dotenv", "nodemon", "pm2", "cross-env",
    "chalk", "ora", "inquirer", "commander", "yargs",
    "uuid", "nanoid", "short-uuid", "cuid",
    "sharp", "jimp", "canvas", "pdf-lib", "pdfmake",
    "nodemailer", "sendgrid", "mailgun-js",
    "stripe", "paypal-rest-sdk", "braintree",
    "aws-sdk", "firebase", "supabase",
    "bcrypt", "bcryptjs", "jsonwebtoken", "passport",
    "multer", "formidable", "busboy",
    "cheerio", "puppeteer", "playwright",
    "compression", "helmet", "cors", "cookie-parser",
    "body-parser", "express-validator", "joi", "yup", "zod",
    "winston", "pino", "bunyan", "debug",
    "jest-circus", "vitest", "cypress", "playwright",
    "rollup", "vite", "parcel", "esbuild",
    "classnames", "clsx", "prop-types",
    "react-router", "react-router-dom", "react-query", "swr",
    "graphql", "apollo-client", "urql",
    "three", "d3", "chart.js", "recharts", "victory",
    "framer-motion", "gsap", "anime",
    "markdown-it", "showdown", "marked", "remark",
    "jszip", "archiver", "adm-zip",
    "glob", "minimatch", "micromatch", "fast-glob",
    "async", "bluebird", "p-queue", "p-limit",
    "semver", "node-fetch", "got", "superagent",
]


def _normalize(name: str) -> str:
    """Normalize package name for comparison."""
    return name.lower().replace("-", "").replace("_", "").replace(".", "")


def detect_typosquatting(
    package: str, ecosystem: str, top_n: int = 5
) -> TyposquatResult:
    eco = ecosystem.lower()
    candidates = KNOWN_PYPI_PACKAGES if eco == "pypi" else KNOWN_NPM_PACKAGES

    # Use multiple similarity metrics
    results = []
    from rapidfuzz.distance import Indel, JaroWinkler
    for candidate in candidates:
        # Token sort ratio
        s1 = fuzz.ratio(package.lower(), candidate.lower()) / 100.0
        # Partial ratio
        s2 = fuzz.partial_ratio(package.lower(), candidate.lower()) / 100.0
        # Normalized (strip separators)
        s3 = fuzz.ratio(_normalize(package), _normalize(candidate)) / 100.0
        # Indel normalized similarity (insertion/deletion)
        s4 = Indel.normalized_similarity(package.lower(), candidate.lower())
        # Jaro-Winkler (prefix-biased)
        s5 = JaroWinkler.normalized_similarity(package.lower(), candidate.lower())
        score = max(s1, s2, s3, s4, s5)
        if score > 0.6:  # Only keep meaningful similarities
            results.append({"package": candidate, "score": score})

    results.sort(key=lambda x: x["score"], reverse=True)
    top = results[:top_n]

    if not top:
        return TyposquatResult()

    best = top[0]
    threshold = settings.typosquatting_similarity_threshold
    is_suspicious = best["score"] >= threshold and best["package"].lower() != package.lower()

    return TyposquatResult(
        closest_match=best["package"] if is_suspicious else None,
        similarity_score=best["score"],
        is_suspicious=is_suspicious,
        all_matches=top,
    )
