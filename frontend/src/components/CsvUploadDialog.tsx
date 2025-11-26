import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
  Chip
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import { Provider } from "../types";
import { importCsv } from "../api/client";

interface ImportResult {
  message: string;
  created: number;
  skipped: number;
  duplicates: number;
  deleted: number;
  skipped_details?: any[];
  duplicates_details?: any[];
  deleted_details?: any[];
}

interface CsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CsvUploadDialog = ({ open, onClose, onSuccess }: CsvUploadDialogProps) => {
  const [provider, setProvider] = useState<Provider>("AWS");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await importCsv(file, provider);
      setImportResult(result);
      setShowResult(true);
      setFile(null);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload CSV file");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImportResult(null);
    setShowResult(false);
    setError(null);
    setFile(null);
    onClose();
  };

  const handleResultClose = () => {
    setShowResult(false);
    handleClose();
  };

  return (
    <>
      {/* Upload Dialog */}
      <Dialog open={open && !showResult} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Import from CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              fullWidth
            >
              <MenuItem value="AWS">AWS</MenuItem>
              <MenuItem value="Azure">Azure</MenuItem>
            </TextField>

            <Box>
              <input
                accept=".csv"
                style={{ display: "none" }}
                id="csv-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="csv-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadRoundedIcon />}
                  fullWidth
                >
                  {file ? file.name : "Select CSV File"}
                </Button>
              </label>
            </Box>

            {error && (
              <Typography variant="body2" sx={{ color: "#ef4444", mt: 1 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                <strong>CSV Format:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                The CSV should include columns for: service, engine, region, endpoint, storage_gb,
                status, subscription, tags, version, and azure_tenant (for Azure). Column names are
                case-insensitive and flexible (e.g., "Service", "service_name", "DB Service").
              </Typography>
              <Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 1, fontWeight: 600 }}>
                Note: Records in the database that are NOT in the CSV will be deleted.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} variant="contained" disabled={!file || loading}>
            {loading ? "Uploading..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Result Dialog */}
      <Dialog open={showResult} onClose={handleResultClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleOutlineIcon color="success" />
            <Typography variant="h6">Import Successful</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {importResult && (
            <Stack spacing={3}>
              <Alert severity="success">
                {importResult.message}
              </Alert>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Summary:
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
                  <Chip 
                    label={`Created: ${importResult.created}`} 
                    color="success" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Duplicates: ${importResult.duplicates}`} 
                    color="info" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Skipped: ${importResult.skipped}`} 
                    color="warning" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Deleted: ${importResult.deleted}`} 
                    color="error" 
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {importResult.deleted > 0 && (
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="warning">
                    <Typography variant="body2" fontWeight={600}>
                      {importResult.deleted} record(s) were deleted from the database because they were not found in the CSV.
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      CSV is the source of truth - any databases not in the CSV are considered decommissioned.
                    </Typography>
                  </Alert>
                </Box>
              )}

              {importResult.skipped > 0 && importResult.skipped_details && importResult.skipped_details.length > 0 && (
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Skipped Records (Missing Required Fields):
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                    {importResult.skipped_details.slice(0, 5).map((item: any, idx: number) => (
                      <Typography key={idx} variant="caption" display="block">
                        • {item.reason}
                      </Typography>
                    ))}
                    {importResult.skipped_details.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {importResult.skipped_details.length - 5} more
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleResultClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

