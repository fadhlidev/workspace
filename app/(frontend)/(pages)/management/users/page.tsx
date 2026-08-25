import type { Metadata } from "next";
import { PageLayout } from "@frontend/components/layout/page-layout";
import { PageBar } from "@frontend/components/layout/page-bar";
import { PageDrawer } from "@frontend/components/layout/page-drawer";
import { PageMenuList } from "@frontend/components/layout/page-menu-list";
import { PageContent } from "@frontend/components/layout/page-content";
import { UserTable } from "@pages/management/users/components/user-table";

export const metadata: Metadata = {
  title: "User Management | Fadhlidev Dashboard",
};

export default function Page() {
  return (
    <PageLayout>
      <PageBar
        title="User Management"
        description="Manage system user accounts, roles, access rights, and permissions"
      />
      <PageDrawer showLogo>
        <PageMenuList />
      </PageDrawer>
      <PageContent allowedRoles={["admin"]} withBar>
        <UserTable />
      </PageContent>
    </PageLayout>
  );
}
