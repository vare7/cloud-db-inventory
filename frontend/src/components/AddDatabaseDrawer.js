import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Button, Drawer, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState } from "react";
const defaultForm = {
    provider: "AWS",
    service: "",
    engine: "",
    region: "",
    endpoint: "",
    storage_gb: 10,
    status: "available",
    subscription: "",
    tags: [],
    version: "",
    azure_tenant: ""
};
export const AddDatabaseDrawer = ({ onCreate }) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(defaultForm);
    const handleSubmit = async () => {
        if (!form.service || !form.engine || !form.region) {
            return;
        }
        await onCreate({ ...form, tags: form.tags.filter(Boolean) });
        setForm(defaultForm);
        setOpen(false);
    };
    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    return (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "contained", startIcon: _jsx(AddRoundedIcon, {}), onClick: () => setOpen(true), sx: {
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    textTransform: "none",
                    fontWeight: 600
                }, children: "Add Database" }), _jsx(Drawer, { anchor: "right", open: open, onClose: () => setOpen(false), children: _jsxs(Box, { sx: { width: 420, p: 4, height: "100%" }, children: [_jsx(Typography, { variant: "h6", sx: { mb: 3 }, children: "New database resource" }), _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, children: _jsxs(TextField, { fullWidth: true, select: true, label: "Provider", value: form.provider, onChange: (e) => updateField("provider", e.target.value), children: [_jsx(MenuItem, { value: "AWS", children: "AWS" }), _jsx(MenuItem, { value: "Azure", children: "Azure" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Service", fullWidth: true, value: form.service, onChange: (e) => updateField("service", e.target.value) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { label: "Engine", fullWidth: true, value: form.engine, onChange: (e) => updateField("engine", e.target.value) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { label: "Region", fullWidth: true, value: form.region, onChange: (e) => updateField("region", e.target.value) }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Endpoint", fullWidth: true, value: form.endpoint, onChange: (e) => updateField("endpoint", e.target.value) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { type: "number", label: "Storage (GB)", fullWidth: true, value: form.storage_gb, onChange: (e) => updateField("storage_gb", Number(e.target.value)), inputProps: { min: 1 } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(TextField, { select: true, label: "Status", fullWidth: true, value: form.status, onChange: (e) => updateField("status", e.target.value), children: [_jsx(MenuItem, { value: "available", children: "Available" }), _jsx(MenuItem, { value: "maintenance", children: "Maintenance" }), _jsx(MenuItem, { value: "warning", children: "Warning" })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Subscription", fullWidth: true, value: form.subscription, onChange: (e) => updateField("subscription", e.target.value) }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { label: "Version", fullWidth: true, value: form.version || "", onChange: (e) => updateField("version", e.target.value), placeholder: "e.g., 15.4, 8.0" }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { label: "Azure Tenant (Azure only)", fullWidth: true, value: form.azure_tenant || "", onChange: (e) => updateField("azure_tenant", e.target.value), disabled: form.provider !== "Azure", placeholder: "Tenant ID" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(TextField, { label: "Tags (comma separated)", fullWidth: true, value: form.tags.join(","), onChange: (e) => updateField("tags", e.target.value
                                            .split(",")
                                            .map((tag) => tag.trim())
                                            .filter(Boolean)) }) })] }), _jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 4 }, children: [_jsx(Button, { variant: "contained", fullWidth: true, onClick: handleSubmit, children: "Save" }), _jsx(Button, { variant: "text", fullWidth: true, color: "inherit", onClick: () => setOpen(false), children: "Cancel" })] })] }) })] }));
};
