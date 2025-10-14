from typing import Any, Dict, List, Optional, Set

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, status
import random
import math

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
    # Exclude immediate last pair if provided (unordered)
    last_a: Optional[str] = request.query_params.get("last_a")
    last_b: Optional[str] = request.query_params.get("last_b")
    avoid_high: Optional[str] = request.query_params.get("avoid_high")
    last_pair: Set[str] = set()
    if last_a and last_b:
        last_pair = {last_a, last_b}
    coll = db["tasks"]
    cursor = coll.find({"user_id": ObjectId(user_id), "completed": False})
    docs = [doc async for doc in cursor]
    if len(docs) < 2:
        return [_serialize_task(d) for d in docs]

    # Sort by dislike_rank desc (missing -> 0)
    def rank_val(d: Dict[str, Any]) -> int:
        v = d.get("dislike_rank", 0)
        try:
            return int(v)
        except Exception:
            return 0

    docs.sort(key=rank_val, reverse=True)

    n = len(docs)
    # Top bucket size scales with n; ensure at least 2 when n >= 4 to avoid sticky top pick
    top_k = min(5, max(1 if n < 4 else 2, math.ceil(n * 0.4)))
    high_pool = docs[:top_k]
    low_start = max(n // 2, 1)  # lower half to bottom
    low_pool = docs[low_start:]
    if not low_pool:
        low_pool = docs[-max(1, n // 2):]

    # If ranks are flat (all zero), fallback to random two distinct with retry
    if rank_val(docs[0]) == rank_val(docs[-1]):
        choices = docs[:]
        random.shuffle(choices)
        a, b = choices[0], choices[1]
        # ensure not the same as last pair, try a few times
        tries = min(10, len(choices))
        while {str(a.get("_id")), str(b.get("_id"))} == last_pair and tries > 0:
            random.shuffle(choices)
            a, b = choices[0], choices[1]
            tries -= 1
        return [_serialize_task(a), _serialize_task(b)]

    # Pick high + low with contrast and avoid repeating last_pair (unordered)
    random.shuffle(high_pool)
    high = high_pool[0]
    if avoid_high and len(high_pool) > 1 and str(high.get("_id")) == avoid_high:
        # pick a different high to avoid repeating the same dreaded task immediately
        for cand in high_pool[1:]:
            if str(cand.get("_id")) != avoid_high:
                high = cand
                break
    low_candidates = [d for d in low_pool if str(d.get("_id")) != str(high.get("_id"))]
    if not low_candidates:
        low_candidates = [d for d in docs if str(d.get("_id")) != str(high.get("_id"))]
    random.shuffle(low_candidates)
    # add some randomness proportional to pool size
    sample_size = max(1, min(5, len(low_candidates) // 3 or 1))
    random.shuffle(low_candidates)
    subset = low_candidates[:sample_size]
    low = None
    for cand in subset:
        if {str(high.get("_id")), str(cand.get("_id"))} != last_pair:
            low = cand
            break
    if low is None:
        # last resort: just pick the first different
        low = low_candidates[0]

    return [_serialize_task(high), _serialize_task(low)]


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


