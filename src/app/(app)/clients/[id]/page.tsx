"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { useTasks } from "@/hooks/use-tasks";
import { useClientRoadmap } from "@/hooks/use-client-roadmap";
import { HealthDot } from "@/components/clients/health-dot";
import { StatusPill } from "@/components/clients/status-pill";
import { ClientForm } from "@/components/clients/client-form";
import { MilestonesTab } from "@/components/clients/milestones-tab";
import { CommunicationsTab } from "@/components/clients/communications-tab";
import { NotesTab } from "@/components/clients/notes-tab";
import { LogCommunication } from "@/components/clients/log-communication";
import { PillarTag } from "@/components/brand/pillar-tag";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

const TABS = ["Overview", "Milestones", "Communications", "Tasks", "Roadmap", "Notes"] as const;
type Tab = (typeof TABS)[number];

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: clients, isLoading } = useClients();
  const [tab, setTab] = useState<Tab>("Overview");
  const [editing, setEditing] = useState(false);

  const client = useMemo(
    () => clients?.find((c) => c.id === id),
    [clients, id],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState title="Client not found." hint="It may have been archived or removed." />
        <div className="mt-4">
          <Link href="/clients" className="font-mono text-xs text-nomad-green">
            ← Back to clients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 font-mono text-xs text-nomad-muted-gray hover:text-foreground"
      >
        <ArrowLeft size={14} /> Clients
      </Link>

      {/* Header */}
      <div className="border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              {client.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusPill status={client.status} />
              {client.status === "active" && (
                <HealthDot health={client.computedHealth} withLabel />
              )}
              {client.mrr != null && (
                <span className="font-mono text-sm text-foreground">
                  ${client.mrr.toLocaleString("en-US")}/mo
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <Pencil size={13} /> Edit
            </Button>
            <LogCommunication clientId={client.id} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
              tab === t
                ? "border-nomad-green text-foreground"
                : "border-transparent text-nomad-muted-gray hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {tab === "Overview" && <OverviewTab client={client} />}
        {tab === "Milestones" && <MilestonesTab clientId={client.id} />}
        {tab === "Communications" && <CommunicationsTab clientId={client.id} />}
        {tab === "Tasks" && <ClientTasks clientId={client.id} />}
        {tab === "Roadmap" && <ClientRoadmapTab clientId={client.id} />}
        {tab === "Notes" && <NotesTab clientId={client.id} notes={client.notes} />}
      </div>

      {editing && <ClientForm client={client} onClose={() => setEditing(false)} />}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="label-mono mb-1">{label}</p>
      <p className="font-mono text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

function OverviewTab({
  client,
}: {
  client: NonNullable<ReturnType<typeof useClients>["data"]>[number];
}) {
  return (
    <div className="grid gap-5 border border-border bg-card p-6 sm:grid-cols-2">
      <Field label="Primary contact" value={client.primary_contact_name} />
      <Field label="Email" value={client.primary_contact_email} />
      <Field label="Phone" value={client.primary_contact_phone} />
      <Field
        label="Contract start"
        value={client.contract_start ? formatShortDate(client.contract_start) : null}
      />
      <div className="sm:col-span-2">
        <p className="label-mono mb-1">Next action</p>
        <p className="font-mono text-sm text-foreground">
          {client.next_action || "—"}
          {client.next_action_due && (
            <span className="text-nomad-green">
              {" "}
              · due {formatShortDate(client.next_action_due)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

function ClientTasks({ clientId }: { clientId: string }) {
  const { data: tasks, isLoading } = useTasks();
  if (isLoading) return <Skeleton className="h-32" />;
  const items = (tasks ?? []).filter((t) => t.client_id === clientId);
  if (items.length === 0) {
    return <EmptyState title="No tasks linked." hint="Tag a board task to this client to see it here." />;
  }
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {items.map((t) => (
        <li key={t.id} className="flex items-center gap-3 p-4">
          <span className="flex-1 font-mono text-sm text-foreground">{t.title}</span>
          {t.status === "done" && (
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-nomad-muted-gray">
              done
            </span>
          )}
          <PillarTag pillar={t.pillar} />
        </li>
      ))}
    </ul>
  );
}

function ClientRoadmapTab({ clientId }: { clientId: string }) {
  const { data: items, isLoading } = useClientRoadmap(clientId);
  if (isLoading) return <Skeleton className="h-32" />;
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="No roadmap items."
        hint="The full roadmap editor lands in Phase 4 — this client's timeline will live here."
      />
    );
  }
  return (
    <ul className="divide-y divide-border border border-border bg-card">
      {items.map((it) => (
        <li key={it.id} className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-sm text-foreground">{it.title}</p>
            {it.quarter && (
              <p className="font-mono text-[10px] text-hierarchy-secondary">
                {it.quarter.replace("_", " ")} · {it.status.replace("_", " ")}
              </p>
            )}
          </div>
          {it.pillar && <PillarTag pillar={it.pillar} />}
        </li>
      ))}
    </ul>
  );
}
