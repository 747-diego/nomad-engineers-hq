import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isWhitelisted, founderFor } from "@/lib/auth/whitelist";
import { AppShell } from "@/components/layout/app-shell";

// Guard for every authenticated screen. Middleware already enforces this, but
// we re-check here so Server Components can rely on a whitelisted user.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isWhitelisted(user.email)) {
    redirect("/login");
  }

  // Self-heal: ensure this founder has a public.users row. The DB trigger only
  // fires on first sign-in *after* the migration, so anyone who signed in
  // earlier has no row — which breaks the FK on standups, reviews, etc.
  const email = user.email!.toLowerCase();
  await supabase
    .from("users")
    .upsert(
      { id: user.id, email, name: founderFor(email)?.name ?? email },
      { onConflict: "email" },
    );

  return (
    <AppShell userId={user.id} email={email}>
      {children}
    </AppShell>
  );
}
