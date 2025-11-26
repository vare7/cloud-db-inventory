import { Box, Stack, Typography } from "@mui/material";

interface Series {
  key: string; // engine name
  color: string;
  values: Record<string, number>; // version -> count
}

interface BarChartProps {
  series: Series[];
  height?: number;
}

export const BarChart = ({ series, height = 280 }: BarChartProps) => {
  const versions = Array.from(
    new Set(series.flatMap((s) => Object.keys(s.values)))
  );
  const max = Math.max(
    1,
    ...series.flatMap((s) => Object.values(s.values))
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ display: "flex", gap: 16, alignItems: "end", height }}>
        {versions.map((ver) => (
          <Box key={ver} sx={{ display: "flex", alignItems: "end", gap: 1 }}>
            {series.map((s) => {
              const v = s.values[ver] || 0;
              const barH = (v / max) * (height - 40);
              return (
                <Box
                  key={s.key}
                  sx={{
                    width: 16,
                    height: barH,
                    bgcolor: s.color,
                    borderRadius: 1,
                  }}
                  title={`${s.key} ${ver}: ${v}`}
                />
              );
            })}
            <Typography variant="caption" sx={{ mt: 0.5, display: "block", textAlign: "center" }}>
              {ver}
            </Typography>
          </Box>
        ))}
      </Box>
      <Stack direction="row" spacing={2} alignItems="center">
        {series.map((s) => (
          <Stack key={s.key} direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 12, height: 12, bgcolor: s.color, borderRadius: 0.5 }} />
            <Typography variant="caption">{s.key}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
