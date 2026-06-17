# Deploying nomad engineers HQ

Target: **hq.nomadengineers.io** on Vercel, backed by the existing Supabase
project. These steps require your Vercel + DNS + Supabase accounts, so they're
done from the dashboards (not from this repo).

---

## 1. Provision the database (once)

In the [Supabase SQL editor](https://supabase.com/dashboard/project/poujckmruflptbuculbo/sql),
run in order:

1. `supabase/migrations/0001_init.sql` — tables, RLS (whitelist-only), realtime,
   triggers, and the `auth.users → public.users` mirror.
2. `supabase/seed.sql` — clients, milestones, 2026 objectives, Q3 roadmap
   (idempotent — safe to re-run).

Realtime is enabled inside the migration (tables are added to the
`supabase_realtime` publication). No extra dashboard toggle needed.

## 2. Configure Supabase Auth

**Authentication → URL Configuration:**

- **Site URL:** `https://hq.nomadengineers.io`
- **Redirect URLs** (add all):
  - `https://hq.nomadengineers.io/auth/callback`
  - `https://*-nomad-engineers-hq.vercel.app/auth/callback` (preview deploys)
  - `http://localhost:3000/auth/callback` (local)

Email magic links are on by default. Only `diego@` and `saralexi@nomadengineers.io`
can actually get in — the app rejects everyone else at the form, the callback,
and in middleware.

## 3. Deploy to Vercel

1. **New Project → Import** `747-diego/nomad-engineers-hq`.
2. Framework preset: **Next.js** (auto-detected). Build command and output are
   default — no overrides.
3. **Environment Variables** (Production + Preview):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://poujckmruflptbuculbo.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(the anon key from `.env.local`)* |
   | `NEXT_PUBLIC_SITE_URL` | `https://hq.nomadengineers.io` |

4. Deploy. (The branch `claude/sharp-pasteur-ayjgk5` holds the full build —
   merge it to `main` first, or point the Vercel production branch at it.)

## 4. Custom domain

1. Vercel project → **Settings → Domains → Add** `hq.nomadengineers.io`.
2. At your DNS provider, add the record Vercel shows — typically a **CNAME**
   `hq` → `cname.vercel-dns.com`.
3. Wait for the cert to issue, then load `https://hq.nomadengineers.io` and sign
   in with a founder email.

## 5. Smoke test

- Magic link arrives and signs you in; a non-whitelisted email is rejected.
- Home blocks until you log today's intention, then unlocks.
- Open the app in two browsers as each founder — a win/task/standup in one shows
  up live in the other (realtime).
- North Star MRR matches the active clients' MRR.

---

## Environment reference

```
NEXT_PUBLIC_SUPABASE_URL       Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  Supabase anon (public) key
NEXT_PUBLIC_SITE_URL           Canonical site origin (prod: hq.nomadengineers.io)
```

The anon key is safe in the browser — every table is guarded by RLS that only
admits the two whitelisted founders.
