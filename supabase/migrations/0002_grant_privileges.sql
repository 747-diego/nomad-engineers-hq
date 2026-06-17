-- ============================================================================
-- Nomad Engineers HQ — 0002: role privileges
-- Run this in the Supabase SQL editor if you ran 0001 before it included the
-- grants below. Fixes: "permission denied for table ... (42501)".
--
-- RLS already restricts WHICH rows each founder can touch; Postgres checks
-- table-level privileges for the connecting role first. Without these grants
-- every read/write is rejected before RLS is ever evaluated. Idempotent.
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Same privileges for any table/sequence created later in this schema.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
