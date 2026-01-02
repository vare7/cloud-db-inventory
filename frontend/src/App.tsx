import { Alert, Box, Button, Container, Divider, Stack, Typography, ThemeProvider, CssBaseline, Tabs, Tab, Switch, FormControlLabel, IconButton, Tooltip } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { lightTheme, darkTheme } from "./theme";
import { useState, useMemo, useEffect } from "react";
import { FiltersBar } from "./components/FiltersBar";
import { InventoryTable } from "./components/InventoryTable";
import { StatCards } from "./components/StatCards";
import { AddDatabaseDrawer } from "./components/AddDatabaseDrawer";
import { CsvUploadDialog } from "./components/CsvUploadDialog";
import { AzureVMCsvUploadDialog } from "./components/AzureVMCsvUploadDialog";
import { AWSAccountCsvUploadDialog } from "./components/AWSAccountCsvUploadDialog";
import { useInventory } from "./hooks/useInventory";
import { useAzureVMs } from "./hooks/useAzureVMs";
import { InventoryFilters } from "./types";
import { Dashboard } from "./components/Dashboard";
import { Upgrades } from "./components/Upgrades";
import PricingCalculator from "./components/PricingCalculator";
import { AzureVMsTable } from "./components/AzureVMsTable";
import { AzureVMFiltersBar } from "./components/AzureVMFiltersBar";
import { SqlServerBuilds } from "./components/SqlServerBuilds";

