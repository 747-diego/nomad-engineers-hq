"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useWeeklyReviewHistory } from "@/hooks/use-weekly-review";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/dates";
import type { FounderKey } from "@/lib/types";

const NAME: Record<FounderKey, string> = { diego: "Diego", saralexi: "Saralexi" };

export default function WeeklyReviewHistoryPage() {
  const { data: reviews, isLoading } = useWeeklyReviewHistory();

  // Group by week_start.
  const byWeek = new Map<string, typeof reviews>();
  (reviews ?? []).forEach((r) => {
    const arr = byWeek.get(r.week_start) ?? [];
    arr!.push(r);
    byWeek.set(r.week_start, arr);
  });
  const weeks = Array.from(byWeek.keys());

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/review"
        className="inline-flex items-center gap-1 font-mono text-xs text-nomad-muted-gray hover:text-foreground"
      >
        <ArrowLeft size={14} /> Weekly Review
      </Link>
      <h1 className="text-2xl">Review History</h1>

      {isLoading ? (
        <Skeleton className="h-48" />
      ) : weeks.length === 0 ? (
        <EmptyState title="No reviews yet." hint="Your submitted weekly reviews will archive here." />
      ) : (
        <div className="space-y-6">
          {weeks.map((week) => (
            <section key={week}>
              <p className="label-mono mb-2">Week of {formatShortDate(week)}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {(byWeek.get(week) ?? []).map((r) => (
                  <div key={r.id} className="border border-border bg-card p-4">
                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-nomad-green">
                      {r.founder ? NAME[r.founder] : "—"}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-muted">
                      Got done
                    </p>
                    <p className="font-mono text-sm text-foreground">
                      {r.accomplishments || "—"}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-muted">
                      Next week
                    </p>
                    <p className="font-mono text-sm text-foreground">
                      {r.next_week_focus || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
