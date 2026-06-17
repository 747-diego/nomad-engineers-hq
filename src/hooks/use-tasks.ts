"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { useRealtime } from "./use-realtime";
import type { Pillar } from "@/lib/pillars";
import type { Assignee, Priority, Task } from "@/lib/types";

const supabase = createClient();

export type NewTask = {
  title: string;
  pillar: Pillar;
  description?: string | null;
  assignee?: Assignee;
  client_id?: string | null;
  priority?: Priority;
  due_date?: string | null;
};

export function useTasks() {
  useRealtime("tasks", [["tasks"]]);

  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .neq("status", "archived")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });
}

export function useCreateTask() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: NewTask) => {
      const { error } = await supabase.from("tasks").insert({
        ...task,
        assignee: task.assignee ?? "both",
        priority: task.priority ?? "medium",
        status: "active",
      });
      if (error) throw error;
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: `created task "${task.title}"`,
        entity_type: "task",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Task> }) => {
      const { error } = await supabase.from("tasks").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      // Optimistic: keeps drag-drop snappy.
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]);
      if (prev) {
        queryClient.setQueryData<Task[]>(
          ["tasks"],
          prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
