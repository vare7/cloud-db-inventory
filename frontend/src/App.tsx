import { Alert, Box, Button, Container, Divider, Stack, Typography, ThemeProvider, CssBaseline, Tabs, Tab, Switch, FormControlLabel } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { theme } from "./theme";
import { useState } from "react";
import { FiltersBar } from "./components/FiltersBar";
import { InventoryTable } from "./components/InventoryTable";
import { StatCards } from "./components/StatCards";
import { AddDatabaseDrawer } from "./components/AddDatabaseDrawer";
import { CsvUploadDialog } from "./components/CsvUploadDialog";
import { useInventory } from "./hooks/useInventory";
import { Dashboard } from "./components/Dashboard";
import { Upgrades } from "./components/Upgrades";

function App() {
  const { data, stats, loading, error, filters, setFilters, refetch, createRecord, deleteRecord } = useInventory();
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [showDashboard, setShowDashboard] = useState<boolean>(() => {
    const stored = localStorage.getItem("showDashboard");
    return stored === null ? true : stored === "true";
  });
  const [showUpgrades, setShowUpgrades] = useState<boolean>(() => {
    const stored = localStorage.getItem("showUpgrades");
    return stored === null ? true : stored === "true";
  });

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Cloud DB Inventory
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage AWS and Azure database resources
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={() => setCsvDialogOpen(true)}
                >
                  Import CSV
                </Button>
                <AddDatabaseDrawer onCreate={createRecord} />
                <FormControlLabel
                  control={<Switch checked={showDashboard} onChange={toggleDashboard} />}
                  label="Dashboard"
                />
                <FormControlLabel
                  control={<Switch checked={showUpgrades} onChange={toggleUpgrades} />}
                  label="Upgrades"
                />
              </Stack>
            </Stack>

            {/* Tabs */}
            <Box>
              <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label="Inventory" />
                {showDashboard && <Tab label="Dashboard" />}
                {showUpgrades && <Tab label="Upgrades" />}
              </Tabs>
            </Box>

            {tab === 0 && (
              <>
                {/* Stats Cards */}
                <StatCards stats={stats} />
                {/* Filters */}
                <FiltersBar filters={filters} onChange={setFilters} onRefresh={refetch} />
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

            {showDashboard && tab === 1 && (
              <Dashboard />
            )}

            {showUpgrades && tab === (showDashboard ? 2 : 1) && (
              <Upgrades />
            )}
          </Stack>

          {/* CSV Upload Dialog */}
          <CsvUploadDialog
            open={csvDialogOpen}
            onClose={() => setCsvDialogOpen(false)}
            onSuccess={refetch}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;


