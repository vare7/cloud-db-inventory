import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f8fafc",
      paper: "#ffffff"
    },
    primary: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb"
    },
    secondary: {
      main: "#8b5cf6",
      light: "#a78bfa",
      dark: "#7c3aed"
    },
    success: {
      main: "#10b981",
      light: "#34d399"
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24"
    },
    error: {
      main: "#ef4444",
      light: "#f87171"
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b"
    },
    divider: "#e2e8f0"
  },
  shape: { 
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em"
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em"
    },
    button: {
      textTransform: "none",
      fontWeight: 600
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none"
          }
        },
        contained: {
          "&:hover": {
            transform: "translateY(-1px)"
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
        }
      }
    }
  }
});
