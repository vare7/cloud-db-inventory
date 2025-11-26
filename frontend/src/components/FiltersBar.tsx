import {
  Box,
  Button,
  MenuItem,
  TextField,
  InputAdornment
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { InventoryFilters, Provider, Status } from "../types";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";

interface FiltersBarProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
  onRefresh: () => void;
}

interface FilterOptions {
  regions: string[];
  engines: string[];
  versions: string[];
  subscriptions: string[];
}

const providers: Provider[] = ["AWS", "Azure"];
const statuses: Status[] = ["available", "maintenance", "warning"];

export const FiltersBar = ({ filters, onChange, onRefresh }: FiltersBarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [],
    engines: [],
    versions: [],
    subscriptions: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.get("/filter-options");
        setFilterOptions(response.data);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    fetchOptions();
  }, []);

  // Extract major version (e.g., "8.0.35" -> "8.0", "15.4" -> "15")
  const extractMajorVersion = (version: string): string => {
    if (!version) return version;
    const parts = version.split('.');
    // For versions like 8.0.35, return major.minor (8.0)
    // For versions like 15.4, return major (15)
    // For SQL Server versions like "SQL Server 2019", return as is
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
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center"
      }}
    >
      <TextField
        size="small"
        placeholder="Search engine, endpoint, tag..."
        value={filters.search ?? ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          )
        }}
        sx={{ minWidth: 240 }}
      />
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
        label="Status"
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value as Status | "" })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {statuses.map((status) => (
          <MenuItem value={status} key={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Region"
        value={filters.region ?? ""}
        onChange={(e) => onChange({ ...filters, region: e.target.value })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All</MenuItem>
        {filterOptions.regions.map((region) => (
          <MenuItem value={region} key={region}>
            {region}
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
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">All</MenuItem>
        {filterOptions.subscriptions.map((subscription) => (
          <MenuItem value={subscription} key={subscription}>
            {subscription}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="outlined"
        startIcon={<RefreshRoundedIcon />}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </Box>
  );
};


