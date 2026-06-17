import type { ClientStatus } from "@/lib/types";

const STYLE: Record<ClientStatus, { bg: string; fg: string; border?: string }> = {
  active: { bg: "#27AE60", fg: "#F5F0E8" },
  pipeline: { bg: "transparent", fg: "#D4A857", border: "#D4A857" },
  archived: { bg: "transparent", fg: "#8A7F72", border: "#8A7F72" },
};

export function StatusPill({ status }: { status: ClientStatus }) {
  const s = STYLE[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: s.bg,
        color: s.fg,
        border: s.border ? `1px solid ${s.border}` : undefined,
        borderRadius: 4,
        padding: "2px 8px",
        fontFamily: "var(--font-dm-mono), monospace",
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}
