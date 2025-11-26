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
  Button
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { DatabaseRecord } from "../types";
import { useState, useRef, useEffect } from "react";

interface InventoryTableProps {
  rows: DatabaseRecord[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

const statusColor: Record<DatabaseRecord["status"], "success" | "warning" | "error"> = {
  available: "success",
  maintenance: "warning",
  warning: "error"
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
  actions: 80
};

export const InventoryTable = ({ rows, loading, onDelete }: InventoryTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);
  const [resizing, setResizing] = useState<{ column: keyof typeof DEFAULT_COLUMN_WIDTHS; startX: number; startWidth: number } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DatabaseRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
    { key: 'actions', label: 'Actions' }
  ] as const;

  return (
    <Paper>
      <TableContainer>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell 
                  key={col.key}
                  sx={{ 
                    width: columnWidths[col.key],
                    position: 'relative',
                    userSelect: 'none'
                  }}
                >
                  {col.label}
                  <Box
                    onMouseDown={(e) => handleResizeStart(col.key, e)}
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
                <TableCell colSpan={12}>
                  <Typography variant="body2" color="text.secondary">
                    Loading inventory...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12}>
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
                      label={row.status}
                      color={statusColor[row.status]}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.subscription}</TableCell>
                  <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis', fontSize: "0.75rem" }}>
                    {row.azure_tenant ? row.azure_tenant.substring(0, 20) + "..." : "-"}
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
        count={rows.length}
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




