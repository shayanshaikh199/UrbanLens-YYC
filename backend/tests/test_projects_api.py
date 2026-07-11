from fastapi.testclient import TestClient

from app.main import app


def test_project_api_normalizes_username_and_persists_filters():
    username = " ProjectUserCase "
    filters = [{"attribute": "zoning", "operator": "contains", "value": "DC"}]

    with TestClient(app) as client:
        saved = client.post(
            f"/api/users/{username}/projects",
            json={"name": "DC scan", "query": "show buildings in DC zoning", "filters": filters},
        ).json()
        listed = client.get("/api/users/projectusercase/projects").json()
        loaded = client.get(f"/api/users/projectusercase/projects/{saved['id']}").json()

    assert saved["name"] == "DC scan"
    assert saved["filters"] == filters
    assert listed["username"] == "projectusercase"
    assert listed["projects"][0]["id"] == saved["id"]
    assert loaded["query"] == "show buildings in DC zoning"
    assert loaded["filters"] == filters
    assert "created_at" in loaded
    assert "updated_at" in loaded


def test_project_api_returns_empty_list_for_new_username():
    with TestClient(app) as client:
        payload = client.get("/api/users/no-projects-user/projects").json()

    assert payload == {"username": "no-projects-user", "projects": []}


def test_project_api_rejects_empty_project_name():
    with TestClient(app) as client:
        response = client.post(
            "/api/users/project-validation/projects",
            json={"name": "", "query": "show commercial buildings", "filters": []},
        )

    assert response.status_code == 422
