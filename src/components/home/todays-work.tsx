"use client";

import { Check } from "lucide-react";
import { useTasks, useUpdateTask } from "@/hooks/use-tasks";
import { PillarTag } from "@/components/brand/pillar-tag";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { todayISO } from "@/lib/dates";

// Block 3 — Today's Work: due today OR high priority, still active (spec §5.2).
export function TodaysWork() {
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const toast = useToast();

  if (isLoading) {
    return (
      <section>
        <p className="label-mono mb-3">Today&apos;s Work</p>
        <Skeleton className="h-32" />
      </section>
    );
  }

  const today = todayISO();
  const items = (tasks ?? []).filter(
    (t) =>
      t.status === "active" && (t.due_date === today || t.priority === "high"),
  );

  async function markDone(id: string, title: string) {
    await updateTask.mutateAsync({ id, patch: { status: "done" } });
    toast(`Done: ${title}`);
  }

  return (
    <section>
      <p className="label-mono mb-3">Today&apos;s Work</p>
      {items.length === 0 ? (
        <EmptyState
          title="Nothing on fire."
          hint="No high-priority or due-today tasks. Pull something forward from the board, or enjoy the clarity."
        />
      ) : (
        <ul className="divide-y divide-border border border-border bg-card">
          {items.map((t) => (
            <li key={t.id} className="flex items-center gap-3 p-4">
              <button
                onClick={() => markDone(t.id, t.title)}
                aria-label="Mark done"
                className="flex h-5 w-5 items-center justify-center border border-nomad-green text-transparent transition-colors hover:bg-nomad-green hover:text-nomad-cream"
              >
                <Check size={14} />
              </button>
              <span className="flex-1 font-mono text-sm text-foreground">
                {t.title}
              </span>
              {t.priority === "high" && (
                <span className="h-2 w-2 rounded-full bg-nomad-green" title="High priority" />
              )}
              <PillarTag pillar={t.pillar} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
