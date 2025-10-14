from typing import Any, Dict, List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, status

from app.utils.database import get_database_or_none
from app.utils.auth import decode_access_token


router = APIRouter()


def _get_user_id_from_cookie(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return sub


def _serialize_task(doc: Dict[str, Any]) -> Dict[str, Any]:
    out = {**doc}
    if isinstance(out.get("_id"), ObjectId):
        out["_id"] = str(out["_id"])
    if isinstance(out.get("user_id"), ObjectId):
        out["user_id"] = str(out["user_id"])
    if isinstance(out.get("label_ids"), list):
        out["label_ids"] = [str(x) for x in out["label_ids"]]
    return out


@router.get("/showdown/pair")
async def get_showdown_pair(request: Request) -> List[Dict[str, Any]]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    coll = db["tasks"]
    # Top 5 by dislike_rank among incomplete tasks for user
    cursor = coll.find({"user_id": ObjectId(user_id), "completed": False}).sort("dislike_rank", -1).limit(5)
    top = [doc async for doc in cursor]
    if len(top) < 2:
        # fallback: just try any 2 incomplete tasks
        cursor2 = coll.find({"user_id": ObjectId(user_id), "completed": False}).limit(2)
        top = [doc async for doc in cursor2]
    # Pick first two for determinism; client can request new pair again to shuffle in Phase 3
    selected = top[:2]
    return [_serialize_task(d) for d in selected]


@router.post("/showdown/complete")
async def showdown_complete(payload: Dict[str, Any], request: Request) -> Dict[str, Any]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    task_id: str = payload.get("task_id")
    seconds: int = int(payload.get("timer_seconds") or 0)
    if not task_id:
        raise HTTPException(status_code=400, detail="task_id is required")
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task_id")
    coll = db["tasks"]
    current = await coll.find_one({"_id": oid})
    if not current:
        raise HTTPException(status_code=404, detail="Task not found")
    if str(current.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await coll.update_one({"_id": oid}, {"$set": {"completed": True, "completed_via_showdown": True, "showdown_timer_seconds": seconds}})
    updated = await coll.find_one({"_id": oid})
    return _serialize_task(updated)


