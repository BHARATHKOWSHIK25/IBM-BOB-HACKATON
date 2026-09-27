from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    app_name: str = "DepPhantom"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = False

    database_url: str = "sqlite+aiosqlite:///./depphantom.db"

    # Registry endpoints
    pypi_api_url: str = "https://pypi.org/pypi"
    npm_api_url: str = "https://registry.npmjs.org"
    pypistats_api_url: str = "https://pypistats.org/api"

    # Registry API timeout (seconds)
    registry_timeout: float = 10.0

    # CORS — comma-separated origins
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost:4173,http://localhost:80,http://localhost"

    # Risk thresholds
    typosquatting_similarity_threshold: float = 0.80
    new_package_age_days: int = 30
    low_download_threshold: int = 100

    # Policy defaults
    default_unknown_package_policy: str = "BLOCK"
    default_new_package_policy: str = "REVIEW"
    default_typosquatting_policy: str = "BLOCK"
    default_high_risk_script_policy: str = "BLOCK"
    default_intent_mismatch_policy: str = "REVIEW"

    # Demo mode — enables demo scenarios; does not disable live analysis
    demo_mode: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
