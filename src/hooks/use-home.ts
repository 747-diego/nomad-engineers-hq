"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "./use-realtime";
import { todayISO } from "@/lib/dates";

const supabase = createClient();

// The nearest incomplete milestone target date — drives "Days to Next
// Milestone" on the home screen (spec §5.2 Block 2).
export function useNextMilestone() {
  useRealtime("milestones", [["milestones", "next"]]);

  return useQuery({
    queryKey: ["milestones", "next"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("id,title,target_date,status")
        .neq("status", "complete")
        .gte("target_date", todayISO())
        .order("target_date", { ascending: true })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
  });
}
