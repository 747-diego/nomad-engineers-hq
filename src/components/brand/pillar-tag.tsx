import { PILLAR_META, type Pillar } from "@/lib/pillars";

// Pillar-colored tag. Cards never round — these stay at 4px like a pill.
export function PillarTag({ pillar, className }: { pillar: Pillar; className?: string }) {
  const meta = PILLAR_META[pillar];
  // Near-black pills need a light edge on dark; near-cream pills need a dark
  // edge on cream — keeps every tag legible in both themes.
  const border =
    meta.color === "#141414"
      ? "1px solid rgba(245,240,232,0.18)"
      : meta.color === "#F5F0E8"
        ? "1px solid rgba(20,20,20,0.18)"
        : undefined;
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: meta.color,
        color: meta.textColor,
        borderRadius: 4,
        padding: "2px 8px",
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        border,
      }}
    >
      {meta.label}
    </span>
  );
}
