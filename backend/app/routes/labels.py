from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Request, Response, status

from app.schemas.label import LabelCreate, LabelUpdate
from app.utils.auth import decode_access_token
from app.utils.database import get_database_or_none
from app.models.label import LabelModel


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


@router.get("/labels")
async def list_labels(request: Request) -> List[Dict[str, Any]]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    model = LabelModel(db)
    return await model.list_by_user(user_id)


@router.post("/labels", status_code=status.HTTP_201_CREATED)
async def create_label(payload: LabelCreate, request: Request) -> Dict[str, Any]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    model = LabelModel(db)
    if await model.exists_with_name(user_id, payload.name):
        raise HTTPException(status_code=409, detail="Label name already exists")
    return await model.create(user_id, payload.name, payload.color)


@router.patch("/labels/{label_id}")
async def update_label(label_id: str, payload: LabelUpdate, request: Request) -> Dict[str, Any]:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    model = LabelModel(db)
    fields = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if "name" in fields and fields["name"] is not None:
        # prevent duplicates
        if await model.exists_with_name(user_id, fields["name"]):
            raise HTTPException(status_code=409, detail="Label name already exists")
    ok = await model.update(label_id, user_id, fields)
    if not ok:
        raise HTTPException(status_code=404, detail="Label not found")
    doc = await model.get_by_id_str(label_id)
    if not doc or doc["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Label not found")
    return doc


@router.delete("/labels/{label_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_label(label_id: str, request: Request) -> Response:
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    user_id = _get_user_id_from_cookie(request)
    model = LabelModel(db)
    ok = await model.delete(label_id, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Label not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


