import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@backend/trpc/root";
import { createTRPCContext } from "@backend/trpc/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
  });

export { handler as GET, handler as POST };
