import { db, sql } from "@storage/database";
import { eq, and, inArray } from "drizzle-orm";
import {
  rolePermissions,
  permissionResources,
  permissionActions,
} from "@storage/database/schemas/rbac";
import type { Resource, Action } from "@shared/types/rbac";

export async function authorize(
  role: string,
  resource: Resource,
  action: Action,
): Promise<boolean> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rolePermissions)
    .innerJoin(
      permissionResources,
      eq(rolePermissions.resourceId, permissionResources.id),
    )
    .innerJoin(
      permissionActions,
      eq(rolePermissions.actionId, permissionActions.id),
    )
    .where(
      and(
        eq(rolePermissions.role, role as "user" | "admin"),
        eq(permissionResources.name, resource),
        eq(permissionActions.name, action),
      ),
    );

  return Number(result?.count ?? 0) > 0;
}

export async function authorizeAny(
  role: string,
  resource: Resource,
  actions: Action[],
): Promise<boolean> {
  if (actions.length === 0) return false;

  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rolePermissions)
    .innerJoin(
      permissionResources,
      eq(rolePermissions.resourceId, permissionResources.id),
    )
    .innerJoin(
      permissionActions,
      eq(rolePermissions.actionId, permissionActions.id),
    )
    .where(
      and(
        eq(rolePermissions.role, role as "user" | "admin"),
        eq(permissionResources.name, resource),
        inArray(permissionActions.name, actions),
      ),
    );

  return Number(result?.count ?? 0) > 0;
}
