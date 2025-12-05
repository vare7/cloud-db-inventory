import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
export const useMetrics = (filters) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        }
        catch {
            setError("Failed to fetch metrics");
        }
        finally {
            setLoading(false);
        }
    }, [filters?.excludeStopped]);
    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);
    return { data, loading, error, refetch: fetchMetrics };
};
