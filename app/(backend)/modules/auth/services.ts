import { TRPCError } from "@trpc/server";
import { db, sql } from "@storage/database";
import { eq, and, inArray } from "drizzle-orm";
import { users } from "@storage/database/schemas/users";
import {
  rolePermissions,
  permissionResources,
  permissionActions,
} from "@storage/database/schemas/rbac";
import { isPasswordMatch } from "@backend/modules/auth/helpers";
import { signToken, verifyToken } from "@backend/helpers/jwt";
import type { Resource, Action } from "@shared/types/rbac";
import type { LoginRequest } from "@shared/schemas/auth/login";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

export async function login(input: LoginRequest) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, input.username))
    .limit(1);

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid username or password",
    });
  }

  const valid = await isPasswordMatch(input.password, user.passwordHash);
  if (!valid) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid username or password",
    });
  }

  const accessToken = await signToken(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      type: "access",
    },
    ACCESS_TOKEN_TTL,
  );

  const refreshToken = await signToken(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      type: "refresh",
    },
    REFRESH_TOKEN_TTL,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  const payload = await verifyToken(refreshToken);
  if (!payload || payload.type !== "refresh") {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid refresh token",
    });
  }

  const { sub, username, role } = payload;

  const accessToken = await signToken(
    {
      sub,
      username,
      role,
      type: "access",
    },
    ACCESS_TOKEN_TTL,
  );

  const newRefreshToken = await signToken(
    {
      sub,
      username,
      role,
      type: "refresh",
    },
    REFRESH_TOKEN_TTL,
  );

  return { accessToken, refreshToken: newRefreshToken };
}

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
