"use client";

import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { Main } from "@/components/section/main";
import { DrawerHeader, useDrawer } from "@/components/section/drawer";
import { useProfile } from "@/hooks/use-profile";
import { UnderDevelopment } from "@/components/ui/under-development";
import { ForbiddenAccess } from "@/components/ui/forbidden-access";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Box } from "@mui/material";
import { cx } from "classix";

interface PageContentProps extends PropsWithChildren {
  withBar?: boolean;
  underDevelopment?: boolean;
  allowedRoles?: ("admin" | "user")[];
  stickyTopComponent?: React.ReactNode;
  stickyTopClassName?: string;
  children: React.ReactNode;
}

export function PageContent({
  children,
  withBar = false,
  underDevelopment = false,
  allowedRoles,
  stickyTopComponent,
  stickyTopClassName,
}: PageContentProps) {
  const { open } = useDrawer();
  const { role } = useProfile();
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const isForbidden =
    allowedRoles && !allowedRoles.includes(role as "admin" | "user");

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <Main open={open} className="@container/main bg-gray-50">
      {withBar && <DrawerHeader />}
      <div ref={sentinelRef} id="sentinel" />
      {underDevelopment || isForbidden ? null : stickyTopComponent ? (
        <Box
          className={cx(
            "sticky z-30 transition-all duration-200",
            withBar ? "top-18" : "top-0",
            isStuck &&
              (stickyTopClassName ||
                "-mx-6 *:rounded-none *:border-x-0 *:border-t-0 *:border-b *:border-b-gray-200"),
          )}
        >
          {stickyTopComponent}
        </Box>
      ) : null}
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
