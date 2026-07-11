const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed: ${response.status}`);
  }
  return payload;
}

export function fetchBuildings(refresh = false) {
  return request(`/api/map/buildings${refresh ? "?refresh=true" : ""}`);
}

export function fetchPermits(refresh = false) {
  return request(`/api/map/permits${refresh ? "?refresh=true" : ""}`);
}

export function runQuery(query) {
  return request("/api/query", {
    method: "POST",
    body: JSON.stringify({ query })
  });
}

export function filterBuildings(filters) {
  return request("/api/filter", {
    method: "POST",
    body: JSON.stringify({ filters })
  });
}

export function fetchProjects(username) {
  return request(`/api/users/${encodeURIComponent(username)}/projects`);
}

export function saveProject(username, project) {
  return request(`/api/users/${encodeURIComponent(username)}/projects`, {
    method: "POST",
    body: JSON.stringify(project)
  });
}
