"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { createAuthClient } from "better-auth/client";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const authClient = createAuthClient();

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    const { error } = await authClient.resetPassword({
      token,
      newPassword,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Reset failed — the link may have expired");
      return;
    }
    toast.success("Password updated — sign in with your new password");
    router.push("/admin/login");
    router.refresh();
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <h1 className="text-xl font-bold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This reset link is missing its token.
        </p>
        <Link
          href="/admin/forgot-password"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          request a new link →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 text-center">
        <h1 className="text-xl font-bold">New password</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong password (min 8 characters).
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">
            New password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-sm font-medium">
            Confirm password
          </Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="mb-4 flex justify-center">
          <span className="grid size-11 place-items-center rounded-xl border border-primary/30 bg-primary/10">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
          </span>
        </div>
        <Suspense
          fallback={
            <div className="grid place-items-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
            </div>
          }
        >
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
