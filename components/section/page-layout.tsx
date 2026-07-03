import type { PropsWithChildren } from "react";
import { Box, CssBaseline } from "@mui/material";
import { Drawer } from "@/components/section/drawer";

export function PageLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer />
      {children}
    </Box>
  );
}
