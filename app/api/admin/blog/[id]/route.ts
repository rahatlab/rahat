import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ post: null });
  }
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const id = searchParams.get("id");
  if (!slug && !id) {
    return NextResponse.json({ error: "Missing slug or id" }, { status: 400 });
  }
  const rows = await db
    .select()
    .from(posts)
    .where(slug ? eq(posts.slug, slug) : eq(posts.id, id!));
  return NextResponse.json({ post: rows.length ? rows[0] : null });
}
