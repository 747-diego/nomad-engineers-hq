"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "./use-realtime";
import type {
  AnnualObjective,
  Horizon,
  RoadmapStatus,
  StudioRoadmapItem,
} from "@/lib/roadmap";
import type { Pillar } from "@/lib/pillars";
import type { ClientRoadmapItem } from "./use-client-roadmap";

const supabase = createClient();

/* ----------------------------- Studio roadmap ---------------------------- */

export function useStudioRoadmap() {
  useRealtime("studio_roadmap_items", [["studio_roadmap"]]);
  return useQuery({
    queryKey: ["studio_roadmap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_roadmap_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as StudioRoadmapItem[];
    },
  });
}

export function useCreateStudioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      horizon: Horizon;
      quarter?: string | null;
      pillar?: Pillar | null;
      objective_id?: string | null;
    }) => {
      const { error } = await supabase.from("studio_roadmap_items").insert({
        ...input,
        status: "planned",
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["studio_roadmap"] }),
  });
}

export function useUpdateStudioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<StudioRoadmapItem>;
    }) => {
      const { error } = await supabase
        .from("studio_roadmap_items")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["studio_roadmap"] });
      const prev = queryClient.getQueryData<StudioRoadmapItem[]>(["studio_roadmap"]);
      if (prev) {
        queryClient.setQueryData<StudioRoadmapItem[]>(
          ["studio_roadmap"],
          prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["studio_roadmap"], ctx.prev);
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["studio_roadmap"] }),
  });
}

export function useDeleteStudioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("studio_roadmap_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["studio_roadmap"] }),
  });
}

/* --------------------------- Annual objectives ---------------------------- */

export function useObjectives(year: number) {
  return useQuery({
    queryKey: ["objectives", year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annual_objectives")
        .select("*")
        .eq("year", year)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AnnualObjective[];
    },
  });
}

export function useCreateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      year: number;
      title: string;
      target_metric?: string | null;
      target_value?: string | null;
    }) => {
      const { error } = await supabase.from("annual_objectives").insert({
        ...input,
        status: "in_progress",
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      queryClient.invalidateQueries({ queryKey: ["objectives", v.year] }),
  });
}

export function useUpdateObjective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      year: number;
      patch: Partial<AnnualObjective>;
    }) => {
      const { error } = await supabase
        .from("annual_objectives")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) =>
      queryClient.invalidateQueries({ queryKey: ["objectives", v.year] }),
  });
}

/* --------------------------- Client roadmap CRUD -------------------------- */

export function useAllClientRoadmap() {
  return useQuery({
    queryKey: ["client_roadmap", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_roadmap_items")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ClientRoadmapItem[];
    },
  });
}

export function useCreateClientRoadmapItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      client_id: string;
      title: string;
      quarter?: string | null;
      pillar?: Pillar | null;
    }) => {
      const { error } = await supabase.from("client_roadmap_items").insert({
        ...input,
        status: "planned",
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["client_roadmap"] }),
  });
}

export function useUpdateClientRoadmapItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<ClientRoadmapItem>;
    }) => {
      const { error } = await supabase
        .from("client_roadmap_items")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["client_roadmap"] }),
  });
}

export type { RoadmapStatus };
