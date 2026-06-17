"use client";

import { useState } from "react";
import { StudioRoadmap } from "@/components/roadmap/studio-roadmap";
import { ClientRoadmaps } from "@/components/roadmap/client-roadmaps";
import { cn } from "@/lib/utils";

type View = "studio" | "client";

export default function RoadmapPage() {
  const [view, setView] = useState<View>("studio");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl">Roadmap</h1>
          <p className="label-mono mt-1">Where we&apos;re headed</p>
        </div>
        <div className="inline-flex border border-border">
          {(["studio", "client"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] transition-colors",
                view === v
                  ? "bg-nomad-green text-nomad-cream"
                  : "text-nomad-muted-gray hover:text-foreground",
              )}
            >
              {v === "studio" ? "Studio" : "Clients"}
            </button>
          ))}
        </div>
      </div>

      {view === "studio" ? <StudioRoadmap /> : <ClientRoadmaps />}
    </div>
  );
}
