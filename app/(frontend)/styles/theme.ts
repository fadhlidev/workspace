"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#282828",
    },
    success: {
      main: "#009689",
    },
  },
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontFamily: "var(--font-lato)",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-lato)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-lato)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-lato)",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-lato)",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-lato)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontFamily: "var(--font-lato)",
        },
      },
    },
  },
  cssVariables: true,
});
