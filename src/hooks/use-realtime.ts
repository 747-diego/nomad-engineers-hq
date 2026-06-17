"use client";

import { useEffect, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// Subscribes to Postgres changes on a table and invalidates the given query
// keys so both founders see updates live (spec §1, §4 realtime).
//
// The browser client is a singleton that dedupes channels by topic, so two
// hooks watching the same table would collide ("cannot add postgres_changes
// callbacks after subscribe()"). A per-instance id keeps every channel unique.
export function useRealtime(table: string, invalidateKeys: string[][]) {
  const queryClient = useQueryClient();
  const instanceId = useId();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime:${table}:${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          invalidateKeys.forEach((key) =>
            queryClient.invalidateQueries({ queryKey: key }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, instanceId]);
}
