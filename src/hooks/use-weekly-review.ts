"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { weekStartISO } from "@/lib/dates";
import { FOUNDERS } from "@/lib/auth/whitelist";
import { ensureUserRow, logActivity } from "@/lib/activity";
import type { FounderKey } from "@/lib/types";

const supabase = createClient();

export type WeeklyReview = {
  id: string;
  week_start: string;
  user_id: string;
  accomplishments: string | null;
  next_week_focus: string | null;
  created_at: string;
};

// This week's reviews for both founders, keyed for display.
export function useWeeklyReviews() {
  const weekStart = weekStartISO();
  return useQuery({
    queryKey: ["weekly_reviews", weekStart],
    queryFn: async () => {
      const [reviews, users] = await Promise.all([
        supabase.from("weekly_reviews").select("*").eq("week_start", weekStart),
        supabase.from("users").select("id,email"),
      ]);
      const keyById: Record<string, FounderKey> = {};
      (users.data ?? []).forEach((u: { id: string; email: string }) => {
        const f = FOUNDERS[u.email];
        if (f) keyById[u.id] = f.key;
      });
      const byFounder: Partial<Record<FounderKey, WeeklyReview>> = {};
      (reviews.data ?? []).forEach((r: WeeklyReview) => {
        const k = keyById[r.user_id];
        if (k) byFounder[k] = r;
      });
      return { weekStart, byFounder };
    },
  });
}

// Auto-pulled context for the review (spec §5.11): what happened this week.
export function useWeeklyRollup() {
  const weekStart = weekStartISO();
  return useQuery({
    queryKey: ["weekly_rollup", weekStart],
    queryFn: async () => {
      const [tasks, wins, comms] = await Promise.all([
        supabase
          .from("tasks")
          .select("id")
          .eq("status", "done")
          .gte("updated_at", weekStart),
        supabase.from("wins").select("id,title").gte("date", weekStart),
        supabase.from("client_communications").select("id").gte("date", weekStart),
      ]);
      return {
        tasksCompleted: tasks.data?.length ?? 0,
        wins: (wins.data ?? []) as { id: string; title: string }[],
        communications: comms.data?.length ?? 0,
      };
    },
  });
}

export function useSubmitWeeklyReview() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      accomplishments: string;
      next_week_focus: string;
    }) => {
      const weekStart = weekStartISO();
      await ensureUserRow(supabase, user);
      const { error } = await supabase.from("weekly_reviews").upsert(
        {
          week_start: weekStart,
          user_id: user.id,
          accomplishments: input.accomplishments,
          next_week_focus: input.next_week_focus,
        },
        { onConflict: "week_start,user_id" },
      );
      if (error) throw error;
      await logActivity(supabase, {
        user_id: user.id,
        action: "submitted the weekly review",
        entity_type: "weekly_review",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weekly_reviews"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useWeeklyReviewHistory() {
  return useQuery({
    queryKey: ["weekly_reviews", "history"],
    queryFn: async () => {
      const [reviews, users] = await Promise.all([
        supabase
          .from("weekly_reviews")
          .select("*")
          .order("week_start", { ascending: false }),
        supabase.from("users").select("id,email"),
      ]);
      const keyById: Record<string, FounderKey> = {};
      (users.data ?? []).forEach((u: { id: string; email: string }) => {
        const f = FOUNDERS[u.email];
        if (f) keyById[u.id] = f.key;
      });
      return (reviews.data ?? []).map((r: WeeklyReview) => ({
        ...r,
        founder: keyById[r.user_id] ?? null,
      }));
    },
  });
}
