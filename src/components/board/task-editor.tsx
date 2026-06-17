"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { PILLARS, PILLAR_META } from "@/lib/pillars";
import type { Client, Task } from "@/lib/types";

const fieldLabel = "label-mono mb-1 block";
const selectClass =
  "h-10 w-full rounded-none border border-input bg-card px-2 font-mono text-sm text-foreground focus:border-nomad-green focus:outline-none";

// Tap-to-expand task editor (spec §5.5). Pillar select doubles as the
// mobile-friendly way to move a card between columns.
export function TaskEditor({
  task,
  clients,
  onClose,
}: {
  task: Task;
  clients: Client[];
  onClose: () => void;
}) {
  const update = useUpdateTask();
  const del = useDeleteTask();
  const toast = useToast();

  const [draft, setDraft] = useState<Task>(task);

  function set<K extends keyof Task>(key: K, value: Task[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function save() {
    await update.mutateAsync({
      id: task.id,
      patch: {
        title: draft.title.trim(),
        description: draft.description,
        pillar: draft.pillar,
        assignee: draft.assignee,
        client_id: draft.client_id,
        priority: draft.priority,
        due_date: draft.due_date || null,
        status: draft.status,
      },
    });
    toast("Task updated");
    onClose();
  }

  async function remove() {
    await del.mutateAsync(task.id);
    toast("Task deleted");
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Edit Task">
      <div className="space-y-3">
        <div>
          <label className={fieldLabel}>Title</label>
          <Input value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div>
          <label className={fieldLabel}>Description</label>
          <Textarea
            rows={3}
            value={draft.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>Pillar</label>
            <select
              className={selectClass}
              value={draft.pillar}
              onChange={(e) => set("pillar", e.target.value as Task["pillar"])}
            >
              {PILLARS.map((p) => (
                <option key={p} value={p}>
                  {PILLAR_META[p].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Priority</label>
            <select
              className={selectClass}
              value={draft.priority}
              onChange={(e) => set("priority", e.target.value as Task["priority"])}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Assignee</label>
            <select
              className={selectClass}
              value={draft.assignee}
              onChange={(e) => set("assignee", e.target.value as Task["assignee"])}
            >
              <option value="both">D+S</option>
              <option value="diego">Diego</option>
              <option value="saralexi">Saralexi</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Due date</label>
            <Input
              type="date"
              value={draft.due_date ?? ""}
              onChange={(e) => set("due_date", e.target.value || null)}
            />
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Client</label>
          <select
            className={selectClass}
            value={draft.client_id ?? ""}
            onChange={(e) => set("client_id", e.target.value || null)}
          >
            <option value="">None</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={remove} disabled={del.isPending}>
            <Trash2 size={14} /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={save} disabled={update.isPending || !draft.title.trim()}>
              {update.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
