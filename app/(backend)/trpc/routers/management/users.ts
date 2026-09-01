import { router, adminProcedure } from "@backend/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { eq, or, sql } from "drizzle-orm";
import { db } from "@storage/database";
import { users as usersTable } from "@storage/database/schemas/users";
import { hashPassword } from "@backend/modules/auth/helpers";
import { z } from "zod";

export const managementUsersRouter = router({
  list: adminProcedure
    .input(
      z
        .object({
          page: z.number().optional(),
          limit: z.number().optional(),
          search: z.string().optional(),
          sort: z.string().optional(),
          order: z.enum(["asc", "desc"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const page = Math.max(1, input?.page || 1);
      const limit = Math.min(100, Math.max(1, input?.limit || 10));
      const offset = (page - 1) * limit;

      const sortField = input?.sort || "name";
      const order = input?.order === "desc" ? "desc" : "asc";

      const orderBy =
        sortField === "createdAt"
          ? order === "desc"
            ? sql`${usersTable.createdAt} desc`
            : sql`${usersTable.createdAt} asc`
          : order === "desc"
            ? sql`${usersTable.name} desc`
            : sql`${usersTable.name} asc`;

      const filters: ReturnType<typeof sql>[] = [];

      if (input?.search) {
        const pattern = `%${input.search}%`;
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
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      return { data: list, total: Number(countResult?.total ?? 0) };
    }),

  create: adminProcedure
    .input(
      z.object({
        username: z.string().min(3),
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["user", "admin"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          or(
            eq(usersTable.username, input.username),
            eq(usersTable.email, input.email),
          ),
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username or email already exists",
        });
      }

      const passwordHash = await hashPassword(input.password);

      const [created] = await db
        .insert(usersTable)
        .values({
          username: input.username,
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role ?? "user",
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
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        username: z.string().min(3).optional(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        role: z.enum(["user", "admin"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id && input.role) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change your own role",
        });
      }

      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (input.username || input.email) {
        const conditions = [];
        if (input.username)
          conditions.push(eq(usersTable.username, input.username));
        if (input.email) conditions.push(eq(usersTable.email, input.email));

        const [duplicate] = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(sql`${or(...conditions)} AND ${usersTable.id} != ${input.id}`)
          .limit(1);

        if (duplicate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username or email already exists",
          });
        }
      }

      const [updated] = await db
        .update(usersTable)
        .set({
          ...(input.username && { username: input.username }),
          ...(input.name && { name: input.name }),
          ...(input.email && { email: input.email }),
          ...(input.role && { role: input.role }),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, input.id))
        .returning({
          id: usersTable.id,
          name: usersTable.name,
          username: usersTable.username,
          email: usersTable.email,
          role: usersTable.role,
          createdAt: usersTable.createdAt,
        });

      return { user: updated };
    }),

  updatePassword: adminProcedure
    .input(
      z.object({
        id: z.string(),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const passwordHash = await hashPassword(input.newPassword);

      await db
        .update(usersTable)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(usersTable.id, input.id));

      return { message: "Password updated" };
    }),

  delete: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete your own account",
        });
      }

      const [existing] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      await db.delete(usersTable).where(eq(usersTable.id, input.id));

      return { message: "User deleted" };
    }),
});
