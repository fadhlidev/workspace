import type { Metadata } from "next";
import { PageLayout } from "@frontend/components/layout/page-layout";
import { PageBar } from "@frontend/components/layout/page-bar";
import { PageDrawer } from "@frontend/components/layout/page-drawer";
import { PageMenuList } from "@frontend/components/layout/page-menu-list";
import { PageContent } from "@frontend/components/layout/page-content";
import { PermissionMatrix } from "@pages/management/access-permission/components/permission-matrix";

export const metadata: Metadata = {
  title: "Access Permissions | Fadhlidev Dashboard",
};

export default function Page() {
  return (
    <PageLayout>
      <PageBar
        title="Access Permissions"
        description="Manage role-based permissions for system resources and actions"
      />
      <PageDrawer showLogo>
        <PageMenuList />
      </PageDrawer>
      <PageContent allowedRoles={["admin"]} withBar>
        <PermissionMatrix />
      </PageContent>
    </PageLayout>
  );
}
