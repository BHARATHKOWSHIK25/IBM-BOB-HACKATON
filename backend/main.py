"""DepPhantom FastAPI application entry point."""
from __future__ import annotations
import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from .database import init_db
from .api.routes import router
from .config import get_settings

settings = get_settings()
logger = logging.getLogger("depphantom")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Configure logging
    logging.basicConfig(
        level=logging.DEBUG if settings.debug else logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    logger.info("DepPhantom starting up...")
    await init_db()
    await _seed_policies()
    logger.info("DepPhantom ready.")
    yield
    logger.info("DepPhantom shutting down.")


async def _seed_policies():
    """Seed default policy values if not already present."""
    from .database import AsyncSessionLocal
    from .models import PolicyConfig
    from sqlalchemy import select

    defaults = [
        ("unknown_package_policy", "BLOCK", "Decision for packages not found in registry"),
        ("new_package_policy", "REVIEW", "Decision for packages newer than 30 days"),
        ("typosquatting_policy", "BLOCK", "Decision when typosquatting detected"),
        ("high_risk_script_policy", "BLOCK", "Decision when dangerous install scripts found"),
        ("intent_mismatch_policy", "REVIEW", "Decision when AI intent does not match package purpose"),
        ("ai_agent_multiplier", "enabled", "Apply extra scrutiny to AI_AGENT requests"),
        ("fail_closed", "enabled", "Block when registry is unavailable (fail-closed)"),
    ]

    async with AsyncSessionLocal() as session:
        for key, value, description in defaults:
            result = await session.execute(
                select(PolicyConfig).where(PolicyConfig.key == key)
            )
            if not result.scalar_one_or_none():
                session.add(PolicyConfig(key=key, value=value, description=description))
        await session.commit()


app = FastAPI(
    title="DepPhantom",
    description=(
        "AI-Hallucinated Dependency Supply-Chain Attack Prevention Platform. "
        "Pre-installation security gate for autonomous coding agents.\n\n"
        "**Never execute an untrusted package to determine if it is safe.**\n\n"
        "Analysis is performed via static registry metadata, name similarity, "
        "and pattern-based inspection only."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# GZip all responses ≥ 1 KB — cuts JSON payload size 60-80%
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS — configurable via environment
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s → %d (%.0fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# Global exception handler — never expose internal details
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. The request has not been authorized.",
            "path": str(request.url.path),
        },
    )


app.include_router(router, prefix="/api")
