import { TRPCError } from "@trpc/server";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const hits = new Map<string, RateLimitRecord>();

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of hits.entries()) {
    if (now > record.resetTime) {
      hits.delete(key);
    }
  }
}, 60 * 1000);

export function checkRateLimit(key: string, options: RateLimitOptions): void {
  const now = Date.now();
  const record = hits.get(key);

  if (!record || now > record.resetTime) {
    hits.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    });
    return;
  }

  if (record.count >= options.max) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: options.message ?? "Too many attempts. Please try again later.",
    });
  }

  record.count += 1;
}
