"""
Integration Tests for Prime Number Sieve & Factorization FastAPI REST API.
Verifies health checks, Sieve of Eratosthenes traces, recursive factor tree
serialization, primality checks, and validation responses.
"""

from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["service"] == "prime-sieve-factorization-api"


def test_sieve_endpoint():
    resp = client.post("/api/sieve", json={"limit": 50, "record_steps": True})
    assert resp.status_code == 200
    data = resp.json()
    assert data["limit"] == 50
    assert data["prime_count"] == 15
    assert data["primes"][:5] == [2, 3, 5, 7, 11]
    assert len(data["steps"]) == 4  # Primes <= sqrt(50): 2, 3, 5, 7
    assert data["steps"][0]["prime"] == 2
    assert len(data["twin_primes"]) > 0


def test_factorize_endpoint():
    resp = client.post("/api/factorize", json={"number": 360})
    assert resp.status_code == 200
    data = resp.json()
    assert data["number"] == 360
    assert data["is_prime"] is False
    assert data["canonical_formula"] == "2^3 × 3^2 × 5"
    assert data["factor_exponents"] == {"2": 3, "3": 2, "5": 1}
    assert data["euler_totient"] == 96
    assert data["classification"] == "abundant"
    assert data["factor_tree"]["value"] == 360
    assert data["factor_tree"]["left"]["value"] == 2
    assert data["factor_tree"]["left"]["is_prime"] is True
    assert data["factor_tree"]["right"]["value"] == 180


def test_primality_endpoint():
    resp_p = client.get("/api/primality/97")
    assert resp_p.status_code == 200
    d_p = resp_p.json()
    assert d_p["is_prime"] is True
    assert d_p["previous_prime"] == 89
    assert d_p["next_prime"] == 101

    resp_c = client.get("/api/primality/100")
    assert resp_c.status_code == 200
    d_c = resp_c.json()
    assert d_c["is_prime"] is False
    assert d_c["previous_prime"] == 97
    assert d_c["next_prime"] == 101


def test_validation_errors():
    # Limit < 2 rejected by Pydantic
    resp1 = client.post("/api/sieve", json={"limit": 1})
    assert resp1.status_code == 422

    # Number < 2 rejected by Pydantic
    resp2 = client.post("/api/factorize", json={"number": 1})
    assert resp2.status_code == 422
