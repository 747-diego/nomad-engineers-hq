"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { useRealtime } from "./use-realtime";
import { todayISO } from "@/lib/dates";
import { FOUNDERS } from "@/lib/auth/whitelist";
import type { DailyStandup, FounderKey } from "@/lib/types";

const supabase = createClient();

// Maps user_id -> founder key by joining against the seeded users table.
async function fetchUserKeys(): Promise<Record<string, FounderKey>> {
  const { data } = await supabase.from("users").select("id,email");
  const map: Record<string, FounderKey> = {};
  (data ?? []).forEach((u: { id: string; email: string }) => {
    const f = FOUNDERS[u.email];
    if (f) map[u.id] = f.key;
  });
  return map;
}

export type StandupsByFounder = {
  diego: DailyStandup | null;
  saralexi: DailyStandup | null;
  keys: Record<string, FounderKey>;
};

export function useTodayStandups() {
  useRealtime("daily_standups", [["standups", "today"]]);

  return useQuery<StandupsByFounder>({
    queryKey: ["standups", "today"],
    queryFn: async () => {
      const today = todayISO();
      const [keys, rows] = await Promise.all([
        fetchUserKeys(),
        supabase.from("daily_standups").select("*").eq("date", today),
      ]);
      const result: StandupsByFounder = { diego: null, saralexi: null, keys };
      (rows.data ?? []).forEach((s: DailyStandup) => {
        const k = keys[s.user_id];
        if (k) result[k] = s;
      });
      return result;
    },
  });
}

export function useLogIntention() {
  const user = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (intention: string) => {
      const today = todayISO();
      const { error } = await supabase.from("daily_standups").upsert(
        { user_id: user.id, date: today, intention: intention.trim() },
        { onConflict: "user_id,date" },
      );
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "logged today's intention",
        entity_type: "daily_standup",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["standups"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useStandupHistory(days = 14) {
  useRealtime("daily_standups", [["standups", "history"]]);

  return useQuery({
    queryKey: ["standups", "history", days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { data } = await supabase
        .from("daily_standups")
        .select("*")
        .gte("date", since.toISOString().slice(0, 10))
        .order("date", { ascending: false });
      return (data ?? []) as DailyStandup[];
    },
  });
}
