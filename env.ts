import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DB_URL: z.url(),
    DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
    DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
    DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().int().default(30_000),
    DB_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().int().default(5_000),
    DB_STATEMENT_TIMEOUT_MS: z.coerce.number().int().default(30_000),
    DB_QUERY_TIMEOUT_MS: z.coerce.number().int().default(30_000),
    DB_USE_SSL: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),

    MINIO_ENDPOINT: z.string().min(1),
    MINIO_PORT: z.coerce.number().int().min(0).default(9000),
    MINIO_USE_SSL: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    MINIO_ACCESS_KEY: z.string().min(1),
    MINIO_SECRET_KEY: z.string().min(1),
    MINIO_BUCKET: z.string().min(1).default("app-storage"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    DB_URL: process.env.DB_URL,
    DB_POOL_MIN: process.env.DB_POOL_MIN,
    DB_POOL_MAX: process.env.DB_POOL_MAX,
    DB_POOL_IDLE_TIMEOUT_MS: process.env.DB_POOL_IDLE_TIMEOUT_MS,
    DB_POOL_CONNECTION_TIMEOUT_MS: process.env.DB_POOL_CONNECTION_TIMEOUT_MS,
    DB_STATEMENT_TIMEOUT_MS: process.env.DB_STATEMENT_TIMEOUT_MS,
    DB_QUERY_TIMEOUT_MS: process.env.DB_QUERY_TIMEOUT_MS,
    DB_USE_SSL: process.env.DB_USE_SSL,

    MINIO_ENDPOINT: process.env.MINIO_ENDPOINT,
    MINIO_PORT: process.env.MINIO_PORT,
    MINIO_USE_SSL: process.env.MINIO_USE_SSL,
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_BUCKET: process.env.MINIO_BUCKET,
  },
});
