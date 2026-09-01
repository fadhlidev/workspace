import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/trpc/root";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
