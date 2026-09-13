import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@backend/trpc/root";

export type PermissionAction = {
  id: string;
  name: string;
  label: string;
  description: string | null;
};

export const permissionActionsCollection = collectionOptions(
  "permissionActions",
  (client) => {
    const queryClient = client.requireDependency<QueryClient>("queryClient");
    const trpc = client.requireDependency<TRPCClient<AppRouter>>("trpcClient");

    return queryCollectionOptions<PermissionAction>({
      id: "permissionActions",
      queryKey: [
        "management",
        "accessPermissions",
        "actions",
        trpc.management.accessPermissions.getActions,
      ],
      queryClient,
      queryFn: async () => {
        const res = await trpc.management.accessPermissions.getActions.query();
        return (res.data ?? []) as PermissionAction[];
      },
      getKey: (action) => action.id,
    });
  },
);
