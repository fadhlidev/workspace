import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import { env } from "@/env.ts";

const poolConfig: PoolConfig = {
  connectionString: env.DB_URL,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: env.DB_POOL_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DB_POOL_CONNECTION_TIMEOUT_MS,
  statement_timeout: env.DB_STATEMENT_TIMEOUT_MS,
  query_timeout: env.DB_QUERY_TIMEOUT_MS,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  ssl: env.DB_USE_SSL ? { rejectUnauthorized: true } : false,
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
