import { daysBetween, todayISO } from "./dates";
import type { Client, Health, Milestone } from "./types";

// Auto-calculated client health (spec §8). No manual override — this is
// derived on every read from milestone status + communication recency.
//
// Precedence: red > yellow > green.
export function computeHealth(
  client: Client,
  milestones: Milestone[],
  lastCommunicationDate: string | null,
): Health {
  const today = todayISO();
  const isActive = client.status === "active";

  const milestoneOverdue = milestones.some(
    (m) =>
      m.status === "overdue" ||
      (m.status !== "complete" &&
        m.target_date != null &&
        m.target_date < today),
  );
  const milestoneAtRisk = milestones.some((m) => m.status === "at_risk");

  // A freshly started client counts its start/creation as recent contact, so a
  // brand-new active client isn't instantly red for "no comms".
  const baseline =
    lastCommunicationDate ??
    client.contract_start ??
    client.created_at.slice(0, 10);
  const commDays = isActive ? daysBetween(baseline, today) : 0;

  const nextDue = client.next_action_due;
  const nextDueOverdue = Boolean(nextDue && nextDue < today);
  const nextDueSoon = Boolean(
    nextDue && nextDue >= today && daysBetween(today, nextDue) <= 3,
  );

  if (milestoneOverdue || (isActive && commDays >= 30) || nextDueOverdue) {
    return "red";
  }
  if (milestoneAtRisk || (isActive && commDays >= 15) || nextDueSoon) {
    return "yellow";
  }
  return "green";
}

export const HEALTH_COLOR: Record<Health, string> = {
  green: "#27AE60",
  yellow: "#D4A857",
  red: "#E06C5A",
};

export const HEALTH_LABEL: Record<Health, string> = {
  green: "Healthy",
  yellow: "Watch",
  red: "Needs attention",
};
