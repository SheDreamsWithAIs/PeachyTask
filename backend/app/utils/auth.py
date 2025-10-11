from datetime import datetime, timedelta, timezone
import os
from typing import Any, Dict, Optional

from jose import jwt, JWTError
from passlib.context import CryptContext


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return password_context.hash(plain_password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return password_context.verify(plain_password, password_hash)


def _get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET")
    if not secret:
        raise RuntimeError("JWT_SECRET env var not set")
    return secret


def _get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALG", "HS256")


def _get_jwt_expire_minutes() -> int:
    raw = os.getenv("JWT_EXPIRE_MIN", "60")
    try:
        return int(raw)
    except ValueError:
        return 60


def create_access_token(
    subject: str,
    additional_claims: Optional[Dict[str, Any]] = None,
    expires_in_minutes: Optional[int] = None,
) -> str:
    secret = _get_jwt_secret()
    algorithm = _get_jwt_algorithm()
    ttl = expires_in_minutes if expires_in_minutes is not None else _get_jwt_expire_minutes()

    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=ttl)
    to_encode: Dict[str, Any] = {"sub": subject, "iat": int(now.timestamp()), "exp": int(expire.timestamp())}
    if additional_claims:
        to_encode.update(additional_claims)
    return jwt.encode(to_encode, secret, algorithm=algorithm)


def decode_access_token(token: str) -> Dict[str, Any]:
    secret = _get_jwt_secret()
    algorithm = _get_jwt_algorithm()
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])
    except JWTError as exc:
        raise exc
    return payload



