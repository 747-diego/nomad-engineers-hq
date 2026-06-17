"use client";

import { useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { useWins, useCreateWin } from "@/hooks/use-wins";
import { useClients } from "@/hooks/use-clients";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/dates";

const selectClass =
  "h-10 w-full rounded-none border border-input bg-card px-2 font-mono text-sm text-foreground focus:border-nomad-green focus:outline-none";

export default function WinsPage() {
  const { data: wins, isLoading } = useWins();
  const { data: clients } = useClients();
  const create = useCreateWin();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");

  const clientName: Record<string, string> = {};
  (clients ?? []).forEach((c) => (clientName[c.id] = c.name));

  async function submit() {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      client_id: clientId || null,
    });
    setTitle("");
    setDescription("");
    setClientId("");
    setAdding(false);
    toast("Win logged");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl">Wins</h1>
          <p className="label-mono mt-1">Proof the work works</p>
        </div>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Log win
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : !wins || wins.length === 0 ? (
        <EmptyState title="No wins yet." hint="When something lands — a launch, a yes, a milestone — mark it here." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {wins.map((w) => (
            <div key={w.id} className="border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <Trophy size={16} className="text-nomad-green" />
                <span className="font-mono text-[10px] text-hierarchy-muted">
                  {formatShortDate(w.date)}
                </span>
              </div>
              <p className="font-display text-lg font-extrabold leading-tight text-foreground">
                {w.title}
              </p>
              {w.description && (
                <p className="mt-2 font-mono text-xs leading-relaxed text-hierarchy-secondary">
                  {w.description}
                </p>
              )}
              {w.client_id && clientName[w.client_id] && (
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-nomad-green">
                  {clientName[w.client_id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Log Win">
        <div className="space-y-3">
          <div>
            <label className="label-mono mb-1 block">Title</label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label-mono mb-1 block">Description</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="label-mono mb-1 block">Client (optional)</label>
            <select
              className={selectClass}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">None</option>
              {(clients ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={create.isPending || !title.trim()}>
              {create.isPending ? "Logging…" : "Log win"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
