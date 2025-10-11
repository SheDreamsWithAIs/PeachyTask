def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload.get("status") == "ok"
    assert payload.get("service") == "peachy-task-backend"
    assert isinstance(payload.get("timestamp"), str)



