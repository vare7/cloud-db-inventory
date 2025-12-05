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
  CircularProgress
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import axios from "axios";

interface ImportResult {
  message: string;
  imported: number;
}

interface AWSAccountCsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AWSAccountCsvUploadDialog = ({ open, onClose, onSuccess }: AWSAccountCsvUploadDialogProps) => {
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
        "http://localhost:8000/api/aws-accounts/import-csv",
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
        <DialogTitle>Import AWS Account Inventory</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Upload a CSV file containing AWS account information. Existing accounts will be updated, new ones will be added.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Expected format:
            </Typography>
            <Box
              sx={{
                bgcolor: "grey.100",
                p: 2,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.875rem"
              }}
            >
              #,AccountID,Account Alias(Friendly Name),BusinessUnit,Owner,Account Type(Data Type),Account Type(Function),Comments
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadRoundedIcon />}
                fullWidth
              >
                {file ? file.name : "Select CSV File"}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Importing..." : "Import"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResult} onClose={handleResultClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleOutlineIcon color="success" />
            <Typography>Import Complete</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="success">{importResult?.message}</Alert>
            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Accounts Processed:</strong> {importResult?.imported}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Existing accounts were updated, new accounts were added.
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResultClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
