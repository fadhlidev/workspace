import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@backend/trpc/root";

export type RolePermission = {
  id: string;
  role: string;
  resourceId: string;
  actionId: string;
  resource: string;
  action: string;
};

export const rolePermissionsCollection = collectionOptions(
  "rolePermissions",
  (client) => {
    const queryClient = client.requireDependency<QueryClient>("queryClient");
    const trpc = client.requireDependency<TRPCClient<AppRouter>>("trpcClient");

    return queryCollectionOptions<RolePermission>({
      id: "rolePermissions",
      queryKey: [
        "management",
        "accessPermissions",
        "rolePermissions",
        trpc.management.accessPermissions.getRolePermissions,
      ],
      queryClient,
      queryFn: async () => {
        const res =
          await trpc.management.accessPermissions.getRolePermissions.query();
        return (res.data ?? []) as RolePermission[];
      },
      getKey: (row) => row.id,
      onInsert: async ({ transaction }) => {
        const { modified } = transaction.mutations[0];
        await trpc.management.accessPermissions.toggleRolePermission.mutate({
          targetRole: modified.role as "user" | "admin",
          resourceId: modified.resourceId,
          actionId: modified.actionId,
          enabled: true,
        });
      },
      onDelete: async ({ transaction }) => {
        const { original } = transaction.mutations[0];
        await trpc.management.accessPermissions.toggleRolePermission.mutate({
          targetRole: original.role as "user" | "admin",
          resourceId: original.resourceId,
          actionId: original.actionId,
          enabled: false,
        });
      },
    });
  },
);
