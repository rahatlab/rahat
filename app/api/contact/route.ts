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
    const safe = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Rahat <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL || "contract.rahat@gmail.com",
      subject: `New message: ${subject}`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#18181b;background:#ffffff">
          <!-- Header -->
          <div style="text-align:center;margin-bottom:28px">
            <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://rahat-work.vercel.app"}/logo-dark.png" alt="Rahat" width="56" height="54" style="border-radius:12px;display:block;margin:0 auto 12px" />
            <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;font-weight:600">Rahat · Contact Form</span>
          </div>

          <!-- Card -->
          <div style="border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;background:#ffffff">
            <div style="background:#06b6d4;padding:16px 24px">
              <h1 style="font-size:17px;font-weight:700;margin:0;color:#ffffff">New message received 📩</h1>
            </div>
            <div style="padding:24px">
              <!-- Fields -->
              <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <tr>
                  <td style="padding:8px 0;width:90px;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.04em">From</td>
                  <td style="padding:8px 0;font-size:15px;color:#18181b;font-weight:500">${safe(name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;border-top:1px solid #f4f4f5">Email</td>
                  <td style="padding:8px 0;font-size:15px;border-top:1px solid #f4f4f5">
                    <a href="mailto:${safe(email)}" style="color:#0891b2;text-decoration:none">${safe(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:13px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;border-top:1px solid #f4f4f5">Subject</td>
                  <td style="padding:8px 0;font-size:15px;color:#18181b;font-weight:500;border-top:1px solid #f4f4f5">${safe(subject)}</td>
                </tr>
              </table>

              <!-- Message -->
              <div style="border-left:3px solid #06b6d4;background:#fafafa;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px">
                <p style="font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.04em;margin:0 0 8px">Message</p>
                <p style="font-size:15px;line-height:1.7;color:#3f3f46;margin:0;white-space:pre-wrap">${safe(message)}</p>
              </div>

              <!-- Reply button -->
              <div style="text-align:center">
                <a href="mailto:${safe(email)}?subject=${encodeURIComponent(`Re: ${subject}`)}"
                   style="display:inline-block;background:#18181b;color:#ffffff;font-weight:600;font-size:14px;padding:12px 28px;border-radius:999px;text-decoration:none">
                   Reply to ${safe(name.split(" ")[0] || "sender")}
                </a>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <p style="text-align:center;font-size:12px;color:#a1a1aa;margin:24px 0 0">
            © ${new Date().getFullYear()} Rahat · Full-Stack Developer Portfolio
            <br />
            You received this because a visitor used your site's contact form.
          </p>
        </div>
      `,
    });
  } catch (e) {
    console.error("[contact] resend alert failed:", e);
  }

  return NextResponse.json({ ok: true });
}
