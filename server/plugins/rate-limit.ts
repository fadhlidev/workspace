import { rateLimit } from "elysia-rate-limit";

export const loginRateLimit = rateLimit({
  duration: 15 * 60 * 1000,
  max: 5,
  scoping: "scoped",
  generator: (req) => {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    return `login:${ip}`;
  },
  skip: (req) => {
    const url = new URL(req.url);
    return !url.pathname.endsWith("/auth/login");
  },
  errorResponse: new Response(
    JSON.stringify({ message: "Too many login attempts. Try again in 15 minutes." }),
    {
      status: 429,
      headers: { "Content-Type": "application/json" },
    },
  ),
  headers: true,
});
