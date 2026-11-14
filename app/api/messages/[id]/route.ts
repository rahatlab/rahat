import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { messages } from "@/db/schema";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: true });
  }
  const { id, read } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await db.update(messages).set({ read }).where(eq(messages.id, id));
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
  await db.delete(messages).where(eq(messages.id, id));
  return NextResponse.json({ ok: true });
}
