import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="function")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True, scope="function")
def _set_app_env_test(monkeypatch):
    """Ensure the API connects to the test database during test session."""
    monkeypatch.setenv("APP_ENV", "test")


