"""Application configuration."""

import os

DEFAULT_ALLOWED_ORIGINS = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "http://localhost:3000,"
    "http://127.0.0.1:3000"
)


def get_allowed_origins() -> list[str]:
    """Return the CORS origins configured through the environment."""
    raw_origins = os.getenv("PERT_ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS)
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
