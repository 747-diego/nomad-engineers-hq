"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { useRealtime } from "./use-realtime";
import { todayISO } from "@/lib/dates";
import type { Win } from "@/lib/types";

const supabase = createClient();

export function useWins(limit?: number) {
  useRealtime("wins", [["wins"]]);

  return useQuery({
    queryKey: ["wins", limit ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("wins")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Win[];
    },
  });
}

export function useCreateWin() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (win: {
      title: string;
      description?: string | null;
      client_id?: string | null;
    }) => {
      const { error } = await supabase.from("wins").insert({
        title: win.title,
        description: win.description ?? null,
        client_id: win.client_id ?? null,
        date: todayISO(),
      });
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: `logged a win: "${win.title}"`,
        entity_type: "win",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wins"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
