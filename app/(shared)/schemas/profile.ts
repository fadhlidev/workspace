import { z } from "zod";

export const updateProfileRequestSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;
