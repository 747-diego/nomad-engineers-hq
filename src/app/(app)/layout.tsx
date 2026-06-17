import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isWhitelisted } from "@/lib/auth/whitelist";
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

  return (
    <AppShell userId={user.id} email={user.email ?? ""}>
      {children}
    </AppShell>
  );
}
