"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useUser } from "@/components/user-provider";
import { useTodayStandups } from "@/hooks/use-standups";
import {
  IntentionsBlock,
  IntentionsBlockLoading,
} from "@/components/standup/intentions-block";
import { NorthStar } from "./north-star";
import { TodaysWork } from "./todays-work";
import { WinsRibbon } from "./wins-ribbon";
import { ActivityFeed } from "./activity-feed";
import { ReviewBanner } from "./review-banner";
import { Wordmark } from "@/components/brand/wordmark";

// Home / Studio Pulse. Order matters: intentions first, then everything else —
// and everything else stays locked until the current founder logs today (§7).
export function StudioPulse() {
  const me = useUser();
  const { data: standups, isLoading } = useTodayStandups();

  if (isLoading || !standups) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <IntentionsBlockLoading />
      </div>
    );
  }

  const gateOpen = Boolean(standups[me.key]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <ReviewBanner />
      <IntentionsBlock standups={standups} />

      {gateOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-6"
        >
          <NorthStar />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <TodaysWork />
              <WinsRibbon />
            </div>
            <ActivityFeed />
          </div>
        </motion.div>
      ) : (
        <div className="relative overflow-hidden border border-dashed border-border bg-card/40 p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <Lock size={20} className="text-nomad-green" />
            <p className="font-mono text-sm text-foreground">
              Log today&apos;s intention to unlock the day.
            </p>
            <p className="max-w-sm font-mono text-xs text-hierarchy-secondary">
              The ritual creates the system. Nothing else loads until you&apos;ve
              set your focus.
            </p>
            <div className="mt-2 text-lg opacity-30">
              <Wordmark />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
