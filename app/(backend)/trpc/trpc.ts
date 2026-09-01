import { initTRPC, TRPCError } from "@trpc/server";
import { verifyToken } from "@backend/helpers/jwt";
import { authorize } from "@backend/modules/auth/services";
import { checkRateLimit } from "@backend/helpers/rate-limit";
import type { Resource, Action } from "@shared/types/rbac";

export type TRPCContext = {
  req: Request;
  ip: string;
  user: {
    id: string;
    username: string;
    role: string;
  } | null;
};

export async function createTRPCContext(opts: {
  req: Request;
}): Promise<TRPCContext> {
  const ip =
    opts.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    opts.req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const authHeader = opts.req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { req: opts.req, ip, user: null };
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload || payload.type !== "access") {
    return { req: opts.req, ip, user: null };
  }

  return {
    req: opts.req,
    ip,
    user: {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    },
  };
}

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export function rateLimitProcedure(options: {
  windowMs: number;
  max: number;
  message?: string;
  keyPrefix?: string;
}) {
  return publicProcedure.use(({ ctx, next }) => {
    const key = `${options.keyPrefix ?? "rl"}:${ctx.ip}`;
    checkRateLimit(key, options);
    return next({ ctx });
  });
}

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Forbidden: Admin access required",
    });
  }
  return next({ ctx });
});

export function permissionProcedure(resource: Resource, action: Action) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const allowed = await authorize(ctx.user.role, resource, action);
    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Forbidden: Insufficient permissions",
      });
    }
    return next({ ctx });
  });
}
