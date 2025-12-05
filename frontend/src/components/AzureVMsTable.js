import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { useState, useEffect } from "react";
import axios from "axios";
export const AzureVMsTable = ({ rows, loading, onDelete }) => {
    const [sortColumn, setSortColumn] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [sortedRows, setSortedRows] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [tenantNames, setTenantNames] = useState({});
    const columns = [
        { key: 'computer_name', label: 'Computer Name' },
        { key: 'private_ip_address', label: 'Private IP' },
        { key: 'subscription', label: 'Subscription' },
        { key: 'resource_group', label: 'Resource Group' },
        { key: 'location', label: 'Location' },
        { key: 'vm_size', label: 'VM Size' },
        { key: 'os_type', label: 'OS Type' },
        { key: 'os_name', label: 'OS Name' },
        { key: 'os_version', label: 'OS Version' },
        { key: 'os_disk_size', label: 'OS Disk (GB)' },
        { key: 'data_disk_count', label: 'Data Disks' },
        { key: 'total_disk_size_gb', label: 'Total Disk (GB)' },
        { key: 'display_status', label: 'Status' },
        { key: 'time_created', label: 'Created' },
        { key: 'tenant_id', label: 'Azure Tenant' },
        { key: 'actions', label: 'Actions' },
    ];
    // Fetch tenant names on mount
    useEffect(() => {
        const fetchTenantNames = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/tenant-names');
                setTenantNames(response.data);
            }
            catch (error) {
                console.error('Failed to fetch tenant names:', error);
            }
        };
        fetchTenantNames();
    }, []);
    const getTenantDisplayName = (tenantId) => {
        if (!tenantId)
            return '-';
        return tenantNames[tenantId] || tenantId;
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
        if (sortColumn && sortColumn !== 'actions') {
            sorted.sort((a, b) => {
                let aVal = a[sortColumn];
                let bVal = b[sortColumn];
                // Handle null/undefined values
                if (aVal == null && bVal == null)
                    return 0;
                if (aVal == null)
                    return sortDirection === 'asc' ? 1 : -1;
                if (bVal == null)
                    return sortDirection === 'asc' ? -1 : 1;
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
            console.error("Delete failed:", error);
        }
        finally {
            setDeleting(false);
        }
    };
    const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    return (_jsxs(Paper, { children: [_jsx(TableContainer, { children: _jsxs(Table, { sx: { tableLayout: 'auto' }, children: [_jsx(TableHead, { children: _jsx(TableRow, { children: columns.map((col) => (_jsx(TableCell, { sx: { whiteSpace: 'nowrap' }, children: col.key === 'actions' ? (col.label) : (_jsx(TableSortLabel, { active: sortColumn === col.key, direction: sortDirection, onClick: () => handleSort(col.key), children: col.label })) }, col.key))) }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Loading VMs..." }) }) })) : rows.length === 0 ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: columns.length, children: _jsx(Typography, { variant: "body2", color: "text.secondary", children: "No VMs found." }) }) })) : (paginatedRows.map((row) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.computer_name }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.private_ip_address || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.subscription }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.resource_group }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.location }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.vm_size }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.os_type }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.os_name || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.os_version || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.os_disk_size || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.data_disk_count || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.total_disk_size_gb || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: row.display_status || "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }, children: row.time_created ? new Date(row.time_created).toLocaleDateString() : "-" }), _jsx(TableCell, { sx: { overflow: 'hidden', textOverflow: 'ellipsis' }, children: getTenantDisplayName(row.tenant_id) }), _jsx(TableCell, { children: _jsx(Button, { size: "small", color: "error", startIcon: _jsx(DeleteRoundedIcon, {}), onClick: () => handleDeleteClick(row), children: "Delete" }) })] }, row.id)))) })] }) }), _jsxs(Box, { sx: { p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", children: ["Page ", page + 1, " of ", Math.ceil(sortedRows.length / rowsPerPage) || 1] }), _jsxs(Box, { children: [_jsx(Button, { size: "small", disabled: page === 0, onClick: () => setPage(page - 1), children: "Previous" }), _jsx(Button, { size: "small", disabled: page >= Math.ceil(sortedRows.length / rowsPerPage) - 1, onClick: () => setPage(page + 1), children: "Next" })] })] }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), children: [_jsx(DialogTitle, { children: "Confirm Delete" }), _jsx(DialogContent, { children: _jsxs(Typography, { children: ["Delete VM \"", recordToDelete?.computer_name, "\"?"] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteDialogOpen(false), children: "Cancel" }), _jsx(Button, { onClick: handleDeleteConfirm, color: "error", variant: "contained", disabled: deleting, children: "Delete" })] })] })] }));
};
