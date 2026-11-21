"""Verificacion de los ejercicios CPM y de la red con duraciones fijas."""

import json
import random
from pathlib import Path

import networkx as nx
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.cpm.schema import CpmRequest
from app.cpm.service import solve_cpm

client = TestClient(app)
REFERENCES = Path(__file__).resolve().parent / "fixtures" / "cpm_reference_exercises.json"


def example(number):
    return json.loads(REFERENCES.read_text(encoding="utf-8"))[str(number)]


@pytest.mark.parametrize("number,duration,path,slacks", [
    (1, 12, ["A", "B", "D"], {"A": 0, "B": 0, "C": 2, "D": 0}),
    (2, 22, ["A", "B", "D", "E", "G", "H"], {"A": 0, "B": 0, "C": 1, "D": 0, "E": 0, "F": 2, "G": 0, "H": 0}),
    (3, 26, ["B", "C", "D", "E", "I", "J"], {"A": 4, "B": 0, "C": 0, "D": 0, "E": 0, "F": 9, "G": 9, "H": 11, "I": 0, "J": 0}),
])
def test_exercises_match_handwritten_results(number, duration, path, slacks):
    response = client.post("/api/v1/cpm/solve", json=example(number))
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["method"] == "cpm"
    assert data["project_duration"] == duration
    assert data["critical_path"] == path
    assert data["critical_paths"] == [path]
    assert {activity["id"]: activity["slack"] for activity in data["activities"]} == slacks
    assert "probability" not in data
    nodes = {node["id"]: node for node in data["nodes"]}
    assert data["nodes"][0]["E"] == data["nodes"][0]["L"] == 0
    assert data["nodes"][-1]["E"] == data["nodes"][-1]["L"] == duration
    pairs = [(edge["source"], edge["target"]) for edge in data["edges"]]
    assert len(set(pairs)) == len(pairs)
    for edge in data["edges"]:
        expected_slack = nodes[edge["target"]]["L"] - nodes[edge["source"]]["E"] - edge["duration"]
        assert edge["slack"] == pytest.approx(expected_slack)
        if edge["is_dummy"]:
            assert edge["duration"] == 0
    assert {step["type"] for step in data["steps"]} == {"forward", "backward", "critical"}
    assert data["steps"][-1]["snapshot"]["E"] == {node["id"]: node["E"] for node in data["nodes"]}
    assert data["steps"][-1]["snapshot"]["L"] == {node["id"]: node["L"] for node in data["nodes"]}


@pytest.mark.parametrize("number,dummies", [(1, 1), (2, 2)])
def test_small_exercises_use_compact_dummy_arcs(number, dummies):
    result = solve_cpm(CpmRequest.model_validate(example(number)))
    assert sum(edge.is_dummy for edge in result.edges) == dummies


def test_only_one_public_example():
    response = client.get("/api/v1/cpm/example")
    assert response.status_code == 200
    assert response.json() == example(1)
    assert len(response.json()["activities"]) == 4
    paths = client.get("/openapi.json").json()["paths"]
    assert [path for path in paths if path.startswith("/api/v1/cpm/example")] == ["/api/v1/cpm/example"]
    assert not paths["/api/v1/cpm/example"]["get"].get("parameters")


def test_pert_response_remains_identical_to_the_original():
    original = json.loads((REFERENCES.parent / "pert_original_result.json").read_text(encoding="utf-8"))
    request = client.get("/api/v1/pert/example").json()
    response = client.post("/api/v1/pert/solve", json=request)
    assert response.status_code == 200
    assert response.json() == original


@pytest.mark.parametrize("activities", [
    [],
    [{"id": "A", "duration": -1}],
    [{"id": "A", "duration": "NaN"}],
    [{"id": "A", "duration": "Infinity"}],
    [{"id": "A"}],
    [{"id": "A", "duration": 1, "predecessors": ["Z"]}],
    [{"id": "A", "duration": 1, "predecessors": ["A"]}],
    [{"id": "A", "duration": 1}, {"id": "A", "duration": 2}],
    [{"id": "A", "duration": 1, "predecessors": ["B"]}, {"id": "B", "duration": 1, "predecessors": ["A"]}],
])
def test_invalid_cpm_projects_are_rejected(activities):
    response = client.post("/api/v1/cpm/solve", json={"activities": activities})
    assert response.status_code == 422


