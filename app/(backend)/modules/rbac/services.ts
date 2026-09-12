import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import {
  rolePermissions,
  permissionResources,
  permissionActions,
} from "@storage/database/schemas/rbac";

export async function getMePermissions(role: string) {
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
    .where(eq(rolePermissions.role, role as "user" | "admin"));

  return { permissions };
}
