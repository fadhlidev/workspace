import { Elysia, t } from "elysia";
import { jwt } from "@backend/plugins/jwt";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import { users } from "@storage/database/schemas/users";
import bcrypt from "bcrypt";

export const profile = new Elysia({ name: "user", prefix: "/user" })
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

    const { sub } = payload as { sub: string };

    const [found] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, sub))
      .limit(1);

    if (!found) {
      return status(404, { message: "User not found" });
    }

    return { user: found };
  })
  .put(
    "/me",
    async ({ jwt, request, body, status }) => {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return status(401, { message: "Unauthorized" });
      }

      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload) {
        return status(401, { message: "Invalid or expired token" });
      }

      const { sub } = payload as { sub: string };

      const [updated] = await db
        .update(users)
        .set({
          username: body.username,
          name: body.name,
          email: body.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, sub))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
        });

      if (!updated) {
        return status(404, { message: "User not found" });
      }

      return { user: updated };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
      }),
    },
  )
  .put(
    "/me/password",
    async ({ jwt, request, body, status }) => {
      const authHeader = request.headers.get("authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return status(401, { message: "Unauthorized" });
      }

      const payload = await jwt.verify(authHeader.slice(7));
      if (!payload) {
        return status(401, { message: "Invalid or expired token" });
      }

      const { sub } = payload as { sub: string };

      const [found] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, sub))
        .limit(1);

      if (!found) {
        return status(404, { message: "User not found" });
      }

      const valid = await bcrypt.compare(
        body.currentPassword,
        found.passwordHash,
      );
      if (!valid) {
        return status(400, { message: "Current password is incorrect" });
      }

      const passwordHash = await bcrypt.hash(body.newPassword, 12);

      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(users.id, sub));

      return { message: "Password updated" };
    },
    {
      body: t.Object({
        currentPassword: t.String({ minLength: 1 }),
        newPassword: t.String({ minLength: 6 }),
      }),
    },
  );
