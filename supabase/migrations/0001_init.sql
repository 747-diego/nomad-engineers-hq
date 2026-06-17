-- ============================================================================
-- Nomad Engineers HQ — initial schema (spec §4)
-- Run in the Supabase SQL editor (or `supabase db push`).
-- Tables, RLS (whitelisted founders only), realtime, and updated_at triggers.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers
-- ----------------------------------------------------------------------------

-- True only for the two whitelisted founders (spec §3). Used by every policy.
create or replace function public.is_whitelisted()
returns boolean
language sql
stable
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') in (
      'diego@nomadengineers.io',
      'saralexi@nomadengineers.io'
    ),
    false
  );
$$;

-- Generic updated_at stamper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'pipeline' check (status in ('active','pipeline','archived')),
  mrr numeric,
  contract_start date,
  contract_end date,
  health text default 'green' check (health in ('green','yellow','red')),
  primary_contact_name text,
  primary_contact_email text,
  primary_contact_phone text,
  notes text,
  next_action text,
  next_action_due date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  target_date date,
  status text not null default 'on_track' check (status in ('on_track','at_risk','overdue','complete')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  pillar text not null check (pillar in ('build','create','automate','discover','admin','finance','brand','hiring')),
  assignee text default 'both' check (assignee in ('diego','saralexi','both')),
  client_id uuid references public.clients(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  due_date date,
  status text not null default 'active' check (status in ('active','done','archived')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_standups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  intention text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  decision text not null,
  made_by text default 'both' check (made_by in ('diego','saralexi','both')),
  rationale text,
  created_at timestamptz not null default now()
);

create table if not exists public.wins (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  title text not null,
  description text,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.quick_capture (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  captured_by text check (captured_by in ('diego','saralexi')),
  status text not null default 'inbox' check (status in ('inbox','triaged','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.client_roadmap_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text,
  quarter text,
  pillar text check (pillar in ('build','create','automate','discover','admin','finance','brand','hiring')),
  status text not null default 'planned' check (status in ('planned','in_progress','complete','dropped')),
  target_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.annual_objectives (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  title text not null,
  description text,
  target_metric text,
  target_value text,
  status text not null default 'in_progress' check (status in ('in_progress','complete','dropped')),
  created_at timestamptz not null default now()
);

create table if not exists public.studio_roadmap_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  horizon text check (horizon in ('this_quarter','next_quarter','this_year','next_year','long_term')),
  quarter text,
  pillar text check (pillar in ('build','create','automate','discover','admin','finance','brand','hiring')),
  status text not null default 'planned' check (status in ('planned','in_progress','complete','dropped')),
  target_date date,
  objective_id uuid references public.annual_objectives(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.client_communications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null default current_date,
  channel text check (channel in ('email','call','text','meeting')),
  summary text,
  logged_by text check (logged_by in ('diego','saralexi')),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  user_id uuid not null references public.users(id) on delete cascade,
  accomplishments text,
  next_week_focus text,
  created_at timestamptz not null default now(),
  unique (week_start, user_id)
);

-- ----------------------------------------------------------------------------
-- updated_at triggers
-- ----------------------------------------------------------------------------

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- New auth users → public.users (whitelisted only)
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) in ('diego@nomadengineers.io','saralexi@nomadengineers.io') then
    insert into public.users (id, email, name)
    values (
      new.id,
      lower(new.email),
      case lower(new.email)
        when 'diego@nomadengineers.io' then 'Diego Tardio'
        when 'saralexi@nomadengineers.io' then 'Saralexi Chacon'
      end
    )
    on conflict (email) do update set id = excluded.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security — every table: full access for whitelisted founders only
-- ----------------------------------------------------------------------------

do $$
declare
  t text;
  tables text[] := array[
    'users','clients','milestones','tasks','daily_standups','decisions',
    'wins','quick_capture','client_roadmap_items','annual_objectives',
    'studio_roadmap_items','client_communications','activity_log','weekly_reviews'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists founders_all on public.%I;', t);
    execute format(
      'create policy founders_all on public.%I for all to authenticated using (public.is_whitelisted()) with check (public.is_whitelisted());',
      t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Realtime (spec §4)
-- ----------------------------------------------------------------------------

do $$
declare
  t text;
  rt_tables text[] := array[
    'tasks','clients','milestones','daily_standups','quick_capture','wins',
    'activity_log','decisions'
  ];
begin
  foreach t in array rt_tables loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception when duplicate_object then
      null; -- already in the publication
    end;
  end loop;
end $$;
