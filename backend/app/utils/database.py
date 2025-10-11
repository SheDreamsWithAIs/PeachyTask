import os
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase


# Load environment variables from .env if present
load_dotenv()

_mongo_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


def _get_env(name: str, default: Optional[str] = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Environment variable '{name}' is required but not set")
    return value


def _resolve_database_name() -> str:
    app_env = os.getenv("APP_ENV", "dev").lower()
    if app_env == "test":
        return _get_env("MONGO_DB_NAME_TEST")
    if app_env in {"prod", "production"}:
        return _get_env("MONGO_DB_NAME_PROD")
    # default to dev
    return _get_env("MONGO_DB_NAME_DEV")


async def connect_to_mongo() -> AsyncIOMotorDatabase:
    global _mongo_client, _database

    if _database is not None:
        return _database

    mongo_uri = _get_env("MONGO_URI")
    db_name = _resolve_database_name()

    _mongo_client = AsyncIOMotorClient(mongo_uri)
    _database = _mongo_client[db_name]

    # lightweight connectivity check
    await _database.command("ping")
    return _database


async def close_mongo_connection() -> None:
    global _mongo_client, _database
    if _mongo_client is not None:
        _mongo_client.close()
    _mongo_client = None
    _database = None


def get_database_or_none() -> Optional[AsyncIOMotorDatabase]:
    return _database


