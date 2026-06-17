// The only two people who get in. Everyone else is rejected at login (spec §3).
export const WHITELISTED_EMAILS = [
  "diego@nomadengineers.io",
  "saralexi@nomadengineers.io",
] as const;

export type WhitelistedEmail = (typeof WHITELISTED_EMAILS)[number];

export function isWhitelisted(email: string | null | undefined): boolean {
  if (!email) return false;
  return WHITELISTED_EMAILS.includes(
    email.trim().toLowerCase() as WhitelistedEmail,
  );
}

// Founder display data, keyed by email.
export const FOUNDERS: Record<string, { name: string; first: string; key: "diego" | "saralexi" }> = {
  "diego@nomadengineers.io": { name: "Diego Tardio", first: "Diego", key: "diego" },
  "saralexi@nomadengineers.io": { name: "Saralexi Chacon", first: "Saralexi", key: "saralexi" },
};

export function founderFor(email: string | null | undefined) {
  if (!email) return null;
  return FOUNDERS[email.trim().toLowerCase()] ?? null;
}
