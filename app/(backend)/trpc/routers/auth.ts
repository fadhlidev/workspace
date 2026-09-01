import {
  router,
  publicProcedure,
  rateLimitProcedure,
} from "@backend/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import { users } from "@storage/database/schemas/users";
import { isPasswordMatch } from "@backend/modules/auth/helpers";
import { signToken, verifyToken } from "@backend/helpers/jwt";
import {
  loginRequestSchema,
  refreshTokenRequestSchema,
} from "@shared/schemas/auth/login";

const loginRateLimitProcedure = rateLimitProcedure({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: "login",
  message: "Too many login attempts. Try again in 15 minutes.",
});

export const authRouter = router({
  login: loginRateLimitProcedure
    .input(loginRequestSchema)
    .mutation(async ({ input }) => {
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
        "15m",
      );

      const refreshToken = await signToken(
        {
          sub: user.id,
          username: user.username,
          role: user.role,
          type: "refresh",
        },
        "7d",
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
    }),

  refresh: publicProcedure
    .input(refreshTokenRequestSchema)
    .mutation(async ({ input }) => {
      const payload = await verifyToken(input.refreshToken);
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
        "15m",
      );

      const refreshToken = await signToken(
        {
          sub,
          username,
          role,
          type: "refresh",
        },
        "7d",
      );

      return { accessToken, refreshToken };
    }),
});
