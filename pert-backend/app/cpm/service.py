"""CPM con duraciones fijas, red AOA y calculo hacia adelante y atras."""

from __future__ import annotations

from itertools import islice

import networkx as nx

from app.cpm.schema import CpmActivityResult, CpmRequest, CpmResponse
from app.schemas.pert import AoaEdge, AoaNode
from app.cpm.network import TOLERANCE, AoaNetwork, build_cpm_network, clean_number
from app.services.snapshots import build_steps

MAX_CRITICAL_PATHS = 100


def _critical_paths(network: AoaNetwork) -> tuple[list[list[str]], bool]:
    critical = nx.DiGraph()
    critical.add_nodes_from(network.graph.nodes)
    for edge in network.edges:
        if edge.is_critical:
            critical.add_edge(edge.source_temp, edge.target_temp)

    paths = list(islice(
        nx.all_simple_paths(critical, network.source_temp, network.sink_temp),
        MAX_CRITICAL_PATHS + 1,
    ))
    sequences = []
    for path in paths[:MAX_CRITICAL_PATHS]:
        sequence = [
            network.graph[start][end]["activity_id"]
            for start, end in zip(path, path[1:])
            if not network.graph[start][end]["is_dummy"]
        ]
        if sequence not in sequences:
            sequences.append(sequence)
    return sequences, len(paths) > MAX_CRITICAL_PATHS


def solve_cpm(request: CpmRequest) -> CpmResponse:
    durations = {activity.id: activity.duration for activity in request.activities}
    network = build_cpm_network(request.activities, durations)
    paths, truncated = _critical_paths(network)
    if paths:
        network.critical_path = paths[0]

    activities = []
    for activity in request.activities:
        start = network.node_by_temp[network.activity_start_temp[activity.id]]
        end = network.node_by_temp[network.activity_end_temp[activity.id]]
        duration = activity.duration
        slack = network.activity_slack[activity.id]
        activities.append(CpmActivityResult(
            id=activity.id,
            name=activity.name or activity.id,
            predecessors=activity.predecessors,
            duration=clean_number(duration),
            start_event=start.event,
            end_event=end.event,
            start_node_id=start.id,
            end_node_id=end.id,
            early_start=start.E,
            early_finish=clean_number(start.E + duration),
            late_start=clean_number(end.L - duration),
            late_finish=end.L,
            slack=clean_number(slack),
            is_critical=abs(slack) <= TOLERANCE,
            slack_formula=(
                f"H({activity.id}) = L{end.event} - E{start.event} - D({activity.id})"
                f" = {end.L:g} - {start.E:g} - {duration:g} = {slack:g}"
            ),
        ))

    return CpmResponse(
        project_duration=clean_number(network.project_duration),
        activities=activities,
        nodes=[AoaNode.model_validate(node, from_attributes=True) for node in network.nodes],
        edges=[AoaEdge.model_validate(edge, from_attributes=True) for edge in network.edges],
        critical_path=network.critical_path,
        critical_paths=paths,
        critical_paths_truncated=truncated,
        critical_activities=network.critical_activities,
        steps=build_steps(network),
    )
