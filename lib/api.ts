import type { Post, Project, SiteSettings, Skill } from "@/lib/types";

const API = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function fetchJson(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...opts?.headers },
    ...opts,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

/* ─── Messages ─────────────────────────────────────────────────────── */

export async function apiGetMessages() {
  const { messages } = await fetchJson("/api/messages");
  return messages;
}

export async function apiMarkMessageRead(id: string, read = true) {
  await fetchJson("/api/messages", {
    method: "PATCH",
    body: JSON.stringify({ id, read }),
  });
}

export async function apiDeleteMessage(id: string) {
  await fetchJson(`/api/messages?id=${id}`, { method: "DELETE" });
}

/* ─── Settings ─────────────────────────────────────────────────────── */

export async function apiGetSettings(): Promise<SiteSettings> {
  const { settings } = await fetchJson("/api/settings");
  return settings;
}

export async function apiUpdateSettings(value: SiteSettings) {
  await fetchJson("/api/settings", {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
}

/* ─── Projects ─────────────────────────────────────────────────────── */

export async function apiGetProjects(): Promise<Project[]> {
  const { projects } = await fetchJson("/api/admin/projects");
  return projects;
}

export async function apiSaveProject(input: Omit<Project, "id" | "slug" | "createdAt"> & { id?: string }): Promise<Project> {
  const { project } = await fetchJson("/api/admin/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return project;
}

export async function apiUpdateProject(id: string, updates: Partial<Project>) {
  await fetchJson("/api/admin/projects", {
    method: "PATCH",
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function apiDeleteProject(id: string) {
  await fetchJson(`/api/admin/projects?id=${id}`, { method: "DELETE" });
}

/* ─── Posts ────────────────────────────────────────────────────────── */

export async function apiGetPosts(): Promise<Post[]> {
  const { posts } = await fetchJson("/api/admin/blog");
  return posts;
}

export async function apiSavePost(input: Omit<Post, "id" | "slug" | "createdAt"> & { id?: string }): Promise<Post> {
  const { post } = await fetchJson("/api/admin/blog", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return post;
}

export async function apiUpdatePost(id: string, updates: Partial<Post>) {
  await fetchJson("/api/admin/blog", {
    method: "PATCH",
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function apiDeletePost(id: string) {
  await fetchJson(`/api/admin/blog?id=${id}`, { method: "DELETE" });
}

/* ─── Skills ───────────────────────────────────────────────────────── */

export async function apiGetSkills(): Promise<Skill[]> {
  // Skills endpoint not yet created — return empty array
  return [];
}

export async function apiSaveSkills(items: Skill[]) {
  // No skills API endpoint yet
}
