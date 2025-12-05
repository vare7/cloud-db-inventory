import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { InventoryFilters } from "../types";

interface MetricsResponse {
  rdbms_counts: Record<string, number>;
  rdbms_percentages: Record<string, number>;
  version_counts: Record<string, Record<string, number>>;
}

export const useMetrics = (filters?: InventoryFilters) => {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (filters?.excludeStopped) {
        searchParams.append("exclude_stopped", "true");
      }
      const res = await apiClient.get(`/metrics?${searchParams.toString()}`);
      setData(res.data);
    } catch {
      setError("Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, [filters?.excludeStopped]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
};
