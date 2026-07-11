from fastapi.testclient import TestClient

from app.main import app


def test_query_filter_and_project_flow():
    with TestClient(app) as client:
        query = client.post("/api/query", json={"query": "show commercial buildings"}).json()
        filtered = client.post("/api/filter", json={"filters": query["filters"]}).json()
        saved = client.post(
            "/api/users/shayan/projects",
            json={"name": "Commercial scan", "query": query["query"], "filters": query["filters"]},
        ).json()
        listed = client.get("/api/users/shayan/projects").json()

    assert query["match_count"] > 0
    assert filtered["match_count"] == query["match_count"]
    assert saved["name"] == "Commercial scan"
    assert len(listed["projects"]) >= 1


def test_llm_status_does_not_expose_key():
    with TestClient(app) as client:
        status = client.get("/api/llm/status").json()

    assert status["provider"] == "groq"
    assert "key" not in status
    assert "api_key" not in status


def test_filter_endpoint_rejects_unsupported_attribute():
    with TestClient(app) as client:
        response = client.post(
            "/api/filter",
            json={"filters": [{"attribute": "secret_field", "operator": "=", "value": "x"}]},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported attribute: secret_field"


def test_filter_endpoint_rejects_unsupported_operator():
    with TestClient(app) as client:
        response = client.post(
            "/api/filter",
            json={"filters": [{"attribute": "zoning", "operator": "starts_with", "value": "DC"}]},
        )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported operator: starts_with"


def test_saved_top_filter_can_be_reapplied():
    with TestClient(app) as client:
        response = client.post(
            "/api/filter",
            json={"filters": [{"attribute": "height_m", "operator": "top", "value": 3, "direction": "desc"}]},
        )
        payload = response.json()

    assert response.status_code == 200
    assert payload["match_count"] == 3
