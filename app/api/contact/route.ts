import { NextResponse } from "next/server";
import { z } from "zod";
import { resend } from "@/lib/resend";
import { addMessage } from "@/lib/data";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { name, email, subject, message } = parsed.data;

  // Persist to DB
  await addMessage({ name, email, subject, message });

  // Alert admin via Resend
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "contract.rahat@gmail.com",
      subject: `New contact form message: ${subject}`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#09090b">
          <h1 style="font-size:20px;margin:0 0 12px">New contact message 📩</h1>
          <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
            <strong>Name:</strong> ${name}<br/>
            <strong>Email:</strong> ${email}<br/>
            <strong>Subject:</strong> ${subject}
          </p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 20px;white-space:pre-wrap">${message}</p>
        </div>
      `,
    });
  } catch (e) {
    console.error("[contact] resend alert failed:", e);
  }

  return NextResponse.json({ ok: true });
}
