import { Elysia, t } from "elysia";
import { jwt } from "@backend/plugins/jwt";
import { eq, or, sql } from "drizzle-orm";
import { db } from "@storage/database";
import { users as usersTable } from "@storage/database/schemas/users";
import bcrypt from "bcrypt";

export const users = new Elysia({
  name: "users",
  prefix: "/users",
})
  .use(jwt)
  .get("/", async ({ query }) => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const sortField = query.sort || "name";
    const order = query.order === "desc" ? "desc" : "asc";

    const orderBy =
      sortField === "createdAt"
        ? order === "desc"
          ? sql`${usersTable.createdAt} desc`
          : sql`${usersTable.createdAt} asc`
        : order === "desc"
          ? sql`${usersTable.name} desc`
          : sql`${usersTable.name} asc`;

    const filters: ReturnType<typeof sql>[] = [];

    if (query.search) {
      const pattern = `%${query.search}%`;
      filters.push(
        sql`(${usersTable.name}::text ILIKE ${pattern} OR ${usersTable.username}::text ILIKE ${pattern} OR ${usersTable.email}::text ILIKE ${pattern})`,
      );
    }

    const where =
      filters.length > 0 ? sql`${sql.join(filters, sql` AND `)}` : undefined;

    const [countResult] = await db
      .select({ total: sql<number>`count(*)` })
      .from(usersTable)
      .where(where);

    const list = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        username: usersTable.username,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { data: list, total: Number(countResult?.total ?? 0) };
  })
  .post(
    "/",
    async ({ body, status }) => {
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          or(
            eq(usersTable.username, body.username),
            eq(usersTable.email, body.email),
          ),
        )
        .limit(1);

      if (existing) {
        return status(409, { message: "Username or email already exists" });
      }

      const passwordHash = await bcrypt.hash(body.password, 12);

      const [created] = await db
        .insert(usersTable)
        .values({
          username: body.username,
          name: body.name,
          email: body.email,
          passwordHash,
          role: body.role ?? "user",
        })
        .returning({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          email: usersTable.email,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        });

      return { user: created };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        name: t.String({ minLength: 1 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        role: t.Optional(t.Union([t.Literal("user"), t.Literal("admin")])),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, jwt, request, status }) => {
      const authHeader = request.headers.get("authorization");
      const payload = await jwt.verify(authHeader?.slice(7) ?? "");
      const { sub } = (payload ?? {}) as { sub: string };

      if (sub === id && body.role) {
        return status(400, {
          message: "Cannot change your own role",
        });
      }

      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);

      if (!existing) {
        return status(404, { message: "User not found" });
      }

      if (body.username || body.email) {
        const conditions = [];
        if (body.username)
          conditions.push(eq(usersTable.username, body.username));
        if (body.email) conditions.push(eq(usersTable.email, body.email));

        const [duplicate] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(sql`${or(...conditions)} AND ${usersTable.id} != ${id}`)
          .limit(1);

        if (duplicate) {
          return status(409, { message: "Username or email already exists" });
        }
      }

      const [updated] = await db
        .update(usersTable)
        .set({
          ...(body.username && { username: body.username }),
          ...(body.name && { name: body.name }),
          ...(body.email && { email: body.email }),
          ...(body.role && { role: body.role }),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id))
        .returning({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          email: usersTable.email,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        });

      return { user: updated };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        username: t.Optional(t.String({ minLength: 3 })),
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
        role: t.Optional(t.Union([t.Literal("user"), t.Literal("admin")])),
      }),
    },
  )
  .patch(
    "/:id/password",
    async ({ params: { id }, body, status }) => {
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);

      if (!existing) {
        return status(404, { message: "User not found" });
      }

      const passwordHash = await bcrypt.hash(body.newPassword, 12);

      await db
        .update(usersTable)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(usersTable.id, id));

      return { message: "Password updated" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        newPassword: t.String({ minLength: 6 }),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, jwt, request, status }) => {
      const authHeader = request.headers.get("authorization");
      const payload = await jwt.verify(authHeader?.slice(7) ?? "");
      const { sub } = (payload ?? {}) as { sub: string };

      if (sub === id) {
        return status(400, { message: "Cannot delete your own account" });
      }

      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);

      if (!existing) {
        return status(404, { message: "User not found" });
      }

      await db.delete(usersTable).where(eq(usersTable.id, id));

      return { message: "User deleted" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
