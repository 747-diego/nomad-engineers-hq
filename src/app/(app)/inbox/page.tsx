"use client";

import { CheckSquare, Scale, Trophy, Archive } from "lucide-react";
import { useInbox, useTriage } from "@/hooks/use-quick-capture";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/dates";
import type { QuickCapture } from "@/lib/types";

const NAME: Record<string, string> = { diego: "Diego", saralexi: "Saralexi" };

export default function InboxPage() {
  const { data: items, isLoading } = useInbox();
  const triage = useTriage();
  const toast = useToast();

  function act(item: QuickCapture, action: "task" | "decision" | "win" | "archive") {
    triage.mutate(
      { item, action },
      {
        onSuccess: () =>
          toast(
            action === "archive" ? "Archived" : `Converted to ${action}`,
          ),
      },
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl">Inbox</h1>
        <p className="label-mono mt-1">Quick Capture · Triage</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : !items || items.length === 0 ? (
        <EmptyState
          title="Inbox zero."
          hint="Hit the + button (or press c) anywhere to capture a thought. Triage it here later."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="border border-border bg-card p-4">
              <p className="whitespace-pre-wrap font-mono text-sm text-foreground">
                {item.content}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-mono text-[10px] text-hierarchy-muted">
                  {item.captured_by ? NAME[item.captured_by] : "—"} ·{" "}
                  {formatShortDate(item.created_at.slice(0, 10))}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TriageButton icon={CheckSquare} label="Task" onClick={() => act(item, "task")} />
                <TriageButton icon={Scale} label="Decision" onClick={() => act(item, "decision")} />
                <TriageButton icon={Trophy} label="Win" onClick={() => act(item, "win")} />
                <TriageButton icon={Archive} label="Archive" onClick={() => act(item, "archive")} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TriageButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof CheckSquare;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-foreground transition-colors hover:border-nomad-green hover:text-nomad-green"
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
