"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";

// Surfaces the real error on screen (message + digest) instead of the bare
// "a client-side exception has occurred" page, so issues are diagnosable
// without opening DevTools.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Also log to the console for the full stack.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto mt-10 max-w-lg">
      <div className="border-l-2 border-nomad-green bg-card p-6">
        <p className="label-mono mb-2">Something broke</p>
        <h1 className="text-2xl">This screen hit an error.</h1>
        <p className="mt-3 break-words font-mono text-xs leading-relaxed text-hierarchy-secondary">
          {error?.message || "Unknown error."}
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[10px] text-hierarchy-muted">
            digest: {error.digest}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-nomad-green px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-nomad-cream transition-all hover:bg-nomad-green-bright"
          >
            <RotateCw size={13} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-nomad-muted-gray transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
