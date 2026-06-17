// The eight pillars (spec §9). Order is the canonical Kanban column order (§5.5).
export const PILLARS = [
  "build",
  "create",
  "automate",
  "discover",
  "admin",
  "finance",
  "brand",
  "hiring",
] as const;

export type Pillar = (typeof PILLARS)[number];

type PillarMeta = {
  label: string;
  group: "service" | "internal";
  description: string;
  /** Tag background color (spec §2). */
  color: string;
  /** Text color that reads on top of `color`. */
  textColor: string;
};

export const PILLAR_META: Record<Pillar, PillarMeta> = {
  build: {
    label: "Build",
    group: "service",
    description: "Websites, portals, apps, brand kits",
    color: "#27AE60",
    textColor: "#F5F0E8",
  },
  create: {
    label: "Create",
    group: "service",
    description: "Content production, video, social, campaigns",
    color: "#2ECC71",
    textColor: "#141414",
  },
  automate: {
    label: "Automate",
    group: "service",
    description: "Lead capture, automation, dashboards, chatbots",
    color: "#1E6B3C",
    textColor: "#F5F0E8",
  },
  discover: {
    label: "Discover",
    group: "service",
    description: "GEO, AEO, AI visibility, schema",
    color: "#8A7F72",
    textColor: "#F5F0E8",
  },
  admin: {
    label: "Admin",
    group: "internal",
    description: "Operations, scheduling, logistics",
    color: "#F5F0E8",
    textColor: "#141414",
  },
  finance: {
    label: "Finance",
    group: "internal",
    description: "Invoicing, banking, taxes, expenses",
    color: "#D4A857",
    textColor: "#141414",
  },
  brand: {
    label: "Brand",
    group: "internal",
    description: "Nomad's own positioning, content, social presence",
    color: "#141414",
    textColor: "#F5F0E8",
  },
  hiring: {
    label: "Hiring",
    group: "internal",
    description: "Contractors, future team members, partnerships",
    color: "#2B2B2B",
    textColor: "#F5F0E8",
  },
};

export function isPillar(value: string): value is Pillar {
  return (PILLARS as readonly string[]).includes(value);
}
