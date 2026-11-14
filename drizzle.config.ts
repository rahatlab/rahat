import fs from "node:fs";
import { defineConfig } from "drizzle-kit";

/* drizzle-kit only auto-loads `.env` — merge `.env.local` (Next.js file) manually */
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL missing — fill .env.local first");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
