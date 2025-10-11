import os

import pytest
from motor.motor_asyncio import AsyncIOMotorClient


@pytest.fixture(autouse=True)
def _require_db_env():
    if not os.getenv("MONGO_URI"):
        pytest.skip("MONGO_URI not set; skipping DB integration tests")
    if not os.getenv("MONGO_DB_NAME_TEST"):
        pytest.skip("MONGO_DB_NAME_TEST not set; skipping DB integration tests")


@pytest.mark.anyio
async def test_connects_and_pings_mongo():
    uri = os.environ["MONGO_URI"]
    dbname = os.environ["MONGO_DB_NAME_TEST"]
    client = AsyncIOMotorClient(uri)
    db = client[dbname]
    await db.command("ping")
    client.close()


@pytest.mark.anyio
async def test_insert_read_cleanup_collection():
    uri = os.environ["MONGO_URI"]
    dbname = os.environ["MONGO_DB_NAME_TEST"]
    client = AsyncIOMotorClient(uri)
    db = client[dbname]
    coll = db["_pytest_sentinel"]
    doc = {"_id": "sentinel", "hello": "world"}
    await coll.insert_one(doc)
    found = await coll.find_one({"_id": "sentinel"})
    assert found is not None
    assert found["hello"] == "world"
    await coll.delete_many({"_id": "sentinel"})
    assert await coll.count_documents({"_id": "sentinel"}) == 0
    client.close()


