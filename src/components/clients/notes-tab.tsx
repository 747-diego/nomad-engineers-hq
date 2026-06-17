"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useUpdateClient } from "@/hooks/use-clients";

// Notes double as the place to drop Drive links etc. (no file uploads in v1, §14).
export function NotesTab({ clientId, notes }: { clientId: string; notes: string | null }) {
  const [value, setValue] = useState(notes ?? "");
  const update = useUpdateClient();
  const toast = useToast();
  const dirty = value !== (notes ?? "");

  async function save() {
    await update.mutateAsync({ id: clientId, patch: { notes: value } });
    toast("Notes saved");
  }

  return (
    <div className="space-y-3">
      <Textarea
        rows={10}
        placeholder="Context, links to Drive, anything worth remembering…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={save} disabled={!dirty || update.isPending}>
          {update.isPending ? "Saving…" : "Save notes"}
        </Button>
      </div>
    </div>
  );
}
