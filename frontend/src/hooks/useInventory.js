import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
const defaultFilters = {
    provider: "",
    status: "",
    region: "",
    engine: "",
    version: "",
    subscription: "",
    search: ""
};
export const useInventory = (initialFilters) => {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFiltersState] = useState(initialFilters ?? defaultFilters);
    const [shouldRefetch, setShouldRefetch] = useState(0);
    // Sync initialFilters to filters state when initialFilters changes
    useEffect(() => {
        if (initialFilters) {
            setFiltersState(initialFilters);
        }
    }, [initialFilters]);
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const searchParams = new URLSearchParams();
            if (filters.provider)
                searchParams.append("provider", filters.provider);
            // If excludeStopped is true and no specific status is selected, exclude stopped instances
            if (filters.excludeStopped && !filters.status) {
                searchParams.append("exclude_stopped", "true");
            }
            else if (filters.status) {
                searchParams.append("status", filters.status);
            }
            if (filters.region)
                searchParams.append("region", filters.region);
            if (filters.engine)
                searchParams.append("engine", filters.engine);
            if (filters.version)
                searchParams.append("version", filters.version);
            if (filters.subscription)
                searchParams.append("subscription", filters.subscription);
            if (filters.search)
                searchParams.append("search", filters.search);
            const [inventoryRes, statsRes] = await Promise.all([
                apiClient.get(`/databases?${searchParams.toString()}`),
                apiClient.get(`/stats?${searchParams.toString()}`)
            ]);
            setData(inventoryRes.data);
            setStats(statsRes.data);
        }
        catch (err) {
            setError("Failed to fetch inventory");
        }
        finally {
            setLoading(false);
        }
    }, [filters]);
    useEffect(() => {
        fetchAll();
    }, [fetchAll, shouldRefetch]);
    const refetch = () => setShouldRefetch((prev) => prev + 1);
    const setFilters = (next) => {
        setFiltersState(next);
        setShouldRefetch((prev) => prev + 1);
    };
    const createRecord = async (payload) => {
        try {
            await apiClient.post("/databases", payload);
            refetch();
        }
        catch {
            setError("Failed to create record");
        }
    };
    const deleteRecord = async (id) => {
        try {
            await apiClient.delete(`/databases/${id}`);
            refetch();
        }
        catch {
            setError("Failed to delete record");
            throw new Error("Failed to delete record");
        }
    };
    return { data, stats, loading, error, refetch, createRecord, deleteRecord, filters, setFilters };
};
