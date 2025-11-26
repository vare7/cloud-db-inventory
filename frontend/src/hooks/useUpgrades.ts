import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { DatabaseRecord } from "../types";

interface UpgradesResponse {
  total: number;
  by_engine: Record<string, number>;
  databases: DatabaseRecord[];
}

export const useUpgrades = () => {
  const [data, setData] = useState<UpgradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpgrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/upgrades");
      setData(res.data);
    } catch {
      setError("Failed to fetch upgrades");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpgrades();
  }, [fetchUpgrades]);

  return { data, loading, error, refetch: fetchUpgrades };
};
