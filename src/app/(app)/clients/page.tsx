"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useClients } from "@/hooks/use-clients";
import { ClientCard } from "@/components/clients/client-card";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClientsPage() {
  const { data: clients, isLoading } = useClients();
  const [adding, setAdding] = useState(false);

  const active = (clients ?? []).filter((c) => c.status === "active");
  const pipeline = (clients ?? []).filter((c) => c.status === "pipeline");
  const archived = (clients ?? []).filter((c) => c.status === "archived");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl">Clients</h1>
          <p className="label-mono mt-1">The people we build for</p>
        </div>
        <Button onClick={() => setAdding(true)} size="sm">
          <Plus size={14} /> New client
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !clients || clients.length === 0 ? (
        <EmptyState title="No clients yet." hint="Add your first client to start tracking health, milestones, and communications." />
      ) : (
        <div className="space-y-8">
          <ClientGroup label="Active" clients={active} />
          <ClientGroup label="Pipeline" clients={pipeline} />
          {archived.length > 0 && (
            <ClientGroup label="Archived" clients={archived} />
          )}
        </div>
      )}

      {adding && <ClientForm onClose={() => setAdding(false)} />}
    </div>
  );
}

function ClientGroup({
  label,
  clients,
}: {
  label: string;
  clients: ReturnType<typeof useClients>["data"];
}) {
  if (!clients || clients.length === 0) return null;
  return (
    <section>
      <p className="label-mono mb-3">
        {label} · {clients.length}
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <ClientCard key={c.id} client={c} />
        ))}
      </div>
    </section>
  );
}
