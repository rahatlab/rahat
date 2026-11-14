import { demoPosts, demoProjects, demoSettings, demoSkills } from "@/lib/seed";
import type { Post, Project, ProjectCategory, SiteSettings, Skill } from "@/lib/types";
import { and, desc, eq } from "drizzle-orm";
import {
  messages,
  posts,
  projects,
  settings,
  skills,
} from "@/db/schema";
import { db } from "@/lib/db";

/**
 * Data access layer.
 * Uses Drizzle/Supabase when DATABASE_URL is configured; falls back to
 * demo data (lib/seed.ts) otherwise so the site stays previewable.
 */

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/* ─── Settings ─────────────────────────────────────────────────────── */

export async function getSettings(): Promise<SiteSettings> {
  if (!isDbConfigured()) return demoSettings;
  const rows = await db.select().from(settings).where(eq(settings.key, "site"));
  if (rows.length === 0) return demoSettings;
  return rows[0].value as SiteSettings;
}

export async function updateSettings(value: SiteSettings): Promise<void> {
  if (!isDbConfigured()) return;
  await db
    .insert(settings)
    .values({ key: "site", value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

/* ─── Skills ───────────────────────────────────────────────────────── */

export async function getSkills(): Promise<Skill[]> {
  if (!isDbConfigured()) return [...demoSkills].sort((a, b) => a.order - b.order);
  return db.select().from(skills).orderBy(skills.order);
}

export async function saveSkills(items: Skill[]): Promise<void> {
  if (!isDbConfigured()) return;
  await db.delete(skills);
  for (const s of items) {
    await db.insert(skills).values(s);
  }
}

/* ─── Projects ─────────────────────────────────────────────────────── */

export function mapDbProject(r: any): Project {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.shortDescription,
    problem: r.problemStatement,
    architecture: r.architecture,
    features: r.keyFeatures,
    image: r.coverImage,
    gallery: r.images,
    tech: r.techStack,
    category: r.category as ProjectCategory,
    liveUrl: r.liveUrl,
    githubUrl: r.githubUrl,
    featured: r.featured,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
  };
}

export async function getProjects(): Promise<Project[]> {
  if (!isDbConfigured()) return [...demoProjects];
  const rows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return rows.map(mapDbProject);
}

export async function getProject(slug: string): Promise<Project | null> {
  if (!isDbConfigured()) {
    return demoProjects.find((p) => p.slug === slug) ?? null;
  }
  const rows = await db.select().from(projects).where(eq(projects.slug, slug));
  if (rows.length === 0) return null;
  return mapDbProject(rows[0]);
}

export async function saveProject(input: Omit<Project, "id" | "createdAt"> & { id?: string }): Promise<Project> {
  if (!isDbConfigured()) {
    throw new Error("DB not configured — use store.ts for demo mode");
  }
  const dbInput = {
    slug: input.slug,
    title: input.title,
    category: input.category,
    shortDescription: input.description,
    problemStatement: input.problem,
    architecture: input.architecture,
    keyFeatures: input.features,
    techStack: input.tech,
    coverImage: input.image,
    images: input.gallery,
    liveUrl: input.liveUrl,
    githubUrl: input.githubUrl,
    featured: input.featured,
  } as any;
  const id = input.id;
  const existing = id
    ? await db.select().from(projects).where(eq(projects.id, id))
    : [];
  if (id && existing.length) {
    await db.update(projects).set(dbInput).where(eq(projects.id, id));
    const rows = await db.select().from(projects).where(eq(projects.id, id));
    const r = rows[0];
    return mapDbProject(r);
  }
  const [created] = await db.insert(projects).values(dbInput).returning();
  return mapDbProject(created);
}

export async function deleteProject(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await db.delete(projects).where(eq(projects.id, id));
}

/* ─── Posts ────────────────────────────────────────────────────────── */

export async function getPosts(): Promise<Post[]> {
  if (!isDbConfigured()) return [...demoPosts].filter((p) => p.published);
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt ?? posts.createdAt));
  return rows.map(mapDbPost);
}

/** Map a raw `posts` row to the client-facing Post shape (coverImage → cover). */
export function mapDbPost(r: any): Post {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    cover: r.coverImage ?? "",
    tags: r.tags,
    content: r.content,
    published: r.published,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
  };
}

/** All posts including drafts — used by the admin blog manager. */
export async function getAllPosts(): Promise<Post[]> {
  if (!isDbConfigured()) return [...demoPosts];
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt));
  return rows.map(mapDbPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!isDbConfigured()) {
    return demoPosts.find((p) => p.slug === slug && p.published) ?? null;
  }
  const rows = await db.select().from(posts).where(eq(posts.slug, slug));
  if (rows.length === 0) return null;
  return mapDbPost(rows[0]);
}

export async function savePost(input: Omit<Post, "id" | "createdAt"> & { id?: string }): Promise<Post> {
  if (!isDbConfigured()) throw new Error("DB not configured — use store.ts for demo mode");
  const dbInput = {
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    coverImage: input.cover,
    tags: input.tags,
    content: input.content,
    published: input.published,
  } as any;
  const id = input.id;
  const existing = id
    ? await db.select().from(posts).where(eq(posts.id, id))
    : [];
  if (id && existing.length) {
    await db.update(posts).set(dbInput).where(eq(posts.id, id));
    const rows = await db.select().from(posts).where(eq(posts.id, id));
    return mapDbPost(rows[0]);
  }
  const [created] = await db
    .insert(posts)
    .values({ ...dbInput, publishedAt: new Date() })
    .returning();
  return mapDbPost(created);
}

export async function deletePost(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await db.delete(posts).where(eq(posts.id, id));
}

/* ─── Messages ─────────────────────────────────────────────────────── */

export async function addMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  if (!isDbConfigured()) return;
  await db.insert(messages).values(input as any);
}

export async function getMessages(): Promise<any[]> {
  if (!isDbConfigured()) return [];
  return db.select().from(messages).orderBy(desc(messages.createdAt));
}

export async function markMessageRead(id: string, read = true): Promise<void> {
  if (!isDbConfigured()) return;
  await db.update(messages).set({ read }).where(eq(messages.id, id));
}

export async function deleteMessage(id: string): Promise<void> {
  if (!isDbConfigured()) return;
  await db.delete(messages).where(eq(messages.id, id));
}
