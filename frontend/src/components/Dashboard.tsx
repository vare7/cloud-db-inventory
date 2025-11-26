import { Alert, Box, Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import { useMetrics } from "../hooks/useMetrics";
import { PieChart } from "./charts/PieChart";
import { BarChart } from "./charts/BarChart";

const COLORS = {
  postgres: "#2563eb", // blue
  mysql: "#f59e0b",    // orange
  mssql: "#10b981",    // green
};

export const Dashboard = () => {
  const { data, loading, error, refetch } = useMetrics();

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
