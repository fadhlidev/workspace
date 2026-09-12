import { router, protectedProcedure } from "@backend/trpc/trpc";
import { getMePermissions } from "@backend/modules/rbac/services";

export const rbacRouter = router({
  getMePermissions: protectedProcedure.query(async ({ ctx }) =>
    getMePermissions(ctx.user.role),
  ),
});
