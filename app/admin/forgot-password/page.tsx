"use client";

import Link from "next/link";
import { createAuthClient } from "better-auth/client";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

const authClient = createAuthClient();

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    if (!email) return;

    setLoading(true);
    const { error } = await authClient.requestPasswordReset({ email });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Something went wrong");
      return;
    }
    /* Always success — avoids leaking which emails exist */
    setSentTo(email);
    setSent(true);
    setDialogOpen(true);
    toast.success("Check your inbox for the reset link");
  }

  return (
    <main className="flex min-h-svh items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        {sent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-11 place-items-center rounded-xl border border-primary/30 bg-primary/10">
              <MailCheck className="size-5 text-primary" aria-hidden />
            </span>
            <h1 className="text-xl font-bold">Check your inbox</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If an admin account exists for that email, a reset link is on its
              way. The link expires in 1 hour.
            </p>
            <Link
              href="/admin/login"
              className="mt-2 text-sm text-primary hover:underline"
            >
              ← back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5 text-center">
              <h1 className="text-xl font-bold">Reset password</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We&apos;ll email you a secure reset link.
              </p>
            </div>

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
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            <p className="mt-6 text-xs text-center text-muted-foreground">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <ArrowLeft className="size-3" aria-hidden /> back to sign in
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Confirmation dialog — shown right after the reset email is sent */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <span className="mx-auto mb-1 grid size-12 place-items-center rounded-2xl border border-primary/30 bg-primary/10">
              <MailCheck className="size-6 text-primary" aria-hidden />
            </span>
            <DialogTitle className="text-center">Reset email sent</DialogTitle>
            <DialogDescription className="text-center">
              If an admin account exists for{" "}
              <span className="font-medium text-foreground">{sentTo}</span>, a
              secure reset link is on its way. The link expires in 1 hour.
            </DialogDescription>
          </DialogHeader>
          <p className="rounded-xl border border-glass-border bg-background/50 px-4 py-3 text-center text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam/promotions folder, then try
            again.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Link
              href="/admin/login"
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Back to sign in
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
