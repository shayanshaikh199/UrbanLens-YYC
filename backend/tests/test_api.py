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
