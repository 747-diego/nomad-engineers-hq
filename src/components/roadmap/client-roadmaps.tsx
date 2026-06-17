"use client";

import { useMemo, useState } from "react";
import {
  useAllClientRoadmap,
  useCreateClientRoadmapItem,
  useUpdateClientRoadmapItem,
} from "@/hooks/use-roadmap";
import { useClients } from "@/hooks/use-clients";
import { RoadmapCard } from "./roadmap-card";
import { AddRoadmapItem } from "./add-roadmap-item";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  quartersForYear,
  quarterLabel,
  type RoadmapStatus,
} from "@/lib/roadmap";
import { cn } from "@/lib/utils";

const YEAR = new Date().getFullYear();
const QUARTERS = quartersForYear(YEAR);
const UNSCHEDULED = "unscheduled";

const selectClass =
  "h-9 rounded-none border border-input bg-card px-2 font-mono text-xs text-foreground focus:border-nomad-green focus:outline-none";

export function ClientRoadmaps() {
  const { data: items, isLoading } = useAllClientRoadmap();
  const { data: clients } = useClients();
  const create = useCreateClientRoadmapItem();
  const update = useUpdateClientRoadmapItem();

  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const clientName = useMemo(() => {
    const m: Record<string, string> = {};
    (clients ?? []).forEach((c) => (m[c.id] = c.name));
    return m;
  }, [clients]);

  const scoped = (items ?? []).filter(
    (i) => clientFilter === "all" || i.client_id === clientFilter,
  );

  const columns = [...QUARTERS, UNSCHEDULED];
  const inColumn = (col: string) =>
    col === UNSCHEDULED
      ? scoped.filter((i) => !i.quarter || !QUARTERS.includes(i.quarter))
      : scoped.filter((i) => i.quarter === col);

  function moveTo(col: string) {
    if (dragId) {
      update.mutate({
        id: dragId,
        patch: { quarter: col === UNSCHEDULED ? null : col },
      });
    }
    setDragId(null);
    setDragOver(null);
  }

  const activeClients = (clients ?? []).filter((c) => c.status !== "archived");

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="label-mono">Client</span>
        <select
          className={selectClass}
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        >
          <option value="all">All clients</option>
          {activeClients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {activeClients.length === 0 ? (
        <EmptyState title="No clients yet." hint="Add a client first, then plan their roadmap here." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(col);
              }}
              onDragLeave={() => setDragOver((d) => (d === col ? null : d))}
              onDrop={() => moveTo(col)}
              className={cn(
                "flex w-64 shrink-0 flex-col border border-border bg-card",
                dragOver === col && "border-nomad-green",
              )}
            >
              <div className="border-b border-border p-3">
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                  {col === UNSCHEDULED ? "Unscheduled" : quarterLabel(col)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                {inColumn(col).map((it) => (
                  <RoadmapCard
                    key={it.id}
                    title={it.title}
                    pillar={it.pillar}
                    status={it.status}
                    clientName={clientFilter === "all" ? clientName[it.client_id] : undefined}
                    draggable
                    onDragStart={() => setDragId(it.id)}
                    onStatusChange={(s: RoadmapStatus) =>
                      update.mutate({ id: it.id, patch: { status: s } })
                    }
                  />
                ))}
                {clientFilter !== "all" && (
                  <AddRoadmapItem
                    compact
                    onAdd={(title, pillar) =>
                      create.mutate({
                        client_id: clientFilter,
                        title,
                        pillar,
                        quarter: col === UNSCHEDULED ? null : col,
                      })
                    }
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {clientFilter === "all" && (
        <p className="font-mono text-[11px] text-hierarchy-muted">
          Pick a client above to add roadmap items.
        </p>
      )}
    </div>
  );
}
