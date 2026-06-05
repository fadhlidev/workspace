import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { PageBar } from "@/components/page-bar";
import { PageContent } from "@/components/page-content";

export const metadata: Metadata = {
  title: "Overview | Fadhlidev Dashboard",
};

export default function Page() {
  return (
    <PageLayout>
      <PageBar title="Overview" />
      <PageContent withBar underDevelopment>
        {null}
      </PageContent>
    </PageLayout>
  );
}
