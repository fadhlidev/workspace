import type { Metadata } from "next";
import { PageLayout } from "@/components/page-layout";
import { PageBar } from "@/components/page-bar";
import { PageContent } from "@/components/page-content";
import { ProfileHeader } from "@/components/me/profile-header";
import { EditProfile } from "@/components/me/edit-profile";
import { ChangePassword } from "@/components/me/change-password";
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
