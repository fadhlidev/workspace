import "dotenv/config";
import { z } from "zod";
import { Client as MinioClient } from "minio";

const schema = z.object({
  MINIO_ENDPOINT: z.string().min(1, "MINIO_ENDPOINT must not be empty"),
  MINIO_PORT: z.coerce.number().int().min(0).default(9000),
  MINIO_USE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  MINIO_ACCESS_KEY: z.string().min(1, "MINIO_ACCESS_KEY must not be empty"),
  MINIO_SECRET_KEY: z.string().min(1, "MINIO_SECRET_KEY must not be empty"),
  MINIO_BUCKET: z.string().min(1).default("app-storage"),
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

declare global {
  var __minioClient: MinioClient | undefined;
}

export function getMinioClient(): MinioClient {
  if (global.__minioClient) {
    return global.__minioClient;
  }

  const client = new MinioClient({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  });

  global.__minioClient = client;
  console.log("[minio] client initialized");
  return client;
}

export const MINIO_BUCKET = env.MINIO_BUCKET;

export async function ensureBucket(
  bucket: string = MINIO_BUCKET,
): Promise<void> {
  const client = getMinioClient();
  const exists = await client.bucketExists(bucket).catch(() => false);
  if (!exists) {
    await client.makeBucket(bucket);
    console.log(`[minio] bucket "${bucket}" created`);
  }
}
