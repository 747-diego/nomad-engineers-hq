import type { Pillar } from "./pillars";

export type RoadmapStatus = "planned" | "in_progress" | "complete" | "dropped";
export type Horizon =
  | "this_quarter"
  | "next_quarter"
  | "this_year"
  | "next_year"
  | "long_term";

export interface StudioRoadmapItem {
  id: string;
  title: string;
  description: string | null;
  horizon: Horizon | null;
  quarter: string | null;
  pillar: Pillar | null;
  status: RoadmapStatus;
  target_date: string | null;
  objective_id: string | null;
  created_at: string;
}

export interface AnnualObjective {
  id: string;
  year: number;
  title: string;
  description: string | null;
  target_metric: string | null;
  target_value: string | null;
  status: "in_progress" | "complete" | "dropped";
  created_at: string;
}

export const ROADMAP_STATUS_LABEL: Record<RoadmapStatus, string> = {
  planned: "Planned",
  in_progress: "In progress",
  complete: "Complete",
  dropped: "Dropped",
};

// The four quarter keys for a given year, e.g. "Q3_2026".
export function quartersForYear(year: number): string[] {
  return [1, 2, 3, 4].map((q) => `Q${q}_${year}`);
}

export function quarterLabel(key: string): string {
  const [q, year] = key.split("_");
  return `${q} ${year}`;
}
