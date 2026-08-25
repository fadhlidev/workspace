import { Elysia, type AnyElysia } from "elysia";
import { jwt } from "@/server/plugins/jwt";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import { users } from "@storage/database/schemas/users";
import { authorize, authorizeAny } from "@backend/modules/auth/services";
import type { Resource, Action } from "@shared/types/rbac";

type HandlerContext = {
  jwt: {
    verify: (token?: string) => Promise<Record<string, unknown> | false>;
  };
  request: Request;
  status: (code: number, body?: unknown) => unknown;
};

export function requirePermission(
  resource: Resource,
  actions: Action | Action[],
) {
  const actionList = Array.isArray(actions) ? actions : [actions];

  async function beforeHandle({ jwt, request, status }: HandlerContext) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return status(401, { message: "Unauthorized" });
    }

    const payload = await jwt.verify(authHeader.slice(7));
    if (!payload) {
      return status(401, { message: "Invalid or expired token" });
    }

    const { sub } = payload as { sub?: string };
    if (!sub) {
      return status(401, { message: "Invalid token payload" });
    }

    const [user] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, sub))
      .limit(1);

    if (!user) {
      return status(401, { message: "User not found" });
    }

    const allowed =
      actionList.length === 1
        ? await authorize(user.role, resource, actionList[0])
        : await authorizeAny(user.role, resource, actionList);

    if (!allowed) {
      return status(403, { message: "Forbidden" });
    }
  }

  const guard = new Elysia({
    name: `permission:${resource}:${(actionList as string[]).join("+")}`,
  })
    .use(jwt)
    .guard({ beforeHandle });

  return Object.assign(
    (app: AnyElysia): AnyElysia => app.use(guard) as unknown as AnyElysia,
    { beforeHandle },
  );
}
