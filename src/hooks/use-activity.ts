"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "./use-realtime";
import { FOUNDERS } from "@/lib/auth/whitelist";
import type { ActivityLog, FounderKey } from "@/lib/types";

const supabase = createClient();

export type ActivityEntry = ActivityLog & { actor: FounderKey | null };

export function useActivity(limit = 10) {
  useRealtime("activity_log", [["activity"]]);

  return useQuery({
    queryKey: ["activity", limit],
    queryFn: async () => {
      const [rows, users] = await Promise.all([
        supabase
          .from("activity_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit),
        supabase.from("users").select("id,email"),
      ]);
      const keyById: Record<string, FounderKey> = {};
      (users.data ?? []).forEach((u: { id: string; email: string }) => {
        const f = FOUNDERS[u.email];
        if (f) keyById[u.id] = f.key;
      });
      return (rows.data ?? []).map((r: ActivityLog) => ({
        ...r,
        actor: r.user_id ? keyById[r.user_id] ?? null : null,
      })) as ActivityEntry[];
    },
  });
}
