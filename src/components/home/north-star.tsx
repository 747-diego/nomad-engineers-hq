"use client";

import { useClients } from "@/hooks/use-clients";
import { useNextMilestone } from "@/hooks/use-home";
import { Skeleton } from "@/components/ui/skeleton";
import { todayISO, daysBetween } from "@/lib/dates";

function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

// Block 2 — North Star Numbers (spec §5.2).
export function NorthStar() {
  const { data: clients, isLoading } = useClients();
  const { data: nextMilestone } = useNextMilestone();

  if (isLoading || !clients) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const active = clients.filter((c) => c.status === "active");
  const pipeline = clients.filter((c) => c.status === "pipeline");
  const mrr = active.reduce((sum, c) => sum + (c.mrr ?? 0), 0);
  const pipelineValue = pipeline.reduce((sum, c) => sum + (c.mrr ?? 0), 0);
  const daysToMilestone = nextMilestone?.target_date
    ? daysBetween(todayISO(), nextMilestone.target_date)
    : null;

  const cards = [
    { label: "MRR", value: money(mrr) },
    { label: "Active Clients", value: String(active.length) },
    { label: "Pipeline Value", value: pipelineValue ? money(pipelineValue) : "—" },
    {
      label: "Days to Next Milestone",
      value: daysToMilestone != null ? String(daysToMilestone) : "—",
      sub: nextMilestone?.title ?? undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="border border-border bg-card p-5">
          <p className="label-mono">{c.label}</p>
          <p className="mt-3 font-display text-3xl font-extrabold text-foreground">
            {c.value}
          </p>
          {c.sub && (
            <p className="mt-1 truncate font-mono text-[10px] text-hierarchy-secondary">
              {c.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
