"""Activity-on-arc (AOA) network construction and event-time computation."""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Mapping, Sequence

import networkx as nx

from app.schemas.pert import ActivityInput

TOLERANCE = 1e-9


class PertValidationError(ValueError):
    """Raised when the project definition cannot be solved."""


@dataclass(frozen=True)
class BuiltNode:
    temp_id: str
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


@dataclass(frozen=True)
class BuiltEdge:
    id: str
    source: str
    target: str
    source_temp: str
    target_temp: str
    activity_id: str | None
    name: str | None
    label: str
    duration: float
    is_dummy: bool
    dummy_label: str | None
    slack: float
    is_critical: bool


@dataclass
class AoaNetwork:
    graph: nx.DiGraph
    nodes: list[BuiltNode]
    edges: list[BuiltEdge]
    node_by_temp: dict[str, BuiltNode]
    edge_by_pair: dict[tuple[str, str], BuiltEdge]
    topo_temp: list[str]
    source_temp: str
    sink_temp: str
    E: dict[str, float]
    L: dict[str, float]
    project_duration: float
    critical_path: list[str]
    critical_activities: list[str]
    activity_slack: dict[str, float]
    activity_start_temp: dict[str, str]
    activity_end_temp: dict[str, str]


def clean_number(value: float, digits: int = 6) -> float:
    """Round a value and normalize negative zero."""
    if abs(value) < TOLERANCE:
        return 0.0
    return round(float(value), digits)


def _activity_graph(
    activities: Sequence[ActivityInput],
) -> tuple[nx.DiGraph, list[str]]:
    graph = nx.DiGraph()
    for activity in activities:
        graph.add_node(activity.id)
    for activity in activities:
        for predecessor in activity.predecessors:
            graph.add_edge(predecessor, activity.id)

    try:
        cycle = nx.find_cycle(graph)
    except nx.NetworkXNoCycle:
        cycle = []

    if cycle:
        cycle_nodes = [edge[0] for edge in cycle] + [cycle[-1][1]]
        raise PertValidationError(
            "Se detectó un ciclo de dependencias: " + " -> ".join(cycle_nodes) + "."
        )

    input_order = {activity.id: index for index, activity in enumerate(activities)}
    topological_order = list(
        nx.lexicographical_topological_sort(graph, key=lambda node: input_order[node])
    )
    return graph, topological_order


