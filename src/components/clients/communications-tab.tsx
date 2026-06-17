"use client";

import { Mail, Phone, MessageSquare, Users } from "lucide-react";
import { useCommunications, type Communication } from "@/hooks/use-communications";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatShortDate } from "@/lib/dates";

const CHANNEL_ICON = {
  email: Mail,
  call: Phone,
  text: MessageSquare,
  meeting: Users,
} as const;

const NAME: Record<string, string> = { diego: "Diego", saralexi: "Saralexi" };

export function CommunicationsTab({ clientId }: { clientId: string }) {
  const { data: comms, isLoading } = useCommunications(clientId);

  if (isLoading) return <Skeleton className="h-32" />;
  if (!comms || comms.length === 0) {
    return (
      <EmptyState
        title="No communications logged."
        hint="Use “Log communication” above. Recency drives this client's health."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {comms.map((c: Communication) => {
        const Icon = c.channel ? CHANNEL_ICON[c.channel] : MessageSquare;
        return (
          <li key={c.id} className="flex gap-3 border border-border bg-card p-4">
            <Icon size={16} className="mt-0.5 shrink-0 text-nomad-green" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-secondary">
                  {c.channel ?? "note"}
                </span>
                <span className="font-mono text-[10px] text-hierarchy-muted">
                  {formatShortDate(c.date)}
                  {c.logged_by && ` · ${NAME[c.logged_by]}`}
                </span>
              </div>
              {c.summary && (
                <p className="mt-1 font-mono text-sm leading-relaxed text-foreground">
                  {c.summary}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
