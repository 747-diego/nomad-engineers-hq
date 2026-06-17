"use client";

import { useState } from "react";
import { Plus, Target } from "lucide-react";
import {
  useStudioRoadmap,
  useCreateStudioItem,
  useUpdateStudioItem,
  useDeleteStudioItem,
  useObjectives,
  useCreateObjective,
  useUpdateObjective,
} from "@/hooks/use-roadmap";
import { RoadmapCard } from "./roadmap-card";
import { AddRoadmapItem } from "./add-roadmap-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import {
  quartersForYear,
  quarterLabel,
  type Horizon,
  type RoadmapStatus,
  type StudioRoadmapItem,
} from "@/lib/roadmap";
import { cn } from "@/lib/utils";

const YEAR = new Date().getFullYear();
const QUARTERS = quartersForYear(YEAR);
const HORIZON_ROWS: { key: Horizon; label: string }[] = [
  { key: "long_term", label: "Long Term" },
  { key: "this_year", label: "This Year" },
  { key: "next_year", label: "Next Year" },
];

export function StudioRoadmap() {
  const { data: items, isLoading } = useStudioRoadmap();
  const create = useCreateStudioItem();
  const update = useUpdateStudioItem();
  const del = useDeleteStudioItem();

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const inQuarter = (q: string) => (items ?? []).filter((i) => i.quarter === q);
  const inHorizon = (h: Horizon) =>
    (items ?? []).filter(
      (i) => !(i.quarter && QUARTERS.includes(i.quarter)) && i.horizon === h,
    );

  function moveToQuarter(q: string) {
    if (dragId) update.mutate({ id: dragId, patch: { quarter: q } });
    setDragId(null);
    setDragOver(null);
  }
  function moveToHorizon(h: Horizon) {
    if (dragId)
      update.mutate({ id: dragId, patch: { horizon: h, quarter: null } });
    setDragId(null);
    setDragOver(null);
  }

  const cardProps = (it: StudioRoadmapItem) => ({
    title: it.title,
    pillar: it.pillar,
    status: it.status,
    draggable: true,
    onDragStart: () => setDragId(it.id),
    onStatusChange: (s: RoadmapStatus) =>
      update.mutate({ id: it.id, patch: { status: s } }),
    onDelete: () => del.mutate(it.id),
  });

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-8">
      <ObjectivesRow />

      {/* Horizon rows */}
      {HORIZON_ROWS.map(({ key, label }) => (
        <section
          key={key}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(key);
          }}
          onDragLeave={() => setDragOver((d) => (d === key ? null : d))}
          onDrop={() => moveToHorizon(key)}
          className={cn(
            "border border-border p-4",
            dragOver === key && "border-nomad-green",
          )}
        >
          <p className="label-mono mb-3">{label}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {inHorizon(key).map((it) => (
              <RoadmapCard key={it.id} {...cardProps(it)} />
            ))}
            <AddRoadmapItem
              onAdd={(title, pillar) =>
                create.mutate({ title, horizon: key, pillar })
              }
            />
          </div>
        </section>
      ))}

      {/* Quarterly */}
      <section>
        <p className="label-mono mb-3">Quarterly · {YEAR}</p>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {QUARTERS.map((q) => (
            <div
              key={q}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(q);
              }}
              onDragLeave={() => setDragOver((d) => (d === q ? null : d))}
              onDrop={() => moveToQuarter(q)}
              className={cn(
                "flex w-64 shrink-0 flex-col border border-border bg-card",
                dragOver === q && "border-nomad-green",
              )}
            >
              <div className="border-b border-border p-3">
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-foreground">
                  {quarterLabel(q)}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-3">
                {inQuarter(q).map((it) => (
                  <RoadmapCard key={it.id} {...cardProps(it)} />
                ))}
                <AddRoadmapItem
                  compact
                  onAdd={(title, pillar) =>
                    create.mutate({
                      title,
                      horizon: "this_quarter",
                      quarter: q,
                      pillar,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ObjectivesRow() {
  const { data: objectives, isLoading } = useObjectives(YEAR);
  const create = useCreateObjective();
  const update = useUpdateObjective();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("");
  const [value, setValue] = useState("");

  async function submit() {
    if (!title.trim()) return;
    await create.mutateAsync({
      year: YEAR,
      title: title.trim(),
      target_metric: metric.trim() || null,
      target_value: value.trim() || null,
    });
    setTitle("");
    setMetric("");
    setValue("");
    setAdding(false);
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="label-mono">Annual Objectives · {YEAR}</p>
        <button
          onClick={() => setAdding(true)}
          className="text-nomad-muted-gray transition-colors hover:text-nomad-green"
          aria-label="Add objective"
        >
          <Plus size={16} />
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(objectives ?? []).map((o) => (
            <div
              key={o.id}
              className="border-l-2 border-nomad-green bg-card p-4"
            >
              <Target size={14} className="mb-2 text-nomad-green" />
              <p className="font-mono text-sm leading-snug text-foreground">
                {o.title}
              </p>
              {o.target_value && (
                <p className="mt-1 font-mono text-[10px] text-hierarchy-secondary">
                  {o.target_metric}: {o.target_value}
                </p>
              )}
              <select
                value={o.status}
                onChange={(e) =>
                  update.mutate({
                    id: o.id,
                    year: YEAR,
                    patch: { status: e.target.value as typeof o.status },
                  })
                }
                className="mt-3 h-7 w-full rounded-none border border-input bg-background px-1 font-mono text-[10px] text-foreground focus:border-nomad-green focus:outline-none"
              >
                <option value="in_progress">In progress</option>
                <option value="complete">Complete</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="New Objective">
        <div className="space-y-3">
          <Input
            autoFocus
            placeholder="Objective"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Metric (e.g. MRR)"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
            />
            <Input
              placeholder="Target (e.g. $15,000)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={create.isPending || !title.trim()}>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
