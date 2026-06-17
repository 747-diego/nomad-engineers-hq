import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";

export default function AuthCodeError() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-6">
      <div className="green-top-bar" />
      <div className="w-full max-w-sm text-center">
        <div className="mb-8 text-3xl">
          <Wordmark />
        </div>
        <p className="font-mono text-sm text-foreground">
          That link didn&apos;t work.
        </p>
        <p className="mt-2 font-mono text-xs text-hierarchy-secondary">
          Magic links expire and can only be used once. Request a fresh one.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center bg-nomad-green px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-nomad-cream transition-all hover:bg-nomad-green-bright"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
