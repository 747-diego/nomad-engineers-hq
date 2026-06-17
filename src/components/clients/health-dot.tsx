import { HEALTH_COLOR, HEALTH_LABEL } from "@/lib/health";
import type { Health } from "@/lib/types";

export function HealthDot({ health, withLabel }: { health: Health; withLabel?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" title={HEALTH_LABEL[health]}>
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: HEALTH_COLOR[health], boxShadow: `0 0 8px ${HEALTH_COLOR[health]}66` }}
      />
      {withLabel && (
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-hierarchy-secondary">
          {HEALTH_LABEL[health]}
        </span>
      )}
    </span>
  );
}
