import { cn } from "@/lib/utils";

// "nomad" in foreground + "engineers" always green, inline, always lowercase.
export function Wordmark({
  className,
  suffix,
}: {
  className?: string;
  /** Optional trailing label, e.g. "HQ". */
  suffix?: string;
}) {
  return (
    <span className={cn("wordmark inline-flex items-baseline gap-[0.15em]", className)}>
      <span>nomad</span>
      <span className="text-nomad-green">engineers</span>
      {suffix ? (
        <span className="text-hierarchy-muted ml-1 font-mono text-[0.5em] font-medium uppercase tracking-[0.2em]">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
