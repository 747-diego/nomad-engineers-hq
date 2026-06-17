"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "./use-realtime";
import type { Client } from "@/lib/types";

const supabase = createClient();

// Lightweight client list — used for board/task client tags and the
// North Star numbers. Full client management arrives in Phase 3.
export function useClients() {
  useRealtime("clients", [["clients"]]);

  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });
}
