"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GripVertical, ArrowRight } from "lucide-react";
import { useClients, useConvertToActive, useUpdateClient } from "@/hooks/use-clients";
import type { ClientWithHealth } from "@/hooks/use-clients";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export default function PipelinePage() {
  const { data: clients, isLoading } = useClients();
  const convert = useConvertToActive();
  const updateClient = useUpdateClient();
  const toast = useToast();

  const [order, setOrder] = useState<ClientWithHealth[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (clients) setOrder(clients.filter((c) => c.status === "pipeline"));
  }, [clients]);

  function onDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setOrder(next);
    setDragIndex(null);
    // Persist new sort_order for all pipeline clients.
    next.forEach((c, i) => {
      if (c.sort_order !== i) {
        updateClient.mutate({ id: c.id, patch: { sort_order: i } });
      }
    });
  }

  async function handleConvert(client: ClientWithHealth) {
    await convert.mutateAsync(client);
    toast(`${client.name} is now active`);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl">Pipeline</h1>
        <p className="label-mono mt-1">Drag to prioritize · convert when it closes</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : order.length === 0 ? (
        <EmptyState title="Pipeline's clear." hint="New prospects you add as 'pipeline' show up here." />
      ) : (
        <ul className="space-y-2">
          {order.map((client, i) => (
            <li
              key={client.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={cn(
                "flex items-center gap-3 border border-border bg-card p-4",
                dragIndex === i && "border-nomad-green opacity-60",
              )}
            >
              <GripVertical
                size={16}
                className="shrink-0 cursor-grab text-nomad-muted-gray"
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={`/clients/${client.id}`}
                  className="font-display text-base font-extrabold text-foreground hover:text-nomad-green"
                >
                  {client.name}
                </Link>
                {client.next_action && (
                  <p className="truncate font-mono text-xs text-hierarchy-secondary">
                    {client.next_action}
                    {client.next_action_due &&
                      ` · ${formatShortDate(client.next_action_due)}`}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConvert(client)}
                disabled={convert.isPending}
              >
                Activate <ArrowRight size={13} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
