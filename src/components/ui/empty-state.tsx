// Brand-voice empty state — never generic (spec §10).
export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-12 text-center">
      <p className="font-mono text-sm text-foreground">{title}</p>
      {hint && (
        <p className="mt-1 max-w-xs font-mono text-xs text-hierarchy-secondary">
          {hint}
        </p>
      )}
    </div>
  );
}
