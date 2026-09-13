import { collectionOptions } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import type { QueryClient } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { AppRouter } from "@backend/trpc/root";

export type PermissionResource = {
  id: string;
  name: string;
  label: string;
  description: string | null;
};

export const permissionResourcesCollection = collectionOptions(
  "permissionResources",
  (client) => {
    const queryClient = client.requireDependency<QueryClient>("queryClient");
    const trpc = client.requireDependency<TRPCClient<AppRouter>>("trpcClient");

    return queryCollectionOptions<PermissionResource>({
      id: "permissionResources",
      queryKey: [
        "management",
        "accessPermissions",
        "resources",
        trpc.management.accessPermissions.getResources,
      ],
      queryClient,
      queryFn: async () => {
        const res =
          await trpc.management.accessPermissions.getResources.query();
        return (res.data ?? []) as PermissionResource[];
      },
      getKey: (resource) => resource.id,
    });
  },
);
