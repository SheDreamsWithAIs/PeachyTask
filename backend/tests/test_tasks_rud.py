import os
from datetime import date

import pytest
from pymongo import MongoClient


def _db():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        pytest.skip("DB env not set; skipping task RUD tests")
    client = MongoClient(uri)
    return client[dbname], client


def _login_as(client_http, email: str):
    resp = client_http.post("/auth/login", json={"email": email, "password": "Password123!"})
    assert resp.status_code == 200


def _seed_user_and_task(email: str):
    db, mc = _db()
    try:
        db["users"].delete_one({"email": email})
        db["tasks"].delete_many({})
        # Generate a valid hash for 'Password123!'
        from app.utils.auth import hash_password
        db["users"].insert_one({"email": email, "password_hash": hash_password("Password123!")})
    finally:
        mc.close()


def test_get_update_delete_task(client):
    email = "rud_user@example.com"
    _seed_user_and_task(email)
    _login_as(client, email)

    # create one task
    payload = {
        "title": "Initial",
        "priority": "medium",
        "deadline": date.today().isoformat(),
    }
    created = client.post("/tasks", json=payload)
    assert created.status_code == 201
    task = created.json()

    # get
    got = client.get(f"/tasks/{task['_id']}")
    assert got.status_code == 200
    assert got.json()["_id"] == task["_id"]

    # update title and completed
    upd = client.patch(f"/tasks/{task['_id']}", json={"title": "Updated", "completed": True})
    assert upd.status_code == 200
    body = upd.json()
    assert body["title"] == "Updated"
    assert body["completed"] is True

    # delete
    deleted = client.delete(f"/tasks/{task['_id']}")
    assert deleted.status_code == 204

    # get after delete
    missing = client.get(f"/tasks/{task['_id']}")
    assert missing.status_code == 404


