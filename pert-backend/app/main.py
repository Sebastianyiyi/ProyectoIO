"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as pert_router
from app.config import get_allowed_origins

app = FastAPI(
    title="PERT API",
    description=(
        "API didáctica para resolver y animar el método PERT, incluyendo red AOA, "
        "tiempos tempranos y tardíos, holguras, ruta crítica y análisis probabilístico."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pert_router)


@app.get("/health", tags=["Sistema"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["Sistema"])
def root() -> dict[str, str]:
    return {
        "name": "PERT API",
        "docs": "/docs",
        "openapi": "/openapi.json",
        "health": "/health",
    }
