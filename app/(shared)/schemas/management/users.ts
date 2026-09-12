import { z } from "zod";

export const listUsersRequestSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type ListUsersRequest = z.infer<typeof listUsersRequestSchema>;

export const createUserRequestSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "admin"]).optional(),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const updateUserRequestSchema = z.object({
  id: z.string(),
  username: z.string().min(3).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export const updateUserPasswordRequestSchema = z.object({
  id: z.string(),
  newPassword: z.string().min(6),
});

export type UpdateUserPasswordRequest = z.infer<
  typeof updateUserPasswordRequestSchema
>;

export const deleteUserRequestSchema = z.object({
  id: z.string(),
});

export type DeleteUserRequest = z.infer<typeof deleteUserRequestSchema>;
