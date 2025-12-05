import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TextField, MenuItem, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { apiClient } from "../api/client";
const providers = ["AWS", "Azure"];
const statusDisplayMap = {
    available: "Running",
    ready: "Running",
    stopped: "Stopped",
    maintenance: "Maintenance",
    warning: "Warning"
};
export const DashboardFiltersBar = ({ filters, onChange }) => {
    const [filterOptions, setFilterOptions] = useState({
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
        if (version.toLowerCase().includes('sql server'))
            return version;
        if (parts.length >= 2 && parseInt(parts[0]) < 10) {
            return `${parts[0]}.${parts[1]}`;
        }
        return parts[0];
    };
    // Get unique major versions for dropdown
    const majorVersions = Array.from(new Set(filterOptions.versions.map(v => extractMajorVersion(v)))).sort();
    return (_jsxs(Stack, { direction: "row", spacing: 2, sx: {
            flexWrap: "wrap",
            alignItems: "center",
            padding: 2,
            backgroundColor: "#f9fafb",
            borderRadius: 1,
            border: "1px solid #e5e7eb"
        }, children: [_jsxs(TextField, { select: true, size: "small", label: "Provider", value: filters.provider ?? "", onChange: (e) => onChange({ ...filters, provider: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), providers.map((provider) => (_jsx(MenuItem, { value: provider, children: provider }, provider)))] }), _jsxs(TextField, { select: true, size: "small", label: "Engine", value: filters.engine ?? "", onChange: (e) => onChange({ ...filters, engine: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.engines.map((engine) => (_jsx(MenuItem, { value: engine, children: engine }, engine)))] }), _jsxs(TextField, { select: true, size: "small", label: "Version", value: filters.version ?? "", onChange: (e) => onChange({ ...filters, version: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), majorVersions.map((version) => (_jsx(MenuItem, { value: version, children: version }, version)))] }), _jsxs(TextField, { select: true, size: "small", label: "Subscription", value: filters.subscription ?? "", onChange: (e) => onChange({ ...filters, subscription: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.subscriptions.map((subscription) => (_jsx(MenuItem, { value: subscription, children: subscription }, subscription)))] }), _jsxs(TextField, { select: true, size: "small", label: "Status", value: filters.status ?? "", onChange: (e) => onChange({ ...filters, status: e.target.value }), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "", children: "All" }), filterOptions.statuses.map((status) => (_jsx(MenuItem, { value: status, children: statusDisplayMap[status] || status }, status)))] })] }));
};
