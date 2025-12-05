import {
  Box,
  Button,
  MenuItem,
  TextField,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { InventoryFilters, Provider, Status, DatabaseRecord } from "../types";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { downloadCSV, downloadExcel } from "../utils/exportUtils";

interface FiltersBarProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
  onRefresh: () => void;
  data?: DatabaseRecord[];
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

export const FiltersBar = ({ filters, onChange, onRefresh, data = [] }: FiltersBarProps) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [],
    engines: [],
    versions: [],
    subscriptions: [],
    statuses: [],
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDownloadMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownloadCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(data, `inventory-export-${timestamp}.csv`);
    handleDownloadMenuClose();
  };

  const handleDownloadExcel = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    downloadExcel(data, `inventory-export-${timestamp}.xls`);
    handleDownloadMenuClose();
  };

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
        {filterOptions.statuses.map((status) => (
          <MenuItem value={status} key={status}>
            {statusDisplayMap[status] || status}
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
        startIcon={<ClearRoundedIcon />}
        onClick={() => onChange({ search: "" })}
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
      <Button
        variant="outlined"
        startIcon={<DownloadRoundedIcon />}
        onClick={handleDownloadMenuOpen}
        disabled={data.length === 0}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDownloadMenuClose}
      >
        <MenuItem onClick={handleDownloadCSV}>
          <ListItemIcon>
            <DescriptionRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadExcel}>
          <ListItemIcon>
            <TableChartRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};


