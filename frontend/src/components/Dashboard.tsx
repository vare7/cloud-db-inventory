import { Alert, Box, Card, CardContent, Divider, Grid, Stack, Typography, Chip } from "@mui/material";
import { useMetrics } from "../hooks/useMetrics";
import { useInventory } from "../hooks/useInventory";
import { useUpgrades } from "../hooks/useUpgrades";
import { PieChart } from "./charts/PieChart";
import { BarChart } from "./charts/BarChart";
import { DashboardFiltersBar } from "./DashboardFiltersBar";
import { InventoryFilters } from "../types";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import { useState } from "react";

const COLORS = {
  postgres: "#2563eb", // blue
  mysql: "#f59e0b",    // orange
  mssql: "#10b981",    // green
};

export const Dashboard = () => {
  const [dashboardFilters, setDashboardFilters] = useState<InventoryFilters>({
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

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Dashboard</Typography>
        <Box>
          {/* Simple manual refresh */}
          <Typography variant="body2" sx={{ cursor: "pointer", color: "primary.main" }} onClick={refetch}>
            Refresh
          </Typography>
        </Box>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Dashboard Filters */}
      <DashboardFiltersBar filters={dashboardFilters} onChange={setDashboardFilters} />

      {/* Status Health Overview */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#f0fdf4", border: "1px solid #10b981" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleRoundedIcon sx={{ fontSize: 40, color: "#10b981" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Running</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.by_status?.available || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#fef2f2", border: "1px solid #ef4444" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <ErrorRoundedIcon sx={{ fontSize: 40, color: "#ef4444" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Stopped</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.by_status?.stopped || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#fffbeb", border: "1px solid #f59e0b" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <BuildRoundedIcon sx={{ fontSize: 40, color: "#f59e0b" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Maintenance</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.by_status?.maintenance || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: "#fef2f2", border: "1px solid #ef4444" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <WarningRoundedIcon sx={{ fontSize: 40, color: "#ef4444" }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Upgrades Needed</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {upgradesData?.total || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Regional Distribution */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>Regional Distribution</Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading...</Typography>
              ) : (
                <Grid container spacing={2}>
                  {stats?.by_provider && Object.entries(stats.by_provider).map(([provider, count]) => (
                    <Grid item xs={12} sm={6} md={4} key={provider}>
                      <Box sx={{ p: 2, bgcolor: "#f3f4f6", borderRadius: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" fontWeight={600}>{provider}</Typography>
                          <Chip 
                            label={count} 
                            size="small" 
                            color={provider === "AWS" ? "primary" : "secondary"}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Storage Analytics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CloudQueueRoundedIcon sx={{ color: "#2563eb" }} />
                  <Typography variant="body2" color="text.secondary">Total Storage</Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats?.storage_gb_total?.toLocaleString() || 0} GB
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Total Databases</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats?.total || 0}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">Avg Storage per DB</Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {stats?.total ? Math.round((stats.storage_gb_total || 0) / stats.total) : 0} GB
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Existing RDBMS Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>RDBMS Mix (Pie)</Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading metrics...</Typography>
              ) : (
                <Stack direction="row" spacing={3} alignItems="center">
                  <PieChart slices={pieSlices} />
                  <Stack spacing={1}>
                    {pieSlices.map((s) => (
                      <Stack key={s.label} direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 12, height: 12, bgcolor: s.color }} />
                        <Typography variant="body2">
                          {s.label}: {s.value}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Versions by RDBMS (Bar)</Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">Loading metrics...</Typography>
              ) : (
                <BarChart series={series} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
};
