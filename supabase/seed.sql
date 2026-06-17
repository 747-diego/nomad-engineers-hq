-- ============================================================================
-- Nomad Engineers HQ — seed data (spec §13)
-- Idempotent: safe to run more than once. Run after 0001_init.sql.
-- Note: public.users rows are created automatically when each founder first
-- signs in (handle_new_user trigger), so they are not seeded here.
-- ============================================================================

-- Clients ---------------------------------------------------------------------
insert into public.clients (name, status, mrr, contract_start, primary_contact_name, primary_contact_email, primary_contact_phone, next_action, sort_order)
values
  ('Kaleidoscope Ventures', 'active', 12500, '2026-06-01', 'Bill Brady', 'bill@kaleidoscope.life', '617-290-7813', 'Phase 1 BUILD execution', 0),
  ('Kathleen Fillion', 'active', 310, null, 'Kathleen', null, null, 'Monthly maintenance', 1)
on conflict do nothing;

insert into public.clients (name, status, primary_contact_name, next_action, sort_order)
select 'Avance Professional Services', 'pipeline', 'Martha Puerta + Jovanny Ortiz', 'Send finalized proposal', 0
where not exists (select 1 from public.clients where name = 'Avance Professional Services');

-- Milestones (Kaleidoscope) ---------------------------------------------------
insert into public.milestones (client_id, title, target_date, status)
select c.id, 'Assessment Launch', '2026-09-01', 'on_track'
from public.clients c
where c.name = 'Kaleidoscope Ventures'
  and not exists (
    select 1 from public.milestones m
    where m.client_id = c.id and m.title = 'Assessment Launch'
  );

-- Annual Objectives 2026 ------------------------------------------------------
insert into public.annual_objectives (year, title, target_metric, target_value, status)
select * from (values
  (2026, 'Reach $15,000 MRR by end of year', 'MRR', '$15,000', 'in_progress'),
  (2026, 'Publish first GEO case study (Q2)', 'Case studies', '1', 'in_progress'),
  (2026, 'Launch Ferguson Library workshop series (Q1)', 'Workshop series', '1', 'in_progress'),
  (2026, 'First contractor hire (Q4)', 'Hires', '1', 'in_progress')
) as v(year, title, target_metric, target_value, status)
where not exists (
  select 1 from public.annual_objectives ao where ao.title = v.title
);

-- Studio Roadmap (Q3 2026) ----------------------------------------------------
insert into public.studio_roadmap_items (title, horizon, quarter, pillar, status)
select * from (values
  ('Build Higgsfield content production pipeline', 'this_quarter', 'Q3_2026', 'create', 'planned'),
  ('Publish first GEO case study', 'this_quarter', 'Q3_2026', 'discover', 'planned'),
  ('Stamford Chamber speaking slot', 'this_quarter', 'Q3_2026', 'brand', 'planned')
) as v(title, horizon, quarter, pillar, status)
where not exists (
  select 1 from public.studio_roadmap_items s where s.title = v.title
);
