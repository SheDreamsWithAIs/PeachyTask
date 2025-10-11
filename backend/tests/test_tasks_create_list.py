import os
from datetime import date

import pytest
from pymongo import MongoClient


def _db_collections():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        pytest.skip("DB env not set; skipping task tests")
    client = MongoClient(uri)
    db = client[dbname]
    return db["users"], db["tasks"], client


def _ensure_user(email: str, password_hash: str):
    users, tasks, mc = _db_collections()
    try:
        users.delete_one({"email": email})
        tasks.delete_many({"user_id": {"$exists": True}})
        users.insert_one({"email": email, "password_hash": password_hash})
    finally:
        mc.close()


def test_create_requires_auth(client):
    payload = {
        "title": "Unauthed",
        "priority": "low",
        "deadline": date.today().isoformat(),
    }
    resp = client.post("/tasks", json=payload)
    assert resp.status_code == 401


def test_create_and_list_tasks(client):
    from app.utils.auth import hash_password

    email = "tasks_user@example.com"
    _ensure_user(email, hash_password("Password123!"))

    # login
    login = client.post("/auth/login", json={"email": email, "password": "Password123!"})
    assert login.status_code == 200

    # create
    payload = {
        "title": "Buy peaches",
        "description": "Get ripe ones",
        "priority": "high",
        "deadline": date.today().isoformat(),
        "completed": False,
        "label_ids": [],
    }
    created = client.post("/tasks", json=payload)
    assert created.status_code == 201
    t = created.json()
    assert t["title"] == payload["title"]
    assert t["completed"] is False

    # list
    listed = client.get("/tasks")
    assert listed.status_code == 200
    tasks = listed.json()
    assert any(x["_id"] == t["_id"] for x in tasks)


