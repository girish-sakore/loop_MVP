import { S3Client, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.R2_BUCKET!;

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  // Newer SDK versions add checksum headers that break presigned PUTs on R2.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const CACHE_CONTROL = "public, max-age=31536000, immutable";

async function exists(key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (e) {
    if ((e as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) return false;
    throw e;
  }
}

export async function findMissing(keys: string[]) {
  const flags = await Promise.all(keys.map(exists));
  return keys.filter((_, i) => !flags[i]);
}

export const presignPut = (key: string) =>
  getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: "image/webp", CacheControl: CACHE_CONTROL }),
    { expiresIn: 600 },
  );