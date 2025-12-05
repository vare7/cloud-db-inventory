import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Alert, Divider, Chip } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import axios from "axios";
export const AzureVMCsvUploadDialog = ({ open, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const handleFileSelect = (e) => {
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
            const response = await axios.post("http://localhost:8000/api/azure-vms/import-csv", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setImportResult(response.data);
            setShowResult(true);
            setFile(null);
            onSuccess();
        }
        catch (err) {
            setError(err.response?.data?.detail || "Failed to upload CSV file");
        }
        finally {
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
    return (_jsxs(_Fragment, { children: [_jsxs(Dialog, { open: open && !showResult, onClose: handleClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Import Azure VMs from CSV" }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [_jsxs(Box, { children: [_jsx("input", { accept: ".csv", style: { display: "none" }, id: "azure-vm-csv-file-input", type: "file", onChange: handleFileSelect }), _jsx("label", { htmlFor: "azure-vm-csv-file-input", children: _jsx(Button, { variant: "outlined", component: "span", startIcon: _jsx(CloudUploadRoundedIcon, {}), fullWidth: true, children: file ? file.name : "Select CSV File" }) })] }), error && (_jsx(Typography, { variant: "body2", sx: { color: "#ef4444", mt: 1 }, children: error })), _jsxs(Box, { sx: { bgcolor: "action.hover", p: 2, borderRadius: 1 }, children: [_jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mb: 1 }, children: _jsx("strong", { children: "CSV Format:" }) }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block", mb: 1 }, children: "Required columns (case-insensitive):" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", sx: { ml: 2 }, children: "\u2022 computerName" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", sx: { ml: 2 }, children: "\u2022 privateIPAddress" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", sx: { ml: 2 }, children: "\u2022 Subscription" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", sx: { ml: 2 }, children: "\u2022 Resource group" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", sx: { ml: 2 }, children: "\u2022 Location" }), _jsx(Typography, { variant: "caption", color: "text.secondary", component: "div", sx: { ml: 2, mb: 1 }, children: "\u2022 vmSize, osType, osDiskSize, dataDiskCount, totalDiskSizeGB, displayStatus, timeCreated, tenantId" }), _jsx(Typography, { variant: "caption", color: "text.secondary", sx: { display: "block" }, children: "UTF-8 encoding with optional BOM is supported." })] })] }) }), _jsxs(DialogActions, { sx: { px: 3, pb: 2 }, children: [_jsx(Button, { onClick: handleClose, color: "inherit", disabled: loading, children: "Cancel" }), _jsx(Button, { onClick: handleUpload, variant: "contained", disabled: !file || loading, children: loading ? "Uploading..." : "Import" })] })] }), _jsxs(Dialog, { open: showResult, onClose: handleResultClose, maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { children: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(CheckCircleOutlineIcon, { color: "success" }), _jsx(Typography, { variant: "h6", children: "Import Successful" })] }) }), _jsx(DialogContent, { children: importResult && (_jsxs(Stack, { spacing: 3, children: [_jsx(Alert, { severity: "success", children: importResult.message }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "Summary:" }), _jsxs(Stack, { direction: "row", spacing: 2, flexWrap: "wrap", sx: { mt: 1 }, children: [_jsx(Chip, { label: `Imported: ${importResult.imported}`, color: "success", variant: "outlined" }), _jsx(Chip, { label: `Skipped: ${importResult.skipped}`, color: "warning", variant: "outlined" }), _jsx(Chip, { label: `Purged: ${importResult.purged}`, color: "error", variant: "outlined" })] })] }), importResult.skipped > 0 && importResult.skipped_details && importResult.skipped_details.length > 0 && (_jsxs(Box, { children: [_jsx(Divider, { sx: { mb: 2 } }), _jsx(Typography, { variant: "subtitle2", color: "warning.main", gutterBottom: true, children: "Skipped Records:" }), _jsxs(Box, { sx: { maxHeight: 150, overflow: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }, children: [importResult.skipped_details.slice(0, 5).map((item, idx) => (_jsxs(Typography, { variant: "caption", display: "block", children: ["\u2022 Row ", item.row, ": ", item.error] }, idx))), importResult.skipped_details.length > 5 && (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["... and ", importResult.skipped_details.length - 5, " more"] }))] })] }))] })) }), _jsx(DialogActions, { sx: { px: 3, pb: 2 }, children: _jsx(Button, { onClick: handleResultClose, variant: "contained", children: "Close" }) })] })] }));
};
