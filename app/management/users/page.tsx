import type { Metadata } from "next";
import { PageLayout } from "@/components/section/page-layout";
import { PageBar } from "@/components/section/page-bar";
import { PageContent } from "@/components/section/page-content";
import { UserTable } from "@/app/management/users/components/user-table";

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
      <PageContent allowedRoles={["admin"]} withBar>
        <UserTable />
      </PageContent>
    </PageLayout>
  );
}
