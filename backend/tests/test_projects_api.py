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
    assert any(project["id"] == saved["id"] for project in listed["projects"])
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


def test_project_api_updates_existing_project_name_instead_of_duplicating():
    username = "dedupe-user"

    with TestClient(app) as client:
        first = client.post(
            f"/api/users/{username}/projects",
            json={
                "name": "Commercial scan",
                "query": "show commercial buildings",
                "filters": [{"attribute": "land_use", "operator": "contains", "value": "COMMERCIAL"}],
            },
        ).json()
        second = client.post(
            f"/api/users/{username}/projects",
            json={
                "name": "Commercial scan",
                "query": "show buildings in DC zoning",
                "filters": [{"attribute": "zoning", "operator": "contains", "value": "DC"}],
            },
        ).json()
        listed = client.get(f"/api/users/{username}/projects").json()

    assert second["id"] == first["id"]
    assert second["query"] == "show buildings in DC zoning"
    assert second["filters"][0]["attribute"] == "zoning"
    assert len([project for project in listed["projects"] if project["name"] == "Commercial scan"]) == 1


def test_project_api_deletes_project():
    username = "delete-user"

    with TestClient(app) as client:
        saved = client.post(
            f"/api/users/{username}/projects",
            json={"name": "Delete me", "query": "show commercial buildings", "filters": []},
        ).json()
        deleted = client.delete(f"/api/users/{username}/projects/{saved['id']}")
        listed = client.get(f"/api/users/{username}/projects").json()
        missing = client.get(f"/api/users/{username}/projects/{saved['id']}")

    assert deleted.status_code == 200
    assert deleted.json() == {"deleted": True, "id": saved["id"]}
    assert all(project["id"] != saved["id"] for project in listed["projects"])
    assert missing.status_code == 404
