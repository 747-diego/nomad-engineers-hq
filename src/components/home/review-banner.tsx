"use client";

import Link from "next/link";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { useUser } from "@/components/user-provider";
import { useWeeklyReviews } from "@/hooks/use-weekly-review";
import { isWeeklyReviewTime } from "@/lib/dates";

// Friday-4pm prompt to run the weekly review (spec §5.11). Hidden once the
// current founder has submitted this week.
export function ReviewBanner() {
  const me = useUser();
  const { data } = useWeeklyReviews();

  if (!isWeeklyReviewTime()) return null;
  if (data?.byFounder[me.key]) return null;

  return (
    <Link
      href="/review"
      className="flex items-center gap-3 border-l-2 border-nomad-green bg-card p-4 transition-colors hover:bg-secondary"
    >
      <CalendarCheck size={18} className="shrink-0 text-nomad-green" />
      <div className="flex-1">
        <p className="font-mono text-sm text-foreground">It&apos;s review time.</p>
        <p className="font-mono text-xs text-hierarchy-secondary">
          Close the week — what got done, what&apos;s next.
        </p>
      </div>
      <ArrowRight size={16} className="text-nomad-green" />
    </Link>
  );
}
