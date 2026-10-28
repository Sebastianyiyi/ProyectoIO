"""REST endpoints for the PERT method."""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas.pert import PertRequest, PertResponse
from app.services.aoa import PertValidationError
from app.services.pert import solve_pert

router = APIRouter(prefix="/api/v1/pert", tags=["PERT"])

_EXAMPLE_PATH = Path(__file__).resolve().parents[2] / "examples" / "simple_project.json"


@router.post(
    "/solve",
    response_model=PertResponse,
    summary="Resolver un proyecto PERT",
    description=(
        "Calcula tiempos esperados, varianzas, red AOA, tiempos E y L, holguras, "
        "ruta crítica, probabilidad y los pasos para la animación."
    ),
)
def solve(request: PertRequest) -> PertResponse:
    try:
        return solve_pert(request)
    except PertValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get(
    "/example",
    response_model=PertRequest,
    summary="Obtener un proyecto de ejemplo",
)
def get_example() -> PertRequest:
    try:
        payload = json.loads(_EXAMPLE_PATH.read_text(encoding="utf-8"))
    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail="No fue posible leer el archivo de ejemplo.",
        ) from exc
    return PertRequest.model_validate(payload)
