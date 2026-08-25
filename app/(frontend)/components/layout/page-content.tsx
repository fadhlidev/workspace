"use client";

import type { PropsWithChildren } from "react";
import { useProfile } from "@frontend/hooks/use-profile";
import { usePageDrawer } from "@frontend/components/layout/page-drawer";
import { DrawerHeader } from "@frontend/components/styled/drawer-header";
import { Main } from "@frontend/components/styled/main";
import { UnderDevelopment } from "@frontend/components/ui/under-development";
import { ForbiddenAccess } from "@frontend/components/ui/forbidden-access";
import { ErrorBoundary } from "@frontend/components/ui/error-boundary";

interface PageContentProps extends PropsWithChildren {
  withBar?: boolean;
  underDevelopment?: boolean;
  allowedRoles?: ("admin" | "user")[];
  children: React.ReactNode;
}

export function PageContent({
  children,
  withBar = false,
  underDevelopment = false,
  allowedRoles,
}: PageContentProps) {
  const { open } = usePageDrawer();
  const { role } = useProfile();

  const isForbidden =
    allowedRoles && !allowedRoles.includes(role as "admin" | "user");

  return (
    <Main open={open} className="@container/main bg-gray-50">
      {withBar && <DrawerHeader />}
      {isForbidden ? (
        <div className="h-[calc(100%-72px)] w-full">
          <ForbiddenAccess />
        </div>
      ) : underDevelopment ? (
        <div className="h-[calc(100%-72px)] w-full">
          <UnderDevelopment />
        </div>
      ) : (
        <ErrorBoundary>{children}</ErrorBoundary>
      )}
    </Main>
  );
}
