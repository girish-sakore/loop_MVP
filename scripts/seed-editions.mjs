import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const content = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/editions/edition-001.json"), "utf8"),
);
const releaseAt = new Date(`${content.publishedAt}T00:00:00.000Z`);

try {
  await pool.query(
    `INSERT INTO edition (id, slug, status, "releaseAt", "publishedAt", content, "createdAt", "updatedAt")
     VALUES ($1, $1, 'published', $2, $2, $3::jsonb, NOW(), NOW())
     ON CONFLICT (slug) DO NOTHING`,
    [content.id, releaseAt, JSON.stringify(content)],
  );

  if (process.env.PROVIDER_EMAIL) {
    await pool.query(`UPDATE "user" SET role = 'provider' WHERE email = $1`, [process.env.PROVIDER_EMAIL]);
  }

  console.log(`Seeded ${content.id}.`);
} finally {
  await pool.end();
}