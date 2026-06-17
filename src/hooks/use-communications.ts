"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { todayISO } from "@/lib/dates";

const supabase = createClient();

export type Communication = {
  id: string;
  client_id: string;
  date: string;
  channel: "email" | "call" | "text" | "meeting" | null;
  summary: string | null;
  logged_by: "diego" | "saralexi" | null;
  created_at: string;
};

export function useCommunications(clientId: string) {
  return useQuery({
    queryKey: ["communications", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_communications")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Communication[];
    },
  });
}

export function useLogCommunication() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      client_id: string;
      channel: Communication["channel"];
      summary: string;
      date?: string;
    }) => {
      const { error } = await supabase.from("client_communications").insert({
        client_id: input.client_id,
        channel: input.channel,
        summary: input.summary,
        date: input.date ?? todayISO(),
        logged_by: user.key,
      });
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: `logged a ${input.channel ?? "note"} communication`,
        entity_type: "client_communication",
        entity_id: input.client_id,
      });
    },
    onSuccess: (_d, v) => {
      queryClient.invalidateQueries({ queryKey: ["communications", v.client_id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] }); // health depends on recency
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
