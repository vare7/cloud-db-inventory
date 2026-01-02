import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  MenuItem,
  TablePagination,
  Link,
} from "@mui/material";
import { useState } from "react";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

interface SqlBuild {
  version: string;
  buildNumber: string;
  releaseDate: string;
  servicePackLevel: string;
  cumulativeUpdate: string;
  kb: string;
  supportEnd: string;
  maintenanceEnd: string;
}

const sqlServerBuilds: SqlBuild[] = [
  {
    version: "SQL Server 2022",
    buildNumber: "16.0.4095.4",
    releaseDate: "2024-09-12",
    servicePackLevel: "RTM",
    cumulativeUpdate: "CU14",
    kb: "5038325",
    supportEnd: "2028-01-11",
    maintenanceEnd: "2033-01-11",
  },
  {
    version: "SQL Server 2022",
    buildNumber: "16.0.4085.2",
    releaseDate: "2024-08-14",
    servicePackLevel: "RTM",
    cumulativeUpdate: "CU13",
    kb: "5036432",
    supportEnd: "2028-01-11",
    maintenanceEnd: "2033-01-11",
  },
  {
    version: "SQL Server 2019",
    buildNumber: "15.0.4375.4",
    releaseDate: "2024-09-12",
    servicePackLevel: "RTM",
    cumulativeUpdate: "CU28",
    kb: "5038325",
    supportEnd: "2025-02-28",
    maintenanceEnd: "2030-01-08",
  },
  {
    version: "SQL Server 2019",
    buildNumber: "15.0.4365.2",
    releaseDate: "2024-08-14",
    servicePackLevel: "RTM",
    cumulativeUpdate: "CU27",
    kb: "5037331",
    supportEnd: "2025-02-28",
    maintenanceEnd: "2030-01-08",
  },
  {
    version: "SQL Server 2017",
    buildNumber: "14.0.3465.1",
    releaseDate: "2024-01-11",
    servicePackLevel: "RTM",
    cumulativeUpdate: "CU31 GDR",
    kb: "5029376",
    supportEnd: "2022-10-11",
    maintenanceEnd: "2027-10-12",
  },
  {
    version: "SQL Server 2016",
    buildNumber: "13.0.7037.1",
    releaseDate: "2024-01-09",
    servicePackLevel: "SP3",
    cumulativeUpdate: "CU17 GDR",
    kb: "5029186",
    supportEnd: "2021-07-13",
    maintenanceEnd: "2026-07-14",
  },
  {
    version: "SQL Server 2014",
    buildNumber: "12.0.6449.1",
    releaseDate: "2024-02-13",
    servicePackLevel: "SP3",
    cumulativeUpdate: "CU4 GDR",
    kb: "5032968",
    supportEnd: "2019-07-09",
    maintenanceEnd: "2024-07-09",
  },
];

type SortColumn = keyof SqlBuild;
type SortDirection = "asc" | "desc";

export const SqlServerBuilds = () => {
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("releaseDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const uniqueVersions = Array.from(new Set(sqlServerBuilds.map((b) => b.version)));

  const filteredBuilds = sqlServerBuilds.filter((build) => {
    const matchesVersion = versionFilter === "all" || build.version === versionFilter;
    const matchesSearch =
      !searchQuery ||
      Object.values(build).some((val) =>
        val.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesVersion && matchesSearch;
  });

  const sortedBuilds = [...filteredBuilds].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const paginatedBuilds = sortedBuilds.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const isExpiredSupport = (supportEnd: string) => {
    return new Date(supportEnd) < new Date();
  };

  const isExpiredMaintenance = (maintenanceEnd: string) => {
    return new Date(maintenanceEnd) < new Date();
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={2} alignItems="center">
          <InfoRoundedIcon fontSize="large" sx={{ color: "#2563eb" }} />
          <Typography variant="h5">SQL Server Builds Reference</Typography>
        </Stack>
      </Stack>

      <Alert severity="info">
        Track SQL Server versions, build numbers, cumulative updates, and support lifecycle
        information. Similar to{" "}
        <Link href="https://sqlserverbuilds.blogspot.com/" target="_blank" rel="noopener">
          sqlserverbuilds.blogspot.com
        </Link>
      </Alert>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Builds Tracked
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {sqlServerBuilds.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                SQL Server Versions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {uniqueVersions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Latest Build
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {sqlServerBuilds[0]?.buildNumber || "N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {sqlServerBuilds[0]?.version}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Version"
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="all">All Versions</MenuItem>
              {uniqueVersions.map((version) => (
                <MenuItem key={version} value={version}>
                  {version}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={9}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search build number, KB, CU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Builds Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "version"}
                    direction={sortColumn === "version" ? sortDirection : "asc"}
                    onClick={() => handleSort("version")}
                  >
                    Version
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "buildNumber"}
                    direction={sortColumn === "buildNumber" ? sortDirection : "asc"}
                    onClick={() => handleSort("buildNumber")}
                  >
                    Build Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === "releaseDate"}
                    direction={sortColumn === "releaseDate" ? sortDirection : "asc"}
                    onClick={() => handleSort("releaseDate")}
                  >
                    Release Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>SP Level</TableCell>
                <TableCell>Cumulative Update</TableCell>
                <TableCell>KB Article</TableCell>
                <TableCell>Support End</TableCell>
                <TableCell>Maintenance End</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBuilds.map((build, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {build.version}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {build.buildNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{build.releaseDate}</TableCell>
                  <TableCell>
                    <Chip label={build.servicePackLevel} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip label={build.cumulativeUpdate} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`https://support.microsoft.com/en-us/help/${build.kb}`}
                      target="_blank"
                      rel="noopener"
                    >
                      {build.kb}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={build.supportEnd}
                      size="small"
                      color={isExpiredSupport(build.supportEnd) ? "error" : "success"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={build.maintenanceEnd}
                      size="small"
                      color={isExpiredMaintenance(build.maintenanceEnd) ? "warning" : "success"}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {paginatedBuilds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" py={4}>
                      No builds found matching the filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedBuilds.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Stack>
  );
};
