import os

import pytest
from pymongo import MongoClient


def _users_collection():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        pytest.skip("MONGO_URI or MONGO_DB_NAME_TEST not set; skipping auth login/logout/me tests")
    client = MongoClient(uri)
    return client[dbname]["users"], client


def _ensure_user(email: str, password_hash: str):
    coll, mc = _users_collection()
    try:
        coll.delete_one({"email": email})
        coll.insert_one({"email": email, "password_hash": password_hash})
    finally:
        mc.close()


def test_login_success_and_me_and_logout(client):
    # prepare user
    from app.utils.auth import hash_password

    email = "login_user@example.com"
    _ensure_user(email, hash_password("Password123!"))

    resp = client.post("/auth/login", json={"email": email, "password": "Password123!"})
    assert resp.status_code == 200
    assert "access_token" in resp.cookies

    me = client.get("/auth/me")
    assert me.status_code == 200
    data = me.json()
    assert data["email"] == email

    out = client.post("/auth/logout")
    assert out.status_code == 200
    # After logout, me should 401
    me2 = client.get("/auth/me")
    assert me2.status_code == 401


def test_login_invalid_credentials(client):
    resp = client.post("/auth/login", json={"email": "nope@example.com", "password": "wrong"})
    assert resp.status_code == 401


