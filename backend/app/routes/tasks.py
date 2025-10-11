from datetime import date
from typing import Any, Dict, List

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Request, Response, status

from app.schemas.task import TaskBase, TaskCreate
from app.utils.database import get_database_or_none
from app.models.task import TaskModel
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
    # Convert ObjectId fields to strings for API responses
    out = {**doc}
    if isinstance(out.get("_id"), ObjectId):
        out["_id"] = str(out["_id"])
    if isinstance(out.get("user_id"), ObjectId):
        out["user_id"] = str(out["user_id"])
    # label_ids as strings
    if isinstance(out.get("label_ids"), list):
        out["label_ids"] = [str(x) for x in out["label_ids"]]
    return out


@router.post("/tasks", status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskBase, request: Request):
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    # Build TaskCreate with server-side user_id
    tc = TaskCreate(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        deadline=payload.deadline,
        completed=payload.completed,
        label_ids=payload.label_ids,
        user_id=user_id,
    )
    # Prepare doc for persistence
    doc: Dict[str, Any] = tc.model_dump()
    doc["user_id"] = ObjectId(doc["user_id"])  # to ObjectId
    if doc.get("label_ids"):
        doc["label_ids"] = [ObjectId(x) for x in doc["label_ids"]]
    # deadline is already coerced to timezone-aware datetime by schema

    task_model = TaskModel(db)
    created = await task_model.create(doc)
    return _serialize_task(created)


@router.get("/tasks")
async def list_tasks(request: Request) -> List[Dict[str, Any]]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    task_model = TaskModel(db)
    docs = await task_model.list_by_user(user_id)
    return [_serialize_task(d) for d in docs]


@router.get("/tasks/{task_id}")
async def get_task(task_id: str, request: Request) -> Dict[str, Any]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    task_model = TaskModel(db)
    doc = await task_model.get_by_id_str(task_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")
    # ownership check
    if str(doc.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return _serialize_task(doc)


@router.patch("/tasks/{task_id}")
async def update_task(task_id: str, payload: Dict[str, Any], request: Request) -> Dict[str, Any]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    task_model = TaskModel(db)
    current = await task_model.get_by_id_str(task_id)
    if not current:
        raise HTTPException(status_code=404, detail="Task not found")
    if str(current.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Accept partial updates validated by schema
    from app.schemas.task import TaskUpdate

    upd = TaskUpdate.model_validate(payload)
    fields = {k: v for k, v in upd.model_dump(exclude_unset=True).items()}
    if "label_ids" in fields and fields["label_ids"] is not None:
        fields["label_ids"] = [ObjectId(x) for x in fields["label_ids"]]
    ok = await task_model.update_fields(task_id, fields)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    doc = await task_model.get_by_id_str(task_id)
    return _serialize_task(doc)


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, request: Request) -> Response:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    task_model = TaskModel(db)
    current = await task_model.get_by_id_str(task_id)
    if not current:
        raise HTTPException(status_code=404, detail="Task not found")
    if str(current.get("user_id")) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await task_model.delete(task_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


