"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { useRealtime } from "./use-realtime";
import { todayISO } from "@/lib/dates";
import type { Assignee, Decision } from "@/lib/types";

const supabase = createClient();

export function useDecisions() {
  useRealtime("decisions", [["decisions"]]);

  return useQuery({
    queryKey: ["decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Decision[];
    },
  });
}

export function useCreateDecision() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      decision: string;
      made_by: Assignee;
      rationale?: string | null;
      date?: string;
    }) => {
      const { error } = await supabase.from("decisions").insert({
        decision: input.decision,
        made_by: input.made_by,
        rationale: input.rationale ?? null,
        date: input.date ?? todayISO(),
      });
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "logged a decision",
        entity_type: "decision",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
