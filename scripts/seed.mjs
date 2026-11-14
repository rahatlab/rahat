/**
 * Seeds the database: single admin user + demo content (settings, skills,
 * projects, posts). Safe to re-run — upserts everywhere, password refreshed.
 *
 *   npm run db:seed
 */
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";
import {
  demoPosts,
  demoProjects,
  demoSettings,
  demoSkills,
} from "../lib/seed.ts";

/* Load .env.local (Next.js env file) manually for Node */
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const { DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!DATABASE_URL) {
  console.error("DATABASE_URL missing in .env.local");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error("ADMIN_EMAIL / ADMIN_PASSWORD (min 8 chars) missing in .env.local");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });
await client.connect();

try {
  await client.query("BEGIN");

  /* ── 1. Admin user (better-auth credential account) ─────────────── */
  const existing = await client.query(
    'SELECT id FROM "user" WHERE email = $1',
    [ADMIN_EMAIL],
  );
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  let userId;

  if (existing.rows.length) {
    userId = existing.rows[0].id;
    await client.query(
      `UPDATE account SET account_id = $1, password = $2, updated_at = now()
       WHERE user_id = $3 AND provider_id = 'credential'`,
      [userId, passwordHash, userId],
    );
    console.log(`• admin exists — account_id + password refreshed (${ADMIN_EMAIL})`);
  } else {
    userId = randomUUID();
    await client.query(
      `INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
       VALUES ($1, 'Rahat', $2, true, now(), now())`,
      [userId, ADMIN_EMAIL],
    );
    await client.query(
      `INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
       VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
      [randomUUID(), userId, userId, passwordHash],
    );
    console.log(`✓ admin created: ${ADMIN_EMAIL}`);
  }

  /* ── 2. Site settings (single 'site' row) ────────────────────────── */
  await client.query(
    `INSERT INTO settings (key, value) VALUES ('site', $1::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [JSON.stringify(demoSettings)],
  );
  console.log("✓ settings seeded");

  /* ── 3. Skills (replace-all keeps demo ordering simple) ─────────── */
  await client.query("DELETE FROM skills");
  for (const s of demoSkills) {
    await client.query(
      `INSERT INTO skills (category, name, "order") VALUES ($1, $2, $3)`,
      [s.category, s.name, s.order],
    );
  }
  console.log(`✓ ${demoSkills.length} skills seeded`);

  /* ── 4. Projects (upsert by slug) ────────────────────────────────── */
  for (const p of demoProjects) {
    await client.query(
      `INSERT INTO projects (
         slug, title, category, short_description, problem_statement, architecture,
         key_features, tech_stack, cover_image, images, live_url, github_url, featured, created_at
       ) VALUES (
         $1,$2,$3,$4,$5,$6,
         $7::jsonb,$8::jsonb,$9,$10::jsonb,$11,$12,$13,$14
       )
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         category = EXCLUDED.category,
         short_description = EXCLUDED.short_description,
         problem_statement = EXCLUDED.problem_statement,
         architecture = EXCLUDED.architecture,
         key_features = EXCLUDED.key_features,
         tech_stack = EXCLUDED.tech_stack,
         cover_image = EXCLUDED.cover_image,
         images = EXCLUDED.images,
         live_url = EXCLUDED.live_url,
         github_url = EXCLUDED.github_url,
         featured = EXCLUDED.featured`,
      [
        p.slug, p.title, p.category, p.description, p.problem,
        p.architecture, JSON.stringify(p.features), JSON.stringify(p.tech),
        p.image, JSON.stringify(p.gallery), p.liveUrl, p.githubUrl,
        p.featured, p.createdAt,
      ],
    );
  }
  console.log(`✓ ${demoProjects.length} projects seeded`);

  /* ── 5. Posts (upsert by slug) ───────────────────────────────────── */
  for (const b of demoPosts) {
    await client.query(
      `INSERT INTO posts (
         slug, title, excerpt, cover_image, tags, content, published, published_at, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,now(),now())
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         cover_image = EXCLUDED.cover_image,
         tags = EXCLUDED.tags,
         content = EXCLUDED.content,
         published = EXCLUDED.published,
         published_at = EXCLUDED.published_at`,
      [
        b.slug, b.title, b.excerpt, b.cover, JSON.stringify(b.tags),
        b.content, b.published, b.publishedAt,
      ],
    );
  }
  console.log(`✓ ${demoPosts.length} posts seeded`);

  await client.query("COMMIT");
  console.log("\n🎉 Seed complete — database ready");
} catch (e) {
  await client.query("ROLLBACK");
  console.error("❌ SEED FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
