"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCapture } from "@/hooks/use-quick-capture";

// Bottom-right floating green circle, on every screen (spec §5.10).
// Keyboard shortcut: `c` (spec §10).
export function QuickCaptureButton() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const capture = useCapture();
  const toast = useToast();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (!typing && e.key === "c") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit() {
    if (!content.trim()) return;
    await capture.mutateAsync(content);
    setContent("");
    setOpen(false);
    toast("Captured to inbox");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick capture"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-nomad-green text-nomad-cream shadow-lg transition-all hover:bg-nomad-green-bright hover:brightness-105 md:bottom-8 md:right-8"
      >
        <Plus size={26} />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Quick Capture">
        <Textarea
          autoFocus
          rows={4}
          placeholder="Get it out of your head…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={capture.isPending || !content.trim()}>
            {capture.isPending ? "Capturing…" : "Capture"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
