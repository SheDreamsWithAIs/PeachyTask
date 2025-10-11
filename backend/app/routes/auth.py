from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.schemas.user import UserCreate, UserLogin
from app.utils.auth import hash_password, create_access_token, verify_password, decode_access_token
from app.utils.database import get_database_or_none
from app.models.user import UserModel


router = APIRouter()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, response: Response):
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")

    users = UserModel(db)

    existing = await users.get_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    password_hash = hash_password(payload.password)
    user_doc = await users.create_user(email=payload.email, password_hash=password_hash)

    token = create_access_token(subject=user_doc.get("_id", payload.email))
    # Set HTTPOnly JWT cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )

    return {"_id": user_doc.get("_id"), "email": user_doc["email"]}


@router.post("/login")
async def login(payload: UserLogin, response: Response):
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    users = UserModel(db)
    user_doc = await users.get_by_email(payload.email)
    if not user_doc or not verify_password(payload.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user_id = str(user_doc.get("_id"))
    token = create_access_token(subject=user_id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        path="/",
    )
    return {"_id": user_id, "email": user_doc["email"]}


def _get_user_id_from_cookie(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_access_token(token)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return sub


@router.get("/me")
async def me(request: Request):
    db = get_database_or_none()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    users = UserModel(db)
    user_id = _get_user_id_from_cookie(request)
    user_doc = await users.get_by_id_str(user_id)
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {"_id": str(user_doc["_id"]), "email": user_doc["email"]}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}



