import { router } from "@backend/trpc/trpc";
import { authRouter } from "@backend/trpc/routers/auth";
import { profileRouter } from "@backend/trpc/routers/profile";
import { rbacRouter } from "@backend/trpc/routers/rbac";
import { managementUsersRouter } from "@backend/trpc/routers/management/users";
import { managementAccessPermissionsRouter } from "@backend/trpc/routers/management/access-permissions";

export const appRouter = router({
  auth: authRouter,
  profile: profileRouter,
  rbac: rbacRouter,
  management: router({
    users: managementUsersRouter,
    accessPermissions: managementAccessPermissionsRouter,
  }),
});

export type AppRouter = typeof appRouter;
