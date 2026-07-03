import type { Metadata } from "next";
import { PageLayout } from "@/components/section/page-layout";
import { PageBar } from "@/components/section/page-bar";
import { PageContent } from "@/components/section/page-content";
import { ProfileHeader } from "@/app/me/components/profile-header";
import { EditProfile } from "@/app/me/components/edit-profile";
import { ChangePassword } from "@/app/me/components/change-password";
import { Stack, Grid } from "@mui/material";

export const metadata: Metadata = {
  title: "My Profile | Fadhlidev Dashboard",
};

export default function Page() {
  return (
    <PageLayout>
      <PageBar
        title="My Profile"
        description="Manage your account information and security settings"
      />
      <PageContent withBar>
        <Stack spacing={3}>
          <ProfileHeader />
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <EditProfile />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ChangePassword />
            </Grid>
          </Grid>
        </Stack>
      </PageContent>
    </PageLayout>
  );
}
