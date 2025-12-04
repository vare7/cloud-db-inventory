import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  TableSortLabel,
} from '@mui/material';
import { fetchPricing } from '../api/client';

interface PricingData {
  id: string;
  provider: string;
  service: string;
  engine: string;
  region: string;
  storage_gb: number;
  version: string | null;
  subscription: string;
  hourly_cost: number;
  monthly_cost: number;
}

interface PricingResponse {
  databases: PricingData[];
  total_hourly: number;
  total_monthly: number;
  count: number;
}

export default function PricingCalculator() {
  const [data, setData] = useState<PricingResponse | null>(null);
  const [filteredData, setFilteredData] = useState<PricingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [providerFilter, setProviderFilter] = useState<string>('');
  const [engineFilter, setEngineFilter] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('');
  const [serviceSearch, setServiceSearch] = useState<string>('');
  
  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof PricingData | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadPricing();
  }, []);

  useEffect(() => {
    if (data) {
      applyFilters();
    }
  }, [data, providerFilter, engineFilter, regionFilter, subscriptionFilter, serviceSearch, sortColumn, sortDirection]);

  const loadPricing = async () => {
    try {
      setLoading(true);
      const response = await fetchPricing();
      setData(response);
      setFilteredData(response.databases);
      setError(null);
    } catch (err) {
      setError('Failed to load pricing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!data) return;

    let filtered = [...data.databases];

    if (providerFilter) {
      filtered = filtered.filter(db => db.provider === providerFilter);
    }
    if (engineFilter) {
      filtered = filtered.filter(db => db.engine.toLowerCase().includes(engineFilter.toLowerCase()));
    }
    if (regionFilter) {
      filtered = filtered.filter(db => db.region === regionFilter);
    }
    if (subscriptionFilter) {
      filtered = filtered.filter(db => db.subscription === subscriptionFilter);
    }
    if (serviceSearch) {
      filtered = filtered.filter(db => db.service.toLowerCase().includes(serviceSearch.toLowerCase()));
    }

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
        if (bVal == null) return sortDirection === 'asc' ? -1 : 1;
        
        // Compare values
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
    setPage(0);
  };

  const handleSort = (column: keyof PricingData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const calculateFilteredTotals = () => {
    const totalHourly = filteredData.reduce((sum, db) => sum + db.hourly_cost, 0);
    const totalMonthly = filteredData.reduce((sum, db) => sum + db.monthly_cost, 0);
    return {
      hourly: totalHourly.toFixed(2),
      monthly: totalMonthly.toFixed(2),
    };
  };

  const getUniqueValues = (key: keyof PricingData): string[] => {
    if (!data) return [];
    const values = data.databases.map(db => String(db[key])).filter(Boolean);
    return Array.from(new Set(values)).sort();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={3}>
        <Alert severity="info">No pricing data available</Alert>
      </Box>
    );
  }

  const filteredTotals = calculateFilteredTotals();
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Databases
              </Typography>
              <Typography variant="h4">{filteredData.length}</Typography>
              <Typography variant="caption" color="textSecondary">
                of {data.count} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Hourly Cost
              </Typography>
              <Typography variant="h4">${filteredTotals.hourly}</Typography>
              <Typography variant="caption" color="textSecondary">
                per hour
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Monthly Cost
              </Typography>
              <Typography variant="h4">${filteredTotals.monthly}</Typography>
              <Typography variant="caption" color="textSecondary">
                per month (730 hrs)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Annual Estimate
              </Typography>
              <Typography variant="h4">
                ${(parseFloat(filteredTotals.monthly) * 12).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                per year
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              fullWidth
              label="Search Service"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              size="small"
              placeholder="e.g., defectdojo"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              label="Provider"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Providers</MenuItem>
              {getUniqueValues('provider').map((provider) => (
                <MenuItem key={provider} value={provider}>
                  {provider}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              label="Engine"
              value={engineFilter}
              onChange={(e) => setEngineFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Engines</MenuItem>
              {getUniqueValues('engine').map((engine) => (
                <MenuItem key={engine} value={engine}>
                  {engine}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              label="Region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Regions</MenuItem>
              {getUniqueValues('region').map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <TextField
              select
              fullWidth
              label="Subscription"
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              size="small"
            >
              <MenuItem value="">All Subscriptions</MenuItem>
              {getUniqueValues('subscription').map((subscription) => (
                <MenuItem key={subscription} value={subscription}>
                  {subscription}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Pricing Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'provider'}
                    direction={sortColumn === 'provider' ? sortDirection : 'asc'}
                    onClick={() => handleSort('provider')}
                  >
                    Provider
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'service'}
                    direction={sortColumn === 'service' ? sortDirection : 'asc'}
                    onClick={() => handleSort('service')}
                  >
                    Service
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'engine'}
                    direction={sortColumn === 'engine' ? sortDirection : 'asc'}
                    onClick={() => handleSort('engine')}
                  >
                    Engine
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'version'}
                    direction={sortColumn === 'version' ? sortDirection : 'asc'}
                    onClick={() => handleSort('version')}
                  >
                    Version
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'region'}
                    direction={sortColumn === 'region' ? sortDirection : 'asc'}
                    onClick={() => handleSort('region')}
                  >
                    Region
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortColumn === 'storage_gb'}
                    direction={sortColumn === 'storage_gb' ? sortDirection : 'asc'}
                    onClick={() => handleSort('storage_gb')}
                  >
                    Storage (GB)
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortColumn === 'subscription'}
                    direction={sortColumn === 'subscription' ? sortDirection : 'asc'}
                    onClick={() => handleSort('subscription')}
                  >
                    Subscription
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortColumn === 'hourly_cost'}
                    direction={sortColumn === 'hourly_cost' ? sortDirection : 'asc'}
                    onClick={() => handleSort('hourly_cost')}
                  >
                    Hourly Cost
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortColumn === 'monthly_cost'}
                    direction={sortColumn === 'monthly_cost' ? sortDirection : 'asc'}
                    onClick={() => handleSort('monthly_cost')}
                  >
                    Monthly Cost
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((db) => (
                <TableRow key={db.id} hover>
                  <TableCell>
                    <Chip
                      label={db.provider}
                      color={db.provider === 'AWS' ? 'warning' : 'info'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{db.service}</TableCell>
                  <TableCell>{db.engine}</TableCell>
                  <TableCell>{db.version || 'N/A'}</TableCell>
                  <TableCell>{db.region}</TableCell>
                  <TableCell align="right">{db.storage_gb}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                      {db.subscription}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${db.hourly_cost.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium" color="primary">
                      ${db.monthly_cost.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="textSecondary" py={4}>
                      No databases match the selected filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Disclaimer */}
      <Box mt={2}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Note:</strong> These are simplified cost estimates for demonstration purposes.
            Actual costs vary based on instance type, IOPS, backup retention, data transfer, and other factors.
            Consult your cloud provider's pricing calculator for accurate estimates.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
}
