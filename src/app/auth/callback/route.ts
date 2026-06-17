import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isWhitelisted } from "@/lib/auth/whitelist";

// Magic-link landing. Exchanges the code for a session, then enforces the
// whitelist one more time server-side before letting anyone in (spec §3).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      if (!isWhitelisted(data.user.email)) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=not_whitelisted`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
