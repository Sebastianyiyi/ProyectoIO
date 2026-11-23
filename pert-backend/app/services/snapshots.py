"""Build the ordered animation snapshots for the PERT algorithm."""

from __future__ import annotations

from app.schemas.pert import PertStep, StepLabels, StepSnapshot, StepUpdates
from app.services.aoa import TOLERANCE, AoaNetwork, BuiltEdge, clean_number


def _format(value: float) -> str:
    if abs(value) < TOLERANCE:
        value = 0.0
    return f"{value:.2f}"


def _edge_name(edge: BuiltEdge) -> str:
    if edge.is_dummy:
        return edge.dummy_label or edge.id
    return edge.activity_id or edge.id


def _incoming_edges(network: AoaNetwork, temp_id: str) -> list[tuple[str, str, dict]]:
    edges = list(network.graph.in_edges(temp_id, data=True))
    return sorted(
        edges,
        key=lambda item: (
            network.node_by_temp[item[0]].event,
            str(item[2]["arc_id"]),
        ),
    )


def _outgoing_edges(network: AoaNetwork, temp_id: str) -> list[tuple[str, str, dict]]:
    edges = list(network.graph.out_edges(temp_id, data=True))
    return sorted(
        edges,
        key=lambda item: (
            network.node_by_temp[item[1]].event,
            str(item[2]["arc_id"]),
        ),
    )


def _snapshot(
    network: AoaNetwork,
    known_early: dict[str, float],
    known_late: dict[str, float],
    *,
    show_critical: bool = False,
) -> StepSnapshot:
    early = {
        node.id: clean_number(known_early[node.temp_id])
        for node in network.nodes
        if node.temp_id in known_early
    }
    late = {
        node.id: clean_number(known_late[node.temp_id])
        for node in network.nodes
        if node.temp_id in known_late
    }
    return StepSnapshot(
        E=early,
        L=late,
        critical_nodes=[node.id for node in network.nodes if node.is_critical]
        if show_critical
        else [],
        critical_edges=[edge.id for edge in network.edges if edge.is_critical]
        if show_critical
        else [],
    )


