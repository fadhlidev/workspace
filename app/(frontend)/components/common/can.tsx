"use client";

import type { ReactNode } from "react";
import type { Resource, Action } from "@shared/types/rbac";
import { usePermissions } from "@frontend/hooks/use-permissions";

interface CanProps {
  resource: Resource;
  action: Action;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Can({ resource, action, fallback = null, children }: CanProps) {
  const { can } = usePermissions();

  if (can(resource, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
