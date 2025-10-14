import os
from pymongo import MongoClient


def _coll():
    uri = os.environ.get("MONGO_URI")
    dbname = os.environ.get("MONGO_DB_NAME_TEST")
    if not uri or not dbname:
        raise RuntimeError("MONGO envs not set for tests")
    client = MongoClient(uri)
    return client[dbname]["tasks"], client


def test_contrast_pairing_and_no_immediate_repeat(client):
    # Create a user via signup to set cookie
    email = f"pair_{os.getpid()}@example.com"
    resp = client.post("/auth/signup", json={"email": email, "password": "Password123!"})
    assert resp.status_code == 201

    coll, mc = _coll()
    try:
        # Clear any tasks for this user
        me = client.get("/auth/me").json()
        uid = me["_id"]
        coll.delete_many({"user_id": MongoClient().get_database("dummy")._Database__name and {}})  # noop; isolation per db

        # Seed tasks with varying dislike_rank
        def mk(title, rank):
            r = client.post("/tasks", json={
                "title": title,
                "priority": "medium",
                "deadline": "2099-01-01",
                "completed": False,
                "label_ids": []
            })
            assert r.status_code == 201
            t = r.json()
            client.patch(f"/tasks/{t['_id']}", json={"dislike_rank": rank})
            return t

        t1 = mk("High A", 50)
        t2 = mk("High B", 45)
        t3 = mk("Low A", 5)
        t4 = mk("Low B", 3)

        # First pair should contrast (one high vs one low)
        p1 = client.get("/showdown/pair").json()
        assert len(p1) == 2
        r1 = sorted([p1[0]["dislike_rank"], p1[1]["dislike_rank"]], reverse=True)
        assert r1[0] >= 40 and r1[1] <= 10

        # Second pair should avoid immediate repeat
        p2 = client.get(f"/showdown/pair?last_a={p1[0]['_id']}&last_b={p1[1]['_id']}").json()
        pair1_ids = {p1[0]["_id"], p1[1]["_id"]}
        pair2_ids = {p2[0]["_id"], p2[1]["_id"]}
        assert pair1_ids != pair2_ids
    finally:
        mc.close()


