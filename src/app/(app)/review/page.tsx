"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, History } from "lucide-react";
import { useUser } from "@/components/user-provider";
import {
  useWeeklyReviews,
  useWeeklyRollup,
  useSubmitWeeklyReview,
} from "@/hooks/use-weekly-review";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/dates";
import type { FounderKey } from "@/lib/types";

const NAME: Record<FounderKey, string> = { diego: "Diego", saralexi: "Saralexi" };

export default function WeeklyReviewPage() {
  const me = useUser();
  const { data, isLoading } = useWeeklyReviews();
  const { data: rollup } = useWeeklyRollup();
  const submit = useSubmitWeeklyReview();
  const toast = useToast();

  const mine = data?.byFounder[me.key];
  const other = me.key === "diego" ? "saralexi" : "diego";
  const theirs = data?.byFounder[other];

  const [accomplishments, setAccomplishments] = useState("");
  const [focus, setFocus] = useState("");

  useEffect(() => {
    if (mine) {
      setAccomplishments(mine.accomplishments ?? "");
      setFocus(mine.next_week_focus ?? "");
    }
  }, [mine]);

  async function handleSubmit() {
    if (!accomplishments.trim() && !focus.trim()) return;
    await submit.mutateAsync({
      accomplishments: accomplishments.trim(),
      next_week_focus: focus.trim(),
    });
    toast("Weekly review submitted");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl">Weekly Review</h1>
          <p className="label-mono mt-1">
            Week of {data ? formatShortDate(data.weekStart) : "…"}
          </p>
        </div>
        <Link
          href="/review/history"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-nomad-muted-gray hover:text-foreground"
        >
          <History size={14} /> History
        </Link>
      </div>

      {/* Auto-pulled rollup */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tasks done", value: rollup?.tasksCompleted ?? "—" },
          { label: "Wins", value: rollup?.wins.length ?? "—" },
          { label: "Comms logged", value: rollup?.communications ?? "—" },
        ].map((c) => (
          <div key={c.label} className="border border-border bg-card p-4">
            <p className="label-mono">{c.label}</p>
            <p className="mt-2 font-display text-2xl font-extrabold text-foreground">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-4">
          <div className="border border-border bg-card p-5">
            <p className="label-mono mb-3 flex items-center gap-2">
              Your review
              {mine && <CheckCircle2 size={13} className="text-nomad-green" />}
            </p>
            <label className="mb-1 block font-mono text-xs text-hierarchy-secondary">
              What got done that mattered
            </label>
            <Textarea
              rows={4}
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
            />
            <label className="mb-1 mt-3 block font-mono text-xs text-hierarchy-secondary">
              What&apos;s next week&apos;s focus
            </label>
            <Textarea
              rows={3}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
            />
            <div className="mt-3 flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submit.isPending || (!accomplishments.trim() && !focus.trim())}
              >
                {submit.isPending ? "Submitting…" : mine ? "Update" : "Submit review"}
              </Button>
            </div>
          </div>

          {/* The other founder's review */}
          <div className="border border-border bg-card p-5">
            <p className="label-mono mb-3">{NAME[other]}&apos;s review</p>
            {theirs ? (
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-muted">
                    Got done
                  </p>
                  <p className="mt-1 font-mono text-sm text-foreground">
                    {theirs.accomplishments || "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-muted">
                    Next week
                  </p>
                  <p className="mt-1 font-mono text-sm text-foreground">
                    {theirs.next_week_focus || "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="font-mono text-sm text-hierarchy-muted">
                waiting for {NAME[other]}…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
