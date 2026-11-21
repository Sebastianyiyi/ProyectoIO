"""API independiente de CPM con un unico ejemplo publico."""

import json
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.cpm.network import CpmValidationError
from app.cpm.schema import CpmRequest, CpmResponse
from app.cpm.service import solve_cpm

router = APIRouter(prefix="/api/v1/cpm", tags=["CPM"])
EXAMPLE = Path(__file__).resolve().with_name("example.json")


@router.post("/solve", response_model=CpmResponse, summary="Resolver un proyecto CPM")
def solve(request: CpmRequest) -> CpmResponse:
    try:
        return solve_cpm(request)
    except CpmValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/example", response_model=CpmRequest, summary="Cargar el ejemplo CPM")
def get_example() -> CpmRequest:
    try:
        payload = json.loads(EXAMPLE.read_text(encoding="utf-8"))
    except OSError as exc:
        raise HTTPException(status_code=500, detail="No fue posible leer el ejemplo CPM.") from exc
    return CpmRequest.model_validate(payload)
