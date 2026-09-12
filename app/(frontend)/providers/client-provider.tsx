"use client";

import { useState, type PropsWithChildren } from "react";
import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SessionProvider, getSession } from "next-auth/react";
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
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { TRPCProvider } from "@frontend/trpc/client";
import type { AppRouter } from "@backend/trpc/root";

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

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          async headers() {
            const session = await getSession();
            if (session?.accessToken) {
              return {
                Authorization: `Bearer ${session.accessToken}`,
              };
            }
            return {};
          },
        }),
      ],
    }),
  );

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
            <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
              <NuqsAdapter>{children}</NuqsAdapter>
              <GooeyToaster position="top-right" closeButton showProgress />
              <ReactQueryDevtools initialIsOpen={false} />
            </TRPCProvider>
          </QueryClientProvider>
        </LocalizationProvider>
      </SessionProvider>
    </ProgressProvider>
  );
}
