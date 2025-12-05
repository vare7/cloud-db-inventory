import {
  Box,
  TextField,
  MenuItem,
  Stack
} from "@mui/material";
import { InventoryFilters, Provider, Status } from "../types";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";

interface DashboardFiltersBarProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
}

interface FilterOptions {
  regions: string[];
  engines: string[];
  versions: string[];
  subscriptions: string[];
  statuses: string[];
}

const providers: Provider[] = ["AWS", "Azure"];

const statusDisplayMap: Record<string, string> = {
  available: "Running",
  ready: "Running",
  stopped: "Stopped",
  maintenance: "Maintenance",
  warning: "Warning"
};

export const DashboardFiltersBar = ({ filters, onChange }: DashboardFiltersBarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [],
    engines: [],
    versions: [],
    subscriptions: [],
    statuses: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.provider) {
          params.append('provider', filters.provider);
        }
        const response = await apiClient.get(`/filter-options?${params.toString()}`);
        setFilterOptions(response.data);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    fetchOptions();
  }, [filters.provider]);

  // Extract major version (e.g., "8.0.35" -> "8.0", "15.4" -> "15")
  const extractMajorVersion = (version: string): string => {
    if (!version) return version;
    const parts = version.split('.');
    if (version.toLowerCase().includes('sql server')) return version;
    if (parts.length >= 2 && parseInt(parts[0]) < 10) {
      return `${parts[0]}.${parts[1]}`;
    }
    return parts[0];
  };

  // Get unique major versions for dropdown
  const majorVersions = Array.from(
    new Set(filterOptions.versions.map(v => extractMajorVersion(v)))
  ).sort();

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        flexWrap: "wrap",
        alignItems: "center",
        padding: 2,
        backgroundColor: "#f9fafb",
        borderRadius: 1,
        border: "1px solid #e5e7eb"
      }}
    >
      <TextField
        select
        size="small"
        label="Provider"
        value={filters.provider ?? ""}
        onChange={(e) => onChange({ ...filters, provider: e.target.value as Provider | "" })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {providers.map((provider) => (
          <MenuItem value={provider} key={provider}>
            {provider}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Engine"
        value={filters.engine ?? ""}
        onChange={(e) => onChange({ ...filters, engine: e.target.value })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {filterOptions.engines.map((engine) => (
          <MenuItem value={engine} key={engine}>
            {engine}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Version"
        value={filters.version ?? ""}
        onChange={(e) => onChange({ ...filters, version: e.target.value })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {majorVersions.map((version) => (
          <MenuItem value={version} key={version}>
            {version}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Subscription"
        value={filters.subscription ?? ""}
        onChange={(e) => onChange({ ...filters, subscription: e.target.value })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {filterOptions.subscriptions.map((subscription) => (
          <MenuItem value={subscription} key={subscription}>
            {subscription}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        size="small"
        label="Status"
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value as Status | "" })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {filterOptions.statuses.map((status) => (
          <MenuItem value={status} key={status}>
            {statusDisplayMap[status] || status}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
};
