"""Request and response schemas for the PERT solver."""

from __future__ import annotations

from typing import Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator, model_validator


class ActivityInput(BaseModel):
    """A single project activity with probabilistic duration estimates."""

    model_config = ConfigDict(
        populate_by_name=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    id: str = Field(min_length=1, description="Identificador único de la actividad.")
    name: str | None = Field(default=None, description="Nombre descriptivo opcional.")
    predecessors: list[str] = Field(
        default_factory=list,
        description="Identificadores de las actividades predecesoras inmediatas.",
    )
    a: float = Field(
        ge=0,
        allow_inf_nan=False,
        validation_alias=AliasChoices("a", "optimistic", "optimista"),
        description="Tiempo optimista.",
    )
    m: float = Field(
        ge=0,
        allow_inf_nan=False,
        validation_alias=AliasChoices("m", "most_likely", "mas_probable"),
        description="Tiempo más probable.",
    )
    b: float = Field(
        ge=0,
        allow_inf_nan=False,
        validation_alias=AliasChoices("b", "pessimistic", "pesimista"),
        description="Tiempo pesimista.",
    )

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        return value.strip()

    @field_validator("predecessors")
    @classmethod
    def normalize_predecessors(cls, value: list[str]) -> list[str]:
        normalized: list[str] = []
        for predecessor in value:
            predecessor = predecessor.strip()
            if predecessor and predecessor not in normalized:
                normalized.append(predecessor)
        return normalized

    @model_validator(mode="after")
    def validate_time_order(self) -> "ActivityInput":
        if not self.a <= self.m <= self.b:
            raise ValueError(
                f"La actividad '{self.id}' debe cumplir a <= m <= b "
                f"(recibido: a={self.a}, m={self.m}, b={self.b})."
            )
        return self


class PertRequest(BaseModel):
    """Payload accepted by the PERT solver endpoint."""

    model_config = ConfigDict(populate_by_name=True, extra="forbid")

    activities: list[ActivityInput] = Field(
        min_length=1,
        description="Lista de actividades del proyecto.",
    )
    target_time: float | None = Field(
        default=None,
        ge=0,
        allow_inf_nan=False,
        validation_alias=AliasChoices("target_time", "T", "t"),
        description="Tiempo objetivo opcional para el análisis probabilístico.",
    )

    @model_validator(mode="after")
    def validate_activity_references(self) -> "PertRequest":
        identifiers = [activity.id for activity in self.activities]
        duplicates = sorted({identifier for identifier in identifiers if identifiers.count(identifier) > 1})
        if duplicates:
            raise ValueError(f"Los siguientes identificadores están repetidos: {', '.join(duplicates)}.")

        known_ids = set(identifiers)
        for activity in self.activities:
            for predecessor in activity.predecessors:
                if predecessor == activity.id:
                    raise ValueError(
                        f"La actividad '{activity.id}' no puede ser predecesora de sí misma."
                    )
                if predecessor not in known_ids:
                    raise ValueError(
                        f"El predecesor '{predecessor}' de la actividad "
                        f"'{activity.id}' no existe."
                    )
        return self


class ActivityResult(BaseModel):
    """Calculated metrics for one activity."""

    id: str
    name: str
    predecessors: list[str]
    a: float
    m: float
    b: float
    expected_time: float
    variance: float
    start_event: int
    end_event: int
    start_node_id: str
    end_node_id: str
    slack: float
    is_critical: bool
    expected_time_formula: str
    variance_formula: str
    slack_formula: str


class AoaNode(BaseModel):
    """Event node displayed in the activity-on-arc network."""

    id: str
    event: int
    E: float
    L: float
    is_source: bool
    is_sink: bool
    is_critical: bool
    rank: int
    x: float
    y: float


class AoaEdge(BaseModel):
    """Real or dummy activity represented as an arc."""

    id: str
    source: str
    target: str
    activity_id: str | None = None
    name: str | None = None
    label: str
    duration: float
    is_dummy: bool
    dummy_label: str | None = None
    slack: float
    is_critical: bool


class ProbabilityAnalysis(BaseModel):
    """Probabilistic analysis based on the critical path."""

    target_time: float | None
    mean: float
    critical_variance: float
    standard_deviation: float
    z_score: float | None
    probability: float | None
    formula: str


class StepLabels(BaseModel):
    """Labels updated by one algorithm step."""

    E: float | None = None
    L: float | None = None


class StepUpdates(BaseModel):
    """Node labels updated by one algorithm step, keyed by node id."""

    E: dict[str, float] = Field(default_factory=dict)
    L: dict[str, float] = Field(default_factory=dict)


class StepSnapshot(BaseModel):
    """Cumulative state after applying one step."""

    E: dict[str, float] = Field(default_factory=dict)
    L: dict[str, float] = Field(default_factory=dict)
    critical_nodes: list[str] = Field(default_factory=list)
    critical_edges: list[str] = Field(default_factory=list)


class PertStep(BaseModel):
    """One animation snapshot produced by the PERT algorithm."""

    index: int
    type: Literal["forward", "backward", "critical"]
    node_id: str | None
    formula: str
    explanation: str
    labels: StepLabels
    updates: StepUpdates
    highlight_nodes: list[str] = Field(default_factory=list)
    highlight_edges: list[str] = Field(default_factory=list)
    snapshot: StepSnapshot


class PertResponse(BaseModel):
    """Complete solution returned by the API."""

    project_duration: float
    activities: list[ActivityResult]
    nodes: list[AoaNode]
    edges: list[AoaEdge]
    critical_path: list[str]
    critical_activities: list[str]
    probability: ProbabilityAnalysis
    steps: list[PertStep]
