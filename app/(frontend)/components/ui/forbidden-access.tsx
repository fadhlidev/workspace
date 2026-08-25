"use client";

import { Box, Typography } from "@mui/material";
import { ShieldX } from "lucide-react";

export function ForbiddenAccess() {
  return (
    <Box className="@container flex size-full items-center justify-center">
      <Box className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50/50 p-8 text-center @md:gap-4">
        <ShieldX className="size-10 stroke-red-400 @md:size-14" />
        <Typography
          variant="h6"
          className="font-lato text-lg font-semibold text-red-700 @md:text-xl"
        >
          Forbidden Access
        </Typography>
        <Typography
          variant="body2"
          className="font-lato max-w-sm text-sm text-red-500"
        >
          You do not have permission to access this section. Please contact your
          administrator if you believe this is a mistake.
        </Typography>
      </Box>
    </Box>
  );
}
