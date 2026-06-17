"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  IntentionsBlock,
  IntentionsBlockLoading,
} from "@/components/standup/intentions-block";
import {
  useTodayStandups,
  useStandupHistory,
} from "@/hooks/use-standups";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLongDate, formatShortDate, todayISO } from "@/lib/dates";
import type { DailyStandup, FounderKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAME: Record<FounderKey, string> = { diego: "Diego", saralexi: "Saralexi" };

export default function StandupPage() {
  const { data: standups, isLoading } = useTodayStandups();
  const { data: history, isLoading: historyLoading } = useStandupHistory(14);
  const [openDay, setOpenDay] = useState<string | null>(null);

  // Group history by date (excluding today), then map to founder keys.
  const keyById = standups?.keys ?? {};
  const byDate = new Map<string, Partial<Record<FounderKey, DailyStandup>>>();
  (history ?? []).forEach((s) => {
    if (s.date === todayISO()) return;
    const k = keyById[s.user_id];
    if (!k) return;
    const entry = byDate.get(s.date) ?? {};
    entry[k] = s;
    byDate.set(s.date, entry);
  });
  const days = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl">{formatLongDate(todayISO())}</h1>
        <p className="label-mono mt-2">Daily Standup</p>
      </div>

      {isLoading || !standups ? (
        <IntentionsBlockLoading />
      ) : (
        <IntentionsBlock standups={standups} />
      )}

      <section>
        <p className="label-mono mb-3">Last 14 Days</p>
        {historyLoading ? (
          <Skeleton className="h-40" />
        ) : days.length === 0 ? (
          <p className="font-mono text-xs text-hierarchy-secondary">
            No history yet — it builds one morning at a time.
          </p>
        ) : (
          <ul className="divide-y divide-border border border-border bg-card">
            {days.map((date) => {
              const entry = byDate.get(date)!;
              const open = openDay === date;
              return (
                <li key={date}>
                  <button
                    onClick={() => setOpenDay(open ? null : date)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="font-mono text-sm text-foreground">
                      {formatShortDate(date)}
                    </span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-nomad-muted-gray transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                  {open && (
                    <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
                      {(["diego", "saralexi"] as FounderKey[]).map((k) => (
                        <div key={k} className="border border-border p-3">
                          <p className="label-mono mb-1">{NAME[k]}</p>
                          <p className="font-mono text-sm text-foreground">
                            {entry[k]?.intention ?? (
                              <span className="text-hierarchy-muted">
                                no intention logged
                              </span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
