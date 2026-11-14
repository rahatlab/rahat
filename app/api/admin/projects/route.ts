import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { projects } from "@/db/schema";
import { db } from "@/lib/db";
import { deleteProject, getProjects, saveProject } from "@/lib/data";
import { z } from "zod";

// Client-facing shape (lib/types.ts `Project`) — the admin panel speaks this,
// while the database uses different column names (handled by lib/data.ts).
const projectSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  category: z.string().min(1),
  description: z.string().default(""),
  problem: z.string().default(""),
  architecture: z.string().default(""),
  features: z.array(z.string()).default([]),
  tech: z.array(z.string()).default([]),
  image: z.string().default(""),
  gallery: z.array(z.string()).default([]),
  liveUrl: z.string().default(""),
  githubUrl: z.string().default(""),
  featured: z.boolean().default(false),
});

/** Client Project keys → database column keys (for partial PATCH updates). */
const PATCH_KEY_MAP: Record<string, string> = {
  title: "title",
  slug: "slug",
  category: "category",
  liveUrl: "liveUrl",
  githubUrl: "githubUrl",
  featured: "featured",
  description: "shortDescription",
  problem: "problemStatement",
  architecture: "architecture",
  features: "keyFeatures",
  tech: "techStack",
  image: "coverImage",
  gallery: "images",
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
    return NextResponse.json({ projects: [] });
  }
  return NextResponse.json({ projects: await getProjects() });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DB not configured" }, { status: 500 });
  }
  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }
  try {
    const input = {
      ...parsed.data,
      // New projects arrive without a slug — derive one from the title.
      slug: parsed.data.slug || slugify(parsed.data.title),
    };
    const project = await saveProject(input as Parameters<typeof saveProject>[0]);
    return NextResponse.json({ project });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save project" },
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
  await db.update(projects).set(dbUpdates).where(eq(projects.id, id));
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
  await deleteProject(id);
  return NextResponse.json({ ok: true });
}
