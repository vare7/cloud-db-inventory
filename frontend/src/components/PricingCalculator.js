import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Alert, Chip, TablePagination, TextField, MenuItem, Grid, Card, CardContent, TableSortLabel, } from '@mui/material';
import { fetchPricing } from '../api/client';
export default function PricingCalculator({ excludeStopped = false }) {
    const [data, setData] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Filters
    const [providerFilter, setProviderFilter] = useState('');
    const [engineFilter, setEngineFilter] = useState('');
    const [regionFilter, setRegionFilter] = useState('');
    const [subscriptionFilter, setSubscriptionFilter] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    // Sorting
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    useEffect(() => {
        loadPricing();
    }, [excludeStopped]);
    useEffect(() => {
        if (data) {
            applyFilters();
        }
    }, [data, providerFilter, engineFilter, regionFilter, subscriptionFilter, serviceSearch, sortColumn, sortDirection]);
    const loadPricing = async () => {
        try {
            setLoading(true);
            const response = await fetchPricing(excludeStopped);
            setData(response);
            setFilteredData(response.databases);
            setError(null);
        }
        catch (err) {
            setError('Failed to load pricing data');
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const applyFilters = () => {
        if (!data)
            return;
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
                if (aVal == null && bVal == null)
                    return 0;
                if (aVal == null)
                    return sortDirection === 'asc' ? 1 : -1;
                if (bVal == null)
                    return sortDirection === 'asc' ? -1 : 1;
                // Compare values
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();
                if (aStr < bStr)
                    return sortDirection === 'asc' ? -1 : 1;
                if (aStr > bStr)
                    return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        setFilteredData(filtered);
        setPage(0);
    };
    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        }
        else {
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
    const getUniqueValues = (key) => {
        if (!data)
            return [];
        const values = data.databases.map(db => String(db[key])).filter(Boolean);
        return Array.from(new Set(values)).sort();
    };
    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: _jsx(CircularProgress, {}) }));
    }
    if (error) {
        return (_jsx(Box, { p: 3, children: _jsx(Alert, { severity: "error", children: error }) }));
    }
    if (!data) {
        return (_jsx(Box, { p: 3, children: _jsx(Alert, { severity: "info", children: "No pricing data available" }) }));
    }
    const filteredTotals = calculateFilteredTotals();
    const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return (_jsxs(Box, { children: [_jsxs(Grid, { container: true, spacing: 2, sx: { mb: 3 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, variant: "body2", children: "Total Databases" }), _jsx(Typography, { variant: "h4", children: filteredData.length }), _jsxs(Typography, { variant: "caption", color: "textSecondary", children: ["of ", data.count, " total"] })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, variant: "body2", children: "Hourly Cost" }), _jsxs(Typography, { variant: "h4", children: ["$", filteredTotals.hourly] }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: "per hour" })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, variant: "body2", children: "Monthly Cost" }), _jsxs(Typography, { variant: "h4", children: ["$", filteredTotals.monthly] }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: "per month (730 hrs)" })] }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { color: "textSecondary", gutterBottom: true, variant: "body2", children: "Annual Estimate" }), _jsxs(Typography, { variant: "h4", children: ["$", (parseFloat(filteredTotals.monthly) * 12).toFixed(2)] }), _jsx(Typography, { variant: "caption", color: "textSecondary", children: "per year" })] }) }) })] }), _jsx(Paper, { sx: { p: 2, mb: 2 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, md: 2.4, children: _jsx(TextField, { fullWidth: true, label: "Search Service", value: serviceSearch, onChange: (e) => setServiceSearch(e.target.value), size: "small", placeholder: "e.g., defectdojo" }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2.4, children: _jsxs(TextField, { select: true, fullWidth: true, label: "Provider", value: providerFilter, onChange: (e) => setProviderFilter(e.target.value), size: "small", children: [_jsx(MenuItem, { value: "", children: "All Providers" }), getUniqueValues('provider').map((provider) => (_jsx(MenuItem, { value: provider, children: provider }, provider)))] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2.4, children: _jsxs(TextField, { select: true, fullWidth: true, label: "Engine", value: engineFilter, onChange: (e) => setEngineFilter(e.target.value), size: "small", children: [_jsx(MenuItem, { value: "", children: "All Engines" }), getUniqueValues('engine').map((engine) => (_jsx(MenuItem, { value: engine, children: engine }, engine)))] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2.4, children: _jsxs(TextField, { select: true, fullWidth: true, label: "Region", value: regionFilter, onChange: (e) => setRegionFilter(e.target.value), size: "small", children: [_jsx(MenuItem, { value: "", children: "All Regions" }), getUniqueValues('region').map((region) => (_jsx(MenuItem, { value: region, children: region }, region)))] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 2.4, children: _jsxs(TextField, { select: true, fullWidth: true, label: "Subscription", value: subscriptionFilter, onChange: (e) => setSubscriptionFilter(e.target.value), size: "small", children: [_jsx(MenuItem, { value: "", children: "All Subscriptions" }), getUniqueValues('subscription').map((subscription) => (_jsx(MenuItem, { value: subscription, children: subscription }, subscription)))] }) })] }) }), _jsxs(Paper, { children: [_jsx(TableContainer, { children: _jsxs(Table, { size: "small", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(TableSortLabel, { active: sortColumn === 'provider', direction: sortColumn === 'provider' ? sortDirection : 'asc', onClick: () => handleSort('provider'), children: "Provider" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: sortColumn === 'service', direction: sortColumn === 'service' ? sortDirection : 'asc', onClick: () => handleSort('service'), children: "Service" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: sortColumn === 'engine', direction: sortColumn === 'engine' ? sortDirection : 'asc', onClick: () => handleSort('engine'), children: "Engine" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: sortColumn === 'version', direction: sortColumn === 'version' ? sortDirection : 'asc', onClick: () => handleSort('version'), children: "Version" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: sortColumn === 'region', direction: sortColumn === 'region' ? sortDirection : 'asc', onClick: () => handleSort('region'), children: "Region" }) }), _jsx(TableCell, { align: "right", children: _jsx(TableSortLabel, { active: sortColumn === 'storage_gb', direction: sortColumn === 'storage_gb' ? sortDirection : 'asc', onClick: () => handleSort('storage_gb'), children: "Storage (GB)" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: sortColumn === 'subscription', direction: sortColumn === 'subscription' ? sortDirection : 'asc', onClick: () => handleSort('subscription'), children: "Subscription" }) }), _jsx(TableCell, { align: "right", children: _jsx(TableSortLabel, { active: sortColumn === 'hourly_cost', direction: sortColumn === 'hourly_cost' ? sortDirection : 'asc', onClick: () => handleSort('hourly_cost'), children: "Hourly Cost" }) }), _jsx(TableCell, { align: "right", children: _jsx(TableSortLabel, { active: sortColumn === 'monthly_cost', direction: sortColumn === 'monthly_cost' ? sortDirection : 'asc', onClick: () => handleSort('monthly_cost'), children: "Monthly Cost" }) })] }) }), _jsxs(TableBody, { children: [paginatedData.map((db) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsx(Chip, { label: db.provider, color: db.provider === 'AWS' ? 'warning' : 'info', size: "small" }) }), _jsx(TableCell, { children: db.service }), _jsx(TableCell, { children: db.engine }), _jsx(TableCell, { children: db.version || 'N/A' }), _jsx(TableCell, { children: db.region }), _jsx(TableCell, { align: "right", children: db.storage_gb }), _jsx(TableCell, { children: _jsx(Typography, { variant: "body2", noWrap: true, sx: { maxWidth: 150 }, children: db.subscription }) }), _jsx(TableCell, { align: "right", children: _jsxs(Typography, { variant: "body2", fontWeight: "medium", children: ["$", db.hourly_cost.toFixed(2)] }) }), _jsx(TableCell, { align: "right", children: _jsxs(Typography, { variant: "body2", fontWeight: "medium", color: "primary", children: ["$", db.monthly_cost.toFixed(2)] }) })] }, db.id))), paginatedData.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, align: "center", children: _jsx(Typography, { color: "textSecondary", py: 4, children: "No databases match the selected filters" }) }) }))] })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 25, 50], component: "div", count: filteredData.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage })] }), _jsx(Box, { mt: 2, children: _jsx(Alert, { severity: "info", children: _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Note:" }), " These are simplified cost estimates for demonstration purposes. Actual costs vary based on instance type, IOPS, backup retention, data transfer, and other factors. Consult your cloud provider's pricing calculator for accurate estimates."] }) }) })] }));
}
