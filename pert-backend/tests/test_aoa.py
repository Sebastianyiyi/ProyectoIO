"""Tests for AOA network construction."""

import pytest

from app.schemas.pert import ActivityInput, PertRequest
from app.services.pert import solve_pert


def solve(activities):
    request = PertRequest(
        activities=[ActivityInput(**activity) for activity in activities]
    )
    return solve_pert(request)


def assert_no_duplicate_arcs(response):
    pairs = {(edge.source, edge.target) for edge in response.edges}
    assert len(pairs) == len(response.edges)


def test_single_activity_has_source_and_sink_without_dummies():
    response = solve([{"id": "A", "a": 2, "m": 4, "b": 6}])

    assert len(response.nodes) == 2
    assert len(response.edges) == 1
    assert response.edges[0].is_dummy is False
    assert not any(edge.is_dummy for edge in response.edges)
    assert response.nodes[0].is_source is True
    assert response.nodes[-1].is_sink is True


def test_multiple_predecessors_generate_dummy_activities():
    response = solve(
        [
            {"id": "A", "a": 1, "m": 1, "b": 1},
            {"id": "B", "a": 1, "m": 1, "b": 1},
            {"id": "C", "predecessors": ["A", "B"], "a": 1, "m": 1, "b": 1},
        ]
    )

    dummies = [edge for edge in response.edges if edge.is_dummy]
    assert len(dummies) == 2
    assert {edge.dummy_label for edge in dummies} == {"f1", "f2"}
    assert all(edge.duration == 0 for edge in dummies)
    assert_no_duplicate_arcs(response)


def test_parallel_activities_do_not_share_start_and_end_nodes():
    response = solve(
        [
            {"id": "A", "a": 1, "m": 1, "b": 1},
            {"id": "B", "a": 2, "m": 2, "b": 2},
        ]
    )

    real_edges = [edge for edge in response.edges if not edge.is_dummy]
    assert real_edges[0].source == real_edges[1].source
    assert real_edges[0].target != real_edges[1].target
    assert_no_duplicate_arcs(response)


def test_example_network_has_expected_dummies_and_times():
    response = solve(
        [
            {"id": "A", "a": 1, "m": 2, "b": 3},
            {"id": "B", "predecessors": ["A"], "a": 2, "m": 3, "b": 4},
            {"id": "C", "predecessors": ["A"], "a": 1, "m": 2, "b": 3},
            {"id": "D", "predecessors": ["B", "C"], "a": 1, "m": 1, "b": 1},
            {"id": "E", "predecessors": ["B"], "a": 1, "m": 2, "b": 9},
            {"id": "F", "predecessors": ["D", "E"], "a": 2, "m": 3, "b": 4},
        ]
    )

    assert response.project_duration == pytest.approx(11.0)
    assert response.critical_path == ["A", "B", "E", "F"]
    assert len([edge for edge in response.edges if edge.is_dummy]) == 4
    assert_no_duplicate_arcs(response)

    activities = {activity.id: activity for activity in response.activities}
    assert activities["C"].slack == pytest.approx(3.0)
    assert activities["D"].slack == pytest.approx(2.0)
    assert activities["E"].is_critical is True


def test_steps_cover_forward_backward_and_critical_phases():
    response = solve(
        [
            {"id": "A", "a": 1, "m": 2, "b": 3},
            {"id": "B", "predecessors": ["A"], "a": 2, "m": 3, "b": 4},
        ]
    )

    step_types = {step.type for step in response.steps}
    assert step_types == {"forward", "backward", "critical"}
    assert response.steps[-1].type == "critical"

    last_step = response.steps[-1]
    assert last_step.snapshot.E
    assert last_step.snapshot.L
    assert last_step.snapshot.critical_edges
