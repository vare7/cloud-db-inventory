import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, TextField, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { AzureVM } from "../types";
import { useState, useEffect } from "react";
import axios from "axios";

interface AzureVMsTableProps {
  rows: AzureVM[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

type SortColumn = keyof AzureVM | 'actions' | '';
type SortDirection = 'asc' | 'desc';

export const AzureVMsTable = ({ rows, loading, onDelete }: AzureVMsTableProps) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [sortedRows, setSortedRows] = useState<AzureVM[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AzureVM | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [tenantNames, setTenantNames] = useState<Record<string, string>>({});

  const columns = [
    { key: 'computer_name' as const, label: 'Computer Name' },
    { key: 'private_ip_address' as const, label: 'Private IP' },
    { key: 'subscription' as const, label: 'Subscription' },
    { key: 'resource_group' as const, label: 'Resource Group' },
    { key: 'location' as const, label: 'Location' },
    { key: 'vm_size' as const, label: 'VM Size' },
    { key: 'os_type' as const, label: 'OS Type' },
    { key: 'os_name' as const, label: 'OS Name' },
    { key: 'os_version' as const, label: 'OS Version' },
    { key: 'os_disk_size' as const, label: 'OS Disk (GB)' },
    { key: 'data_disk_count' as const, label: 'Data Disks' },
    { key: 'total_disk_size_gb' as const, label: 'Total Disk (GB)' },
    { key: 'display_status' as const, label: 'Status' },
    { key: 'time_created' as const, label: 'Created' },
    { key: 'tenant_id' as const, label: 'Azure Tenant' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  // Fetch tenant names on mount
  useEffect(() => {
    const fetchTenantNames = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tenant-names');
        setTenantNames(response.data);
      } catch (error) {
        console.error('Failed to fetch tenant names:', error);
      }
    };
    fetchTenantNames();
  }, []);

  const getTenantDisplayName = (tenantId: string | null | undefined): string => {
    if (!tenantId) return '-';
    return tenantNames[tenantId] || tenantId;
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    let sorted = [...rows];

    if (sortColumn && sortColumn !== 'actions') {
      sorted.sort((a, b) => {
        let aVal: any = (a as any)[sortColumn];
        let bVal: any = (b as any)[sortColumn];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
        if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

        // Compare numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Compare strings
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setSortedRows(sorted);
    setPage(0);
  }, [rows, sortColumn, sortDirection]);

  const handleDeleteClick = (record: AzureVM) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setDeleting(true);
    try {
      await onDelete(recordToDelete.id);
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
    }
  };

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper>
      <TableContainer>
        <Table sx={{ tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ whiteSpace: 'nowrap' }}>
                  {col.key === 'actions' ? (
                    col.label
                  ) : (
                    <TableSortLabel
                      active={sortColumn === col.key}
                      direction={sortDirection}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography variant="body2" color="text.secondary">
                    Loading VMs...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography variant="body2" color="text.secondary">
                    No VMs found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.computer_name}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.private_ip_address || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.subscription}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.resource_group}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.location}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.vm_size}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.os_type}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.os_name || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.os_version || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.os_disk_size || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.data_disk_count || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.total_disk_size_gb || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.display_status || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                    {row.time_created ? new Date(row.time_created).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getTenantDisplayName(row.tenant_id)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteRoundedIcon />}
                      onClick={() => handleDeleteClick(row)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Page {page + 1} of {Math.ceil(sortedRows.length / rowsPerPage) || 1}
        </Typography>
        <Box>
          <Button
            size="small"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            size="small"
            disabled={page >= Math.ceil(sortedRows.length / rowsPerPage) - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Delete VM "{recordToDelete?.computer_name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
