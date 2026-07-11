import { useCallback, useEffect, useState } from "react";

import { fetchBuildings, fetchPermits } from "../services/api.js";

export function useMapData() {
  const [buildings, setBuildings] = useState([]);
  const [permits, setPermits] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError("");
    try {
      const [buildingPayload, permitPayload] = await Promise.all([
        fetchBuildings(refresh),
        fetchPermits(refresh)
      ]);
      setBuildings(buildingPayload.buildings);
      setPermits(permitPayload.permits);
      setMetadata(buildingPayload.metadata);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return { buildings, permits, metadata, loading, error, refresh: () => load(true) };
}
