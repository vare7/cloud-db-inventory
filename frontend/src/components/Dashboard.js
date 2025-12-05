import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Box, Card, CardContent, Grid, Stack, Typography, Chip } from "@mui/material";
import { useMetrics } from "../hooks/useMetrics";
import { useInventory } from "../hooks/useInventory";
import { useUpgrades } from "../hooks/useUpgrades";
import { PieChart } from "./charts/PieChart";
import { BarChart } from "./charts/BarChart";
import { DashboardFiltersBar } from "./DashboardFiltersBar";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import { useState } from "react";
const COLORS = {
    postgres: "#2563eb", // blue
    mysql: "#f59e0b", // orange
    mssql: "#10b981", // green
};
export const Dashboard = () => {
    const [dashboardFilters, setDashboardFilters] = useState({
        provider: "",
        status: "",
        region: "",
        engine: "",
        version: "",
        subscription: "",
        search: ""
    });
    const { data, loading, error, refetch } = useMetrics(dashboardFilters);
    const { stats } = useInventory(dashboardFilters);
    const { data: upgradesData } = useUpgrades(dashboardFilters);
    const pieSlices = data
        ? [
            { label: "Postgres", value: data.rdbms_counts.postgres || 0, color: COLORS.postgres },
            { label: "MySQL", value: data.rdbms_counts.mysql || 0, color: COLORS.mysql },
            { label: "SQL Server", value: data.rdbms_counts.mssql || 0, color: COLORS.mssql },
        ]
        : [];
    const series = data
        ? [
            { key: "postgres", color: COLORS.postgres, values: data.version_counts.postgres || {} },
            { key: "mysql", color: COLORS.mysql, values: data.version_counts.mysql || {} },
            { key: "mssql", color: COLORS.mssql, values: data.version_counts.mssql || {} },
        ]
        : [];
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "h5", children: "Dashboard" }), _jsx(Box, { children: _jsx(Typography, { variant: "body2", sx: { cursor: "pointer", color: "primary.main" }, onClick: refetch, children: "Refresh" }) })] }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(DashboardFiltersBar, { filters: dashboardFilters, onChange: setDashboardFilters }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { sx: { bgcolor: "#f0fdf4", border: "1px solid #10b981" }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(CheckCircleRoundedIcon, { sx: { fontSize: 40, color: "#10b981" } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Running" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: stats?.by_status?.available || 0 })] })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { sx: { bgcolor: "#fef2f2", border: "1px solid #ef4444" }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(ErrorRoundedIcon, { sx: { fontSize: 40, color: "#ef4444" } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Stopped" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: stats?.by_status?.stopped || 0 })] })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { sx: { bgcolor: "#fffbeb", border: "1px solid #f59e0b" }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(BuildRoundedIcon, { sx: { fontSize: 40, color: "#f59e0b" } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Maintenance" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: stats?.by_status?.maintenance || 0 })] })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { sx: { bgcolor: "#fef2f2", border: "1px solid #ef4444" }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(WarningRoundedIcon, { sx: { fontSize: 40, color: "#ef4444" } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Upgrades Needed" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: upgradesData?.total || 0 })] })] }) }) }) })] }), _jsx(Grid, { container: true, spacing: 3, children: _jsx(Grid, { item: true, xs: 12, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle1", sx: { mb: 2 }, children: "Regional Distribution" }), loading ? (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading..." })) : (_jsx(Grid, { container: true, spacing: 2, children: stats?.by_provider && Object.entries(stats.by_provider).map(([provider, count]) => (_jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(Box, { sx: { p: 2, bgcolor: "#f3f4f6", borderRadius: 1 }, children: _jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "body2", fontWeight: 600, children: provider }), _jsx(Chip, { label: count, size: "small", color: provider === "AWS" ? "primary" : "secondary" })] }) }) }, provider))) }))] }) }) }) }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1, children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(CloudQueueRoundedIcon, { sx: { color: "#2563eb" } }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Storage" })] }), _jsxs(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: [stats?.storage_gb_total?.toLocaleString() || 0, " GB"] })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total Databases" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: stats?.total || 0 })] }) }) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs(Stack, { spacing: 1, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Avg Storage per DB" }), _jsxs(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: [stats?.total ? Math.round((stats.storage_gb_total || 0) / stats.total) : 0, " GB"] })] }) }) }) })] }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 12, md: 5, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle1", sx: { mb: 1 }, children: "RDBMS Mix (Pie)" }), loading ? (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading metrics..." })) : (_jsxs(Stack, { direction: "row", spacing: 3, alignItems: "center", children: [_jsx(PieChart, { slices: pieSlices }), _jsx(Stack, { spacing: 1, children: pieSlices.map((s) => (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Box, { sx: { width: 12, height: 12, bgcolor: s.color } }), _jsxs(Typography, { variant: "body2", children: [s.label, ": ", s.value] })] }, s.label))) })] }))] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 7, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "subtitle1", sx: { mb: 1 }, children: "Versions by RDBMS (Bar)" }), loading ? (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading metrics..." })) : (_jsx(BarChart, { series: series }))] }) }) })] })] }));
};
