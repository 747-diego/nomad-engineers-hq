import { cn } from "@/lib/utils";

// Skeleton screen block — never a blank load (spec §10).
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-none bg-secondary/60", className)}
    />
  );
}
