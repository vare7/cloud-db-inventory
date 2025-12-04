import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControlLabel,
  Switch,
  TableSortLabel
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { DatabaseRecord } from "../types";
import { useState, useEffect } from "react";
import axios from "axios";

interface InventoryTableProps {
  rows: DatabaseRecord[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

const statusColor: Record<DatabaseRecord["status"], "success" | "warning" | "error" | "info" | "default"> = {
  available: "success",
  ready: "success",
  stopped: "error",
  maintenance: "warning",
  warning: "error"
};

const statusLabel: Record<DatabaseRecord["status"], string> = {
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

export const InventoryTable = ({ rows, loading, onDelete }: InventoryTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [resizing, setResizing] = useState<{
    column: keyof typeof DEFAULT_COLUMN_WIDTHS;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [showDetailed, setShowDetailed] = useState(() => {
    const saved = localStorage.getItem('showDetailed');
    return saved === 'true';
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DatabaseRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [purging, setPurging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadInput, setUploadInput] = useState<HTMLInputElement | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof DatabaseRecord | 'storage' | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedRows, setSortedRows] = useState<DatabaseRecord[]>([]);

  const handleDeleteClick = (record: DatabaseRecord) => {
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
      console.error('Failed to delete record:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleDetailedToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
    setShowDetailed(newValue);
    localStorage.setItem('showDetailed', newValue.toString());
  };

  const handleSort = (column: keyof DatabaseRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
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
        let aVal: any = sortColumn === 'storage' ? a.storage_gb : (a as any)[sortColumn];
        let bVal: any = sortColumn === 'storage' ? b.storage_gb : (b as any)[sortColumn];
        
        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
        if (bVal == null) return sortDirection === 'asc' ? -1 : 1;
        
        // Handle arrays (tags)
        if (Array.isArray(aVal) && Array.isArray(bVal)) {
          const aStr = aVal.join(',').toLowerCase();
          const bStr = bVal.join(',').toLowerCase();
          if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
          if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
        
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

  const columns = [
    { key: 'provider' as const, label: 'Provider' },
    { key: 'service' as const, label: 'Service' },
    { key: 'engine' as const, label: 'Engine' },
    { key: 'version' as const, label: 'Version' },
    { key: 'region' as const, label: 'Region' },
    { key: 'endpoint' as const, label: 'Endpoint' },
    { key: 'storage' as const, label: 'Storage (GB)' },
    { key: 'status' as const, label: 'Status' },
    { key: 'subscription' as const, label: 'Subscription' },
    { key: 'tenant' as const, label: 'Azure Tenant' },
    { key: 'tags' as const, label: 'Tags' },
    ...(showDetailed ? [
      { key: 'availabilityZone' as const, label: 'Availability Zone' },
      { key: 'autoScaling' as const, label: 'Auto Scaling' },
      { key: 'iops' as const, label: 'IOPS' },
      { key: 'highAvailabilityState' as const, label: 'HA State' },
      { key: 'replica' as const, label: 'Replica' },
      { key: 'backupRetentionDays' as const, label: 'Backup Retention' },
      { key: 'geoRedundantBackup' as const, label: 'Geo Backup' }
    ] : []),
    { key: 'actions' as const, label: 'Actions' }
  ];

  const totalColumns = columns.length;

  return (
    <Paper>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CleaningServicesIcon />}
            disabled={purging || uploading || loading}
            onClick={async () => {
              if (!confirm('Purge ALL records? This cannot be undone.')) return;
              setPurging(true);
              try {
                await axios.delete('/api/databases');
                setPage(0);
                // Ensure UI reflects changes
                window.location.reload();
              } catch (e) {
                console.error('Failed to purge:', e);
              } finally {
                setPurging(false);
              }
            }}
          >
            {purging ? 'Purging…' : 'Purge All'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UploadFileIcon />}
            disabled={uploading || loading}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,text/csv';
              input.onchange = async () => {
                if (!input.files || input.files.length === 0) return;
                const file = input.files[0];
                setUploading(true);
                try {
                  const form = new FormData();
                  form.append('file', file);
                  form.append('provider', 'AWS');
                  form.append('purge_first', 'true');
                  await axios.post('/api/databases/import-csv', form, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  setPage(0);
                  window.location.reload();
                } catch (e) {
                  console.error('Failed to import CSV:', e);
                } finally {
                  setUploading(false);
                  input.remove();
                }
              };
              setUploadInput(input);
              input.click();
            }}
          >
            {uploading ? 'Re-importing…' : 'Purge & Re-import'}
          </Button>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={showDetailed}
              onChange={handleDetailedToggle}
              color="primary"
            />
          }
          label="Detailed View"
        />
      </Box>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    width: columnWidths[col.key as keyof typeof DEFAULT_COLUMN_WIDTHS],
                    position: 'relative',
                    userSelect: 'none'
                  }}
                  sortDirection={sortColumn === col.key ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortColumn === col.key}
                    direction={sortDirection}
                    onClick={() => handleSort(col.key as keyof DatabaseRecord)}
                  >
                    {col.label}
                  </TableSortLabel>
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
                <TableCell colSpan={totalColumns}>
                  <Typography variant="body2" color="text.secondary">
                    Loading inventory...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns}>
                  <Typography variant="body2" color="text.secondary">
                    No databases match your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.provider}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.service}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.engine}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.version || "-"}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.region}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.endpoint}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.storage_gb}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={statusLabel[row.status]}
                      color={statusColor[row.status]}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.subscription}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.azure_tenant}
                  </TableCell>
                  <TableCell>
                    {row.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  {showDetailed && (
                    <>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.availability_zone || "-"}</TableCell>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.auto_scaling || "-"}</TableCell>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.iops || "-"}</TableCell>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.high_availability_state || "-"}</TableCell>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.replica || "-"}</TableCell>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.backup_retention_days || "-"}</TableCell>
                      <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.geo_redundant_backup || "-"}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(row)}
                      color="error"
                      title="Delete database record"
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 15, 25, 50, 100]}
        component="div"
        count={sortedRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Database Record</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this database record?
            {recordToDelete && (
              <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2"><strong>Provider:</strong> {recordToDelete.provider}</Typography>
                <Typography variant="body2"><strong>Service:</strong> {recordToDelete.service}</Typography>
                <Typography variant="body2"><strong>Engine:</strong> {recordToDelete.engine}</Typography>
                <Typography variant="body2"><strong>Region:</strong> {recordToDelete.region}</Typography>
              </Box>
            )}
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              This action cannot be undone.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};




