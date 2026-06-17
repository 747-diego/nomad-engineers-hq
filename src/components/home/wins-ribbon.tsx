"use client";

import { Trophy } from "lucide-react";
import { useWins } from "@/hooks/use-wins";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/dates";

// Block 4 — Wins Ribbon: last 3 wins, horizontal scroll, celebratory (spec §5.2).
export function WinsRibbon() {
  const { data: wins, isLoading } = useWins(3);

  return (
    <section>
      <p className="label-mono mb-3">Recent Wins</p>
      {isLoading ? (
        <Skeleton className="h-24" />
      ) : !wins || wins.length === 0 ? (
        <EmptyState title="No wins logged yet." hint="When something good happens, mark it. Momentum compounds." />
      ) : (
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {wins.map((w) => (
            <div
              key={w.id}
              className="min-w-[220px] flex-1 border border-border bg-card p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-nomad-green">
                <Trophy size={14} />
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-secondary">
                  {formatShortDate(w.date)}
                </span>
              </div>
              <p className="font-mono text-sm text-foreground">{w.title}</p>
              {w.description && (
                <p className="mt-1 font-mono text-xs text-hierarchy-secondary">
                  {w.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
