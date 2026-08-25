import type { PropsWithChildren } from "react";
import { Box, CssBaseline } from "@mui/material";

export function PageLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {children}
    </Box>
  );
}
