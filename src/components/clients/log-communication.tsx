"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useLogCommunication, type Communication } from "@/hooks/use-communications";

const CHANNELS: NonNullable<Communication["channel"]>[] = [
  "email",
  "call",
  "text",
  "meeting",
];

export function LogCommunication({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [channel, setChannel] =
    useState<NonNullable<Communication["channel"]>>("call");
  const [summary, setSummary] = useState("");
  const log = useLogCommunication();
  const toast = useToast();

  async function submit() {
    if (!summary.trim()) return;
    await log.mutateAsync({ client_id: clientId, channel, summary: summary.trim() });
    setSummary("");
    setOpen(false);
    toast("Communication logged");
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Log communication
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Log Communication">
        <div className="space-y-3">
          <div className="flex gap-2">
            {CHANNELS.map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={
                  "flex-1 border px-2 py-2 font-mono text-[10px] uppercase tracking-[0.1em] transition-colors " +
                  (channel === c
                    ? "border-nomad-green bg-nomad-green text-nomad-cream"
                    : "border-border text-foreground hover:border-nomad-green")
                }
              >
                {c}
              </button>
            ))}
          </div>
          <Textarea
            autoFocus
            rows={3}
            placeholder="What was discussed?"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={log.isPending || !summary.trim()}>
              {log.isPending ? "Logging…" : "Log it"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
