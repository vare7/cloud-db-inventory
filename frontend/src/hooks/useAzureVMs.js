import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
export const useAzureVMs = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFiltersState] = useState({});
    const [shouldRefetch, setShouldRefetch] = useState(0);
    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const searchParams = new URLSearchParams();
            if (filters.region)
                searchParams.append("region", filters.region);
            if (filters.subscription)
                searchParams.append("subscription", filters.subscription);
            if (filters.tenant_id)
                searchParams.append("tenant_id", filters.tenant_id);
            if (filters.status)
                searchParams.append("status", filters.status);
            if (filters.search)
                searchParams.append("search", filters.search);
            const response = await apiClient.get(`/azure-vms?${searchParams.toString()}`);
            setData(response.data);
        }
        catch (err) {
            setError("Failed to fetch VMs");
            console.error(err);
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
    const deleteRecord = async (id) => {
        try {
            await apiClient.delete(`/azure-vms/${id}`);
            refetch();
        }
        catch {
            setError("Failed to delete VM");
            throw new Error("Failed to delete VM");
        }
    };
    return { data, loading, error, refetch, deleteRecord, filters, setFilters };
};
