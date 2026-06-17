"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-provider";
import { useRealtime } from "./use-realtime";
import { todayISO } from "@/lib/dates";
import type { QuickCapture } from "@/lib/types";

const supabase = createClient();

export function useInbox() {
  useRealtime("quick_capture", [["quick_capture"]]);

  return useQuery({
    queryKey: ["quick_capture", "inbox"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quick_capture")
        .select("*")
        .eq("status", "inbox")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as QuickCapture[];
    },
  });
}

export function useCapture() {
  const user = useUser();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from("quick_capture").insert({
        content: content.trim(),
        captured_by: user.key,
        status: "inbox",
      });
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["quick_capture"] }),
  });
}

// Triage: convert an inbox item into a task / decision / win, or archive it.
export function useTriage() {
  const user = useUser();
  const queryClient = useQueryClient();

  function markTriaged(id: string) {
    return supabase
      .from("quick_capture")
      .update({ status: "triaged" })
      .eq("id", id);
  }

  return useMutation({
    mutationFn: async ({
      item,
      action,
    }: {
      item: QuickCapture;
      action: "task" | "decision" | "win" | "archive";
    }) => {
      if (action === "archive") {
        const { error } = await supabase
          .from("quick_capture")
          .update({ status: "archived" })
          .eq("id", item.id);
        if (error) throw error;
        return;
      }

      if (action === "task") {
        const { error } = await supabase.from("tasks").insert({
          title: item.content.slice(0, 120),
          description: item.content.length > 120 ? item.content : null,
          pillar: "admin",
          assignee: "both",
          priority: "medium",
          status: "active",
        });
        if (error) throw error;
      } else if (action === "decision") {
        const { error } = await supabase.from("decisions").insert({
          date: todayISO(),
          decision: item.content,
          made_by: user.key,
        });
        if (error) throw error;
      } else if (action === "win") {
        const { error } = await supabase.from("wins").insert({
          title: item.content.slice(0, 120),
          description: item.content.length > 120 ? item.content : null,
          date: todayISO(),
        });
        if (error) throw error;
      }
      await markTriaged(item.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quick_capture"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["wins"] });
      queryClient.invalidateQueries({ queryKey: ["decisions"] });
    },
  });
}
