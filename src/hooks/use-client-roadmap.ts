"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Pillar } from "@/lib/pillars";

const supabase = createClient();

export type ClientRoadmapItem = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  quarter: string | null;
  pillar: Pillar | null;
  status: "planned" | "in_progress" | "complete" | "dropped";
  target_date: string | null;
  created_at: string;
};

// Read-only here; the full roadmap editor lands in Phase 4.
export function useClientRoadmap(clientId: string) {
  return useQuery({
    queryKey: ["client_roadmap", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_roadmap_items")
        .select("*")
        .eq("client_id", clientId)
        .order("quarter", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ClientRoadmapItem[];
    },
  });
}
