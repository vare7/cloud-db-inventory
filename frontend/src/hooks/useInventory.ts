import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { DatabaseRecord, InventoryFilters, StatsSummary } from "../types";

interface UseInventoryResult {
  data: DatabaseRecord[];
  stats: StatsSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createRecord: (payload: Omit<DatabaseRecord, "id">) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  filters: InventoryFilters;
  setFilters: (next: InventoryFilters) => void;
}

const defaultFilters: InventoryFilters = {
  provider: "",
  status: "",
  region: "",
  engine: "",
  version: "",
  subscription: "",
  search: ""
};

export const useInventory = (): UseInventoryResult => {
  const [data, setData] = useState<DatabaseRecord[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<InventoryFilters>(defaultFilters);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (filters.provider) searchParams.append("provider", filters.provider);
      if (filters.status) searchParams.append("status", filters.status);
      if (filters.region) searchParams.append("region", filters.region);
      if (filters.engine) searchParams.append("engine", filters.engine);
      if (filters.version) searchParams.append("version", filters.version);
      if (filters.subscription) searchParams.append("subscription", filters.subscription);
      if (filters.search) searchParams.append("search", filters.search);
      const [inventoryRes, statsRes] = await Promise.all([
        apiClient.get(`/databases?${searchParams.toString()}`),
        apiClient.get(`/stats?${searchParams.toString()}`)
      ]);
      setData(inventoryRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, shouldRefetch]);

  const refetch = () => setShouldRefetch((prev) => prev + 1);

  const setFilters = (next: InventoryFilters) => {
    setFiltersState(next);
    setShouldRefetch((prev) => prev + 1);
  };

  const createRecord = async (payload: Omit<DatabaseRecord, "id">) => {
    try {
      await apiClient.post("/databases", payload);
      refetch();
    } catch {
      setError("Failed to create record");
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      await apiClient.delete(`/databases/${id}`);
      refetch();
    } catch {
      setError("Failed to delete record");
      throw new Error("Failed to delete record");
    }
  };

  return { data, stats, loading, error, refetch, createRecord, deleteRecord, filters, setFilters };
};


