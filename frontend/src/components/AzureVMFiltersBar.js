import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
import axios from "axios";
export const AzureVMFiltersBar = ({ filters, onChange, onRefresh }) => {
    const [filterOptions, setFilterOptions] = useState({
        regions: [],
        subscriptions: [],
        tenants: [],
        statuses: [],
    });
    const [tenantNames, setTenantNames] = useState({});
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await apiClient.get("/azure-vms-filter-options");
                setFilterOptions(response.data);
            }
            catch (error) {
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
            }
            catch (error) {
                console.error('Failed to fetch tenant names:', error);
            }
        };
        fetchTenantNames();
    }, []);
    const getTenantDisplayName = (tenantId) => {
        if (!tenantId)
            return "Unknown";
        return tenantNames[tenantId] || tenantId;
    };
    return (_jsxs(Box, { sx: {
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center"
        }, children: [_jsx(TextField, { size: "small", placeholder: "Search computer name, resource group...", variant: "outlined", value: filters.search || "", onChange: (e) => onChange({ ...filters, search: e.target.value || undefined }), InputProps: {
                    startAdornment: _jsx(SearchRoundedIcon, { sx: { mr: 1, color: "action.active" } }),
                } }), _jsxs(TextField, { size: "small", select: true, label: "Region", variant: "outlined", value: filters.region || "", onChange: (e) => onChange({ ...filters, region: e.target.value || undefined }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All Regions" }), filterOptions.regions.map((region) => (_jsx(MenuItem, { value: region, children: region }, region)))] }), _jsxs(TextField, { size: "small", select: true, label: "Subscription", variant: "outlined", value: filters.subscription || "", onChange: (e) => onChange({ ...filters, subscription: e.target.value || undefined }), sx: { minWidth: 200 }, children: [_jsx(MenuItem, { value: "", children: "All Subscriptions" }), filterOptions.subscriptions.map((sub) => (_jsx(MenuItem, { value: sub, children: sub }, sub)))] }), _jsxs(TextField, { size: "small", select: true, label: "Azure Tenant", variant: "outlined", value: filters.tenant_id || "", onChange: (e) => onChange({ ...filters, tenant_id: e.target.value || undefined }), sx: { minWidth: 200 }, children: [_jsx(MenuItem, { value: "", children: "All Tenants" }), filterOptions.tenants.map((tenant) => (_jsx(MenuItem, { value: tenant, children: getTenantDisplayName(tenant) }, tenant)))] }), _jsxs(TextField, { size: "small", select: true, label: "Status", variant: "outlined", value: filters.status || "", onChange: (e) => onChange({ ...filters, status: e.target.value || undefined }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All Status" }), filterOptions.statuses.map((status) => (_jsx(MenuItem, { value: status, children: status }, status)))] }), _jsx(Button, { variant: "outlined", startIcon: _jsx(ClearRoundedIcon, {}), onClick: () => onChange({ search: undefined, region: undefined, subscription: undefined, tenant_id: undefined, status: undefined }), children: "Clear" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(RefreshRoundedIcon, {}), onClick: onRefresh, children: "Refresh" })] }));
};
