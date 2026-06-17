import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HealthDot } from "./health-dot";
import { StatusPill } from "./status-pill";
import { formatShortDate } from "@/lib/dates";
import type { ClientWithHealth } from "@/hooks/use-clients";

export function ClientCard({ client }: { client: ClientWithHealth }) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="group relative flex flex-col border border-border bg-card p-5 transition-colors hover:border-nomad-green"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-display text-xl font-extrabold leading-tight text-foreground">
          {client.name}
        </h3>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-nomad-muted-gray transition-colors group-hover:text-nomad-green"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <StatusPill status={client.status} />
        {client.status === "active" && <HealthDot health={client.computedHealth} />}
        {client.status === "active" && client.mrr != null && (
          <span className="font-mono text-xs text-foreground">
            ${client.mrr.toLocaleString("en-US")}/mo
          </span>
        )}
      </div>

      {client.next_action && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="label-mono mb-1">Next</p>
          <p className="font-mono text-xs leading-relaxed text-hierarchy-secondary">
            {client.next_action}
            {client.next_action_due && (
              <span className="text-nomad-green">
                {" "}
                · {formatShortDate(client.next_action_due)}
              </span>
            )}
          </p>
        </div>
      )}
    </Link>
  );
}
