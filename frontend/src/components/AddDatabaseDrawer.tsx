import {
  Box,
  Button,
  Drawer,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState } from "react";
import { DatabaseRecord, Provider, Status } from "../types";

interface AddDatabaseDrawerProps {
  onCreate: (payload: Omit<DatabaseRecord, "id">) => Promise<void>;
}

const defaultForm: Omit<DatabaseRecord, "id"> = {
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

export const AddDatabaseDrawer = ({ onCreate }: AddDatabaseDrawerProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<DatabaseRecord, "id">>(defaultForm);

  const handleSubmit = async () => {
    if (!form.service || !form.engine || !form.region) {
      return;
    }
    await onCreate({ ...form, tags: form.tags.filter(Boolean) });
    setForm(defaultForm);
    setOpen(false);
  };

  const updateField = (key: keyof typeof form, value: string | number | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddRoundedIcon />}
        onClick={() => setOpen(true)}
        sx={{
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
          textTransform: "none",
          fontWeight: 600
        }}
      >
        Add Database
      </Button>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 420, p: 4, height: "100%" }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            New database resource
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Provider"
                value={form.provider}
                onChange={(e) => updateField("provider", e.target.value as Provider)}
              >
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Service"
                fullWidth
                value={form.service}
                onChange={(e) => updateField("service", e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Engine"
                fullWidth
                value={form.engine}
                onChange={(e) => updateField("engine", e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Region"
                fullWidth
                value={form.region}
                onChange={(e) => updateField("region", e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Endpoint"
                fullWidth
                value={form.endpoint}
                onChange={(e) => updateField("endpoint", e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                type="number"
                label="Storage (GB)"
                fullWidth
                value={form.storage_gb}
                onChange={(e) => updateField("storage_gb", Number(e.target.value))}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={form.status}
                onChange={(e) => updateField("status", e.target.value as Status)}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subscription"
                fullWidth
                value={form.subscription}
                onChange={(e) => updateField("subscription", e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Version"
                fullWidth
                value={form.version || ""}
                onChange={(e) => updateField("version", e.target.value)}
                placeholder="e.g., 15.4, 8.0"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Azure Tenant (Azure only)"
                fullWidth
                value={form.azure_tenant || ""}
                onChange={(e) => updateField("azure_tenant", e.target.value)}
                disabled={form.provider !== "Azure"}
                placeholder="Tenant ID"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Tags (comma separated)"
                fullWidth
                value={form.tags.join(",")}
                onChange={(e) =>
                  updateField(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  )
                }
              />
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Save
            </Button>
            <Button variant="text" fullWidth color="inherit" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};


