import { useCallback, useEffect, useState } from "react";

import {
  deleteProject as deleteProjectRequest,
  fetchProjects,
  saveProject as saveProjectRequest
} from "../services/api.js";

export function useProjects(username) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!username.trim()) {
      setItems([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await fetchProjects(username);
      setItems(payload.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProject(project) {
    if (!username.trim()) {
      throw new Error("Enter a username before saving projects.");
    }
    try {
      await saveProjectRequest(username, project);
      await load();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteProject(projectId) {
    if (!username.trim()) {
      throw new Error("Enter a username before deleting projects.");
    }
    try {
      await deleteProjectRequest(username, projectId);
      await load();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  return { items, loading, error, saveProject, deleteProject, reload: load };
}
