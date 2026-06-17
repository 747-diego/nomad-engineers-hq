"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "./use-realtime";
import type { Milestone, MilestoneStatus } from "@/lib/types";

const supabase = createClient();

export function useMilestones(clientId: string) {
  useRealtime("milestones", [["milestones", clientId]]);

  return useQuery({
    queryKey: ["milestones", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("client_id", clientId)
        .order("target_date", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Milestone[];
    },
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>, clientId: string) {
  queryClient.invalidateQueries({ queryKey: ["milestones", clientId] });
  queryClient.invalidateQueries({ queryKey: ["clients"] }); // health depends on milestones
  queryClient.invalidateQueries({ queryKey: ["milestones", "next"] });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      client_id: string;
      title: string;
      target_date: string | null;
      status?: MilestoneStatus;
    }) => {
      const { error } = await supabase.from("milestones").insert({
        ...input,
        status: input.status ?? "on_track",
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => invalidate(queryClient, v.client_id),
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      clientId: string;
      patch: Partial<Milestone>;
    }) => {
      const finalPatch = { ...patch };
      if (patch.status === "complete" && !patch.completed_at) {
        finalPatch.completed_at = new Date().toISOString();
      }
      if (patch.status && patch.status !== "complete") {
        finalPatch.completed_at = null;
      }
      const { error } = await supabase
        .from("milestones")
        .update(finalPatch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => invalidate(queryClient, v.clientId),
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; clientId: string }) => {
      const { error } = await supabase.from("milestones").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => invalidate(queryClient, v.clientId),
  });
}
