import { randomUUID } from "crypto";
import { getMinioClient, MINIO_BUCKET } from "@storage/bucket";

export interface UploadResult {
  key: string;
  bucket: string;
  size: number;
  etag: string;
  contentType: string;
}

export interface UploadOptions {
  /** Folder prefix inside the bucket, e.g. 'avatars', 'documents/invoices'. */
  folder?: string;
  /** Original file name, used to derive the extension & metadata. Not used directly as the object key (avoids collision & path traversal). */
  originalName?: string;
  contentType?: string;
  /** Maximum file size in bytes. Default 20MB. */
  maxSizeBytes?: number;
  /** Allowed MIME type whitelist, e.g. ['image/png', 'image/jpeg']. Leave empty to allow all. */
  allowedMimeTypes?: string[];
}

export class UploadValidationError extends Error {}

function sanitizeFolder(folder?: string): string {
  if (!folder) return "";
  // prevent path traversal ('..') and stray leading/trailing slashes
  const cleaned = folder.replace(/\.\./g, "").replace(/^\/+|\/+$/g, "");
  return cleaned ? `${cleaned}/` : "";
}

function extractExtension(originalName?: string): string {
  if (!originalName) return "";
  const match = originalName.match(/\.([a-zA-Z0-9]+)$/);
  return match ? `.${match[1].toLowerCase()}` : "";
}

/**
 * Upload a buffer/stream to MinIO. The object key is auto-generated (UUID) to
 * avoid collisions and path traversal — the original file name is stored in metadata.
 */
export async function uploadFile(
  data: Buffer,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const {
    folder,
    originalName,
    contentType = "application/octet-stream",
    maxSizeBytes = 20 * 1024 * 1024, // 20MB
    allowedMimeTypes,
  } = options;

  if (data.length > maxSizeBytes) {
    throw new UploadValidationError(
      `File terlalu besar: ${data.length} bytes (maks ${maxSizeBytes} bytes)`,
    );
  }

  if (allowedMimeTypes && !allowedMimeTypes.includes(contentType)) {
    throw new UploadValidationError(
      `Tipe file "${contentType}" tidak diizinkan. Diizinkan: ${allowedMimeTypes.join(", ")}`,
    );
  }

  const client = getMinioClient();
  const key = `${sanitizeFolder(folder)}${randomUUID()}${extractExtension(originalName)}`;

  const result = await client.putObject(MINIO_BUCKET, key, data, data.length, {
    "Content-Type": contentType,
    ...(originalName ? { "x-amz-meta-original-name": originalName } : {}),
  });

  return {
    key,
    bucket: MINIO_BUCKET,
    size: data.length,
    etag: result.etag,
    contentType,
  };
}

/** Fetch a file as a Buffer — suitable for small-to-medium files processed directly on the server. */
export async function downloadFile(
  key: string,
  bucket: string = MINIO_BUCKET,
): Promise<Buffer> {
  const client = getMinioClient();
  const stream = await client.getObject(bucket, key);

  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}

/** Stream directly — used in Route Handlers so large files don't need to be fully buffered in memory. */
export async function getFileStream(
  key: string,
  bucket: string = MINIO_BUCKET,
) {
  const client = getMinioClient();
  return client.getObject(bucket, key);
}

export async function getFileStat(key: string, bucket: string = MINIO_BUCKET) {
  const client = getMinioClient();
  return client.statObject(bucket, key);
}

export async function deleteFile(
  key: string,
  bucket: string = MINIO_BUCKET,
): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(bucket, key);
}

/**
 * Presigned URL for temporary access without going through our server — useful
 * for private files to be shared directly to client/CDN without proxying server bandwidth.
 * Default expiry 1 hour.
 */
export async function getPresignedDownloadUrl(
  key: string,
  expirySeconds: number = 60 * 60,
  bucket: string = MINIO_BUCKET,
): Promise<string> {
  const client = getMinioClient();
  return client.presignedGetObject(bucket, key, expirySeconds);
}

export interface FileListItem {
  key: string;
  size: number;
  lastModified: Date;
}

export async function listFiles(
  prefix: string = "",
  bucket: string = MINIO_BUCKET,
): Promise<FileListItem[]> {
  const client = getMinioClient();
  const stream = client.listObjectsV2(bucket, prefix, true);

  const items: FileListItem[] = [];
  for await (const obj of stream) {
    if (obj.name) {
      items.push({
        key: obj.name,
        size: obj.size ?? 0,
        lastModified: obj.lastModified ?? new Date(),
      });
    }
  }
  return items;
}
