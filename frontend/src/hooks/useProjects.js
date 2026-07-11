import { useCallback, useEffect, useState } from "react";

import { fetchProjects, saveProject as saveProjectRequest } from "../services/api.js";

export function useProjects(username) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const payload = await fetchProjects(username);
      setItems(payload.projects);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProject(project) {
    await saveProjectRequest(username, project);
    await load();
  }

  return { items, loading, saveProject, reload: load };
}
