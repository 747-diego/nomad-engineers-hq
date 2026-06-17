"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import type { Task } from "@/lib/types";
import { formatShortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const PRIORITY_DOT: Record<Task["priority"], string> = {
  low: "bg-nomad-muted-gray",
  medium: "bg-nomad-cream",
  high: "bg-nomad-green",
};

const ASSIGNEE_LABEL: Record<Task["assignee"], string> = {
  diego: "D",
  saralexi: "S",
  both: "D+S",
};

export function TaskCard({
  task,
  clientName,
  onClick,
  onDragStart,
  draggable,
  onSwipeLeft,
  onSwipeRight,
}: {
  task: Task;
  clientName?: string;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [dx, setDx] = useState(0);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!start.current) return;
    const t = e.touches[0];
    const moveX = t.clientX - start.current.x;
    const moveY = t.clientY - start.current.y;
    if (Math.abs(moveX) > Math.abs(moveY)) setDx(moveX);
  }
  function onTouchEnd() {
    if (dx <= -64) onSwipeLeft?.();
    else if (dx >= 64) onSwipeRight?.();
    setDx(0);
    start.current = null;
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ transform: dx ? `translateX(${dx}px)` : undefined }}
      className="group animate-fade-in cursor-pointer touch-pan-y border border-border bg-background p-3 transition-colors hover:border-nomad-green"
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            PRIORITY_DOT[task.priority],
          )}
          title={`${task.priority} priority`}
        />
        <p className="flex-1 font-mono text-sm leading-snug text-foreground">
          {task.title}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-nomad-muted-gray">
          {ASSIGNEE_LABEL[task.assignee]}
        </span>
        {clientName && (
          <span className="truncate font-mono text-[10px] text-hierarchy-secondary">
            {clientName}
          </span>
        )}
        {task.due_date && (
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-hierarchy-secondary">
            <Calendar size={10} />
            {formatShortDate(task.due_date)}
          </span>
        )}
      </div>
    </div>
  );
}
