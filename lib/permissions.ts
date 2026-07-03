import { db } from "@/lib/db";
import {
  rolePermissions,
  permissionResources,
  permissionActions,
} from "@/db/schemas/rbac";
import { eq, and, sql, inArray } from "drizzle-orm";

export const Resources = {
  USERS: "users",
  ACCESS_PERMISSION: "access-permission",
} as const;

export const Actions = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
} as const;

export type Resource = (typeof Resources)[keyof typeof Resources];
export type Action = (typeof Actions)[keyof typeof Actions];

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
