import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
const placeholder = {
    total: 0,
    storage_gb_total: 0,
    by_provider: {
        AWS: 0,
        Azure: 0
    },
    by_status: {
        available: 0,
        ready: 0,
        stopped: 0,
        maintenance: 0,
        warning: 0
    }
};
export const StatCards = ({ stats }) => {
    const data = stats ?? placeholder;
    const cards = [
        {
            title: "Total Databases",
            value: data.total,
            color: "#2563eb", // blue
            icon: _jsx(StorageRoundedIcon, { fontSize: "large", sx: { color: "#ffffff" } })
        },
        {
            title: "Provisioned Storage (GB)",
            value: data.storage_gb_total,
            color: "#f59e0b", // orange
            icon: _jsx(CloudQueueRoundedIcon, { fontSize: "large", sx: { color: "#ffffff" } })
        },
        {
            title: "Healthy (%)",
            value: data.total ? Math.round(((data.by_status.available + data.by_status.ready) / data.total) * 100) : 0,
            color: "#10b981", // green
            icon: _jsx(HealthAndSafetyRoundedIcon, { fontSize: "large", sx: { color: "#ffffff" } })
        }
    ];
    return (_jsx(Grid, { container: true, spacing: 2, children: cards.map((card) => (_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Card, { sx: { height: '100%', bgcolor: card.color }, children: _jsx(CardContent, { children: _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Box, { sx: {
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }, children: card.icon }), _jsxs(Box, { sx: { flex: 1 }, children: [_jsx(Typography, { variant: "body2", sx: { color: '#ffffff' }, gutterBottom: true, children: card.title }), _jsx(Typography, { variant: "h4", sx: { fontWeight: 700, color: '#ffffff' }, children: card.value })] })] }) }) }) }, card.title))) }));
};
