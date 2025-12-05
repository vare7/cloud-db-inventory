import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Alert, Box, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Paper, Chip, Button, Menu, ListItemIcon, ListItemText } from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import { useState, useEffect } from "react";
import { useUpgrades } from "../hooks/useUpgrades";
import { downloadCSV, downloadExcel } from "../utils/exportUtils";
const ENGINE_COLORS = {
    postgres: "#2563eb",
    mysql: "#f59e0b",
    mssql: "#10b981",
};
const statusColor = {
    available: "success",
    ready: "success",
    stopped: "error",
    maintenance: "warning",
    warning: "error",
};
const statusLabel = {
    available: "Running",
    ready: "Running",
    stopped: "Stopped",
    maintenance: "Maintenance",
    warning: "Warning"
};
const DEFAULT_COLUMN_WIDTHS = {
    provider: 100,
    service: 150,
    engine: 150,
    version: 150,
    region: 150,
    endpoint: 250,
    status: 120,
    subscription: 180
};
export const Upgrades = ({ excludeStopped = false }) => {
    const { data, loading, error, refetch } = useUpgrades({ excludeStopped });
    const [filterProvider, setFilterProvider] = useState("all");
    const [filterEngine, setFilterEngine] = useState("all");
    const [filterRegion, setFilterRegion] = useState("all");
    const [filterVersion, setFilterVersion] = useState("all");
    const [filterSubscription, setFilterSubscription] = useState("all");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
    const [resizing, setResizing] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    useEffect(() => {
        if (!resizing)
            return;
        const handleMouseMove = (e) => {
            if (!resizing)
                return;
            const diff = e.clientX - resizing.startX;
            const newWidth = Math.max(80, resizing.startWidth + diff);
            setColumnWidths(prev => ({ ...prev, [resizing.column]: newWidth }));
        };
        const handleMouseUp = () => {
            setResizing(null);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizing]);
    const handleResizeStart = (column, e) => {
        e.preventDefault();
        setResizing({ column, startX: e.clientX, startWidth: columnWidths[column] });
    };
    // Get unique regions based on selected provider
    const availableRegions = data?.databases
        .filter((db) => filterProvider === "all" || db.provider === filterProvider)
        .map((db) => db.region)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort() || [];
    // Get unique versions
    const availableVersions = data?.databases
        .map((db) => db.version)
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .sort() || [];
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
    const majorVersions = Array.from(new Set(availableVersions.map(v => extractMajorVersion(v)))).sort();
    // Get unique subscriptions
    const availableSubscriptions = data?.databases
        .map((db) => db.subscription)
        .filter((value, index, self) => value && self.indexOf(value) === index)
        .sort() || [];
    // Reset region filter when provider changes
    useEffect(() => {
        setFilterRegion("all");
    }, [filterProvider]);
    const filteredDatabases = data?.databases.filter((db) => {
        // Provider filter
        if (filterProvider !== "all" && db.provider !== filterProvider)
            return false;
        // Engine filter
        if (filterEngine !== "all") {
            const eng = db.engine.toLowerCase();
            if (filterEngine === "postgres" && !eng.includes("postgre"))
                return false;
            if (filterEngine === "mysql" && !eng.includes("mysql"))
                return false;
            if (filterEngine === "mssql" &&
                !(eng.includes("mssql") || eng.includes("sql server") || eng.includes("sqlserver")))
                return false;
        }
        // Region filter
        if (filterRegion !== "all" && db.region !== filterRegion)
            return false;
        // Version filter - match by major version prefix
        if (filterVersion !== "all" && db.version) {
            const dbMajorVersion = extractMajorVersion(db.version);
            if (dbMajorVersion !== filterVersion)
                return false;
        }
        // Subscription filter
        if (filterSubscription !== "all" && db.subscription !== filterSubscription)
            return false;
        return true;
    }) || [];
    // Calculate counts from filtered databases
    const filteredCounts = {
        total: filteredDatabases.length,
        postgres: filteredDatabases.filter(db => db.engine.toLowerCase().includes("postgre")).length,
        mysql: filteredDatabases.filter(db => db.engine.toLowerCase().includes("mysql")).length,
        mssql: filteredDatabases.filter(db => {
            const eng = db.engine.toLowerCase();
            return eng.includes("mssql") || eng.includes("sql server") || eng.includes("sqlserver");
        }).length
    };
    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleDownloadMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleDownloadMenuClose = () => {
        setAnchorEl(null);
    };
    const handleDownloadCSV = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(filteredDatabases, `upgrades-export-${timestamp}.csv`);
        handleDownloadMenuClose();
    };
    const handleDownloadExcel = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadExcel(filteredDatabases, `upgrades-export-${timestamp}.xls`);
        handleDownloadMenuClose();
    };
    const paginatedDatabases = filteredDatabases.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return (_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(WarningRoundedIcon, { fontSize: "large", sx: { color: "#f59e0b" } }), _jsx(Typography, { variant: "h5", children: "Databases Needing Upgrades" })] }), _jsx(Box, { children: _jsx(Typography, { variant: "body2", sx: { cursor: "pointer", color: "primary.main" }, onClick: refetch, children: "Refresh" }) })] }), error && _jsx(Alert, { severity: "error", children: error }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "Total" }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: loading ? "..." : filteredCounts.total })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Box, { sx: {
                                                    width: 12,
                                                    height: 12,
                                                    bgcolor: ENGINE_COLORS.postgres,
                                                    borderRadius: 1,
                                                } }), _jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "Postgres" })] }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: loading ? "..." : filteredCounts.postgres })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Box, { sx: {
                                                    width: 12,
                                                    height: 12,
                                                    bgcolor: ENGINE_COLORS.mysql,
                                                    borderRadius: 1,
                                                } }), _jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "MySQL" })] }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: loading ? "..." : filteredCounts.mysql })] }) }) }), _jsx(Grid, { item: true, xs: 12, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Box, { sx: {
                                                    width: 12,
                                                    height: 12,
                                                    bgcolor: ENGINE_COLORS.mssql,
                                                    borderRadius: 1,
                                                } }), _jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: "SQL Server" })] }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700 }, children: loading ? "..." : filteredCounts.mssql })] }) }) })] }), _jsxs(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 2 }, children: [_jsxs(TextField, { select: true, size: "small", label: "Provider", value: filterProvider, onChange: (e) => setFilterProvider(e.target.value), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "All" }), _jsx(MenuItem, { value: "AWS", children: "AWS" }), _jsx(MenuItem, { value: "Azure", children: "Azure" })] }), _jsxs(TextField, { select: true, size: "small", label: "Engine", value: filterEngine, onChange: (e) => setFilterEngine(e.target.value), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "All" }), _jsx(MenuItem, { value: "postgres", children: "Postgres" }), _jsx(MenuItem, { value: "mysql", children: "MySQL" }), _jsx(MenuItem, { value: "mssql", children: "SQL Server" })] }), _jsxs(TextField, { select: true, size: "small", label: "Region", value: filterRegion, onChange: (e) => setFilterRegion(e.target.value), sx: { minWidth: 150 }, disabled: availableRegions.length === 0, children: [_jsx(MenuItem, { value: "all", children: "All" }), availableRegions.map((region) => (_jsx(MenuItem, { value: region, children: region }, region)))] }), _jsxs(TextField, { select: true, size: "small", label: "Current Version", value: filterVersion, onChange: (e) => setFilterVersion(e.target.value), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "All" }), majorVersions.map((version) => (_jsx(MenuItem, { value: version, children: version }, version)))] }), _jsxs(TextField, { select: true, size: "small", label: "Subscription", value: filterSubscription, onChange: (e) => setFilterSubscription(e.target.value), sx: { minWidth: 180 }, children: [_jsx(MenuItem, { value: "all", children: "All" }), availableSubscriptions.map((subscription) => (_jsx(MenuItem, { value: subscription, children: subscription }, subscription)))] }), _jsx(Button, { variant: "outlined", startIcon: _jsx(ClearRoundedIcon, {}), onClick: () => {
                            setFilterProvider("all");
                            setFilterEngine("all");
                            setFilterRegion("all");
                            setFilterVersion("all");
                            setFilterSubscription("all");
                        }, children: "Clear" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(DownloadRoundedIcon, {}), onClick: handleDownloadMenuOpen, disabled: filteredDatabases.length === 0, children: "Export" }), _jsxs(Menu, { anchorEl: anchorEl, open: Boolean(anchorEl), onClose: handleDownloadMenuClose, children: [_jsxs(MenuItem, { onClick: handleDownloadCSV, children: [_jsx(ListItemIcon, { children: _jsx(DescriptionRoundedIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Download as CSV" })] }), _jsxs(MenuItem, { onClick: handleDownloadExcel, children: [_jsx(ListItemIcon, { children: _jsx(TableChartRoundedIcon, { fontSize: "small" }) }), _jsx(ListItemText, { children: "Download as Excel" })] })] })] }), _jsxs(Paper, { children: [_jsx(TableContainer, { children: _jsxs(Table, { sx: { tableLayout: 'fixed' }, children: [_jsx(TableHead, { children: _jsx(TableRow, { children: [
                                            { key: 'provider', label: 'Provider' },
                                            { key: 'service', label: 'Service' },
                                            { key: 'engine', label: 'Engine' },
                                            { key: 'version', label: 'Current Version' },
                                            { key: 'region', label: 'Region' },
                                            { key: 'endpoint', label: 'Endpoint' },
                                            { key: 'status', label: 'Status' },
                                            { key: 'subscription', label: 'Subscription' },
                                        ].map((col) => (_jsxs(TableCell, { sx: {
                                                width: columnWidths[col.key],
                                                position: 'relative',
                                                userSelect: 'none'
                                            }, children: [col.label, _jsx(Box, { onMouseDown: (e) => handleResizeStart(col.key, e), sx: {
                                                        position: 'absolute',
                                                        right: 0,
                                                        top: 0,
                                                        bottom: 0,
                                                        width: '5px',
                                                        cursor: 'col-resize',
                                                        userSelect: 'none',
                                                        '&:hover': {
                                                            backgroundColor: 'primary.main',
                                                            opacity: 0.3
                                                        }
                                                    } })] }, col.key))) }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading..." }) }) })) : filteredDatabases.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No databases need upgrades." }) }) })) : (paginatedDatabases.map((row) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.provider }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.service }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.engine }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: row.version || "unknown", color: "warning", variant: "outlined" }) }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.region }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.endpoint }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: statusLabel[row.status], color: statusColor[row.status], sx: { textTransform: "capitalize" } }) }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.subscription })] }, row.id)))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 15, 25, 50], component: "div", count: filteredDatabases.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage })] })] }));
};
