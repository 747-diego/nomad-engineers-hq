import { createClient } from "@/lib/supabase/server";
import { founderFor } from "@/lib/auth/whitelist";
import { Watermark } from "@/components/brand/watermark";

// Studio Pulse home. Phase 1 ships the branded shell + skeleton blocks;
// Phase 2 wires up the mandatory standup gate, North Star numbers, and feeds.
export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const founder = founderFor(user?.email);

  return (
    <div className="relative mx-auto max-w-5xl">
      <section className="relative overflow-hidden border border-border bg-card p-8 md:p-12">
        <Watermark size="22rem" />
        <div className="relative">
          <p className="label-mono mb-3">Studio Pulse</p>
          <h1 className="text-4xl md:text-5xl">
            {founder ? `Welcome, ${founder.first}.` : "Welcome."}
          </h1>
          <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-hierarchy-secondary">
            The foundation is live — brand system, auth, and data layer are in
            place. The daily standup gate and Studio Pulse blocks land in Phase 2.
          </p>
          <div className="mt-6 inline-flex">
            <span className="pill">we build. you grow.</span>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {["MRR", "Active Clients", "Pipeline", "Next Milestone"].map((label) => (
          <div key={label} className="border border-border bg-card p-5">
            <p className="label-mono">{label}</p>
            <p className="mt-3 font-mono text-2xl text-hierarchy-muted">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
