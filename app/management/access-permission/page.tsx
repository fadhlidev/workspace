import type { Metadata } from "next";
import { PageLayout } from "@/components/section/page-layout";
import { PageBar } from "@/components/section/page-bar";
import { PageContent } from "@/components/section/page-content";
import { PermissionMatrix } from "@/app/management/access-permission/components/permission-matrix";

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
      <PageContent allowedRoles={["admin"]} withBar>
        <PermissionMatrix />
      </PageContent>
    </PageLayout>
  );
}
