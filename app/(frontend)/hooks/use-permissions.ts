import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTRPC } from "@frontend/trpc/client";
import type { Resource, Action } from "@shared/types/rbac";

type Permission = { resource: Resource; action: Action };

export function usePermissions() {
  const { data: session } = useSession();
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.rbac.getMePermissions.queryOptions(undefined, {
      enabled: !!session,
      staleTime: 5 * 60 * 1000,
    }),
  );

  const permissions = (data?.permissions as Permission[]) ?? [];

  const can = (resource: Resource, action: Action): boolean =>
    permissions.some((p) => p.resource === resource && p.action === action);

  return { can, permissions, isLoading };
}
