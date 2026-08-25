import { Elysia, t } from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "@storage/database";
import { jwt } from "@backend/plugins/jwt";
import {
  permissionResources,
  permissionActions,
  rolePermissions,
} from "@storage/database/schemas/rbac";
import { Resources, Actions } from "@backend/modules/rbac/constants";
import { authorize } from "@backend/modules/auth/services";
import { getAuthRole } from "@backend/modules/auth/helpers";

export const accessPermission = new Elysia({
  name: "access-permission",
  prefix: "/access-permission",
})
  .use(jwt)
  .get("/resources", async () => {
    const resources = await db
      .select()
      .from(permissionResources)
      .orderBy(permissionResources.label);
    return { data: resources };
  })
  .get("/actions", async () => {
    const actions = await db
      .select()
      .from(permissionActions)
      .orderBy(permissionActions.label);
    return { data: actions };
  })
  .get("/role-permissions", async ({ jwt, request, status }) => {
    const role = await getAuthRole(jwt.verify, request);
    if (!role) return status(401, { message: "Unauthorized" });
    const allowed = await authorize(
      role,
      Resources.ACCESS_PERMISSION,
      Actions.VIEW,
    );
    if (!allowed) return status(403, { message: "Forbidden" });

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
  })
  .put(
    "/role-permissions",
    async ({ jwt, request, body, status }) => {
      const role = await getAuthRole(jwt.verify, request);
      if (!role) return status(401, { message: "Unauthorized" });
      const allowed = await authorize(
        role,
        Resources.ACCESS_PERMISSION,
        Actions.UPDATE,
      );
      if (!allowed) return status(403, { message: "Forbidden" });

      await db.transaction(async (tx) => {
        await tx.delete(rolePermissions);
        if (body.permissions.length > 0) {
          await tx.insert(rolePermissions).values(
            body.permissions as {
              role: "user" | "admin";
              resourceId: string;
              actionId: string;
            }[],
          );
        }
      });
      return { message: "Permissions updated" };
    },
    {
      body: t.Object({
        permissions: t.Array(
          t.Object({
            role: t.String(),
            resourceId: t.String(),
            actionId: t.String(),
          }),
        ),
      }),
    },
  )
  .post(
    "/role-permissions/toggle",
    async ({ jwt, request, body, status }) => {
      const role = await getAuthRole(jwt.verify, request);
      if (!role) return status(401, { message: "Unauthorized" });
      const allowed = await authorize(
        role,
        Resources.ACCESS_PERMISSION,
        Actions.UPDATE,
      );
      if (!allowed) return status(403, { message: "Forbidden" });

      if (body.enabled) {
        await db
          .insert(rolePermissions)
          .values({
            role: body.targetRole as "user" | "admin",
            resourceId: body.resourceId,
            actionId: body.actionId,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(rolePermissions)
          .where(
            and(
              eq(rolePermissions.role, body.targetRole as "user" | "admin"),
              eq(rolePermissions.resourceId, body.resourceId),
              eq(rolePermissions.actionId, body.actionId),
            ),
          );
      }
      return {
        message: body.enabled ? "Permission granted" : "Permission revoked",
      };
    },
    {
      body: t.Object({
        targetRole: t.String(),
        resourceId: t.String(),
        actionId: t.String(),
        enabled: t.Boolean(),
      }),
    },
  );
