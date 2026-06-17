import { cn } from "@/lib/utils";

// Ghost "n." mark — Prompt ExtraBold at low opacity, always behind content,
// always clipped to its container (spec / design system "MARK" version).
export function Watermark({
  className,
  size = "40vw",
}: {
  className?: string;
  size?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <span
        className="watermark-n absolute -bottom-[0.18em] left-[0.04em] leading-none"
        style={{ fontSize: size }}
      >
        n.
      </span>
    </div>
  );
}
