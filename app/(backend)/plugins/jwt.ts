import { jwt as plugin } from "@elysia/jwt";

export const jwt = plugin({
  name: "jwt",
  secret: process.env.JWT_SECRET!,
});
