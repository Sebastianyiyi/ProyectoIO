"""PERT calculation engine."""

from __future__ import annotations

from math import sqrt

from scipy.stats import norm

from app.schemas.pert import (
    ActivityInput,
    ActivityResult,
    AoaEdge,
    AoaNode,
    PertRequest,
    PertResponse,
    ProbabilityAnalysis,
)
from app.services.aoa import TOLERANCE, AoaNetwork, build_aoa, clean_number
from app.services.snapshots import build_steps


def expected_time(activity: ActivityInput) -> float:
    """PERT expected duration: te = (a + 4m + b) / 6."""
    return (activity.a + 4.0 * activity.m + activity.b) / 6.0


def activity_variance(activity: ActivityInput) -> float:
    """PERT variance: ((b - a) / 6)^2."""
    return ((activity.b - activity.a) / 6.0) ** 2


def _number(value: float) -> str:
    if abs(value) < TOLERANCE:
        return "0"
    return f"{value:g}"


def _activity_result(
    activity: ActivityInput,
    network: AoaNetwork,
    mean: float,
    variance: float,
) -> ActivityResult:
    start_temp = network.activity_start_temp[activity.id]
    end_temp = network.activity_end_temp[activity.id]
    start_node = network.node_by_temp[start_temp]
    end_node = network.node_by_temp[end_temp]
    slack = network.activity_slack[activity.id]

    return ActivityResult(
        id=activity.id,
        name=activity.name or activity.id,
        predecessors=activity.predecessors,
        a=clean_number(activity.a),
        m=clean_number(activity.m),
        b=clean_number(activity.b),
        expected_time=clean_number(mean),
        variance=clean_number(variance),
        start_event=start_node.event,
        end_event=end_node.event,
        start_node_id=start_node.id,
        end_node_id=end_node.id,
        slack=clean_number(slack),
        is_critical=abs(slack) <= TOLERANCE,
        expected_time_formula=(
            f"te({activity.id}) = ({_number(activity.a)} + "
            f"4({_number(activity.m)}) + {_number(activity.b)}) / 6 = "
            f"{mean:.4f}"
        ),
        variance_formula=(
            f"Var({activity.id}) = (({_number(activity.b)} - "
            f"{_number(activity.a)}) / 6)^2 = {variance:.4f}"
        ),
        slack_formula=(
            f"H({activity.id}) = L{end_node.event} - E{start_node.event} - "
            f"{mean:.2f} = {slack:.2f}"
        ),
    )


def _probability_analysis(
    network: AoaNetwork,
    variances: dict[str, float],
    target_time: float | None,
) -> ProbabilityAnalysis:
    variance_activities = network.critical_path or network.critical_activities
    critical_variance = sum(variances[activity_id] for activity_id in variance_activities)
    standard_deviation = sqrt(max(critical_variance, 0.0))
    mean = network.project_duration

    if target_time is None:
        z_score = None
        probability = None
        formula = (
            "No se proporcionó un tiempo objetivo T; se calcula únicamente la "
            "duración esperada y la desviación estándar de la ruta crítica."
        )
    elif standard_deviation <= TOLERANCE:
        z_score = None
        probability = 1.0 if target_time >= mean - TOLERANCE else 0.0
        formula = (
            "La desviación estándar de la ruta crítica es 0; la duración es "
            f"determinista. P(T <= {_number(target_time)}) = {probability:.4f}."
        )
    else:
        z_score = (target_time - mean) / standard_deviation
        probability = float(norm.cdf(z_score))
        formula = (
            f"Z = ({_number(target_time)} - {mean:.2f}) / "
            f"{standard_deviation:.4f} = {z_score:.4f}; "
            f"P(T <= {_number(target_time)}) = {probability:.4f}."
        )

    return ProbabilityAnalysis(
        target_time=clean_number(target_time) if target_time is not None else None,
        mean=clean_number(mean),
        critical_variance=clean_number(critical_variance),
        standard_deviation=clean_number(standard_deviation),
        z_score=clean_number(z_score) if z_score is not None else None,
        probability=clean_number(probability) if probability is not None else None,
        formula=formula,
    )


def solve_pert(request: PertRequest) -> PertResponse:
    """Solve the complete PERT problem and return the animation-ready response."""
    expected_times = {
        activity.id: expected_time(activity) for activity in request.activities
    }
    variances = {
        activity.id: activity_variance(activity) for activity in request.activities
    }

    network = build_aoa(request.activities, expected_times)

    activities = [
        _activity_result(
            activity,
            network,
            expected_times[activity.id],
            variances[activity.id],
        )
        for activity in request.activities
    ]

    nodes = [
        AoaNode(
            id=node.id,
            event=node.event,
            E=node.E,
            L=node.L,
            is_source=node.is_source,
            is_sink=node.is_sink,
            is_critical=node.is_critical,
            rank=node.rank,
            x=node.x,
            y=node.y,
        )
        for node in network.nodes
    ]

    edges = [
        AoaEdge(
            id=edge.id,
            source=edge.source,
            target=edge.target,
            activity_id=edge.activity_id,
            name=edge.name,
            label=edge.label,
            duration=edge.duration,
            is_dummy=edge.is_dummy,
            dummy_label=edge.dummy_label,
            slack=edge.slack,
            is_critical=edge.is_critical,
        )
        for edge in network.edges
    ]

    return PertResponse(
        project_duration=clean_number(network.project_duration),
        activities=activities,
        nodes=nodes,
        edges=edges,
        critical_path=network.critical_path,
        critical_activities=network.critical_activities,
        probability=_probability_analysis(
            network,
            variances,
            request.target_time,
        ),
        steps=build_steps(network),
    )
