import { router, protectedProcedure } from "@backend/trpc/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import { users } from "@storage/database/schemas/users";
import { hashPassword, isPasswordMatch } from "@backend/modules/auth/helpers";
import { z } from "zod";

export const profileRouter = router({
  getMe: protectedProcedure.query(async ({ ctx }) => {
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
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!found) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return { user: found };
  }),

  updateMe: protectedProcedure
    .input(
      z.object({
        username: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(users)
        .set({
          username: input.username,
          name: input.name,
          email: input.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          name: users.name,
          role: users.role,
        });

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return { user: updated };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [found] = await db
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!found) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const valid = await isPasswordMatch(
        input.currentPassword,
        found.passwordHash,
      );

      if (!valid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      const newHash = await hashPassword(input.newPassword);

      await db
        .update(users)
        .set({ passwordHash: newHash, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));

      return { message: "Password updated" };
    }),
});
