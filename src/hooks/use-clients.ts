"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { useRealtime } from "./use-realtime";
import { computeHealth } from "@/lib/health";
import type { Client, Health, Milestone } from "@/lib/types";

const supabase = createClient();

export type ClientWithHealth = Client & { computedHealth: Health };

// Clients enriched with auto-calculated health (spec §8). Pulls milestones and
// the latest communication per client in two extra queries, then derives.
export function useClients() {
  useRealtime("clients", [["clients"]]);
  useRealtime("milestones", [["clients"]]);

  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const [clientsRes, milestonesRes, commsRes] = await Promise.all([
        supabase.from("clients").select("*").order("sort_order"),
        supabase.from("milestones").select("*"),
        supabase
          .from("client_communications")
          .select("client_id,date")
          .order("date", { ascending: false }),
      ]);
      if (clientsRes.error) throw clientsRes.error;

      const milestonesByClient = new Map<string, Milestone[]>();
      (milestonesRes.data ?? []).forEach((m: Milestone) => {
        const arr = milestonesByClient.get(m.client_id) ?? [];
        arr.push(m);
        milestonesByClient.set(m.client_id, arr);
      });

      const lastCommByClient = new Map<string, string>();
      (commsRes.data ?? []).forEach((c: { client_id: string; date: string }) => {
        if (!lastCommByClient.has(c.client_id)) {
          lastCommByClient.set(c.client_id, c.date);
        }
      });

      return (clientsRes.data ?? []).map((c: Client) => ({
        ...c,
        computedHealth: computeHealth(
          c,
          milestonesByClient.get(c.id) ?? [],
          lastCommByClient.get(c.id) ?? null,
        ),
      })) as ClientWithHealth[];
    },
  });
}

export function useClient(id: string) {
  useRealtime("clients", [["client", id]]);

  return useQuery({
    queryKey: ["client", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Client;
    },
  });
}

export function useCreateClient() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Client> & { name: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({ status: "pipeline", ...input })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: `added client "${input.name}"`,
        entity_type: "client",
        entity_id: data.id,
      });
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Client> }) => {
      const { error } = await supabase.from("clients").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
    },
  });
}

export function useConvertToActive() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: Client) => {
      const { error } = await supabase
        .from("clients")
        .update({ status: "active" })
        .eq("id", client.id);
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: `converted "${client.name}" to active`,
        entity_type: "client",
        entity_id: client.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
