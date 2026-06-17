# nomad engineers HQ

Internal operating system for Nomad Engineers — a daily OS for a two-founder
studio. Next.js 14 (App Router) · TypeScript · Tailwind · Supabase · Vercel.

> Build spec: `nomad-hq-spec-v2.1`. Design system: `nomadengineers.design v1.2`.
> The brand system is non-negotiable — see `tailwind.config.ts` + `globals.css`.

## Stack

- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** with brand tokens (Nomad Black `#141414`, Cream `#F5F0E8`, Green `#27AE60`)
- **Supabase** — Postgres, magic-link auth, realtime
- **shadcn/ui** — base components, fully restyled to the brand
- **TanStack Query** — data fetching + caching on top of Supabase
- **Framer Motion** — animations / page transitions
- **Lucide React** — icons
- Fonts: **Prompt** ExtraBold (headlines) + **DM Mono** (body/UI) via `next/font`

## Getting started

1. Install deps:
   ```bash
   npm install
   ```
2. Copy env and fill in your Supabase keys:
   ```bash
   cp .env.example .env.local
   ```
   `.env.local` is preconfigured for the HQ Supabase project.
3. Provision the database — open the [Supabase SQL editor](https://supabase.com/dashboard/project/poujckmruflptbuculbo/sql)
   and run, in order:
   - `supabase/migrations/0001_init.sql` — tables, RLS, realtime, triggers
   - `supabase/seed.sql` — clients, milestones, objectives, roadmap (idempotent)
4. In Supabase **Authentication → URL Configuration**, add the redirect URL
   `http://localhost:3000/auth/callback` (and the production equivalent).
5. Run it:
   ```bash
   npm run dev
   ```

## Auth

Magic-link only, restricted to two whitelisted founders
(`diego@` / `saralexi@nomadengineers.io`). Enforcement happens in three places:
the login form, the auth callback, and `middleware.ts` (which also refreshes the
session and guards every route).

## Project structure

```
src/
  app/
    (app)/            authenticated screens (wrapped in AppShell)
      layout.tsx      auth guard + chrome
      page.tsx        Studio Pulse (home)
    login/            magic-link login
    auth/callback/    OTP code exchange + whitelist check
  components/
    brand/            Wordmark, Watermark
    layout/           Sidebar, TopBar, BottomNav, AppShell, nav config
    ui/               shadcn base components (brand-styled)
    providers.tsx     TanStack Query provider
  lib/
    auth/whitelist.ts whitelist + founder lookup
    pillars.ts        the 8 pillars + tag colors
    supabase/         browser / server / middleware clients
supabase/
  migrations/         schema
  seed.sql            seed data
```

## Build status

- ✅ **Phase 1 — Foundation:** scaffold, deps, Supabase clients, magic-link auth
  + whitelist, full schema (RLS + realtime), brand system, global layout
  (top bar, sidebar, bottom nav).
- ✅ **Phase 2 — Daily-use screens:** Studio Pulse home with the mandatory
  standup gate, Standup + history, pillar Kanban board (drag/filter/inline-add),
  Quick Capture + inbox triage. Realtime + toasts throughout.
- ✅ **Phase 3 — Client management:** clients list, detail with tabs
  (Overview / Milestones / Communications / Tasks / Roadmap / Notes),
  milestone management, communication logging, auto-calculated health (§8),
  and the pipeline view with drag-reorder + convert-to-active.
- ✅ **Phase 4 — Strategic layer:** Studio Roadmap (annual objectives, horizon
  rows, drag-between-quarter columns) + Client Roadmaps (per-client quarter
  board), Decisions Log (search + filter), and the Wins Wall.
- ⏳ Phase 5 — polish (weekly review, empty states, shortcuts, mobile gestures).
  Phase 6 — deploy.
