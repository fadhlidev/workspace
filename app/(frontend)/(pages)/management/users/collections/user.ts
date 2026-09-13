import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@backend/trpc/root";
import type { User } from "@pages/management/users/types/user";

export type ManagementUserRow = User & {
  role: "user" | "admin";
  password?: string;
};

export const usersCollection = collectionOptions("users", (client) => {
  const queryClient = client.requireDependency<QueryClient>("queryClient");
  const trpc = client.requireDependency<TRPCClient<AppRouter>>("trpcClient");

  return queryCollectionOptions<ManagementUserRow>({
    id: "users",
    queryKey: ["management", "users", trpc.management.users.list],
    queryClient,
    queryFn: async () => {
      const res = await trpc.management.users.list.query({
        page: 1,
        limit: 100,
      });
      return res.data as ManagementUserRow[];
    },
    getKey: (user) => user.id,
    onInsert: async ({ transaction }) => {
      const { modified, metadata } = transaction.mutations[0];
      const password = (metadata as { password?: string })?.password ?? "";
      await trpc.management.users.create.mutate({
        name: modified.name,
        username: modified.username,
        email: modified.email,
        password,
        role: modified.role,
      });
    },
    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0];
      await trpc.management.users.update.mutate({
        id: original.id,
        ...(changes.name !== undefined && { name: changes.name }),
        ...(changes.username !== undefined && {
          username: changes.username,
        }),
        ...(changes.email !== undefined && { email: changes.email }),
        ...(changes.role !== undefined && { role: changes.role }),
      });
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      await trpc.management.users.delete.mutate({ id: original.id });
    },
  });
});
