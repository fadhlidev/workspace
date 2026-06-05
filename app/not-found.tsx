"use client";

import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Box, Button, Paper, Typography } from "@mui/material";

export default function NotFound() {
  return (
    <Box
      sx={{
        display: "grid",
        minHeight: "100vh",
        placeItems: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#f6f8fb",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(ellipse at 20% 10%, rgba(105,37,156,0.08), transparent 50%)",
            "radial-gradient(ellipse at 80% 90%, rgba(15,118,110,0.08), transparent 50%)",
          ].join(","),
        }}
      />

      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          px: { xs: 4, sm: 8 },
          py: { xs: 6, sm: 8 },
          maxWidth: 480,
          mx: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(105,37,156,0.08)",
            mb: 3,
          }}
        >
          <SearchX size={36} className="text-[#69259c]" />
        </Box>

        <Typography
          className="font-lato"
          sx={{
            fontSize: { xs: "5rem", sm: "6rem" },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #69259c 0%, #0f766e 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          404
        </Typography>

        <Typography
          className="font-lato"
          variant="h5"
          sx={{ fontWeight: 700, color: "#12175d", mb: 1 }}
        >
          Page not found
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            textAlign: "center",
            fontSize: "0.875rem",
            maxWidth: 320,
            mb: 4,
          }}
        >
          The page you are looking for does not exist or has been moved. Check
          the URL or head back to the dashboard.
        </Typography>

        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          startIcon={<Home size={18} />}
          sx={{ px: 4 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
}
