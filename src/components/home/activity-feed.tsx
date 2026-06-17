"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useActivity } from "@/hooks/use-activity";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { FounderKey } from "@/lib/types";

const NAME: Record<FounderKey, string> = { diego: "Diego", saralexi: "Saralexi" };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Block 5 — Activity Feed: last 10 actions, real-time (spec §5.2).
export function ActivityFeed() {
  const { data: activity, isLoading } = useActivity(10);

  return (
    <section>
      <p className="label-mono mb-3">Activity</p>
      {isLoading ? (
        <Skeleton className="h-48" />
      ) : !activity || activity.length === 0 ? (
        <EmptyState title="Quiet so far." hint="Actions show up here as you both work." />
      ) : (
        <ul className="space-y-3 border border-border bg-card p-4">
          <AnimatePresence initial={false}>
            {activity.map((a) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-nomad-green" />
                <div className="min-w-0">
                  <p className="font-mono text-xs leading-relaxed text-foreground">
                    <span className="text-nomad-green">
                      {a.actor ? NAME[a.actor] : "Someone"}
                    </span>{" "}
                    {a.action}
                  </p>
                  <p className="font-mono text-[10px] text-hierarchy-muted">
                    {timeAgo(a.created_at)}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
