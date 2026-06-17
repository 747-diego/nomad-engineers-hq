"use client";

import { Trash2 } from "lucide-react";
import { PillarTag } from "@/components/brand/pillar-tag";
import {
  ROADMAP_STATUS_LABEL,
  type RoadmapStatus,
} from "@/lib/roadmap";
import type { Pillar } from "@/lib/pillars";
import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<RoadmapStatus, string> = {
  planned: "#8A7F72",
  in_progress: "#27AE60",
  complete: "#1E6B3C",
  dropped: "#555555",
};
const STATUSES: RoadmapStatus[] = ["planned", "in_progress", "complete", "dropped"];

export function RoadmapCard({
  title,
  pillar,
  status,
  clientName,
  draggable,
  onDragStart,
  onStatusChange,
  onDelete,
}: {
  title: string;
  pillar: Pillar | null;
  status: RoadmapStatus;
  clientName?: string;
  draggable?: boolean;
  onDragStart?: () => void;
  onStatusChange?: (s: RoadmapStatus) => void;
  onDelete?: () => void;
}) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "animate-fade-in border border-border bg-background p-3",
        draggable && "cursor-grab",
        status === "complete" && "opacity-60",
        status === "dropped" && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 font-mono text-sm leading-snug text-foreground">
          {title}
        </p>
        {onDelete && (
          <button
            onClick={onDelete}
            aria-label="Delete"
            className="text-nomad-muted-gray transition-colors hover:text-[#E06C5A]"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pillar && <PillarTag pillar={pillar} />}
        {clientName && (
          <span className="font-mono text-[10px] text-hierarchy-secondary">
            {clientName}
          </span>
        )}
        {onStatusChange ? (
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as RoadmapStatus)}
            className="ml-auto h-7 rounded-none border border-input bg-card px-1 font-mono text-[10px] text-foreground focus:border-nomad-green focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {ROADMAP_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        ) : (
          <span
            className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-hierarchy-secondary"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: STATUS_COLOR[status] }}
            />
            {ROADMAP_STATUS_LABEL[status]}
          </span>
        )}
      </div>
    </div>
  );
}
