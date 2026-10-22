import {
  S3Client, ListObjectsV2Command, PutObjectCommand,
  HeadObjectCommand, DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, NEXT_PUBLIC_ASSETS_URL } = process.env;

for (const [k, v] of Object.entries({ R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, NEXT_PUBLIC_ASSETS_URL })) {
  if (!v) { console.error(`❌ ${k} is missing`); process.exit(1); }
}
console.log("✅ env vars present");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const step = async (name, fn) => {
  try { const r = await fn(); console.log(`✅ ${name}`, r ?? ""); }
  catch (e) { console.error(`❌ ${name}:`, e.name, "-", e.message); process.exit(1); }
};

const key1 = "test/direct.txt";
const key2 = "test/presigned.txt";

await step("1. Credentials + bucket (list)", async () => {
  const r = await s3.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, MaxKeys: 5 }));
  return `${r.KeyCount} object(s) found`;
});

await step("2. Direct upload", () =>
  s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: key1, Body: "hello from TheLoopLearn",
    ContentType: "text/plain", CacheControl: "public, max-age=60",
  })));

await step("3. Object exists (head)", async () => {
  const r = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key1 }));
  return `${r.ContentLength} bytes`;
});

await step("4. Presigned upload (what the creator dashboard uses)", async () => {
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key2, ContentType: "text/plain" }),
    { expiresIn: 120 },
  );
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "text/plain" }, body: "presigned ok" });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
});

await step("5. Public access via custom domain", async () => {
  const base = NEXT_PUBLIC_ASSETS_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/${key1}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} (is the custom domain Active?)`);
  return `${res.status}, cf-cache-status=${res.headers.get("cf-cache-status")}, body="${await res.text()}"`;
});

await step("6. Cleanup", async () => {
  await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key1 }));
  await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key2 }));
});

console.log("\n🎉 R2 is fully connected.");