from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


class LabelModel:
    collection_name = "labels"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db[self.collection_name]

    async def create(self, user_id: str, name: str, color: Optional[str] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "user_id": ObjectId(user_id),
            "name": name,
            "name_normalized": name.strip().lower(),
            "color": color,
            "created_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        doc["user_id"] = str(doc["user_id"])
        return doc

    async def list_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        cursor = self.collection.find({"user_id": ObjectId(user_id)}).sort("created_at", -1)
        out: List[Dict[str, Any]] = []
        async for d in cursor:
            d["_id"] = str(d["_id"])
            d["user_id"] = str(d["user_id"])
            out.append(d)
        return out

    async def get_by_id_str(self, id_str: str) -> Optional[Dict[str, Any]]:
        try:
            oid = ObjectId(id_str)
        except Exception:
            return None
        d = await self.collection.find_one({"_id": oid})
        if not d:
            return None
        d["_id"] = str(d["_id"])
        d["user_id"] = str(d["user_id"])
        return d

    async def update(self, id_str: str, user_id: str, fields: Dict[str, Any]) -> bool:
        if "name" in fields and fields["name"] is not None:
            fields["name_normalized"] = fields["name"].strip().lower()
        try:
            oid = ObjectId(id_str)
        except Exception:
            return False
        res = await self.collection.update_one({"_id": oid, "user_id": ObjectId(user_id)}, {"$set": fields})
        return res.matched_count == 1

    async def delete(self, id_str: str, user_id: str) -> bool:
        try:
            oid = ObjectId(id_str)
        except Exception:
            return False
        res = await self.collection.delete_one({"_id": oid, "user_id": ObjectId(user_id)})
        return res.deleted_count == 1

    async def exists_with_name(self, user_id: str, name: str) -> bool:
        doc = await self.collection.find_one({
            "user_id": ObjectId(user_id),
            "name_normalized": name.strip().lower(),
        })
        return doc is not None


