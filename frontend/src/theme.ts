import { createTheme } from "@mui/material/styles";

const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode colors
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
        }
      : {
          // Dark mode colors
          background: {
            default: "#0f172a",
            paper: "#1e293b"
          },
          primary: {
            main: "#60a5fa",
            light: "#93c5fd",
            dark: "#3b82f6"
          },
          secondary: {
            main: "#a78bfa",
            light: "#c4b5fd",
            dark: "#8b5cf6"
          },
          success: {
            main: "#34d399",
            light: "#6ee7b7"
          },
          warning: {
            main: "#fbbf24",
            light: "#fcd34d"
          },
          error: {
            main: "#f87171",
            light: "#fca5a5"
          },
          text: {
            primary: "#f1f5f9",
            secondary: "#94a3b8"
          },
          divider: "#334155"
        }),
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
      textTransform: "none" as const,
      fontWeight: 600
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
            : "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
          "&:hover": {
            boxShadow: mode === 'light'
              ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
              : "0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)"
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
          boxShadow: mode === 'light'
            ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
            : "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)"
        }
      }
    }
  }
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));
export const theme = lightTheme;
