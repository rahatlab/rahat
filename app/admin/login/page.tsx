"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setLoading(true);
    
    // Use direct fetch API (bypasses better-auth client issues)
    const response = await fetch('https://rahat-work.vercel.app/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const { error } = await response.json();
    setLoading(false);

    if (error) {
      toast.error(error.message || "Invalid email or password");
      return;
    }
    toast.success("Welcome back!");
    // 🔑 CRITICAL: Full page reload + immediate return
    window.location.href = "/admin";
    return; // Exit early to ensure redirect happens
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
          <Loader2 className="size-5 animate-spin" aria-hidden />
        </span>
        <h1 className="mb-2 text-2xl font-bold">Admin login</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Sign in to manage your portfolio.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/admin/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-center text-muted-foreground">
          No account? Contact the site administrator to get access.
        </p>
      </div>
    </main>
  );
}
