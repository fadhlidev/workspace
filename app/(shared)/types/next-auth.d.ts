import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    username?: string;
  }

  interface Session {
    accessToken?: string;
    role?: string;
    error?: string;
    user: {
      role?: string;
      accessToken?: string;
      username?: string;
    } & import("next-auth/core/types").DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExp?: number;
    role?: string;
    username?: string;
    error?: string;
  }
}
