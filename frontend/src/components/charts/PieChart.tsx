import { Box } from "@mui/material";

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  slices: PieSlice[];
  size?: number; // diameter
}

export const PieChart = ({ slices, size = 220 }: PieChartProps) => {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = size / 2;
  const center = size / 2;

  let startAngle = -Math.PI / 2; // start at top

  const paths = slices.map((s, idx) => {
    const angle = total ? (s.value / total) * Math.PI * 2 : 0;
    const endAngle = startAngle + angle;
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    startAngle = endAngle;
    return (
      <path key={idx} d={d} fill={s.color} />
    );
  });

  return (
    <Box sx={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
    </Box>
  );
};
