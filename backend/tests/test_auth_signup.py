import os

import pytest
from pymongo import MongoClient


@pytest.fixture(autouse=True)
def _ensure_jwt_env(monkeypatch):
    # Ensure JWT envs exist for cookie generation
    monkeypatch.setenv("JWT_SECRET", os.getenv("JWT_SECRET", "test-secret"))
    monkeypatch.setenv("JWT_ALG", os.getenv("JWT_ALG", "HS256"))
    monkeypatch.setenv("JWT_EXPIRE_MIN", os.getenv("JWT_EXPIRE_MIN", "60"))


def _users_collection():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        pytest.skip("MONGO_URI or MONGO_DB_NAME_TEST not set; skipping auth signup tests")
    client = MongoClient(uri)
    return client[dbname]["users"], client


def test_signup_success(client):
    payload = {"email": "signup_tester@example.com", "password": "Password123!"}
    coll, mc = _users_collection()
    try:
        coll.delete_one({"email": payload["email"]})
        resp = client.post("/auth/signup", json=payload)
        assert resp.status_code == 201
        data = resp.json()
        assert data["email"] == payload["email"]
        # cookie present
        cookies = resp.cookies
        assert "access_token" in cookies
    finally:
        mc.close()


def test_signup_duplicate_email(client):
    payload = {"email": "dup_tester@example.com", "password": "Password123!"}
    coll, mc = _users_collection()
    try:
        coll.delete_one({"email": payload["email"]})
        first = client.post("/auth/signup", json=payload)
        assert first.status_code == 201
        second = client.post("/auth/signup", json=payload)
        assert second.status_code == 409
    finally:
        mc.close()


def test_signup_invalid_email(client):
    payload = {"email": "not-an-email", "password": "Password123!"}
    resp = client.post("/auth/signup", json=payload)
    # FastAPI/Pydantic validation should reject
    assert resp.status_code in (400, 422)


