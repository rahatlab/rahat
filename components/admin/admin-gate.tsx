"use client";

import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/client";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "./admin-shell";

const authClient = createAuthClient();

export const adminSession = {
  get: () => false, // handled by better-auth cookies
};

/** Auth pages anyone may reach — must work while signed out, standalone. */
const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ADMIN_PATHS.includes(pathname);
  const [checking, setChecking] = useState(!isPublic);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await authClient.getSession();
      const hasSession = !!data?.session;
      if (cancelled) return;

      if (isPublic) {
        // Already signed in → skip the login page, go straight to the dashboard.
        if (hasSession) router.replace("/admin");
        return;
      }

      setAuthed(hasSession);
      setChecking(false);
      if (!hasSession) {
        toast.error("Please sign in to access the admin panel");
        router.push("/admin/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, isPublic]);

  // Public auth pages render bare — no admin shell/sidebar.
  if (isPublic) return <>{children}</>;
  if (checking) return null;
  if (!authed) return null;
  // Protected pages get the full admin console around them.
  return <AdminShell>{children}</AdminShell>;
}
