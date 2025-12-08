import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { AzureVM } from "../types";

interface AzureVMFilters {
  region?: string;
  subscription?: string;
  tenant_id?: string;
  status?: string;
  os_type?: string;
  search?: string;
}

interface UseAzureVMsResult {
  data: AzureVM[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  deleteRecord: (id: string) => Promise<void>;
  filters: AzureVMFilters;
  setFilters: (next: AzureVMFilters) => void;
}

export const useAzureVMs = (): UseAzureVMsResult => {
  const [data, setData] = useState<AzureVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<AzureVMFilters>({});
  const [shouldRefetch, setShouldRefetch] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (filters.region) searchParams.append("region", filters.region);
      if (filters.subscription) searchParams.append("subscription", filters.subscription);
      if (filters.tenant_id) searchParams.append("tenant_id", filters.tenant_id);
      if (filters.status) searchParams.append("status", filters.status);
      if (filters.os_type) searchParams.append("os_type", filters.os_type);
      if (filters.search) searchParams.append("search", filters.search);
      
      const response = await apiClient.get(`/azure-vms?${searchParams.toString()}`);
      setData(response.data);
    } catch (err) {
      setError("Failed to fetch VMs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, shouldRefetch]);

  const refetch = () => setShouldRefetch((prev) => prev + 1);

  const setFilters = (next: AzureVMFilters) => {
    setFiltersState(next);
    setShouldRefetch((prev) => prev + 1);
  };

  const deleteRecord = async (id: string) => {
    try {
      await apiClient.delete(`/azure-vms/${id}`);
      refetch();
    } catch {
      setError("Failed to delete VM");
      throw new Error("Failed to delete VM");
    }
  };

  return { data, loading, error, refetch, deleteRecord, filters, setFilters };
};
