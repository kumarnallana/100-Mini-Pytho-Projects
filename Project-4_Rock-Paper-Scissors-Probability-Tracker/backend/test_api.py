"""
Unit & Integration Tests for the FastAPI REST API.
Verifies all HTTP endpoints, payloads, error handling, and serialization.
"""

import pytest
from fastapi.testclient import TestClient
from api import app, engine


@pytest.fixture(autouse=True)
def reset_engine_before_each_test():
    """Ensures each test starts with a clean slate."""
    engine.reset()
    yield
    engine.reset()


client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "rps-probability-tracker-api"
    assert "total_rounds_processed" in data


def test_play_valid_round():
    response = client.post("/api/play", json={"player_move": "rock"})
    assert response.status_code == 200
    data = response.json()

    assert data["round_number"] == 1
    assert data["player_move"] == "rock"
    assert data["ai_move"] in ["rock", "paper", "scissors"]
    assert data["outcome"] in ["win", "loss", "draw"]
    assert "streak_stats" in data
    assert "player_probabilities" in data
    assert "next_prediction" in data
    assert data["player_counts"]["rock"] == 1


def test_play_invalid_move():
    response = client.post("/api/play", json={"player_move": "fireball"})
    assert response.status_code == 400
    data = response.json()
    assert "Invalid move" in data["detail"]


def test_stats_endpoint():
    # Play 2 rounds
    client.post("/api/play", json={"player_move": "paper"})
    client.post("/api/play", json={"player_move": "scissors"})

    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()

    assert data["total_rounds"] == 2
    assert "markov_transitions" in data
    assert "wsls_transitions" in data
    assert "streaks" in data
    assert len(data["recent_history"]) == 2


def test_simulate_endpoint():
    response = client.post("/api/simulate", json={
        "rounds": 15,
        "strategy": "biased_rock"
    })
    assert response.status_code == 200
    data = response.json()

    assert data["rounds_simulated"] == 15
    assert data["strategy"] == "biased_rock"
    assert data["summary"]["total_rounds"] == 15
    assert data["summary"]["player_counts"]["rock"] > 0


def test_reset_endpoint():
    client.post("/api/play", json={"player_move": "rock"})
    client.post("/api/play", json={"player_move": "scissors"})
    assert engine.total_rounds == 2

    response = client.post("/api/reset")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "reset_complete"

    # Confirm stats are reset
    stats_resp = client.get("/api/stats")
    assert stats_resp.json()["total_rounds"] == 0
