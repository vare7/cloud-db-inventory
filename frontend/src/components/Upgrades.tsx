import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
} from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { useState, useEffect } from "react";
import { useUpgrades } from "../hooks/useUpgrades";
import { DatabaseRecord } from "../types";

const ENGINE_COLORS = {
  postgres: "#2563eb",
  mysql: "#f59e0b",
  mssql: "#10b981",
};

const statusColor: Record<DatabaseRecord["status"], "success" | "warning" | "error"> = {
  available: "success",
  maintenance: "warning",
  warning: "error",
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

export const Upgrades = () => {
  const { data, loading, error, refetch } = useUpgrades();
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterEngine, setFilterEngine] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterVersion, setFilterVersion] = useState<string>("all");
  const [filterSubscription, setFilterSubscription] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [resizing, setResizing] = useState<{ column: keyof typeof DEFAULT_COLUMN_WIDTHS; startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
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

  const handleResizeStart = (column: keyof typeof DEFAULT_COLUMN_WIDTHS, e: React.MouseEvent) => {
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
    .sort() as string[] || [];

  // Extract major version (e.g., "8.0.35" -> "8.0", "15.4" -> "15")
  const extractMajorVersion = (version: string): string => {
    if (!version) return version;
    const parts = version.split('.');
    // For versions like 8.0.35, return major.minor (8.0)
    // For versions like 15.4, return major (15)
    // For SQL Server versions like "SQL Server 2019", return as is
    if (version.toLowerCase().includes('sql server')) return version;
    if (parts.length >= 2 && parseInt(parts[0]) < 10) {
      return `${parts[0]}.${parts[1]}`;
    }
    return parts[0];
  };

  // Get unique major versions for dropdown
  const majorVersions = Array.from(
    new Set(availableVersions.map(v => extractMajorVersion(v)))
  ).sort();

  // Get unique subscriptions
  const availableSubscriptions = data?.databases
    .map((db) => db.subscription)
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .sort() || [];

  // Reset region filter when provider changes
  useEffect(() => {
    setFilterRegion("all");
  }, [filterProvider]);

  const filteredDatabases =
    data?.databases.filter((db) => {
      // Provider filter
      if (filterProvider !== "all" && db.provider !== filterProvider) return false;

      // Engine filter
      if (filterEngine !== "all") {
        const eng = db.engine.toLowerCase();
        if (filterEngine === "postgres" && !eng.includes("postgre")) return false;
        if (filterEngine === "mysql" && !eng.includes("mysql")) return false;
        if (filterEngine === "mssql" && 
            !(eng.includes("mssql") || eng.includes("sql server") || eng.includes("sqlserver"))) return false;
      }

      // Region filter
      if (filterRegion !== "all" && db.region !== filterRegion) return false;

      // Version filter - match by major version prefix
      if (filterVersion !== "all" && db.version) {
        const dbMajorVersion = extractMajorVersion(db.version);
        if (dbMajorVersion !== filterVersion) return false;
      }

      // Subscription filter
      if (filterSubscription !== "all" && db.subscription !== filterSubscription) return false;

      return true;
    }) || [];

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDatabases = filteredDatabases.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
          <WarningRoundedIcon fontSize="large" sx={{ color: "#f59e0b" }} />
          <Typography variant="h5">Databases Needing Upgrades</Typography>
        </Stack>
        <Box>
          <Typography
            variant="body2"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={refetch}
          >
            Refresh
          </Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      {/* Count Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? "..." : data?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: ENGINE_COLORS.postgres,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Postgres
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? "..." : data?.by_engine.postgres || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: ENGINE_COLORS.mysql,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  MySQL
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? "..." : data?.by_engine.mysql || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: ENGINE_COLORS.mssql,
                    borderRadius: 1,
                  }}
                />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  SQL Server
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {loading ? "..." : data?.by_engine.mssql || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Dropdowns */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          select
          size="small"
          label="Provider"
          value={filterProvider}
          onChange={(e) => setFilterProvider(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="AWS">AWS</MenuItem>
          <MenuItem value="Azure">Azure</MenuItem>
        </TextField>
        
        <TextField
          select
          size="small"
          label="Engine"
          value={filterEngine}
          onChange={(e) => setFilterEngine(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="postgres">Postgres</MenuItem>
          <MenuItem value="mysql">MySQL</MenuItem>
          <MenuItem value="mssql">SQL Server</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Region"
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          sx={{ minWidth: 150 }}
          disabled={availableRegions.length === 0}
        >
          <MenuItem value="all">All</MenuItem>
          {availableRegions.map((region) => (
            <MenuItem value={region} key={region}>
              {region}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Current Version"
          value={filterVersion}
          onChange={(e) => setFilterVersion(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All</MenuItem>
          {majorVersions.map((version) => (
            <MenuItem value={version} key={version}>
              {version}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Subscription"
          value={filterSubscription}
          onChange={(e) => setFilterSubscription(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          {availableSubscriptions.map((subscription) => (
            <MenuItem value={subscription} key={subscription}>
              {subscription}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                {[
                  { key: 'provider', label: 'Provider' },
                  { key: 'service', label: 'Service' },
                  { key: 'engine', label: 'Engine' },
                  { key: 'version', label: 'Current Version' },
                  { key: 'region', label: 'Region' },
                  { key: 'endpoint', label: 'Endpoint' },
                  { key: 'status', label: 'Status' },
                  { key: 'subscription', label: 'Subscription' },
                ].map((col) => (
                  <TableCell 
                    key={col.key}
                    sx={{ 
                      width: columnWidths[col.key as keyof typeof DEFAULT_COLUMN_WIDTHS],
                      position: 'relative',
                      userSelect: 'none'
                    }}
                  >
                    {col.label}
                    <Box
                      onMouseDown={(e) => handleResizeStart(col.key as keyof typeof DEFAULT_COLUMN_WIDTHS, e)}
                      sx={{
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
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">
                      Loading...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredDatabases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary">
                      No databases need upgrades.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDatabases.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.provider}</TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.service}</TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.engine}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.version || "unknown"}
                        color="warning"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.region}</TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.endpoint}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status}
                        color={statusColor[row.status]}
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.subscription}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 25, 50]}
          component="div"
          count={filteredDatabases.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Stack>
  );
};
