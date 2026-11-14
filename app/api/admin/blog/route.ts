import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { deletePost, getAllPosts, savePost } from "@/lib/data";
import { z } from "zod";

// Client-facing shape (lib/types.ts `Post`) — admin panel speaks this,
// the database uses different column names (handled by lib/data.ts).
const postSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().default(""),
  content: z.string().min(1),
  cover: z.string().default(""),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

/** Client Post keys → database column keys (for partial PATCH updates). */
const PATCH_KEY_MAP: Record<string, string> = {
  title: "title",
  slug: "slug",
  excerpt: "excerpt",
  content: "content",
  cover: "coverImage",
  tags: "tags",
  published: "published",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const runtime = "nodejs";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ posts: [] });
  }
  return NextResponse.json({ posts: await getAllPosts() });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }
  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  try {
    const input = {
      ...parsed.data,
      // New posts arrive without a slug — derive one from the title.
      slug: parsed.data.slug || slugify(parsed.data.title),
    };
    const post = await savePost(input as Parameters<typeof savePost>[0]);
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save post" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const dbUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates as Record<string, unknown>)) {
    const column = PATCH_KEY_MAP[key];
    if (column && value !== undefined) dbUpdates[column] = value;
  }
  await db.update(posts).set(dbUpdates).where(eq(posts.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await deletePost(id);
  return NextResponse.json({ ok: true });
}
