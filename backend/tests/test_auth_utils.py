import os

import pytest

from app.utils.auth import hash_password, verify_password, create_access_token, decode_access_token


def test_password_hashing_and_verification():
    raw = "SuperSecret123!"
    h = hash_password(raw)
    assert h != raw
    assert verify_password(raw, h) is True
    assert verify_password("wrong", h) is False


def test_jwt_encode_decode_roundtrip(monkeypatch):
    # Ensure required env vars are present for test determinism
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    monkeypatch.setenv("JWT_ALG", "HS256")
    monkeypatch.setenv("JWT_EXPIRE_MIN", "5")

    token = create_access_token("user123", {"role": "tester"}, expires_in_minutes=1)
    payload = decode_access_token(token)
    assert payload["sub"] == "user123"
    assert payload["role"] == "tester"
    assert "exp" in payload
    assert "iat" in payload



