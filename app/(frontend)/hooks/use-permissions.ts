import { api } from "@backend/api/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Resource, Action } from "@shared/types/rbac";

type Permission = { resource: Resource; action: Action };

export function usePermissions() {
  const { data: session } = useSession();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/permissions/me"],
    queryFn: async () => {
      const res = await api.get("/api/permissions/me");
      return res.data.permissions as Permission[];
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000,
  });

  const permissions = data ?? [];

  const can = (resource: Resource, action: Action): boolean =>
    permissions.some((p) => p.resource === resource && p.action === action);

  return { can, permissions, isLoading };
}
