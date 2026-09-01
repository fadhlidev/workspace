import {
  router,
  adminProcedure,
  permissionProcedure,
} from "@backend/trpc/trpc";
import { eq, and } from "drizzle-orm";
import { db } from "@storage/database";
import {
  permissionResources,
  permissionActions,
  rolePermissions,
} from "@storage/database/schemas/rbac";
import { Resources, Actions } from "@backend/modules/rbac/constants";
import { z } from "zod";

export const managementAccessPermissionsRouter = router({
  getResources: adminProcedure.query(async () => {
    const resources = await db
      .select()
      .from(permissionResources)
      .orderBy(permissionResources.label);
    return { data: resources };
  }),

  getActions: adminProcedure.query(async () => {
    const actions = await db
      .select()
      .from(permissionActions)
      .orderBy(permissionActions.label);
    return { data: actions };
  }),

  getRolePermissions: permissionProcedure(
    Resources.ACCESS_PERMISSION,
    Actions.VIEW,
  ).query(async () => {
    const rows = await db
      .select({
        id: rolePermissions.id,
        role: rolePermissions.role,
        resourceId: rolePermissions.resourceId,
        actionId: rolePermissions.actionId,
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
      .orderBy(permissionResources.name, permissionActions.name);

    return { data: rows };
  }),

  updateRolePermissions: permissionProcedure(
    Resources.ACCESS_PERMISSION,
    Actions.UPDATE,
  )
    .input(
      z.object({
        permissions: z.array(
          z.object({
            role: z.string(),
            resourceId: z.string(),
            actionId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        await tx.delete(rolePermissions);
        if (input.permissions.length > 0) {
          await tx.insert(rolePermissions).values(
            input.permissions as {
              role: "user" | "admin";
              resourceId: string;
              actionId: string;
            }[],
          );
        }
      });
      return { message: "Permissions updated" };
    }),

  toggleRolePermission: permissionProcedure(
    Resources.ACCESS_PERMISSION,
    Actions.UPDATE,
  )
    .input(
      z.object({
        targetRole: z.string(),
        resourceId: z.string(),
        actionId: z.string(),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.enabled) {
        await db
          .insert(rolePermissions)
          .values({
            role: input.targetRole as "user" | "admin",
            resourceId: input.resourceId,
            actionId: input.actionId,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(rolePermissions)
          .where(
            and(
              eq(rolePermissions.role, input.targetRole as "user" | "admin"),
              eq(rolePermissions.resourceId, input.resourceId),
              eq(rolePermissions.actionId, input.actionId),
            ),
          );
      }
      return {
        message: input.enabled ? "Permission granted" : "Permission revoked",
      };
    }),
});
