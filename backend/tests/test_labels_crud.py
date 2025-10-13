import os

import pytest
from pymongo import MongoClient


def _db():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        pytest.skip("DB env not set; skipping label tests")
    client = MongoClient(uri)
    return client[dbname], client


def _prepare_user(client_http, email: str):
    db, mc = _db()
    try:
        db["users"].delete_one({"email": email})
        db["labels"].delete_many({})
        from app.utils.auth import hash_password

        db["users"].insert_one({"email": email, "password_hash": hash_password("Password123!")})
    finally:
        mc.close()
    resp = client_http.post("/auth/login", json={"email": email, "password": "Password123!"})
    assert resp.status_code == 200


def test_label_crud_and_duplicates(client):
    email = "label_user@example.com"
    _prepare_user(client, email)

    # create
    created = client.post("/labels", json={"name": "Urgent", "color": "#ff0000"})
    assert created.status_code == 201
    label = created.json()
    assert label["name"] == "Urgent"

    # duplicate
    dup = client.post("/labels", json={"name": "urgent"})
    assert dup.status_code == 409

    # list
    listed = client.get("/labels")
    assert listed.status_code == 200
    labels = listed.json()
    assert any(l["_id"] == label["_id"] for l in labels)

    # update
    upd = client.patch(f"/labels/{label['_id']}", json={"name": "Work"})
    assert upd.status_code == 200
    assert upd.json()["name"] == "Work"

    # delete
    deleted = client.delete(f"/labels/{label['_id']}")
    assert deleted.status_code == 204


