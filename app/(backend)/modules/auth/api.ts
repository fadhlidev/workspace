import { Elysia, t } from "elysia";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import { jwt } from "@backend/plugins/jwt";
import { loginRateLimit } from "@backend/plugins/rate-limit";
import { users } from "@storage/database/schemas/users";

export const auth = new Elysia({
  name: "auth",
  prefix: "/auth",
})
  .use(jwt)
  .use(loginRateLimit)
  .post(
    "/login",
    async ({ jwt, body, status }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, body.username))
        .limit(1);

      if (!user) {
        return status(401, { message: "Invalid username or password" });
      }

      const valid = await bcrypt.compare(body.password, user.passwordHash);
      if (!valid) {
        return status(401, { message: "Invalid username or password" });
      }

      const accessToken = await jwt.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
        type: "access",
        exp: "15m",
      });

      const refreshToken = await jwt.sign({
        sub: user.id,
        username: user.username,
        role: user.role,
        type: "refresh",
        exp: "7d",
      });

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
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  )
  .post(
    "/refresh",
    async ({ jwt, body, status }) => {
      const payload = await jwt.verify(body.refreshToken);
      if (!payload || payload.type !== "refresh") {
        return status(401, { message: "Invalid refresh token" });
      }
      const { sub, username, role } = payload as {
        sub: string;
        username: string;
        role: string;
      };

      const accessToken = await jwt.sign({
        sub,
        username,
        role,
        type: "access",
        exp: "15m",
      });

      const refreshToken = await jwt.sign({
        sub,
        username,
        role,
        type: "refresh",
        exp: "7d",
      });

      return { accessToken, refreshToken };
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    },
  );
