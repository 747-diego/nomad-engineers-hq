import type { SupabaseClient } from "@supabase/supabase-js";

type Supa = SupabaseClient;

// Ensures the current founder has a public.users row before writing anything
// that references it (daily_standups, weekly_reviews, activity_log all FK to
// users.id). Safe to call repeatedly. Best-effort: never throws.
export async function ensureUserRow(
  supabase: Supa,
  user: { id: string; email: string; name: string },
) {
  try {
    await supabase
      .from("users")
      .upsert(
        { id: user.id, email: user.email, name: user.name },
        { onConflict: "email" },
      );
  } catch {
    /* best-effort */
  }
}

// Activity logging is secondary — a failure here must never break the primary
// action, so swallow any error.
export async function logActivity(
  supabase: Supa,
  entry: {
    user_id: string;
    action: string;
    entity_type?: string;
    entity_id?: string | null;
  },
) {
  try {
    await supabase.from("activity_log").insert(entry);
  } catch {
    /* best-effort */
  }
}
