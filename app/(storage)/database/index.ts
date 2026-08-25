import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
  DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().default(30_000),
  DB_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().default(5_000),
  DB_STATEMENT_TIMEOUT_MS: z.coerce.number().int().default(30_000),
  DB_QUERY_TIMEOUT_MS: z.coerce.number().int().default(30_000),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;

const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  statement_timeout: env.DB_STATEMENT_TIMEOUT_MS,
  query_timeout: env.DB_QUERY_TIMEOUT_MS,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
};

export const pool = new Pool(poolConfig);

pool.on("error", (err) => {
  console.error("💥 Unexpected DB pool error:", err);
});

pool.on("connect", () => {
  if (env.NODE_ENV === "development") {
    console.log("🔌 New DB connection established");
  }
});

export const db = drizzle({
  client: pool,
  logger: env.NODE_ENV === "development",
});

export { sql } from "drizzle-orm";

export async function checkDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("✅ Database connection OK");
  } finally {
    client.release();
  }
}

export async function closeDb(): Promise<void> {
  await pool.end();
  console.log("🔒 Database pool closed");
}

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received, closing DB pool...`);
  await closeDb();
  process.exit(0);
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
