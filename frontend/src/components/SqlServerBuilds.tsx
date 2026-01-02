import { Alert, Box, Card, CardContent, Chip, CircularProgress, Grid, Link, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, TextField, Typography } from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { useEffect, useMemo, useState } from "react";

import { fetchBuilds } from "../api/client";
import { BuildInfo } from "../types";

type Engine = "SQL Server" | "PostgreSQL" | "MySQL";
type SortColumn = keyof BuildInfo;
type SortDirection = "asc" | "desc";

export const SqlServerBuilds = () => {
  const [builds, setBuilds] = useState<BuildInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineFilter, setEngineFilter] = useState<Engine | "all">("all");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<SortColumn>("support_end");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: BuildInfo[] = await fetchBuilds();
        setBuilds(data);
      } catch (err) {
        console.error("Failed to load build catalog", err);
        setError("Failed to load build catalog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

    const engines: Engine[] = useMemo(() => {
      if (builds.length === 0) {
        return ["SQL Server", "PostgreSQL", "MySQL"] as Engine[];
      }
      return Array.from(new Set(builds.map((b) => b.engine))) as Engine[];
    }, [builds]);

    const filteredBuilds = useMemo(() => {
      const byEngine = builds.filter((row) => engineFilter === "all" || row.engine === engineFilter);

      // Deduplicate by version: keep only the latest build per engine+version
      const deduped = byEngine.reduce((acc, build) => {
        const key = `${build.engine}|${build.version}`;
        const existing = acc.get(key);
        if (!existing || (build.release_date > existing.release_date)) {
          acc.set(key, build);
        }
        return acc;
      }, new Map<string, BuildInfo>());

      const uniqueBuilds = Array.from(deduped.values());

      return uniqueBuilds.filter((build) => {
        const matchesVersion =
          versionFilter === "all" || `${build.engine} | ${build.version}` === versionFilter;
        const matchesSearch =
          !searchQuery ||
          Object.values(build).some((val) => val?.toString().toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesVersion && matchesSearch;
      });
    }, [builds, engineFilter, searchQuery, versionFilter]);

    const uniqueVersions = useMemo(
      () => Array.from(new Set(filteredBuilds.map((b) => `${b.engine} | ${b.version}`))),
      [filteredBuilds]
    );

    const sortedBuilds = useMemo(() => {
      const sorted = [...filteredBuilds].sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortColumn] ?? "";
        const bVal = (b as unknown as Record<string, unknown>)[sortColumn] ?? "";
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      });
      return sorted;
    }, [filteredBuilds, sortColumn, sortDirection]);

    const paginatedBuilds = useMemo(
      () => sortedBuilds.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
      [sortedBuilds, page, rowsPerPage]
    );

    const handleSort = (column: SortColumn) => {
      if (sortColumn === column) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortDirection("asc");
      }
    };

    const isExpiredSupport = (supportEnd?: string | null) => {
      if (!supportEnd) return false;
      return new Date(supportEnd) < new Date();
    };

    const isExpiredMaintenance = (maintenanceEnd?: string | null) => {
      if (!maintenanceEnd) return false;
      return new Date(maintenanceEnd) < new Date();
    };

    return (
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <InfoRoundedIcon fontSize="large" sx={{ color: "#2563eb" }} />
            <Typography variant="h5">Database Engine Builds Reference</Typography>
          </Stack>
        </Stack>

        <Alert severity="info">
          Track build numbers, cumulative updates/patches, and support lifecycle for SQL Server, PostgreSQL, and MySQL.
          Sources: Microsoft KBs, PostgreSQL release notes, MySQL release notes.
        </Alert>

        {error && <Alert severity="error">{error}</Alert>}
        {loading && builds.length === 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Loading build catalog...
            </Typography>
          </Stack>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Builds Tracked
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {loading ? "..." : builds.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Engine Coverage
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {engines.map((e) => (
                    <Chip
                      key={e}
                      label={`${e}`}
                      size="small"
                      color="primary"
                      variant={engineFilter === e ? "filled" : "outlined"}
                      onClick={() => {
                        setEngineFilter(e);
                        setVersionFilter("all");
                        setPage(0);
                      }}
                      sx={{ cursor: "pointer" }}
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Latest Build (per engine)
                </Typography>
                <Stack spacing={0.5}>
                  {engines.map((e) => {
                    const latest = builds
                      .filter((b) => b.engine === e)
                      .sort((a, b) => {
                        // Sort by support_end date (nulls last), then by release_date
                        const aSupport = a.support_end ? new Date(a.support_end).getTime() : 0;
                        const bSupport = b.support_end ? new Date(b.support_end).getTime() : 0;
                        if (aSupport !== bSupport) return bSupport - aSupport;
                        return (b.release_date || "").localeCompare(a.release_date || "");
                      })[0];
                    return (
                      <Typography key={e} variant="body2" fontWeight={600}>
                        {e}: {latest?.build_number ?? "N/A"} ({latest?.version ?? ""})
                      </Typography>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Engine"
                value={engineFilter}
                onChange={(e) => {
                  setEngineFilter(e.target.value as Engine | "all");
                  setVersionFilter("all");
                  setPage(0);
                }}
                size="small"
              >
                <MenuItem value="all">All Engines</MenuItem>
                {engines.map((engine) => (
                  <MenuItem key={engine} value={engine}>
                    {engine}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Version"
                value={versionFilter}
                onChange={(e) => {
                  setVersionFilter(e.target.value);
                  setPage(0);
                }}
                size="small"
              >
                <MenuItem value="all">All Versions</MenuItem>
                {uniqueVersions.map((version) => (
                  <MenuItem key={version} value={version}>
                    {version.split(" | ")[1]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Search build number, KB/Notes, CU/patch..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === "engine"}
                      direction={sortColumn === "engine" ? sortDirection : "asc"}
                      onClick={() => handleSort("engine")}
                    >
                      Engine
                    </TableSortLabel>
                  </TableCell>
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
                      active={sortColumn === "build_number"}
                      direction={sortColumn === "build_number" ? sortDirection : "asc"}
                      onClick={() => handleSort("build_number")}
                    >
                      Build Number
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === "release_date"}
                      direction={sortColumn === "release_date" ? sortDirection : "asc"}
                      onClick={() => handleSort("release_date")}
                    >
                      Release Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === "update"}
                      direction={sortColumn === "update" ? sortDirection : "asc"}
                      onClick={() => handleSort("update")}
                    >
                      Update / Patch
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === "doc_label"}
                      direction={sortColumn === "doc_label" ? sortDirection : "asc"}
                      onClick={() => handleSort("doc_label")}
                    >
                      Docs
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === "support_end"}
                      direction={sortColumn === "support_end" ? sortDirection : "asc"}
                      onClick={() => handleSort("support_end")}
                    >
                      Support End
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortColumn === "maintenance_end"}
                      direction={sortColumn === "maintenance_end" ? sortDirection : "asc"}
                      onClick={() => handleSort("maintenance_end")}
                    >
                      Maintenance End
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBuilds.map((build) => (
                  <TableRow key={build.id} hover>
                    <TableCell>
                      <Chip label={build.engine} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {build.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {build.build_number}
                      </Typography>
                    </TableCell>
                    <TableCell>{build.release_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={build.update || "—"}
                        size="small"
                        color={build.update ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={build.doc_url} target="_blank" rel="noopener">
                        {build.doc_label}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={build.support_end ?? "—"}
                        size="small"
                        color={isExpiredSupport(build.support_end) ? "error" : "success"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={build.maintenance_end ?? "—"}
                        size="small"
                        color={isExpiredMaintenance(build.maintenance_end) ? "warning" : "success"}
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