def build_steps(network: AoaNetwork) -> list[PertStep]:
    """Generate forward, backward and critical-path snapshots."""
    steps: list[PertStep] = []
    known_early: dict[str, float] = {}
    known_late: dict[str, float] = {}

    def append_step(
        *,
        step_type: str,
        node_id: str | None,
        formula: str,
        explanation: str,
        labels: StepLabels,
        updates: StepUpdates,
        highlight_nodes: list[str],
        highlight_edges: list[str],
        show_critical: bool = False,
    ) -> None:
        steps.append(
            PertStep(
                index=len(steps),
                type=step_type,
                node_id=node_id,
                formula=formula,
                explanation=explanation,
                labels=labels,
                updates=updates,
                highlight_nodes=list(dict.fromkeys(highlight_nodes)),
                highlight_edges=list(dict.fromkeys(highlight_edges)),
                snapshot=_snapshot(
                    network,
                    known_early,
                    known_late,
                    show_critical=show_critical,
                ),
            )
        )

    for temp_id in network.topo_temp:
        node = network.node_by_temp[temp_id]
        incoming = _incoming_edges(network, temp_id)

        if not incoming:
            value = network.E[temp_id]
            formula = f"E{node.event} = 0.00"
            explanation = (
                f"El evento {node.event} es el inicio del proyecto; por definición "
                "su tiempo temprano es 0.00."
            )
            active_edges: list[BuiltEdge] = []
            highlight_nodes = [node.id]
        else:
            terms: list[str] = []
            arrivals: list[tuple[float, BuiltEdge]] = []
            descriptions: list[str] = []

            for source_temp, target_temp, data in incoming:
                source_node = network.node_by_temp[source_temp]
                duration = float(data["duration"])
                edge = network.edge_by_pair[(source_temp, target_temp)]
                arrival = network.E[source_temp] + duration
                terms.append(f"E{source_node.event} + {_format(duration)}")
                arrivals.append((arrival, edge))
                descriptions.append(
                    f"{_edge_name(edge)} desde el evento {source_node.event}"
                )

            best_arrival = max(arrival for arrival, _ in arrivals)
            active_edges = [
                edge
                for arrival, edge in arrivals
                if abs(arrival - best_arrival) <= TOLERANCE
            ]
            value = network.E[temp_id]
            formula = (
                f"E{node.event} = max({', '.join(terms)}) = "
                f"{_format(best_arrival)}"
            )
            explanation = (
                f"Se evalúan los arcos de entrada del evento {node.event} "
                f"({'; '.join(descriptions)}). El paso adelante toma el máximo, "
                f"por lo que E{node.event} = {_format(best_arrival)}."
            )
            highlight_nodes = [node.id] + [
                network.node_by_temp[edge.source_temp].id for edge in active_edges
            ]

        known_early[temp_id] = value
        append_step(
            step_type="forward",
            node_id=node.id,
            formula=formula,
            explanation=explanation,
            labels=StepLabels(E=clean_number(value)),
            updates=StepUpdates(E={node.id: clean_number(value)}),
            highlight_nodes=highlight_nodes,
            highlight_edges=[edge.id for edge in active_edges],
        )

    for temp_id in reversed(network.topo_temp):
        node = network.node_by_temp[temp_id]
        outgoing = _outgoing_edges(network, temp_id)

        if not outgoing:
            value = network.L[temp_id]
            formula = f"L{node.event} = E{node.event} = {_format(value)}"
            explanation = (
                f"El evento {node.event} es el final del proyecto y no tiene "
                f"salidas; por ello conserva el tiempo temprano: L{node.event} = "
                f"{_format(value)}."
            )
            active_edges: list[BuiltEdge] = []
            highlight_nodes = [node.id]
        else:
            terms = []
            departures: list[tuple[float, BuiltEdge]] = []
            descriptions = []

            for source_temp, target_temp, data in outgoing:
                target_node = network.node_by_temp[target_temp]
                duration = float(data["duration"])
                edge = network.edge_by_pair[(source_temp, target_temp)]
                departure = network.L[target_temp] - duration
                terms.append(f"L{target_node.event} - {_format(duration)}")
                departures.append((departure, edge))
                descriptions.append(
                    f"{_edge_name(edge)} hacia el evento {target_node.event}"
                )

            best_departure = min(departure for departure, _ in departures)
            active_edges = [
                edge
                for departure, edge in departures
                if abs(departure - best_departure) <= TOLERANCE
            ]
            value = network.L[temp_id]
            formula = (
                f"L{node.event} = min({', '.join(terms)}) = "
                f"{_format(best_departure)}"
            )
            explanation = (
                f"Se evalúan los arcos de salida del evento {node.event} "
                f"({'; '.join(descriptions)}). El paso atrás toma el mínimo, "
                f"por lo que L{node.event} = {_format(best_departure)}."
            )
            highlight_nodes = [node.id] + [
                network.node_by_temp[edge.target_temp].id for edge in active_edges
            ]

        known_late[temp_id] = value
        append_step(
            step_type="backward",
            node_id=node.id,
            formula=formula,
            explanation=explanation,
            labels=StepLabels(L=clean_number(value)),
            updates=StepUpdates(L={node.id: clean_number(value)}),
            highlight_nodes=highlight_nodes,
            highlight_edges=[edge.id for edge in active_edges],
        )

    real_edge_by_activity = {
        edge.activity_id: edge for edge in network.edges if edge.activity_id is not None
    }

    for activity_id in network.critical_activities:
        edge = real_edge_by_activity[activity_id]
        start_node = network.node_by_temp[edge.source_temp]
        end_node = network.node_by_temp[edge.target_temp]
        slack = network.activity_slack[activity_id]

        append_step(
            step_type="critical",
            node_id=end_node.id,
            formula=(
                f"H({activity_id}) = L{end_node.event} - E{start_node.event} - "
                f"{_format(edge.duration)} = {_format(slack)}"
            ),
            explanation=(
                f"La actividad {activity_id} tiene holgura cero, por lo que no "
                "puede retrasarse sin afectar la duración total del proyecto y "
                "pertenece a la ruta crítica."
            ),
            labels=StepLabels(
                E=clean_number(network.E[edge.source_temp]),
                L=clean_number(network.L[edge.target_temp]),
            ),
            updates=StepUpdates(),
            highlight_nodes=[start_node.id, end_node.id],
            highlight_edges=[edge.id],
            show_critical=True,
        )

    critical_path = network.critical_path or network.critical_activities
    if critical_path:
        path_text = " -> ".join(critical_path)
        duration_text = _format(network.project_duration)
    else:
        path_text = "No se encontró una ruta crítica."
        duration_text = _format(network.project_duration)

    append_step(
        step_type="critical",
        node_id=None,
        formula=f"Ruta crítica: {path_text} (duración = {duration_text})",
        explanation=(
            "El conjunto de actividades con holgura cero forma la ruta crítica. "
            "Cualquier retraso en estas actividades incrementa la duración total "
            "del proyecto."
        ),
        labels=StepLabels(),
        updates=StepUpdates(),
        highlight_nodes=[node.id for node in network.nodes if node.is_critical],
        highlight_edges=[edge.id for edge in network.edges if edge.is_critical],
        show_critical=True,
    )

    return steps
