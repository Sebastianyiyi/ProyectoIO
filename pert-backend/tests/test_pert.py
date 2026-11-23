"""Tests for PERT calculations."""

import pytest
from pydantic import ValidationError

from app.schemas.pert import ActivityInput, PertRequest
from app.services.aoa import PertValidationError
from app.services.pert import activity_variance, expected_time, solve_pert


def make_request(activities, target_time=None):
    return PertRequest(
        activities=[ActivityInput(**activity) for activity in activities],
        target_time=target_time,
    )


def test_expected_time_and_variance_formulas():
    activity = ActivityInput(id="A", a=2, m=4, b=6)

    assert expected_time(activity) == pytest.approx(4.0)
    assert activity_variance(activity) == pytest.approx((4 / 6) ** 2)


def test_diamond_project_forward_backward_and_critical_path():
    request = make_request(
        [
            {"id": "A", "a": 1, "m": 2, "b": 3},
            {"id": "B", "predecessors": ["A"], "a": 2, "m": 3, "b": 4},
            {"id": "C", "predecessors": ["A"], "a": 1, "m": 2, "b": 3},
            {"id": "D", "predecessors": ["B", "C"], "a": 1, "m": 1, "b": 1},
        ],
        target_time=8,
    )

    response = solve_pert(request)
    times = {activity.id: activity for activity in response.activities}

    assert response.project_duration == pytest.approx(6.0)
    assert times["A"].slack == pytest.approx(0.0)
    assert times["B"].slack == pytest.approx(0.0)
    assert times["C"].slack == pytest.approx(1.0)
    assert times["D"].slack == pytest.approx(0.0)
    assert response.critical_path == ["A", "B", "D"]
    assert response.critical_activities == ["A", "B", "D"]

    nodes = {node.event: node for node in response.nodes}
    assert nodes[1].E == pytest.approx(0.0)
    assert nodes[1].L == pytest.approx(0.0)
    assert nodes[1].is_source is True
    assert response.nodes[-1].is_sink is True
    assert response.nodes[-1].E == pytest.approx(6.0)
    assert response.nodes[-1].L == pytest.approx(6.0)


def test_probability_uses_only_critical_path_variances():
    request = make_request(
        [
            {"id": "A", "a": 1, "m": 2, "b": 3},
            {"id": "B", "predecessors": ["A"], "a": 2, "m": 3, "b": 4},
            {"id": "C", "predecessors": ["A"], "a": 1, "m": 1, "b": 1},
            {"id": "D", "predecessors": ["B", "C"], "a": 1, "m": 1, "b": 1},
        ],
        target_time=8,
    )

    response = solve_pert(request)
    expected_variance = ((2 / 6) ** 2) + ((2 / 6) ** 2)
    expected_sigma = expected_variance**0.5
    expected_z = (8 - 6) / expected_sigma
    expected_probability = 0.5 * (1 + __import__("math").erf(expected_z / 2**0.5))

    assert response.probability.critical_variance == pytest.approx(expected_variance)
    assert response.probability.standard_deviation == pytest.approx(expected_sigma, abs=1e-6)
    assert response.probability.z_score == pytest.approx(expected_z, abs=1e-6)
    assert response.probability.probability == pytest.approx(
        expected_probability, abs=1e-6
    )


def test_probability_is_omitted_without_target_time():
    request = make_request([{"id": "A", "a": 1, "m": 2, "b": 3}])

    response = solve_pert(request)

    assert response.probability.target_time is None
    assert response.probability.z_score is None
    assert response.probability.probability is None


def test_deterministic_project_handles_zero_sigma():
    request = make_request(
        [{"id": "A", "a": 2, "m": 2, "b": 2}],
        target_time=2,
    )

    response = solve_pert(request)

    assert response.probability.standard_deviation == pytest.approx(0.0)
    assert response.probability.z_score is None
    assert response.probability.probability == pytest.approx(1.0)


def test_cycle_is_rejected():
    request = make_request(
        [
            {"id": "A", "predecessors": ["B"], "a": 1, "m": 1, "b": 1},
            {"id": "B", "predecessors": ["A"], "a": 1, "m": 1, "b": 1},
        ]
    )

    with pytest.raises(PertValidationError, match="ciclo"):
        solve_pert(request)


def test_invalid_time_order_is_rejected():
    with pytest.raises(ValidationError, match="a <= m <= b"):
        PertRequest(
            activities=[
                ActivityInput(id="A", a=5, m=2, b=3),
            ]
        )


def test_unknown_predecessor_is_rejected():
    with pytest.raises(ValidationError, match="no existe"):
        PertRequest(
            activities=[
                ActivityInput(id="A", predecessors=["Z"], a=1, m=1, b=1),
            ]
        )
