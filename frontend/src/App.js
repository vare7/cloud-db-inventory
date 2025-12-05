import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Alert, Box, Button, Container, Stack, Typography, ThemeProvider, CssBaseline, Tabs, Tab, Switch, FormControlLabel } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { theme } from "./theme";
import { useState } from "react";
import { FiltersBar } from "./components/FiltersBar";
import { InventoryTable } from "./components/InventoryTable";
import { StatCards } from "./components/StatCards";
import { AddDatabaseDrawer } from "./components/AddDatabaseDrawer";
import { CsvUploadDialog } from "./components/CsvUploadDialog";
import { AzureVMCsvUploadDialog } from "./components/AzureVMCsvUploadDialog";
import { AWSAccountCsvUploadDialog } from "./components/AWSAccountCsvUploadDialog";
import { useInventory } from "./hooks/useInventory";
import { useAzureVMs } from "./hooks/useAzureVMs";
import { Dashboard } from "./components/Dashboard";
import { Upgrades } from "./components/Upgrades";
import PricingCalculator from "./components/PricingCalculator";
import { AzureVMsTable } from "./components/AzureVMsTable";
import { AzureVMFiltersBar } from "./components/AzureVMFiltersBar";
function App() {
    const { data, stats, loading, error, filters, setFilters, refetch, createRecord, deleteRecord } = useInventory();
    const { data: vmData, loading: vmLoading, error: vmError, filters: vmFilters, setFilters: setVMFilters, refetch: refetchVMs, deleteRecord: deleteVM } = useAzureVMs();
    const [csvDialogOpen, setCsvDialogOpen] = useState(false);
    const [vmCsvDialogOpen, setVMCsvDialogOpen] = useState(false);
    const [awsAccountDialogOpen, setAwsAccountDialogOpen] = useState(false);
    const [tab, setTab] = useState(0);
    const [excludeStopped, setExcludeStopped] = useState(() => {
        const stored = localStorage.getItem("excludeStopped");
        return stored === null ? false : stored === "true";
    });
    const [showDashboard, setShowDashboard] = useState(() => {
        const stored = localStorage.getItem("showDashboard");
        return stored === null ? true : stored === "true";
    });
    const [showUpgrades, setShowUpgrades] = useState(() => {
        const stored = localStorage.getItem("showUpgrades");
        return stored === null ? true : stored === "true";
    });
    const [showPricing, setShowPricing] = useState(() => {
        const stored = localStorage.getItem("showPricing");
        return stored === null ? true : stored === "true";
    });
    const toggleExcludeStopped = (_, checked) => {
        setExcludeStopped(checked);
        localStorage.setItem("excludeStopped", checked ? "true" : "false");
        // Update filters to apply/remove stopped exclusion
        setFilters({ ...filters, excludeStopped: checked });
    };
    const toggleDashboard = (_, checked) => {
        setShowDashboard(checked);
        localStorage.setItem("showDashboard", checked ? "true" : "false");
        if (!checked && tab === 1)
            setTab(0);
    };
    const toggleUpgrades = (_, checked) => {
        setShowUpgrades(checked);
        localStorage.setItem("showUpgrades", checked ? "true" : "false");
        const upgradesTabIndex = showDashboard ? 2 : 1;
        if (!checked && tab === upgradesTabIndex)
            setTab(0);
    };
    const togglePricing = (_, checked) => {
        setShowPricing(checked);
        localStorage.setItem("showPricing", checked ? "true" : "false");
        let pricingTabIndex = 1;
        if (showDashboard)
            pricingTabIndex++;
        if (showUpgrades)
            pricingTabIndex++;
        if (!checked && tab === pricingTabIndex)
            setTab(0);
    };
    return (_jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(Box, { sx: { minHeight: '100vh', bgcolor: 'background.default' }, children: _jsxs(Container, { maxWidth: "xl", sx: { py: 4 }, children: [_jsxs(Stack, { spacing: 3, children: [_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "space-between", sx: { flexWrap: "wrap", gap: 2 }, children: [_jsxs(Box, { children: [_jsx(Typography, { variant: "h4", sx: { mb: 0.5 }, children: "Cloud DB Inventory" }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Manage AWS and Azure database resources" })] }), _jsxs(Stack, { direction: "row", spacing: 1, sx: { flexWrap: "wrap", justifyContent: "flex-end" }, children: [_jsx(Button, { variant: "contained", size: "small", startIcon: _jsx(CloudUploadRoundedIcon, {}), onClick: () => setCsvDialogOpen(true), children: "Import CSV" }), _jsx(Button, { variant: "outlined", size: "small", startIcon: _jsx(CloudUploadRoundedIcon, {}), onClick: () => setAwsAccountDialogOpen(true), children: "Import AWS Accounts" }), _jsx(AddDatabaseDrawer, { onCreate: createRecord }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: excludeStopped, onChange: toggleExcludeStopped, size: "small" }), label: "Exclude Stopped", sx: { whiteSpace: "nowrap" } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: showDashboard, onChange: toggleDashboard, size: "small" }), label: "Dashboard", sx: { whiteSpace: "nowrap" } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: showUpgrades, onChange: toggleUpgrades, size: "small" }), label: "Upgrades", sx: { whiteSpace: "nowrap" } }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: showPricing, onChange: togglePricing, size: "small" }), label: "Pricing", sx: { whiteSpace: "nowrap" } })] })] }), _jsx(Box, { children: _jsxs(Tabs, { value: tab, onChange: (_e, v) => setTab(v), sx: { mb: 2 }, children: [_jsx(Tab, { label: "Inventory" }), _jsx(Tab, { label: "Azure VMs" }), showDashboard && _jsx(Tab, { label: "Dashboard" }), showUpgrades && _jsx(Tab, { label: "Upgrades" }), showPricing && _jsx(Tab, { label: "Pricing Calculator" })] }) }), tab === 0 && (_jsxs(_Fragment, { children: [_jsx(StatCards, { stats: stats }), _jsx(FiltersBar, { filters: filters, onChange: setFilters, onRefresh: refetch, data: data }), error && (_jsx(Alert, { severity: "error", children: error })), _jsx(InventoryTable, { rows: data, loading: loading, onDelete: deleteRecord })] })), tab === 1 && (_jsxs(_Fragment, { children: [_jsxs(Stack, { direction: "row", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "h6", children: "Azure Virtual Machines" }), _jsx(Button, { variant: "contained", startIcon: _jsx(CloudUploadRoundedIcon, {}), onClick: () => setVMCsvDialogOpen(true), children: "Import VMs CSV" })] }), _jsx(AzureVMFiltersBar, { filters: vmFilters, onChange: setVMFilters, onRefresh: refetchVMs }), vmError && (_jsx(Alert, { severity: "error", children: vmError })), _jsx(AzureVMsTable, { rows: vmData, loading: vmLoading, onDelete: deleteVM })] })), showDashboard && tab === (() => {
                                    let idx = 2;
                                    return idx;
                                })() && (_jsx(Dashboard, {})), showUpgrades && tab === (() => {
                                    let idx = 3;
                                    return idx;
                                })() && (_jsx(Upgrades, { excludeStopped: excludeStopped })), showPricing && tab === (() => {
                                    let idx = 4;
                                    return idx;
                                })() && (_jsx(PricingCalculator, { excludeStopped: excludeStopped }))] }), _jsx(CsvUploadDialog, { open: csvDialogOpen, onClose: () => setCsvDialogOpen(false), onSuccess: refetch }), _jsx(AzureVMCsvUploadDialog, { open: vmCsvDialogOpen, onClose: () => setVMCsvDialogOpen(false), onSuccess: refetchVMs }), _jsx(AWSAccountCsvUploadDialog, { open: awsAccountDialogOpen, onClose: () => setAwsAccountDialogOpen(false), onSuccess: refetch })] }) })] }));
}
export default App;
