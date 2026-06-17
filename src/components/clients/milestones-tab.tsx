"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  useMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
} from "@/hooks/use-milestones";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/dates";
import type { MilestoneStatus } from "@/lib/types";

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  on_track: "#27AE60",
  at_risk: "#D4A857",
  overdue: "#E06C5A",
  complete: "#8A7F72",
};
const STATUSES: MilestoneStatus[] = ["on_track", "at_risk", "overdue", "complete"];
const STATUS_LABEL: Record<MilestoneStatus, string> = {
  on_track: "On track",
  at_risk: "At risk",
  overdue: "Overdue",
  complete: "Complete",
};

const selectClass =
  "h-9 rounded-none border border-input bg-card px-2 font-mono text-xs text-foreground focus:border-nomad-green focus:outline-none";

export function MilestonesTab({ clientId }: { clientId: string }) {
  const { data: milestones, isLoading } = useMilestones(clientId);
  const create = useCreateMilestone();
  const update = useUpdateMilestone();
  const del = useDeleteMilestone();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  function add() {
    if (!title.trim()) return;
    create.mutate({
      client_id: clientId,
      title: title.trim(),
      target_date: date || null,
    });
    setTitle("");
    setDate("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2 border border-border bg-card p-3">
        <div className="min-w-[160px] flex-1">
          <label className="label-mono mb-1 block">New milestone</label>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
        </div>
        <Input
          type="date"
          className="w-40"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Button size="sm" onClick={add} disabled={create.isPending || !title.trim()}>
          <Plus size={14} /> Add
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : !milestones || milestones.length === 0 ? (
        <EmptyState title="No milestones yet." hint="Add the next meaningful checkpoint for this client." />
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {milestones.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-4">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: STATUS_COLOR[m.status] }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-mono text-sm text-foreground">{m.title}</p>
                {m.target_date && (
                  <p className="font-mono text-[10px] text-hierarchy-secondary">
                    Target {formatShortDate(m.target_date)}
                  </p>
                )}
              </div>
              <select
                className={selectClass}
                value={m.status}
                onChange={(e) =>
                  update.mutate({
                    id: m.id,
                    clientId,
                    patch: { status: e.target.value as MilestoneStatus },
                  })
                }
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => del.mutate({ id: m.id, clientId })}
                aria-label="Delete milestone"
                className="text-nomad-muted-gray transition-colors hover:text-[#E06C5A]"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
