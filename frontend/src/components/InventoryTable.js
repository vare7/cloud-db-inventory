import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, FormControlLabel, Switch, TableSortLabel } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useState, useEffect } from "react";
import axios from "axios";
const statusColor = {
    available: "success",
    ready: "success",
    stopped: "error",
    maintenance: "warning",
    warning: "error"
};
const statusLabel = {
    available: "Running",
    ready: "Running",
    stopped: "Stopped",
    maintenance: "Maintenance",
    warning: "Warning"
};
const DEFAULT_COLUMN_WIDTHS = {
    provider: 100,
    service: 150,
    engine: 150,
    version: 120,
    region: 150,
    endpoint: 250,
    storage: 120,
    status: 120,
    subscription: 180,
    tenant: 180,
    tags: 200,
    availabilityZone: 150,
    autoScaling: 120,
    iops: 100,
    highAvailabilityState: 180,
    replica: 120,
    backupRetentionDays: 180,
    geoRedundantBackup: 180,
    actions: 80
};
export const InventoryTable = ({ rows, loading, onDelete }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
    const [resizing, setResizing] = useState(null);
    const [showDetailed, setShowDetailed] = useState(() => {
        const saved = localStorage.getItem('showDetailed');
        return saved === 'true';
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [purging, setPurging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadInput, setUploadInput] = useState(null);
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedRows, setSortedRows] = useState([]);
    const handleDeleteClick = (record) => {
        setRecordToDelete(record);
        setDeleteDialogOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!recordToDelete)
            return;
        setDeleting(true);
        try {
            await onDelete(recordToDelete.id);
            setDeleteDialogOpen(false);
            setRecordToDelete(null);
        }
        catch (error) {
            console.error('Failed to delete record:', error);
        }
        finally {
            setDeleting(false);
        }
    };
    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
        setRecordToDelete(null);
    };
    useEffect(() => {
        if (!resizing)
            return;
        const handleMouseMove = (e) => {
            if (!resizing)
                return;
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
    const handleResizeStart = (column, e) => {
        e.preventDefault();
        setResizing({ column, startX: e.clientX, startWidth: columnWidths[column] });
    };
    const handleChangePage = (_event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const handleDetailedToggle = (event) => {
        const newValue = event.target.checked;
        setShowDetailed(newValue);
        localStorage.setItem('showDetailed', newValue.toString());
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
    useEffect(() => {
        let sorted = [...rows];
        // Apply sorting
        if (sortColumn) {
            sorted.sort((a, b) => {
                // Handle storage_gb field specially (column key is 'storage')
                let aVal = sortColumn === 'storage' ? a.storage_gb : a[sortColumn];
                let bVal = sortColumn === 'storage' ? b.storage_gb : b[sortColumn];
                // Handle null/undefined values
                if (aVal == null && bVal == null)
                    return 0;
                if (aVal == null)
                    return sortDirection === 'asc' ? 1 : -1;
                if (bVal == null)
                    return sortDirection === 'asc' ? -1 : 1;
                // Handle arrays (tags)
                if (Array.isArray(aVal) && Array.isArray(bVal)) {
                    const aStr = aVal.join(',').toLowerCase();
                    const bStr = bVal.join(',').toLowerCase();
                    if (aStr < bStr)
                        return sortDirection === 'asc' ? -1 : 1;
                    if (aStr > bStr)
                        return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                }
                // Compare numbers
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
                }
                // Compare strings
                const aStr = String(aVal).toLowerCase();
                const bStr = String(bVal).toLowerCase();
                if (aStr < bStr)
                    return sortDirection === 'asc' ? -1 : 1;
                if (aStr > bStr)
                    return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        setSortedRows(sorted);
        setPage(0);
    }, [rows, sortColumn, sortDirection]);
    const columns = [
        { key: 'provider', label: 'Provider' },
        { key: 'service', label: 'Service' },
        { key: 'engine', label: 'Engine' },
        { key: 'version', label: 'Version' },
        { key: 'region', label: 'Region' },
        { key: 'endpoint', label: 'Endpoint' },
        { key: 'storage', label: 'Storage (GB)' },
        { key: 'status', label: 'Status' },
        { key: 'subscription', label: 'Subscription' },
        { key: 'tenant', label: 'Azure Tenant' },
        { key: 'tags', label: 'Tags' },
        ...(showDetailed ? [
            { key: 'availabilityZone', label: 'Availability Zone' },
            { key: 'autoScaling', label: 'Auto Scaling' },
            { key: 'iops', label: 'IOPS' },
            { key: 'highAvailabilityState', label: 'HA State' },
            { key: 'replica', label: 'Replica' },
            { key: 'backupRetentionDays', label: 'Backup Retention' },
            { key: 'geoRedundantBackup', label: 'Geo Backup' }
        ] : []),
        { key: 'actions', label: 'Actions' }
    ];
    const totalColumns = columns.length;
    return (_jsxs(Paper, { children: [_jsxs(Box, { sx: { p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx(Box, { sx: { display: 'flex', gap: 1 }, children: _jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(CleaningServicesIcon, {}), disabled: purging || uploading || loading, onClick: async () => {
                                if (!confirm('Purge ALL records? This cannot be undone.'))
                                    return;
                                setPurging(true);
                                try {
                                    await axios.delete('/api/databases');
                                    setPage(0);
                                    // Ensure UI reflects changes
                                    window.location.reload();
                                }
                                catch (e) {
                                    console.error('Failed to purge:', e);
                                }
                                finally {
                                    setPurging(false);
                                }
                            }, children: purging ? 'Purging…' : 'Purge All' }) }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: showDetailed, onChange: handleDetailedToggle, color: "primary" }), label: "Detailed View" })] }), _jsx(TableContainer, { children: _jsxs(Table, { sx: { tableLayout: 'fixed' }, children: [_jsx(TableHead, { children: _jsx(TableRow, { children: columns.map((col) => (_jsxs(TableCell, { sx: {
                                        width: columnWidths[col.key],
                                        position: 'relative',
                                        userSelect: 'none'
                                    }, sortDirection: sortColumn === col.key ? sortDirection : false, children: [_jsx(TableSortLabel, { active: sortColumn === col.key, direction: sortDirection, onClick: () => handleSort(col.key), children: col.label }), _jsx(Box, { onMouseDown: (e) => handleResizeStart(col.key, e), sx: {
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
                                            } })] }, col.key))) }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: totalColumns, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading inventory..." }) }) })) : rows.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: totalColumns, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No databases match your filters." }) }) })) : (paginatedRows.map((row) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.provider }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.service }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.engine }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.version || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.region }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.endpoint }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.storage_gb }), _jsx(TableCell, { children: _jsx(Chip, { size: "small", label: statusLabel[row.status], color: statusColor[row.status], sx: { textTransform: "capitalize" } }) }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.subscription }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.azure_tenant }), _jsx(TableCell, { children: row.tags.map((tag) => (_jsx(Chip, { label: tag, size: "small", variant: "outlined", sx: { mr: 0.5 } }, tag))) }), showDetailed && (_jsxs(_Fragment, { children: [_jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.availability_zone || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.auto_scaling || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.iops || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.high_availability_state || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.replica || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.backup_retention_days || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.geo_redundant_backup || "-" })] })), _jsx(TableCell, { children: _jsx(IconButton, { size: "small", onClick: () => handleDeleteClick(row), color: "error", title: "Delete database record", children: _jsx(DeleteOutlineRoundedIcon, { fontSize: "small" }) }) })] }, row.id)))) })] }) }), _jsx(TablePagination, { rowsPerPageOptions: [5, 10, 15, 25, 50, 100], component: "div", count: sortedRows.length, rowsPerPage: rowsPerPage, page: page, onPageChange: handleChangePage, onRowsPerPageChange: handleChangeRowsPerPage }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: handleDeleteCancel, children: [_jsx(DialogTitle, { children: "Delete Database Record" }), _jsx(DialogContent, { children: _jsxs(DialogContentText, { children: ["Are you sure you want to delete this database record?", recordToDelete && (_jsxs(Box, { sx: { mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }, children: [_jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Provider:" }), " ", recordToDelete.provider] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Service:" }), " ", recordToDelete.service] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Engine:" }), " ", recordToDelete.engine] }), _jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Region:" }), " ", recordToDelete.region] })] })), _jsx(Typography, { variant: "body2", color: "error", sx: { mt: 2 }, children: "This action cannot be undone." })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleDeleteCancel, disabled: deleting, children: "Cancel" }), _jsx(Button, { onClick: handleDeleteConfirm, color: "error", variant: "contained", disabled: deleting, children: deleting ? 'Deleting...' : 'Delete' })] })] })] }));
};
