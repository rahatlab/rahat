import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ project: null });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");
  if (!slug && !id) {
    return NextResponse.json({ error: "Missing slug or id" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(projects)
    .where(slug ? eq(projects.slug, slug) : eq(projects.id, id!));
  return NextResponse.json({ project: rows.length ? rows[0] : null });
}
