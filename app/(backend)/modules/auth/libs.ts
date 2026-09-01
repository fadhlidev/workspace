import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@storage/database";
import { users } from "@storage/database/schemas/users";
import { eq } from "drizzle-orm";
import { isPasswordMatch } from "@backend/modules/auth/helpers";
import { signToken, verifyToken } from "@backend/helpers/jwt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .limit(1);

        if (!user) return null;

        const valid = await isPasswordMatch(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

        const accessToken = await signToken(
          {
            sub: user.id,
            username: user.username,
            role: user.role,
            type: "access",
          },
          "15m",
        );

        const refreshToken = await signToken(
          {
            sub: user.id,
            username: user.username,
            role: user.role,
            type: "refresh",
          },
          "7d",
        );

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExp: Math.floor(Date.now() / 1000) + 15 * 60,
          role: user.role,
          username: user.username,
        };
      }

      if (
        token.accessTokenExp &&
        Date.now() < (token.accessTokenExp as number) * 1000
      ) {
        return token;
      }

      try {
        const payload = await verifyToken(token.refreshToken as string);
        if (!payload || payload.type !== "refresh") {
          return { ...token, error: "RefreshAccessTokenError" };
        }

        const newAccessToken = await signToken(
          {
            sub: payload.sub,
            username: payload.username,
            role: payload.role,
            type: "access",
          },
          "15m",
        );

        const newRefreshToken = await signToken(
          {
            sub: payload.sub,
            username: payload.username,
            role: payload.role,
            type: "refresh",
          },
          "7d",
        );

        return {
          ...token,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          accessTokenExp: Math.floor(Date.now() / 1000) + 15 * 60,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.role = token.role as string | undefined;
      session.error = token.error as string | undefined;
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.username = token.username as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
