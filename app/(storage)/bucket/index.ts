import { Client as MinioClient } from "minio";
import { env } from "@/env.ts";

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
