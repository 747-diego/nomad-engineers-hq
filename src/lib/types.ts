import type { Pillar } from "./pillars";

export type FounderKey = "diego" | "saralexi";
export type Assignee = FounderKey | "both";

export type ClientStatus = "active" | "pipeline" | "archived";
export type Health = "green" | "yellow" | "red";

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  mrr: number | null;
  contract_start: string | null;
  contract_end: string | null;
  health: Health | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_due: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type MilestoneStatus = "on_track" | "at_risk" | "overdue" | "complete";

export interface Milestone {
  id: string;
  client_id: string;
  title: string;
  target_date: string | null;
  status: MilestoneStatus;
  completed_at: string | null;
  created_at: string;
}

export type TaskStatus = "active" | "done" | "archived";
export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  pillar: Pillar;
  assignee: Assignee;
  client_id: string | null;
  priority: Priority;
  due_date: string | null;
  status: TaskStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DailyStandup {
  id: string;
  user_id: string;
  date: string;
  intention: string;
  created_at: string;
}

export interface Decision {
  id: string;
  date: string;
  decision: string;
  made_by: Assignee;
  rationale: string | null;
  created_at: string;
}

export interface Win {
  id: string;
  date: string;
  title: string;
  description: string | null;
  client_id: string | null;
  created_at: string;
}

export type CaptureStatus = "inbox" | "triaged" | "archived";

export interface QuickCapture {
  id: string;
  content: string;
  captured_by: FounderKey | null;
  status: CaptureStatus;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}
