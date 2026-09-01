import { router, protectedProcedure } from "@backend/trpc/trpc";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import {
  rolePermissions,
  permissionResources,
  permissionActions,
} from "@storage/database/schemas/rbac";

export const rbacRouter = router({
  getMePermissions: protectedProcedure.query(async ({ ctx }) => {
    const permissions = await db
      .select({
        resource: permissionResources.name,
        action: permissionActions.name,
      })
      .from(rolePermissions)
      .innerJoin(
        permissionResources,
        eq(rolePermissions.resourceId, permissionResources.id),
      )
      .innerJoin(
        permissionActions,
        eq(rolePermissions.actionId, permissionActions.id),
      )
      .where(eq(rolePermissions.role, ctx.user.role as "user" | "admin"));

    return { permissions };
  }),
});
