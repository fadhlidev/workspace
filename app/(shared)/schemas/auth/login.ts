import { z } from "zod";

export const loginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.email(),
    role: z.union([z.literal("admin"), z.literal("user")]),
  }),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

export const refreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
