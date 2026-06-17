"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useDecisions, useCreateDecision } from "@/hooks/use-decisions";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/dates";
import type { Assignee } from "@/lib/types";

const NAME: Record<Assignee, string> = {
  diego: "Diego",
  saralexi: "Saralexi",
  both: "Both",
};
const selectClass =
  "h-9 rounded-none border border-input bg-card px-2 font-mono text-xs text-foreground focus:border-nomad-green focus:outline-none";

export default function DecisionsPage() {
  const { data: decisions, isLoading } = useDecisions();
  const create = useCreateDecision();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [whoFilter, setWhoFilter] = useState<Assignee | "all">("all");

  // New-decision form
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [madeBy, setMadeBy] = useState<Assignee>("both");

  const filtered = (decisions ?? []).filter((d) => {
    if (whoFilter !== "all" && d.made_by !== whoFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        d.decision.toLowerCase().includes(q) ||
        (d.rationale ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  async function submit() {
    if (!decision.trim()) return;
    await create.mutateAsync({
      decision: decision.trim(),
      made_by: madeBy,
      rationale: rationale.trim() || null,
    });
    setDecision("");
    setRationale("");
    setMadeBy("both");
    setAdding(false);
    toast("Decision logged");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="sticky top-14 z-20 -mx-4 bg-background/90 px-4 py-2 backdrop-blur md:mx-0 md:px-0">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl">Decisions</h1>
            <p className="label-mono mt-1">What we chose, and why</p>
          </div>
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus size={14} /> Log decision
          </Button>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-nomad-muted-gray"
            />
            <Input
              className="pl-9"
              placeholder="Search decisions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            className={selectClass}
            value={whoFilter}
            onChange={(e) => setWhoFilter(e.target.value as Assignee | "all")}
          >
            <option value="all">Anyone</option>
            <option value="diego">Diego</option>
            <option value="saralexi">Saralexi</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query || whoFilter !== "all" ? "No matches." : "No decisions logged."}
          hint="Capture the calls that shape the studio — the reasoning matters as much as the choice."
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((d) => (
            <li key={d.id} className="border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="pill">{NAME[d.made_by]}</span>
                <span className="font-mono text-[10px] text-hierarchy-muted">
                  {formatShortDate(d.date)}
                </span>
              </div>
              <p className="mt-3 font-mono text-sm text-foreground">{d.decision}</p>
              {d.rationale && (
                <p className="mt-2 border-l-2 border-border pl-3 font-mono text-xs leading-relaxed text-hierarchy-secondary">
                  {d.rationale}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Log Decision">
        <div className="space-y-3">
          <div>
            <label className="label-mono mb-1 block">Decision</label>
            <Textarea
              autoFocus
              rows={2}
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            />
          </div>
          <div>
            <label className="label-mono mb-1 block">Why (rationale)</label>
            <Textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </div>
          <div>
            <label className="label-mono mb-1 block">Made by</label>
            <select
              className={selectClass + " w-full"}
              value={madeBy}
              onChange={(e) => setMadeBy(e.target.value as Assignee)}
            >
              <option value="both">Both</option>
              <option value="diego">Diego</option>
              <option value="saralexi">Saralexi</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={create.isPending || !decision.trim()}>
              {create.isPending ? "Logging…" : "Log it"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
