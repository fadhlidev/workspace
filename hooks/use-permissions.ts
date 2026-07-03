"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Resource, Action } from "@/lib/permissions";

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
