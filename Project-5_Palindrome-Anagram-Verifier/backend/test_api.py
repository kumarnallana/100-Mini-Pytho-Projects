"""
Integration Tests for Palindrome & Anagram Verifier FastAPI REST API.
Verifies all HTTP endpoints, JSON schemas, and edge case responses.
"""

import pytest
from fastapi.testclient import TestClient
from api import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "palindrome-anagram-verifier-api"


def test_palindrome_verification_endpoint():
    # Valid palindrome
    resp1 = client.post("/api/verify/palindrome", json={"text": "racecar"})
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["is_palindrome"] is True
    assert data1["clean_text"] == "racecar"
    assert len(data1["steps"]) == 3
    assert data1["mismatch"] is None

    # Almost palindrome
    resp2 = client.post("/api/verify/palindrome", json={"text": "abca"})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["is_palindrome"] is False
    assert data2["is_almost_palindrome"] is True
    assert data2["mismatch"] is not None


def test_anagram_verification_endpoint():
    # Valid anagram
    resp1 = client.post("/api/verify/anagram", json={"text1": "silent", "text2": "listen"})
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["is_anagram"] is True
    assert data1["min_edits_needed"] == 0

    # Non-anagram with delta
    resp2 = client.post("/api/verify/anagram", json={"text1": "apple", "text2": "pale"})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["is_anagram"] is False
    assert data2["surplus_text1"] == {"p": 1}


def test_group_anagrams_endpoint():
    words = ["rat", "tar", "art", "car"]
    resp = client.post("/api/anagrams/group", json={"words": words})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_groups"] == 2
    assert data["total_words"] == 4
    assert len(data["groups"]["art"]) == 3


def test_dual_verify_endpoint():
    resp = client.post("/api/verify/dual", json={
        "palindrome_text": "madam",
        "anagram_text1": "debit card",
        "anagram_text2": "bad credit"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["palindrome"]["is_palindrome"] is True
    assert data["anagram"]["is_anagram"] is True


def test_validation_errors():
    # Missing required field
    resp = client.post("/api/verify/palindrome", json={})
    assert resp.status_code == 422

