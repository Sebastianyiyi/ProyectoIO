"""API integration tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_example_endpoint_returns_valid_request():
    response = client.get("/api/v1/pert/example")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload["activities"]) > 0
    assert payload["target_time"] == 13


def test_solve_endpoint_returns_complete_solution():
    payload = {
        "activities": [
            {"id": "A", "predecessors": [], "a": 1, "m": 2, "b": 3},
            {"id": "B", "predecessors": ["A"], "a": 2, "m": 3, "b": 4},
            {"id": "C", "predecessors": ["A"], "a": 1, "m": 2, "b": 3},
            {"id": "D", "predecessors": ["B", "C"], "a": 1, "m": 1, "b": 1},
        ],
        "target_time": 8,
    }

    response = client.post("/api/v1/pert/solve", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["project_duration"] == 6
    assert body["critical_path"] == ["A", "B", "D"]
    assert body["probability"]["probability"] > 0.99
    assert body["steps"]
    assert {step["type"] for step in body["steps"]} == {
        "forward",
        "backward",
        "critical",
    }


def test_solve_endpoint_accepts_aliases_and_optional_target():
    payload = {
        "activities": [
            {
                "id": "A",
                "predecessors": [],
                "optimistic": 1,
                "most_likely": 2,
                "pessimistic": 3,
            }
        ]
    }

    response = client.post("/api/v1/pert/solve", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["probability"]["probability"] is None
    assert body["activities"][0]["expected_time"] == 2


def test_solve_endpoint_rejects_cycles():
    payload = {
        "activities": [
            {"id": "A", "predecessors": ["B"], "a": 1, "m": 1, "b": 1},
            {"id": "B", "predecessors": ["A"], "a": 1, "m": 1, "b": 1},
        ]
    }

    response = client.post("/api/v1/pert/solve", json=payload)

    assert response.status_code == 422
    assert "ciclo" in response.json()["detail"]


def test_solve_endpoint_rejects_invalid_estimates():
    payload = {
        "activities": [
            {"id": "A", "predecessors": [], "a": 5, "m": 2, "b": 1},
        ]
    }

    response = client.post("/api/v1/pert/solve", json=payload)

    assert response.status_code == 422
