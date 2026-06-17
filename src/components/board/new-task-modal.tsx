"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCreateTask } from "@/hooks/use-tasks";
import { useClients } from "@/hooks/use-clients";
import { PILLARS, PILLAR_META, type Pillar } from "@/lib/pillars";
import type { Assignee, Priority } from "@/lib/types";

const selectClass =
  "h-10 w-full rounded-none border border-input bg-card px-2 font-mono text-sm text-foreground focus:border-nomad-green focus:outline-none";

// Global "new task" modal, opened by the `n` shortcut.
export function NewTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateTask();
  const { data: clients } = useClients();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState<Pillar>("build");
  const [assignee, setAssignee] = useState<Assignee>("both");
  const [priority, setPriority] = useState<Priority>("medium");
  const [clientId, setClientId] = useState("");

  async function submit() {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(),
      pillar,
      assignee,
      priority,
      client_id: clientId || null,
    });
    setTitle("");
    setClientId("");
    onClose();
    toast("Task created");
  }

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="space-y-3">
        <Input
          autoFocus
          placeholder="What needs doing?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
        />
        <div className="grid grid-cols-2 gap-3">
          <select className={selectClass} value={pillar} onChange={(e) => setPillar(e.target.value as Pillar)}>
            {PILLARS.map((p) => (
              <option key={p} value={p}>
                {PILLAR_META[p].label}
              </option>
            ))}
          </select>
          <select className={selectClass} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className={selectClass} value={assignee} onChange={(e) => setAssignee(e.target.value as Assignee)}>
            <option value="both">D+S</option>
            <option value="diego">Diego</option>
            <option value="saralexi">Saralexi</option>
          </select>
          <select className={selectClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">No client</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending || !title.trim()}>
            {create.isPending ? "Creating…" : "Create task"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