def test_cpm_request_has_no_pert_estimates_or_probability_target():
    payload = {"activities": [{"id": "A", "duration": 3, "a": 1, "m": 2, "b": 3}]}
    assert client.post("/api/v1/cpm/solve", json=payload).status_code == 422
    payload = {"activities": [{"id": "A", "duration": 3}], "target_time": 4}
    assert client.post("/api/v1/cpm/solve", json=payload).status_code == 422


def test_fractional_zero_and_unordered_activities():
    result = solve_cpm(CpmRequest.model_validate({"activities": [
        {"id": "C", "duration": 0, "predecessors": ["B"]},
        {"id": "B", "duration": 2.25, "predecessors": ["A"]},
        {"id": "A", "duration": 1.5},
    ]}))
    assert result.project_duration == 3.75
    assert result.critical_path == ["A", "B", "C"]
    assert all(activity.slack == 0 for activity in result.activities)


def test_multiple_critical_paths():
    result = solve_cpm(CpmRequest.model_validate({"activities": [
        {"id": "A", "duration": 3}, {"id": "B", "duration": 3},
    ]}))
    assert {tuple(path) for path in result.critical_paths} == {("A",), ("B",)}
    assert result.project_duration == 3
    assert set(result.critical_activities) == {"A", "B"}


def test_third_exercise_keeps_f_dependent_only_on_c_after_duration_changes():
    payload = example(3)
    payload["activities"][0]["duration"] = 10
    result = solve_cpm(CpmRequest.model_validate(payload))
    activities = {activity.id: activity for activity in result.activities}
    assert result.project_duration == 28
    assert result.critical_path == ["A", "D", "E", "I", "J"]
    assert activities["F"].early_start == 8
    assert activities["D"].early_start == 10


def test_critical_path_enumeration_is_bounded():
    activities = [{"id": "S", "duration": 0}]
    previous = ["S"]
    for level in range(7):
        current = [f"{level}A", f"{level}B"]
        activities.extend({"id": name, "duration": 1, "predecessors": previous} for name in current)
        previous = current
    activities.append({"id": "T", "duration": 0, "predecessors": previous})
    result = solve_cpm(CpmRequest.model_validate({"activities": activities}))
    assert result.project_duration == 7
    assert result.critical_paths_truncated is True
    assert len(result.critical_paths) == 100


def test_compact_aoa_matches_independent_activity_schedule_and_dependencies():
    rng = random.Random(27)
    for _ in range(25):
        count = rng.randint(3, 9)
        activities = []
        graph = nx.DiGraph()
        durations = {}
        for number in range(count):
            name = str(number)
            predecessors = [str(parent) for parent in range(number) if rng.random() < 0.35]
            duration = rng.randint(0, 12) / 2
            durations[name] = duration
            activities.append({"id": name, "duration": duration, "predecessors": predecessors})
            graph.add_node(name)
            graph.add_edges_from((parent, name) for parent in predecessors)
        early, finish = {}, {}
        for name in nx.topological_sort(graph):
            early[name] = max((finish[parent] for parent in graph.predecessors(name)), default=0)
            finish[name] = early[name] + durations[name]
        total = max(finish.values())
        late = {}
        for name in reversed(list(nx.topological_sort(graph))):
            late[name] = min((late[child] for child in graph.successors(name)), default=total) - durations[name]
        rng.shuffle(activities)
        result = solve_cpm(CpmRequest.model_validate({"activities": activities}))
        assert result.project_duration == total
        by_id = {activity.id: activity for activity in result.activities}
        aoa = nx.DiGraph((edge.source, edge.target) for edge in result.edges)
        for activity in result.activities:
            assert activity.early_start == early[activity.id]
            assert activity.late_start == late[activity.id]
            assert activity.slack == late[activity.id] - early[activity.id]
        for left in graph:
            for right in graph:
                if left != right:
                    assert nx.has_path(aoa, by_id[left].end_node_id, by_id[right].start_node_id) == nx.has_path(graph, left, right)
