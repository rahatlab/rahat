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
        from: process.env.EMAIL_FROM || "Portfolio <onboarding@resend.dev>",
        to: user.email,
        subject: "Reset your portfolio admin password",
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#09090b">
            <h1 style="font-size:20px;margin:0 0 12px">Hi ${user.name || "there"} 👋</h1>
            <p style="font-size:15px;line-height:1.6;margin:0 0 20px">
              Someone (hopefully you) requested a password reset for your portfolio admin account.
              This link expires in 1 hour.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#06b6d4;color:#04222a;font-weight:600;font-size:14px;padding:12px 20px;border-radius:999px;text-decoration:none">
               Reset password
            </a>
            <p style="font-size:13px;color:#71717a;margin:20px 0 0">
              If the button doesn't work, copy this link:<br/>
              <span style="word-break:break-all">${resetUrl}</span>
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
