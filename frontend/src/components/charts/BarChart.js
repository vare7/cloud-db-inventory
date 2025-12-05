import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Stack, Typography } from "@mui/material";
export const BarChart = ({ series, height = 280 }) => {
    const versions = Array.from(new Set(series.flatMap((s) => Object.keys(s.values))));
    const max = Math.max(1, ...series.flatMap((s) => Object.values(s.values)));
    return (_jsxs(Stack, { spacing: 2, children: [_jsx(Box, { sx: { display: "flex", gap: 16, alignItems: "end", height }, children: versions.map((ver) => (_jsxs(Box, { sx: { display: "flex", alignItems: "end", gap: 1 }, children: [series.map((s) => {
                            const v = s.values[ver] || 0;
                            const barH = (v / max) * (height - 40);
                            return (_jsx(Box, { sx: {
                                    width: 16,
                                    height: barH,
                                    bgcolor: s.color,
                                    borderRadius: 1,
                                }, title: `${s.key} ${ver}: ${v}` }, s.key));
                        }), _jsx(Typography, { variant: "caption", sx: { mt: 0.5, display: "block", textAlign: "center" }, children: ver })] }, ver))) }), _jsx(Stack, { direction: "row", spacing: 2, alignItems: "center", children: series.map((s) => (_jsxs(Stack, { direction: "row", spacing: 1, alignItems: "center", children: [_jsx(Box, { sx: { width: 12, height: 12, bgcolor: s.color, borderRadius: 0.5 } }), _jsx(Typography, { variant: "caption", children: s.key })] }, s.key))) })] }));
};
