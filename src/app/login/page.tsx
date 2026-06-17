"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isWhitelisted } from "@/lib/auth/whitelist";
import { Wordmark } from "@/components/brand/wordmark";
import { Watermark } from "@/components/brand/watermark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(
    params.get("error") === "not_whitelisted"
      ? "That email isn't on the list. Access is invite-only."
      : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const clean = email.trim().toLowerCase();
    // Reject non-whitelisted emails before we ever send a link (spec §3).
    if (!isWhitelisted(clean)) {
      setError("That email isn't on the list. Access is invite-only.");
      return;
    }

    setStatus("sending");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: clean,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setStatus("idle");
      setError(signInError.message);
      return;
    }
    setStatus("sent");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="green-top-bar" />
      <Watermark size="60vw" className="opacity-100" />

      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-4xl">
            <Wordmark />
          </div>
          <p className="label-mono mt-4">internal operating system</p>
        </div>

        {status === "sent" ? (
          <div className="border border-nomad-green bg-card p-6 text-center">
            <p className="font-mono text-sm text-foreground">
              Check your inbox.
            </p>
            <p className="mt-2 font-mono text-xs text-hierarchy-secondary">
              We sent a magic link to{" "}
              <span className="text-nomad-green">{email.trim().toLowerCase()}</span>.
              Open it on this device to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              required
              autoFocus
              placeholder="you@nomadengineers.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "sending"}
            />
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send magic link"}
            </Button>
            {error && (
              <p className="font-mono text-xs text-[#E06C5A]">{error}</p>
            )}
          </form>
        )}

        <p className="mt-12 text-center font-mono text-xs lowercase tracking-[0.2em] text-hierarchy-muted">
          we build. you grow.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
