import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { db } from "@storage/database";
import { users } from "@storage/database/schemas/users";
import { hashPassword, isPasswordMatch } from "@backend/modules/auth/helpers";
import type {
  ChangePasswordRequest,
  UpdateProfileRequest,
} from "@shared/schemas/profile";

export async function getProfile(userId: string) {
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
    .where(eq(users.id, userId))
    .limit(1);

  if (!found) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return { user: found };
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileRequest,
) {
  const [updated] = await db
    .update(users)
    .set({
      username: input.username,
      name: input.name,
      email: input.email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
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
}

export async function changePassword(
  userId: string,
  input: ChangePasswordRequest,
) {
  const [found] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
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
    .where(eq(users.id, userId));

  return { message: "Password updated" };
}
