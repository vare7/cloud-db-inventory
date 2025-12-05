import { Box, Button, MenuItem, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import axios from "axios";

interface AzureVMFilters {
  region?: string;
  subscription?: string;
  tenant_id?: string;
  status?: string;
  search?: string;
}

interface AzureVMFiltersBarProps {
  filters: AzureVMFilters;
  onChange: (filters: AzureVMFilters) => void;
  onRefresh: () => void;
}

interface FilterOptions {
  regions: string[];
  subscriptions: string[];
  tenants: string[];
  statuses: string[];
}

export const AzureVMFiltersBar = ({ filters, onChange, onRefresh }: AzureVMFiltersBarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [],
    subscriptions: [],
    tenants: [],
    statuses: [],
  });
  const [tenantNames, setTenantNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.get("/azure-vms-filter-options");
        setFilterOptions(response.data);
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const fetchTenantNames = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tenant-names');
        setTenantNames(response.data);
      } catch (error) {
        console.error('Failed to fetch tenant names:', error);
      }
    };
    fetchTenantNames();
  }, []);

  const getTenantDisplayName = (tenantId: string): string => {
    if (!tenantId) return "Unknown";
    return tenantNames[tenantId] || tenantId;
  };

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
        placeholder="Search computer name, resource group..."
        variant="outlined"
        value={filters.search || ""}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        InputProps={{
          startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: "action.active" }} />,
        }}
      />

      <TextField
        size="small"
        select
        label="Region"
        variant="outlined"
        value={filters.region || ""}
        onChange={(e) => onChange({ ...filters, region: e.target.value || undefined })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All Regions</MenuItem>
        {filterOptions.regions.map((region) => (
          <MenuItem key={region} value={region}>
            {region}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        select
        label="Subscription"
        variant="outlined"
        value={filters.subscription || ""}
        onChange={(e) => onChange({ ...filters, subscription: e.target.value || undefined })}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">All Subscriptions</MenuItem>
        {filterOptions.subscriptions.map((sub) => (
          <MenuItem key={sub} value={sub}>
            {sub}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        select
        label="Azure Tenant"
        variant="outlined"
        value={filters.tenant_id || ""}
        onChange={(e) => onChange({ ...filters, tenant_id: e.target.value || undefined })}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">All Tenants</MenuItem>
        {filterOptions.tenants.map((tenant) => (
          <MenuItem key={tenant} value={tenant}>
            {getTenantDisplayName(tenant)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        select
        label="Status"
        variant="outlined"
        value={filters.status || ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">All Status</MenuItem>
        {filterOptions.statuses.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="outlined"
        startIcon={<ClearRoundedIcon />}
        onClick={() => onChange({ search: undefined, region: undefined, subscription: undefined, tenant_id: undefined, status: undefined })}
      >
        Clear
      </Button>

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

