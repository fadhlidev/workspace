"use client";

import { Box, Button, Typography } from "@mui/material";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <Box className="@container flex size-full items-center justify-center">
      <Box className="flex flex-col items-center gap-3 p-8 text-center @md:gap-4">
        <Box className="flex size-10 items-center justify-center rounded-full bg-red-50 @md:size-14">
          <AlertTriangle className="size-5 text-red-500 @md:size-7" />
        </Box>
        <Typography
          variant="h6"
          className="font-lato text-lg font-semibold text-gray-600 @md:text-xl"
        >
          Something went wrong
        </Typography>
        <Typography
          variant="body2"
          className="font-lato max-w-sm text-sm text-gray-400"
        >
          An unexpected error occurred. Try refreshing the page or come back
          later.
        </Typography>
        {resetErrorBoundary && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshCw size={15} />}
            onClick={resetErrorBoundary}
            sx={{ mt: 1 }}
          >
            Try again
          </Button>
        )}
      </Box>
    </Box>
  );
}
