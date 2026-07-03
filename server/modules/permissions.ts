import { Elysia } from "elysia";
import { eq } from "drizzle-orm";
import { jwt } from "@/server/plugins/jwt";
import { db } from "@/lib/db";
import {
  rolePermissions,
  permissionResources,
  permissionActions,
} from "@/db/schemas/rbac";

export const permissions = new Elysia({
  name: "permissions",
  prefix: "/permissions",
})
  .use(jwt)
  .get("/me", async ({ jwt, request, status }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return status(401, { message: "Unauthorized" });
    }

    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) {
      return status(401, { message: "Invalid or expired token" });
    }

    const { role } = payload as { role: string };

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
  });
