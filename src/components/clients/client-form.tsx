"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useCreateClient, useUpdateClient } from "@/hooks/use-clients";
import type { Client, ClientStatus } from "@/lib/types";

const fieldLabel = "label-mono mb-1 block";
const selectClass =
  "h-10 w-full rounded-none border border-input bg-card px-2 font-mono text-sm text-foreground focus:border-nomad-green focus:outline-none";

type Draft = {
  name: string;
  status: ClientStatus;
  mrr: string;
  contract_start: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  next_action: string;
  next_action_due: string;
};

function toDraft(c?: Client): Draft {
  return {
    name: c?.name ?? "",
    status: c?.status ?? "pipeline",
    mrr: c?.mrr != null ? String(c.mrr) : "",
    contract_start: c?.contract_start ?? "",
    primary_contact_name: c?.primary_contact_name ?? "",
    primary_contact_email: c?.primary_contact_email ?? "",
    primary_contact_phone: c?.primary_contact_phone ?? "",
    next_action: c?.next_action ?? "",
    next_action_due: c?.next_action_due ?? "",
  };
}

// Create or edit a client (spec §5.3).
export function ClientForm({
  client,
  onClose,
}: {
  client?: Client;
  onClose: () => void;
}) {
  const create = useCreateClient();
  const update = useUpdateClient();
  const toast = useToast();
  const [d, setD] = useState<Draft>(toDraft(client));
  const editing = Boolean(client);

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    const patch = {
      name: d.name.trim(),
      status: d.status,
      mrr: d.mrr ? Number(d.mrr) : null,
      contract_start: d.contract_start || null,
      primary_contact_name: d.primary_contact_name || null,
      primary_contact_email: d.primary_contact_email || null,
      primary_contact_phone: d.primary_contact_phone || null,
      next_action: d.next_action || null,
      next_action_due: d.next_action_due || null,
    };
    if (editing && client) {
      await update.mutateAsync({ id: client.id, patch });
      toast("Client updated");
    } else {
      await create.mutateAsync(patch);
      toast("Client added");
    }
    onClose();
  }

  const pending = create.isPending || update.isPending;

  return (
    <Modal open onClose={onClose} title={editing ? "Edit Client" : "New Client"}>
      <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
        <div>
          <label className={fieldLabel}>Name</label>
          <Input value={d.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={fieldLabel}>Status</label>
            <select
              className={selectClass}
              value={d.status}
              onChange={(e) => set("status", e.target.value as ClientStatus)}
            >
              <option value="pipeline">Pipeline</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className={fieldLabel}>MRR ($/mo)</label>
            <Input
              type="number"
              value={d.mrr}
              onChange={(e) => set("mrr", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={fieldLabel}>Contract start</label>
          <Input
            type="date"
            value={d.contract_start}
            onChange={(e) => set("contract_start", e.target.value)}
          />
        </div>
        <div>
          <label className={fieldLabel}>Primary contact</label>
          <Input
            placeholder="Name"
            value={d.primary_contact_name}
            onChange={(e) => set("primary_contact_name", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Email"
            value={d.primary_contact_email}
            onChange={(e) => set("primary_contact_email", e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={d.primary_contact_phone}
            onChange={(e) => set("primary_contact_phone", e.target.value)}
          />
        </div>
        <div>
          <label className={fieldLabel}>Next action</label>
          <Textarea
            rows={2}
            value={d.next_action}
            onChange={(e) => set("next_action", e.target.value)}
          />
        </div>
        <div>
          <label className={fieldLabel}>Next action due</label>
          <Input
            type="date"
            value={d.next_action_due}
            onChange={(e) => set("next_action_due", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={save} disabled={pending || !d.name.trim()}>
          {pending ? "Saving…" : editing ? "Save" : "Add client"}
        </Button>
      </div>
    </Modal>
  );
}
