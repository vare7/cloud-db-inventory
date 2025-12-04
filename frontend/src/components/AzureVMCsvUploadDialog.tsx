import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Alert,
  Divider,
  Chip,
  CircularProgress
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import axios from "axios";

interface ImportResult {
  message: string;
  imported: number;
  skipped: number;
  purged: number;
  skipped_details?: any[];
}

interface AzureVMCsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AzureVMCsvUploadDialog = ({ open, onClose, onSuccess }: AzureVMCsvUploadDialogProps) => {
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
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8000/api/azure-vms/import-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setImportResult(response.data);
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
        <DialogTitle>Import Azure VMs from CSV</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box>
              <input
                accept=".csv"
                style={{ display: "none" }}
                id="azure-vm-csv-file-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="azure-vm-csv-file-input">
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
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Required columns (case-insensitive):
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ ml: 2 }}>
                • computerName
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ ml: 2 }}>
                • privateIPAddress
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ ml: 2 }}>
                • Subscription
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ ml: 2 }}>
                • Resource group
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ ml: 2 }}>
                • Location
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ ml: 2, mb: 1 }}>
                • vmSize, osType, osDiskSize, dataDiskCount, totalDiskSizeGB, displayStatus, timeCreated, tenantId
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                UTF-8 encoding with optional BOM is supported.
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
                    label={`Imported: ${importResult.imported}`} 
                    color="success" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Skipped: ${importResult.skipped}`} 
                    color="warning" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Purged: ${importResult.purged}`} 
                    color="error" 
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {importResult.skipped > 0 && importResult.skipped_details && importResult.skipped_details.length > 0 && (
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" color="warning.main" gutterBottom>
                    Skipped Records:
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                    {importResult.skipped_details.slice(0, 5).map((item: any, idx: number) => (
                      <Typography key={idx} variant="caption" display="block">
                        • Row {item.row}: {item.error}
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
