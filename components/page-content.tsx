"use client";

import type { PropsWithChildren } from "react";
import { Main } from "@/components/section/main";
import { DrawerHeader, useDrawer } from "@/components/section/drawer";
import { UnderDevelopment } from "@/components/under-development";
import { ErrorBoundary } from "@/components/error-boundary";

interface PageContentProps extends PropsWithChildren {
  withBar?: boolean;
  underDevelopment?: boolean;
  children: React.ReactNode;
}

export function PageContent({
  children,
  withBar = false,
  underDevelopment = false,
}: PageContentProps) {
  const { open } = useDrawer();

  return (
    <Main open={open} className="bg-gray-50">
      {withBar && <DrawerHeader />}
      {underDevelopment ? (
        <div className="h-[calc(100%-72px)] w-full">
          <UnderDevelopment />
        </div>
      ) : (
        <ErrorBoundary>{children}</ErrorBoundary>
      )}
    </Main>
  );
}
