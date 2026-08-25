"use client";

import { Box, Typography } from "@mui/material";
import { Construction } from "lucide-react";

export function UnderDevelopment() {
  return (
    <Box className="@container flex size-full items-center justify-center">
      <Box className="flex flex-col items-center gap-3 p-8 text-center @md:gap-4">
        <Construction className="size-10 stroke-gray-400 @md:size-14" />
        <Typography
          variant="h6"
          className="font-lato text-lg font-semibold text-gray-600 @md:text-xl"
        >
          Under Development
        </Typography>
        <Typography
          variant="body2"
          className="font-lato max-w-sm text-sm text-gray-400"
        >
          This section is currently under development and will be available
          soon.
        </Typography>
      </Box>
    </Box>
  );
}
