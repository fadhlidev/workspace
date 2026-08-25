import type { Metadata } from "next";
import { PageLayout } from "@frontend/components/layout/page-layout";
import { PageBar } from "@frontend/components/layout/page-bar";
import { PageDrawer } from "@frontend/components/layout/page-drawer";
import { PageMenuList } from "@frontend/components/layout/page-menu-list";
import { PageContent } from "@frontend/components/layout/page-content";

export const metadata: Metadata = {
  title: "Overview | Fadhlidev Dashboard",
};

export default function Page() {
  return (
    <PageLayout>
      <PageBar title="Overview" />
      <PageDrawer showLogo>
        <PageMenuList />
      </PageDrawer>
      <PageContent withBar underDevelopment>
        {null}
      </PageContent>
    </PageLayout>
  );
}
