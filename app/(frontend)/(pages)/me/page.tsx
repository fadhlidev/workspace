import type { Metadata } from "next";
import { PageLayout } from "@frontend/components/layout/page-layout";
import { PageBar } from "@frontend/components/layout/page-bar";
import { PageDrawer } from "@frontend/components/layout/page-drawer";
import { PageMenuList } from "@frontend/components/layout/page-menu-list";
import { PageContent } from "@frontend/components/layout/page-content";
import { ProfileHeader } from "@pages/me/components/profile-header";
import { EditProfile } from "@pages/me/components/edit-profile";
import { ChangePassword } from "@pages/me/components/change-password";
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
      <PageDrawer showLogo>
        <PageMenuList />
      </PageDrawer>
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
