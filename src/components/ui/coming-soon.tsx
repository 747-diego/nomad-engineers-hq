import { Watermark } from "@/components/brand/watermark";

// Placeholder for screens shipping in a later phase. Branded, never generic.
export function ComingSoon({
  title,
  phase,
  blurb,
}: {
  title: string;
  phase: string;
  blurb: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden border border-border bg-card p-10">
        <Watermark size="18rem" />
        <div className="relative">
          <p className="label-mono mb-2">{phase}</p>
          <h1 className="text-3xl">{title}</h1>
          <p className="mt-3 max-w-md font-mono text-sm leading-relaxed text-hierarchy-secondary">
            {blurb}
          </p>
        </div>
      </div>
    </div>
  );
}
