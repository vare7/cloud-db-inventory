import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { DatabaseRecord, InventoryFilters } from "../types";

interface UpgradesResponse {
  total: number;
  by_engine: Record<string, number>;
  databases: DatabaseRecord[];
}

export const useUpgrades = (filters?: InventoryFilters) => {
  const [data, setData] = useState<UpgradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpgrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (filters?.provider) searchParams.append("provider", filters.provider);
      if (filters?.engine) searchParams.append("engine", filters.engine);
      if (filters?.version) searchParams.append("version", filters.version);
      if (filters?.subscription) searchParams.append("subscription", filters.subscription);
      // If excludeStopped is true and no specific status is selected, exclude stopped instances
      if (filters?.excludeStopped && !filters?.status) {
        searchParams.append("exclude_stopped", "true");
      } else if (filters?.status) {
        searchParams.append("status", filters.status);
      }
      
      const res = await apiClient.get(`/upgrades?${searchParams.toString()}`);
      setData(res.data);
    } catch {
      setError("Failed to fetch upgrades");
    } finally {
      setLoading(false);
    }
  }, [
    filters?.provider,
    filters?.engine,
    filters?.version,
    filters?.subscription,
    filters?.status,
    filters?.excludeStopped
  ]);

  useEffect(() => {
    fetchUpgrades();
  }, [fetchUpgrades]);

  return { data, loading, error, refetch: fetchUpgrades };
};
