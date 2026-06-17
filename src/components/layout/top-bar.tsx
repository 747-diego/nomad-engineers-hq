"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { founderFor } from "@/lib/auth/whitelist";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Sticky top bar on every screen (spec §6): wordmark left, greeting + avatar right.
export function TopBar({ email }: { email: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const founder = founderFor(email);
  const first = founder?.first ?? "there";
  const initials = founder
    ? founder.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "?";

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <Link href="/" className="text-base md:hidden">
        <Wordmark suffix="HQ" />
      </Link>
      <div className="hidden md:block" />

      <div className="relative flex items-center gap-2">
        <ThemeToggle />
        <span className="hidden font-mono text-xs text-hierarchy-secondary sm:inline">
          {greeting()}, {first}
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5"
          aria-label="Account menu"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-none bg-nomad-green font-mono text-[11px] font-medium text-nomad-cream">
            {initials}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "text-nomad-muted-gray transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-11 z-50 w-52 border border-border bg-card p-1 shadow-xl">
              <div className="px-3 py-2">
                <p className="font-mono text-xs text-foreground">
                  {founder?.name ?? "Unknown"}
                </p>
                <p className="font-mono text-[10px] text-nomad-muted-gray">
                  {email}
                </p>
              </div>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-secondary"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
