"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTasks, useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useClients } from "@/hooks/use-clients";
import { TaskCard } from "@/components/board/task-card";
import { TaskEditor } from "@/components/board/task-editor";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PILLARS, PILLAR_META, type Pillar } from "@/lib/pillars";
import { todayISO } from "@/lib/dates";
import type { Assignee, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 rounded-none border border-input bg-card px-2 font-mono text-xs text-foreground focus:border-nomad-green focus:outline-none";

export default function BoardPage() {
  const { data: tasks, isLoading } = useTasks();
  const { data: clients } = useClients();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [editing, setEditing] = useState<Task | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Pillar | null>(null);

  // Filters (spec §5.5)
  const [assignee, setAssignee] = useState<Assignee | "all">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<"all" | "today" | "overdue">("all");

  const clientName = useMemo(() => {
    const map: Record<string, string> = {};
    (clients ?? []).forEach((c) => (map[c.id] = c.name));
    return map;
  }, [clients]);

  const active = (tasks ?? []).filter((t) => {
    if (t.status !== "active") return false;
    if (assignee !== "all" && t.assignee !== assignee) return false;
    if (clientFilter !== "all" && t.client_id !== clientFilter) return false;
    if (dueFilter === "today" && t.due_date !== todayISO()) return false;
    if (dueFilter === "overdue" && !(t.due_date && t.due_date < todayISO()))
      return false;
    return true;
  });

  const byPillar = (p: Pillar) => active.filter((t) => t.pillar === p);

  function onDrop(pillar: Pillar) {
    if (dragId) {
      const task = tasks?.find((t) => t.id === dragId);
      if (task && task.pillar !== pillar) {
        updateTask.mutate({ id: dragId, patch: { pillar } });
      }
    }
    setDragId(null);
    setDragOver(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl">Board</h1>
          <p className="label-mono mt-1">Pillar Kanban</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={selectClass}
            value={assignee}
            onChange={(e) => setAssignee(e.target.value as Assignee | "all")}
          >
            <option value="all">All assignees</option>
            <option value="both">D+S</option>
            <option value="diego">Diego</option>
            <option value="saralexi">Saralexi</option>
          </select>
          <select
            className={selectClass}
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          >
            <option value="all">All clients</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value as typeof dueFilter)}
          >
            <option value="all">Any due date</option>
            <option value="today">Due today</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {PILLARS.map((p) => (
            <Skeleton key={p} className="h-64 w-72 shrink-0" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PILLARS.map((pillar) => (
            <BoardColumn
              key={pillar}
              pillar={pillar}
              tasks={byPillar(pillar)}
              clientName={clientName}
              isDragOver={dragOver === pillar}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(pillar);
              }}
              onDragLeave={() => setDragOver((p) => (p === pillar ? null : p))}
              onDrop={() => onDrop(pillar)}
              onCardClick={setEditing}
              onCardDragStart={setDragId}
              onAdd={(title) => createTask.mutate({ title, pillar })}
              onSwipeLeft={(id) => updateTask.mutate({ id, patch: { status: "done" } })}
              onSwipeRight={(id) =>
                updateTask.mutate({ id, patch: { due_date: todayISO() } })
              }
            />
          ))}
        </div>
      )}

      {editing && clients && (
        <TaskEditor
          task={editing}
          clients={clients}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function BoardColumn({
  pillar,
  tasks,
  clientName,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardClick,
  onCardDragStart,
  onAdd,
  onSwipeLeft,
  onSwipeRight,
}: {
  pillar: Pillar;
  tasks: Task[];
  clientName: Record<string, string>;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onCardClick: (t: Task) => void;
  onCardDragStart: (id: string) => void;
  onAdd: (title: string) => void;
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
}) {
  const meta = PILLAR_META[pillar];
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  function submit() {
    if (!title.trim()) return;
    onAdd(title.trim());
    setTitle("");
    setAdding(false);
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "flex w-72 shrink-0 flex-col border border-border bg-card",
        isDragOver && "border-nomad-green",
      )}
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-[2px]" style={{ background: meta.color }} />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
            {meta.label}
          </span>
          <span className="font-mono text-[10px] text-nomad-muted-gray">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding((a) => !a)}
          aria-label={`Add to ${meta.label}`}
          className="text-nomad-muted-gray transition-colors hover:text-nomad-green"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {adding && (
          <Input
            autoFocus
            placeholder="New task…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") {
                setAdding(false);
                setTitle("");
              }
            }}
            onBlur={submit}
          />
        )}

        {tasks.length === 0 && !adding ? (
          <p className="py-6 text-center font-mono text-[11px] text-hierarchy-muted">
            {meta.description}
          </p>
        ) : (
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              clientName={t.client_id ? clientName[t.client_id] : undefined}
              draggable
              onDragStart={() => onCardDragStart(t.id)}
              onClick={() => onCardClick(t)}
              onSwipeLeft={() => onSwipeLeft(t.id)}
              onSwipeRight={() => onSwipeRight(t.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
