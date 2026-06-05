import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/login`,
          {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) return null;

        const data = await res.json();

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          username: data.user.username,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
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
        const res = await fetch(
          `${process.env.NEXTAUTH_URL}/api/auth/refresh`,
          {
            method: "POST",
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) {
          return { ...token, error: "RefreshAccessTokenError" };
        }

        const data = await res.json();

        return {
          ...token,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? token.refreshToken,
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
