import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Alert, CircularProgress } from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useState } from "react";
import axios from "axios";
export const AWSAccountCsvUploadDialog = ({ open, onClose, onSuccess }) => {
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
            const response = await axios.post("http://localhost:8000/api/aws-accounts/import-csv", formData, {
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
    return (_jsxs(_Fragment, { children: [_jsxs(Dialog, { open: open && !showResult, onClose: handleClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Import AWS Account Inventory" }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 3, sx: { mt: 1 }, children: [_jsx(Typography, { variant: "body2", color: "text.secondary", children: "Upload a CSV file containing AWS account information. Existing accounts will be updated, new ones will be added." }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { fontWeight: 600 }, children: "Expected format:" }), _jsx(Box, { sx: {
                                        bgcolor: "grey.100",
                                        p: 2,
                                        borderRadius: 1,
                                        fontFamily: "monospace",
                                        fontSize: "0.875rem"
                                    }, children: "#,AccountID,Account Alias(Friendly Name),BusinessUnit,Owner,Account Type(Data Type),Account Type(Function),Comments" }), error && _jsx(Alert, { severity: "error", children: error }), _jsx(Box, { children: _jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(CloudUploadRoundedIcon, {}), fullWidth: true, children: [file ? file.name : "Select CSV File", _jsx("input", { type: "file", accept: ".csv", hidden: true, onChange: handleFileSelect })] }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleClose, disabled: loading, children: "Cancel" }), _jsx(Button, { onClick: handleUpload, variant: "contained", disabled: !file || loading, startIcon: loading ? _jsx(CircularProgress, { size: 20 }) : null, children: loading ? "Importing..." : "Import" })] })] }), _jsxs(Dialog, { open: showResult, onClose: handleResultClose, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: _jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(CheckCircleOutlineIcon, { color: "success" }), _jsx(Typography, { children: "Import Complete" })] }) }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 2, children: [_jsx(Alert, { severity: "success", children: importResult?.message }), _jsxs(Stack, { spacing: 1, children: [_jsxs(Typography, { variant: "body2", children: [_jsx("strong", { children: "Accounts Processed:" }), " ", importResult?.imported] }), _jsx(Typography, { variant: "caption", color: "text.secondary", children: "Existing accounts were updated, new accounts were added." })] })] }) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: handleResultClose, variant: "contained", children: "Close" }) })] })] }));
};
