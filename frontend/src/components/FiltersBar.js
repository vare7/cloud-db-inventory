import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, MenuItem, TextField, InputAdornment, Menu, ListItemIcon, ListItemText } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import { downloadCSV, downloadExcel } from "../utils/exportUtils";
const providers = ["AWS", "Azure"];
const statusDisplayMap = {
    available: "Running",
    ready: "Running",
    stopped: "Stopped",
    maintenance: "Maintenance",
    warning: "Warning"
};
export const FiltersBar = ({ filters, onChange, onRefresh, data = [] }) => {
    const [filterOptions, setFilterOptions] = useState({
        regions: [],
        engines: [],
        versions: [],
        subscriptions: [],
        statuses: [],
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const handleDownloadMenuOpen = (event) => {
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
            }
            catch (error) {
                console.error("Failed to fetch filter options:", error);
            }
        };
        fetchOptions();
    }, [filters.provider]);
    // Extract major version (e.g., "8.0.35" -> "8.0", "15.4" -> "15")
    const extractMajorVersion = (version) => {
        if (!version)
            return version;
        const parts = version.split('.');
        // For versions like 8.0.35, return major.minor (8.0)
        // For versions like 15.4, return major (15)
        // For SQL Server versions like "SQL Server 2019", return as is
        if (version.toLowerCase().includes('sql server'))
            return version;
        if (parts.length >= 2 && parseInt(parts[0]) < 10) {
            return `${parts[0]}.${parts[1]}`;
        }
        return parts[0];
    };
    // Get unique major versions for dropdown
    const majorVersions = Array.from(new Set(filterOptions.versions.map(v => extractMajorVersion(v)))).sort();
    return (_jsxs(Box, { sx: {
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center"
        }, children: [_jsx(TextField, { size: "small", placeholder: "Search engine, endpoint, tag...", value: filters.search ?? "", onChange: (e) => onChange({ ...filters, search: e.target.value }), InputProps: {
                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchRoundedIcon, { fontSize: "small" }) }))
                }, sx: { minWidth: 240 } }), _jsxs(TextField, { select: true, size: "small", label: "Provider", value: filters.provider ?? "", onChange: (e) => onChange({ ...filters, provider: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), providers.map((provider) => (_jsx(MenuItem, { value: provider, children: provider }, provider)))] }), _jsxs(TextField, { select: true, size: "small", label: "Status", value: filters.status ?? "", onChange: (e) => onChange({ ...filters, status: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.statuses.map((status) => (_jsx(MenuItem, { value: status, children: statusDisplayMap[status] || status }, status)))] }), _jsxs(TextField, { select: true, size: "small", label: "Region", value: filters.region ?? "", onChange: (e) => onChange({ ...filters, region: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.regions.map((region) => (_jsx(MenuItem, { value: region, children: region }, region)))] }), _jsxs(TextField, { select: true, size: "small", label: "Engine", value: filters.engine ?? "", onChange: (e) => onChange({ ...filters, engine: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.engines.map((engine) => (_jsx(MenuItem, { value: engine, children: engine }, engine)))] }), _jsxs(TextField, { select: true, size: "small", label: "Version", value: filters.version ?? "", onChange: (e) => onChange({ ...filters, version: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), majorVersions.map((version) => (_jsx(MenuItem, { value: version, children: version }, version)))] }), _jsxs(TextField, { select: true, size: "small", label: "Subscription", value: filters.subscription ?? "", onChange: (e) => onChange({ ...filters, subscription: e.target.value }), sx: { minWidth: 180 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.subscriptions.map((subscription) => (_jsx(MenuItem, { value: subscription, children: subscription }, subscription)))] }), _jsx(Button, { variant: "outlined", startIcon: _jsx(ClearRoundedIcon, {}), onClick: () => onChange({ search: "" }), children: "Clear" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshRoundedIcon, {}), onClick: onRefresh, children: "Refresh" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(DownloadRoundedIcon, {}), onClick: handleDownloadMenuOpen, disabled: data.length === 0, children: "Export" }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleDownloadMenuClose, children: [_jsxs(MenuItem, { onClick: handleDownloadCSV, children: [_jsx(ListItemIcon, { children: _jsx(DescriptionRoundedIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Download as CSV" })] }), _jsxs(MenuItem, { onClick: handleDownloadExcel, children: [_jsx(ListItemIcon, { children: _jsx(TableChartRoundedIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Download as Excel" })] })] })] }));
};
