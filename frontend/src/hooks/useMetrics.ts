import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";

interface MetricsResponse {
  rdbms_counts: Record<string, number>;
  rdbms_percentages: Record<string, number>;
  version_counts: Record<string, Record<string, number>>;
}

export const useMetrics = () => {
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/metrics");
      setData(res.data);
    } catch {
      setError("Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, loading, error, refetch: fetchMetrics };
};
