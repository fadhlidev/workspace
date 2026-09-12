import {
  router,
  publicProcedure,
  rateLimitProcedure,
} from "@backend/trpc/trpc";
import { login, refreshTokens } from "@backend/modules/auth/services";
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
    .mutation(async ({ input }) => login(input)),

  refresh: publicProcedure
    .input(refreshTokenRequestSchema)
    .mutation(async ({ input }) => refreshTokens(input.refreshToken)),
});