def build_aoa(
    activities: Sequence[ActivityInput],
    expected_times: Mapping[str, float],
) -> AoaNetwork:
    """Build a valid AOA network and compute E, L, slacks and critical path."""
    activity_graph, topological_activities = _activity_graph(activities)
    activity_by_id = {activity.id: activity for activity in activities}

    aoa = nx.DiGraph()
    event_meta: dict[str, dict[str, object]] = {}

    def new_event(kind: str, activity_id: str | None = None) -> str:
        temp_id = f"t{len(event_meta)}"
        event_meta[temp_id] = {
            "kind": kind,
            "activity_id": activity_id,
            "order": len(event_meta),
        }
        aoa.add_node(temp_id)
        return temp_id

    dummy_counter = 0

    def add_arc(
        source: str,
        target: str,
        duration: float,
        activity_id: str | None,
        name: str | None,
        is_dummy: bool,
        dummy_label: str | None,
    ) -> None:
        if aoa.has_edge(source, target):
            raise PertValidationError(
                "No fue posible construir la red AOA sin arcos duplicados."
            )
        arc_id = f"dummy_{dummy_counter}" if is_dummy else f"act_{activity_id}"
        aoa.add_edge(
            source,
            target,
            arc_id=arc_id,
            activity_id=activity_id,
            name=name,
            duration=float(duration),
            is_dummy=is_dummy,
            dummy_label=dummy_label,
        )

    source = new_event("source")
    activity_start: dict[str, str] = {}
    activity_end: dict[str, str] = {}
    merge_events: dict[frozenset[str], str] = {}

    for activity_id in topological_activities:
        activity = activity_by_id[activity_id]
        predecessors = activity.predecessors

        if not predecessors:
            start_event = source
        elif len(predecessors) == 1:
            start_event = activity_end[predecessors[0]]
        else:
            merge_key = frozenset(predecessors)
            if merge_key not in merge_events:
                merge_event = new_event("merge")
                for predecessor in predecessors:
                    dummy_counter += 1
                    add_arc(
                        activity_end[predecessor],
                        merge_event,
                        0.0,
                        None,
                        None,
                        True,
                        f"f{dummy_counter}",
                    )
                merge_events[merge_key] = merge_event
            start_event = merge_events[merge_key]

        end_event = new_event("activity_end", activity.id)
        activity_start[activity.id] = start_event
        activity_end[activity.id] = end_event
        add_arc(
            start_event,
            end_event,
            expected_times[activity.id],
            activity.id,
            activity.name,
            False,
            None,
        )

    terminal_activities = [
        activity for activity in activities if activity_graph.out_degree(activity.id) == 0
    ]

    if len(terminal_activities) == 1:
        sink = activity_end[terminal_activities[0].id]
    else:
        sink = new_event("sink")
        for activity in terminal_activities:
            dummy_counter += 1
            add_arc(
                activity_end[activity.id],
                sink,
                0.0,
                None,
                None,
                True,
                f"f{dummy_counter}",
            )

    creation_order = {
        temp_id: int(meta["order"]) for temp_id, meta in event_meta.items()
    }
    topological_events = list(
        nx.lexicographical_topological_sort(
            aoa, key=lambda node: creation_order[node]
        )
    )

    early_times: dict[str, float] = {source: 0.0}
    for event in topological_events:
        if event == source:
            continue
        incoming = list(aoa.in_edges(event, data=True))
        if not incoming:
            raise PertValidationError("El grafo AOA contiene un evento inalcanzable.")
        early_times[event] = max(
            early_times[source_event] + float(data["duration"])
            for source_event, _, data in incoming
        )

    late_times: dict[str, float] = {}
    for event in reversed(topological_events):
        outgoing = list(aoa.out_edges(event, data=True))
        if not outgoing:
            late_times[event] = early_times[event]
            continue
        late_times[event] = min(
            late_times[target_event] - float(data["duration"])
            for _, target_event, data in outgoing
        )

    project_duration = early_times[sink]

    activity_slack: dict[str, float] = {}
    for activity in activities:
        start = activity_start[activity.id]
        end = activity_end[activity.id]
        activity_slack[activity.id] = (
            late_times[end] - early_times[start] - expected_times[activity.id]
        )

    critical_activities = [
        activity_id
        for activity_id in topological_activities
        if abs(activity_slack[activity_id]) <= TOLERANCE
    ]

    zero_slack_graph = nx.DiGraph()
    for source_event, target_event, data in aoa.edges(data=True):
        slack = (
            late_times[target_event]
            - early_times[source_event]
            - float(data["duration"])
        )
        if abs(slack) <= TOLERANCE:
            zero_slack_graph.add_edge(source_event, target_event)

    try:
        critical_event_path = nx.shortest_path(zero_slack_graph, source, sink)
    except (nx.NetworkXNoPath, nx.NodeNotFound):
        critical_event_path = []

    critical_path: list[str] = []
    for source_event, target_event in zip(
        critical_event_path, critical_event_path[1:]
    ):
        data = aoa[source_event][target_event]
        if not data["is_dummy"]:
            critical_path.append(str(data["activity_id"]))

    event_numbers = {
        temp_id: position + 1
        for position, temp_id in enumerate(topological_events)
    }
    final_ids = {
        temp_id: f"n{event_number}"
        for temp_id, event_number in event_numbers.items()
    }

    rank: dict[str, int] = {source: 0}
    for event in topological_events:
        if event == source:
            continue
        rank[event] = max(rank[predecessor] + 1 for predecessor in aoa.predecessors(event))

    events_by_rank: dict[int, list[str]] = defaultdict(list)
    for event in topological_events:
        events_by_rank[rank[event]].append(event)

    positions: dict[str, tuple[float, float]] = {}
    for level, grouped_events in events_by_rank.items():
        for index, event in enumerate(grouped_events):
            positions[event] = (80.0 + level * 230.0, 110.0 + index * 130.0)

    built_nodes: list[BuiltNode] = []
    node_by_temp: dict[str, BuiltNode] = {}
    for event in topological_events:
        node = BuiltNode(
            temp_id=event,
            id=final_ids[event],
            event=event_numbers[event],
            E=clean_number(early_times[event]),
            L=clean_number(late_times[event]),
            is_source=event == source,
            is_sink=event == sink,
            is_critical=abs(early_times[event] - late_times[event]) <= TOLERANCE,
            rank=rank[event],
            x=positions[event][0],
            y=positions[event][1],
        )
        built_nodes.append(node)
        node_by_temp[event] = node

    built_edges: list[BuiltEdge] = []
    edge_by_pair: dict[tuple[str, str], BuiltEdge] = {}
    sorted_edges = sorted(
        aoa.edges(data=True),
        key=lambda item: (
            event_numbers[item[0]],
            event_numbers[item[1]],
            str(item[2]["arc_id"]),
        ),
    )
    for source_event, target_event, data in sorted_edges:
        duration = float(data["duration"])
        slack = (
            late_times[target_event]
            - early_times[source_event]
            - duration
        )
        is_dummy = bool(data["is_dummy"])
        activity_id = data["activity_id"]
        if is_dummy:
            label = f"{data['dummy_label']} (0.00)"
        else:
            label = f"{activity_id} ({duration:.2f})"

        edge = BuiltEdge(
            id=str(data["arc_id"]),
            source=node_by_temp[source_event].id,
            target=node_by_temp[target_event].id,
            source_temp=source_event,
            target_temp=target_event,
            activity_id=str(activity_id) if activity_id is not None else None,
            name=str(data["name"]) if data["name"] is not None else None,
            label=label,
            duration=clean_number(duration),
            is_dummy=is_dummy,
            dummy_label=str(data["dummy_label"]) if is_dummy else None,
            slack=clean_number(slack),
            is_critical=abs(slack) <= TOLERANCE,
        )
        built_edges.append(edge)
        edge_by_pair[(source_event, target_event)] = edge

    return AoaNetwork(
        graph=aoa,
        nodes=built_nodes,
        edges=built_edges,
        node_by_temp=node_by_temp,
        edge_by_pair=edge_by_pair,
        topo_temp=topological_events,
        source_temp=source,
        sink_temp=sink,
        E=early_times,
        L=late_times,
        project_duration=project_duration,
        critical_path=critical_path,
        critical_activities=critical_activities,
        activity_slack=activity_slack,
        activity_start_temp=activity_start,
        activity_end_temp=activity_end,
    )
