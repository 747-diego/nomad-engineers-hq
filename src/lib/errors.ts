// Turns anything thrown by Supabase/PostgREST (plain objects with
// message/details/hint/code — not Error instances) into a readable string.
export function errorToMessage(error: unknown): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;

  const e = error as Record<string, unknown>;
  const parts = [e.message, e.details, e.hint, e.code]
    .filter((p): p is string | number => p !== null && p !== undefined && p !== "")
    .map(String);
  if (parts.length) return parts.join(" · ");

  try {
    return JSON.stringify(e);
  } catch {
    return "Unknown error";
  }
}
