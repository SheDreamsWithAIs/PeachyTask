from datetime import datetime, timezone
from typing import Any, Dict, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId


class UserModel:
    """Thin model wrapper over Motor for the `users` collection."""

    collection_name = "users"

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db[self.collection_name]

    async def create_user(self, email: str, password_hash: str) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "email": email,
            "password_hash": password_hash,
            "created_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    async def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"email": email})

    async def get_by_id_str(self, id_str: str) -> Optional[Dict[str, Any]]:
        try:
            oid = ObjectId(id_str)
        except Exception:
            return None
        return await self.collection.find_one({"_id": oid})



