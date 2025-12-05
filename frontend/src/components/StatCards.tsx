import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import HealthAndSafetyRoundedIcon from "@mui/icons-material/HealthAndSafetyRounded";
import { StatsSummary } from "../types";

interface StatCardsProps {
  stats: StatsSummary | null;
  excludeStopped?: boolean;
}

const placeholder: StatsSummary = {
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

export const StatCards = ({ stats, excludeStopped }: StatCardsProps) => {
  const data = stats ?? placeholder;
  
  // Calculate health differently based on excludeStopped flag
  let healthValue = 0;
  if (excludeStopped) {
    // When excluding stopped, health = available / (total - stopped)
    const activeTotal = data.total - (data.by_status.stopped || 0);
    healthValue = activeTotal ? Math.round(((data.by_status.available + (data.by_status.ready || 0)) / activeTotal) * 100) : 0;
  } else {
    // When not excluding stopped, health = available / total (including stopped)
    healthValue = data.total ? Math.round(((data.by_status.available + (data.by_status.ready || 0)) / data.total) * 100) : 0;
  }
  
  const cards = [
    {
      title: "Total Databases",
      value: data.total,
      color: "#2563eb", // blue
      icon: <StorageRoundedIcon fontSize="large" sx={{ color: "#ffffff" }} />
    },
    {
      title: "Provisioned Storage (GB)",
      value: data.storage_gb_total,
      color: "#f59e0b", // orange
      icon: <CloudQueueRoundedIcon fontSize="large" sx={{ color: "#ffffff" }} />
    },
    {
      title: "Healthy (%)",
      value: healthValue,
      color: "#10b981", // green
      icon: <HealthAndSafetyRoundedIcon fontSize="large" sx={{ color: "#ffffff" }} />
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} md={4} key={card.title}>
          <Card sx={{ height: '100%', bgcolor: card.color }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#ffffff' }} gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#ffffff' }}>
                    {card.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};


