"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PILLARS, PILLAR_META, type Pillar } from "@/lib/pillars";

// Inline "add a roadmap item" affordance: title + pillar.
export function AddRoadmapItem({
  onAdd,
  compact,
}: {
  onAdd: (title: string, pillar: Pillar) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState<Pillar>("build");

  function submit() {
    if (!title.trim()) return;
    onAdd(title.trim(), pillar);
    setTitle("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={
          "flex items-center justify-center gap-1.5 border border-dashed border-border py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-nomad-muted-gray transition-colors hover:border-nomad-green hover:text-nomad-green" +
          (compact ? "" : " ")
        }
      >
        <Plus size={13} /> Add
      </button>
    );
  }

  return (
    <div className="space-y-2 border border-border bg-background p-2">
      <Input
        autoFocus
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <select
        value={pillar}
        onChange={(e) => setPillar(e.target.value as Pillar)}
        className="h-8 w-full rounded-none border border-input bg-card px-1 font-mono text-[10px] text-foreground focus:border-nomad-green focus:outline-none"
      >
        {PILLARS.map((p) => (
          <option key={p} value={p}>
            {PILLAR_META[p].label}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        <button
          onClick={submit}
          className="flex-1 bg-nomad-green py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-nomad-cream"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-2 font-mono text-[10px] uppercase tracking-[0.1em] text-nomad-muted-gray"
        >
          Esc
        </button>
      </div>
    </div>
  );
}
