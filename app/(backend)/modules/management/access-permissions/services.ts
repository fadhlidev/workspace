import { and, eq } from "drizzle-orm";
import { db } from "@storage/database";
import {
  permissionResources,
  permissionActions,
  rolePermissions,
} from "@storage/database/schemas/rbac";
import type {
  RolePermissionEntry,
  ToggleRolePermissionRequest,
} from "@shared/schemas/management/access-permissions";

export async function getPermissionResources() {
  const resources = await db
    .select()
    .from(permissionResources)
    .orderBy(permissionResources.label);

  return { data: resources };
}

export async function getPermissionActions() {
  const actions = await db
    .select()
    .from(permissionActions)
    .orderBy(permissionActions.label);

  return { data: actions };
}

export async function getRolePermissions() {
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
}

export async function updateRolePermissions(
  permissions: RolePermissionEntry[],
) {
  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions);
    if (permissions.length > 0) {
      await tx.insert(rolePermissions).values(permissions);
    }
  });

  return { message: "Permissions updated" };
}

export async function toggleRolePermission(input: ToggleRolePermissionRequest) {
  if (input.enabled) {
    await db
      .insert(rolePermissions)
      .values({
        role: input.targetRole,
        resourceId: input.resourceId,
        actionId: input.actionId,
      })
      .onConflictDoNothing();
  } else {
    await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.role, input.targetRole),
          eq(rolePermissions.resourceId, input.resourceId),
          eq(rolePermissions.actionId, input.actionId),
        ),
      );
  }

  return {
    message: input.enabled ? "Permission granted" : "Permission revoked",
  };
}
