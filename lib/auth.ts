import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from "resend";
import * as schema from "@/db/schema";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    /* Single seeded admin — no open sign-ups */
    disableSignUp: true,
    minPasswordLength: 8,
    /* Forgot-password email via Resend (admin only) */
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${siteUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;
      console.log(`[auth] sending reset email to ${user.email} ...`);
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Rahat <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your password · Rahat",
        html: `
          <div style="font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#18181b;background:#ffffff">
            <!-- Header -->
            <div style="text-align:center;margin-bottom:32px">
              <img src="${siteUrl}/logo-dark.png" alt="Rahat" width="56" height="54" style="border-radius:12px;display:block;margin:0 auto 12px" />
              <span style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;font-weight:600">Rahat · Admin Console</span>
            </div>

            <!-- Body -->
            <div style="border:1px solid #e4e4e7;border-radius:16px;padding:32px 28px;background:#fafafa">
              <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;color:#18181b">Reset your password</h1>
              <p style="font-size:15px;line-height:1.7;color:#3f3f46;margin:0 0 8px">
                Hi ${user.name || "there"},
              </p>
              <p style="font-size:15px;line-height:1.7;color:#3f3f46;margin:0 0 24px">
                We received a request to reset the password for your admin account.
                Click the button below to choose a new password. This link expires in
                <strong style="color:#18181b">1 hour</strong>.
              </p>
              <div style="text-align:center;margin:0 0 24px">
                <a href="${resetUrl}"
                   style="display:inline-block;background:#06b6d4;color:#ffffff;font-weight:600;font-size:15px;padding:14px 32px;border-radius:999px;text-decoration:none">
                   Reset password
                </a>
              </div>
              <p style="font-size:13px;color:#71717a;line-height:1.6;margin:0;padding-top:16px;border-top:1px solid #e4e4e7">
                If the button doesn't work, copy and paste this link into your browser:
                <br />
                <a href="${resetUrl}" style="color:#0891b2;word-break:break-all">${resetUrl}</a>
              </p>
            </div>

            <!-- Footer -->
            <p style="text-align:center;font-size:12px;color:#a1a1aa;margin:24px 0 0">
              © ${new Date().getFullYear()} Rahat · Full-Stack Developer Portfolio
              <br />
              This is an automated email — please don't reply.
            </p>
          </div>
        `,
      });
      if (error) {
        console.error("[auth] reset email FAILED:", JSON.stringify(error));
      } else {
        console.log(`[auth] reset email accepted by Resend, id=${data?.id}`);
      }
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
