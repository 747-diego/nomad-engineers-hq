"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NewTaskModal } from "@/components/board/new-task-modal";

// Global shortcuts (spec §10). `c` (quick capture) lives on the capture button.
// Here: `n` new task, `/` focus search, `g h` go home (+ g b/c/r/w chords).
export function KeyboardShortcuts() {
  const router = useRouter();
  const [newTask, setNewTask] = useState(false);
  const pendingG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      // `g` chord for navigation
      if (pendingG.current) {
        const routes: Record<string, string> = {
          h: "/",
          b: "/board",
          c: "/clients",
          r: "/roadmap",
          w: "/wins",
        };
        if (routes[e.key]) {
          e.preventDefault();
          router.push(routes[e.key]);
        }
        pendingG.current = false;
        if (gTimer.current) clearTimeout(gTimer.current);
        return;
      }

      if (e.key === "g") {
        pendingG.current = true;
        gTimer.current = setTimeout(() => (pendingG.current = false), 800);
        return;
      }

      if (e.key === "n") {
        e.preventDefault();
        setNewTask(true);
      } else if (e.key === "/") {
        const search = document.querySelector<HTMLInputElement>(
          'input[data-shortcut="search"]',
        );
        if (search) {
          e.preventDefault();
          search.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return <NewTaskModal open={newTask} onClose={() => setNewTask(false)} />;
}