function App() {
  // Initialize excludeStopped state first so we can use it for useInventory
  const [excludeStopped, setExcludeStopped] = useState<boolean>(() => {
    const stored = localStorage.getItem("excludeStopped");
    const value = stored === null ? true : stored === "true";
    console.log("[App] Initializing excludeStopped from localStorage:", value);
    return value;
  });
  
  // Pass excludeStopped to useInventory initial filters
  const initialInventoryFilters: InventoryFilters = {
    provider: "",
    status: "",
    region: "",
    engine: "",
    version: "",
    subscription: "",
    search: "",
    excludeStopped: excludeStopped
  };
  console.log("[App] Passing initialFilters to useInventory:", initialInventoryFilters);
  
  const { data, stats, loading, error, filters, setFilters, refetch, createRecord, deleteRecord } = useInventory(initialInventoryFilters);
  
  const { data: vmData, loading: vmLoading, error: vmError, filters: vmFilters, setFilters: setVMFilters, refetch: refetchVMs, deleteRecord: deleteVM } = useAzureVMs();
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [vmCsvDialogOpen, setVMCsvDialogOpen] = useState(false);
  const [awsAccountDialogOpen, setAwsAccountDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("darkMode");
    return stored === null ? false : stored === "true";
  });
  const [showDashboard, setShowDashboard] = useState<boolean>(() => {
    const stored = localStorage.getItem("showDashboard");
    return stored === null ? true : stored === "true";
  });
  const [showUpgrades, setShowUpgrades] = useState<boolean>(() => {
    const stored = localStorage.getItem("showUpgrades");
    return stored === null ? true : stored === "true";
  });
  const [showPricing, setShowPricing] = useState<boolean>(() => {
    const stored = localStorage.getItem("showPricing");
    return stored === null ? true : stored === "true";
  });
  const [showSqlBuilds, setShowSqlBuilds] = useState<boolean>(() => {
    const stored = localStorage.getItem("showSqlBuilds");
    return stored === null ? true : stored === "true";
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "true" : "false");
  };

  const currentTheme = useMemo(() => darkMode ? darkTheme : lightTheme, [darkMode]);

  const toggleExcludeStopped = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setExcludeStopped(checked);
    localStorage.setItem("excludeStopped", checked ? "true" : "false");
    setFilters({ ...filters, excludeStopped: checked });
  };

  const toggleDashboard = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setShowDashboard(checked);
    localStorage.setItem("showDashboard", checked ? "true" : "false");
    if (!checked && tab === 1) setTab(0);
  };

  const toggleUpgrades = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setShowUpgrades(checked);
    localStorage.setItem("showUpgrades", checked ? "true" : "false");
    const upgradesTabIndex = showDashboard ? 2 : 1;
    if (!checked && tab === upgradesTabIndex) setTab(0);
  };

  const togglePricing = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setShowPricing(checked);
    localStorage.setItem("showPricing", checked ? "true" : "false");
    let pricingTabIndex = 1;
    if (showDashboard) pricingTabIndex++;
    if (showUpgrades) pricingTabIndex++;
    if (!checked && tab === pricingTabIndex) setTab(0);
  };

  const toggleSqlBuilds = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setShowSqlBuilds(checked);
    localStorage.setItem("showSqlBuilds", checked ? "true" : "false");
    let sqlBuildsTabIndex = 1;
    if (showDashboard) sqlBuildsTabIndex++;
    if (showUpgrades) sqlBuildsTabIndex++;
    if (showPricing) sqlBuildsTabIndex++;
    if (!checked && tab === sqlBuildsTabIndex) setTab(0);
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Cloud DB Inventory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage AWS and Azure database resources
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end", alignItems: "center" }}>
                <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                  <IconButton onClick={toggleDarkMode} color="primary" size="small">
                    {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={() => setCsvDialogOpen(true)}
                >
                  Import CSV
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={() => setAwsAccountDialogOpen(true)}
                >
                  Import AWS Accounts
                </Button>
                <AddDatabaseDrawer onCreate={createRecord} />
                <FormControlLabel
                  control={<Switch checked={excludeStopped} onChange={toggleExcludeStopped} size="small" />}
                  label="Exclude Stopped"
                  sx={{ whiteSpace: "nowrap" }}
                />
                <FormControlLabel
                  control={<Switch checked={showDashboard} onChange={toggleDashboard} size="small" />}
                  label="Dashboard"
                  sx={{ whiteSpace: "nowrap" }}
                />
                <FormControlLabel
                  control={<Switch checked={showUpgrades} onChange={toggleUpgrades} size="small" />}
                  label="Upgrades"
                  sx={{ whiteSpace: "nowrap" }}
                />
                <FormControlLabel
                  control={<Switch checked={showPricing} onChange={togglePricing} size="small" />}
                  label="Pricing"
                  sx={{ whiteSpace: "nowrap" }}
                />
                <FormControlLabel
                  control={<Switch checked={showSqlBuilds} onChange={toggleSqlBuilds} size="small" />}
                  label="SQL Builds"
                  sx={{ whiteSpace: "nowrap" }}
                />
              </Stack>
            </Stack>

            {/* Tabs */}
            <Box>
              <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Inventory" />
                <Tab label="Azure VMs" />
                {showDashboard && <Tab label="Dashboard" />}
                {showUpgrades && <Tab label="Upgrades" />}
                {showPricing && <Tab label="Pricing Calculator" />}
                {showSqlBuilds && <Tab label="SQL Builds" />}
              </Tabs>
            </Box>

            {tab === 0 && (
              <>
                {/* Stats Cards */}
                <StatCards stats={stats} excludeStopped={excludeStopped} />
                {/* Filters */}
                <FiltersBar filters={filters} onChange={setFilters} onRefresh={refetch} data={data} />
                {/* Error Alert */}
                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}
                {/* Table */}
                <InventoryTable rows={data} loading={loading} onDelete={deleteRecord} />
              </>
            )}

            {tab === 1 && (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Azure Virtual Machines</Typography>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadRoundedIcon />}
                    onClick={() => setVMCsvDialogOpen(true)}
                  >
                    Import VMs CSV
                  </Button>
                </Stack>
                {/* Azure VMs Filters */}
                <AzureVMFiltersBar filters={vmFilters} onChange={setVMFilters} onRefresh={refetchVMs} />
                {/* Error Alert */}
                {vmError && (
                  <Alert severity="error">
                    {vmError}
                  </Alert>
                )}
                {/* Azure VMs Table */}
                <AzureVMsTable rows={vmData} loading={vmLoading} onDelete={deleteVM} />
              </>
            )}

            {showDashboard && tab === (() => {
              let idx = 2;
              return idx;
            })() && (
              <Dashboard />
            )}

            {showUpgrades && tab === (() => {
              let idx = 3;
              return idx;
            })() && (
              <Upgrades excludeStopped={excludeStopped} />
            )}

            {showPricing && tab === (() => {
              let idx = 4;
              return idx;
            })() && (
              <PricingCalculator excludeStopped={excludeStopped} />
            )}

            {showSqlBuilds && tab === (() => {
              let idx = 5;
              return idx;
            })() && (
              <SqlServerBuilds />
            )}
          </Stack>

          {/* CSV Upload Dialog */}
          <CsvUploadDialog
            open={csvDialogOpen}
            onClose={() => setCsvDialogOpen(false)}
            onSuccess={refetch}
          />

          {/* Azure VM CSV Upload Dialog */}
          <AzureVMCsvUploadDialog
            open={vmCsvDialogOpen}
            onClose={() => setVMCsvDialogOpen(false)}
            onSuccess={refetchVMs}
          />

          {/* AWS Account CSV Upload Dialog */}
          <AWSAccountCsvUploadDialog
            open={awsAccountDialogOpen}
            onClose={() => setAwsAccountDialogOpen(false)}
            onSuccess={refetch}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;


