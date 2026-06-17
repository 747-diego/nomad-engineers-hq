"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/components/user-provider";
import { useToast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLogIntention,
  type StandupsByFounder,
} from "@/hooks/use-standups";
import type { FounderKey } from "@/lib/types";

const KEYS: FounderKey[] = ["diego", "saralexi"];
const NAME: Record<FounderKey, string> = {
  diego: "Diego",
  saralexi: "Saralexi",
};

// Today's Intentions — highest priority, top of the home screen (spec §5.2).
export function IntentionsBlock({ standups }: { standups: StandupsByFounder }) {
  const me = useUser();
  const logIntention = useLogIntention();
  const toast = useToast();
  const [draft, setDraft] = useState("");

  async function submit() {
    if (draft.trim().length < 10) return;
    await logIntention.mutateAsync(draft);
    setDraft("");
    toast("Intention logged. The day is yours.");
  }

  return (
    <section>
      <p className="label-mono mb-3">Today&apos;s Intentions</p>
      <div className="grid gap-3 md:grid-cols-2">
        {KEYS.map((key) => {
          const isMe = key === me.key;
          const standup = standups[key];
          return (
            <div
              key={key}
              className="relative overflow-hidden border border-border bg-card p-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center bg-nomad-green font-mono text-[10px] font-medium text-nomad-cream">
                  {NAME[key][0]}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.1em] text-foreground">
                  {NAME[key]}
                </span>
              </div>

              {standup ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-sm leading-relaxed text-foreground"
                >
                  {standup.intention}
                </motion.p>
              ) : isMe ? (
                <div>
                  <Textarea
                    autoFocus
                    rows={2}
                    placeholder="What are you focused on today?"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-nomad-muted-gray">
                      {draft.trim().length < 10
                        ? `${Math.max(0, 10 - draft.trim().length)} more chars`
                        : "ready"}
                    </span>
                    <Button
                      size="sm"
                      onClick={submit}
                      disabled={logIntention.isPending || draft.trim().length < 10}
                    >
                      {logIntention.isPending ? "Logging…" : "Log intention"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="font-mono text-sm text-hierarchy-muted">
                  waiting for {NAME[key]}…
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function IntentionsBlockLoading() {
  return (
    <section>
      <p className="label-mono mb-3">Today&apos;s Intentions</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </section>
  );
}
