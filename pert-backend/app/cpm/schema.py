"""Datos de entrada y resultados del metodo CPM."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas.pert import AoaEdge, AoaNode, PertStep


class CpmActivityInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    id: str = Field(min_length=1)
    name: str | None = None
    predecessors: list[str] = Field(default_factory=list)
    duration: float = Field(ge=0, allow_inf_nan=False)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        return value.strip() or None if value is not None else None

    @field_validator("predecessors")
    @classmethod
    def normalize_predecessors(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(item.strip() for item in value if item.strip()))


class CpmRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    activities: list[CpmActivityInput] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_references(self) -> "CpmRequest":
        ids = [activity.id for activity in self.activities]
        if len(ids) != len(set(ids)):
            raise ValueError("Los identificadores de las actividades no pueden estar repetidos.")
        known = set(ids)
        for activity in self.activities:
            for predecessor in activity.predecessors:
                if predecessor == activity.id:
                    raise ValueError(f"La actividad '{activity.id}' no puede depender de sí misma.")
                if predecessor not in known:
                    raise ValueError(f"El predecesor '{predecessor}' de '{activity.id}' no existe.")
        return self


class CpmActivityResult(BaseModel):
    id: str
    name: str
    predecessors: list[str]
    duration: float
    start_event: int
    end_event: int
    start_node_id: str
    end_node_id: str
    early_start: float
    early_finish: float
    late_start: float
    late_finish: float
    slack: float
    is_critical: bool
    slack_formula: str


class CpmResponse(BaseModel):
    method: Literal["cpm"] = "cpm"
    project_duration: float
    activities: list[CpmActivityResult]
    nodes: list[AoaNode]
    edges: list[AoaEdge]
    critical_path: list[str]
    critical_paths: list[list[str]]
    critical_paths_truncated: bool = False
    critical_activities: list[str]
    steps: list[PertStep]
