import os
from datetime import date

import pytest
from pymongo import MongoClient


def _db():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        pytest.skip("DB env not set; skipping task-label tests")
    client = MongoClient(uri)
    return client[dbname], client


def _prepare_user(client_http, email: str, clear_labels: bool = True):
    db, mc = _db()
    try:
        db["users"].delete_one({"email": email})
        if clear_labels:
            db["labels"].delete_many({})
        db["tasks"].delete_many({})
        from app.utils.auth import hash_password

        db["users"].insert_one({"email": email, "password_hash": hash_password("Password123!")})
    finally:
        mc.close()
    resp = client_http.post("/auth/login", json={"email": email, "password": "Password123!"})
    assert resp.status_code == 200


def _create_label(client_http, name: str):
    resp = client_http.post("/labels", json={"name": name, "color": "#abcdef"})
    assert resp.status_code == 201
    return resp.json()


def test_create_task_with_valid_labels(client):
    email = "rel_user@example.com"
    _prepare_user(client, email)
    l1 = _create_label(client, "Work")
    l2 = _create_label(client, "Urgent")
    payload = {
        "title": "Label test",
        "priority": "high",
        "deadline": date.today().isoformat(),
        "label_ids": [l1["_id"], l2["_id"]],
    }
    created = client.post("/tasks", json=payload)
    assert created.status_code == 201
    t = created.json()
    assert set(t["label_ids"]) == {l1["_id"], l2["_id"]}


def test_create_task_with_nonexistent_label(client):
    email = "rel_user2@example.com"
    _prepare_user(client, email)
    payload = {
        "title": "Bad labels",
        "priority": "low",
        "deadline": date.today().isoformat(),
        "label_ids": ["64b64b64b64b64b64b64b64b"],
    }
    resp = client.post("/tasks", json=payload)
    assert resp.status_code == 400


def test_create_task_with_other_users_label(client):
    # user A
    email_a = "rel_user_a@example.com"
    _prepare_user(client, email_a)
    la = _create_label(client, "A-label")

    # user B
    email_b = "rel_user_b@example.com"
    _prepare_user(client, email_b, clear_labels=False)
    payload = {
        "title": "Other user label",
        "priority": "medium",
        "deadline": date.today().isoformat(),
        "label_ids": [la["_id"]],
    }
    resp = client.post("/tasks", json=payload)
    assert resp.status_code == 403


