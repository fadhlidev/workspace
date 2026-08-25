"use client";

import type { PropsWithChildren } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { SessionProvider } from "next-auth/react";
import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { GooeyToaster } from "goey-toast";
import { useTheme } from "@mui/material/styles";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 3,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function ClientProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();
  const theme = useTheme();

  return (
    <ProgressProvider
      color={theme.palette.primary.main}
      height="3px"
      options={{ showSpinner: false }}
      delay={100}
      stopDelay={0}
    >
      <SessionProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <QueryClientProvider client={queryClient}>
            {children}
            <GooeyToaster position="top-right" closeButton showProgress />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </LocalizationProvider>
      </SessionProvider>
    </ProgressProvider>
  );
}
