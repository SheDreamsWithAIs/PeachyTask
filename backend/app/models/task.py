from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class TaskModel:
    collection_name = "tasks"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db[self.collection_name]

    async def create(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {**doc, "created_at": now, "updated_at": now}
        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    async def get_by_id_str(self, id_str: str) -> Optional[Dict[str, Any]]:
        try:
            oid = ObjectId(id_str)
        except Exception:
            return None
        return await self.collection.find_one({"_id": oid})

    async def list_by_user(self, user_id_str: str) -> List[Dict[str, Any]]:
        try:
            uid = ObjectId(user_id_str)
        except Exception:
            return []
        cursor = self.collection.find({"user_id": uid}).sort("created_at", -1)
        return [doc async for doc in cursor]

    async def update_fields(self, id_str: str, fields: Dict[str, Any]) -> bool:
        try:
            oid = ObjectId(id_str)
        except Exception:
            return False
        result = await self.collection.update_one({"_id": oid}, {"$set": {**fields, "updated_at": datetime.now(timezone.utc)}})
        return result.matched_count == 1

    async def delete(self, id_str: str) -> bool:
        try:
            oid = ObjectId(id_str)
        except Exception:
            return False
        result = await self.collection.delete_one({"_id": oid})
        return result.deleted_count == 1


