import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { settings } from "@/db/schema";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ settings: {} });
  }
  const rows = await db.select().from(settings).where(eq(settings.key, "site"));
  return NextResponse.json({ settings: rows.length ? rows[0].value : {} });
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true });
  }
  const { value } = await request.json();
  if (!value) {
    return NextResponse.json({ error: "Missing value" }, { status: 400 });
  }
  await db
    .insert(settings)
    .values({ key: "site", value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
  return NextResponse.json({ ok: true });
}
