-- Supabase/Postgres schema additions for user picks:
-- - Zamora (portero menos goleado)
-- - MVP (mejor jugador del torneo)
--
-- Run this in Supabase SQL Editor if your DB user does not have permission
-- to auto-create tables at runtime.

create table if not exists public.zamora_picks (
  email text primary key references public.users(email) on delete cascade,
  pick_json jsonb not null,
  updated_at text not null
);

-- Since you only access Supabase from the backend, lock down direct client access.
alter table public.zamora_picks enable row level security;
revoke all on table public.zamora_picks from anon, authenticated;

create table if not exists public.mvp_picks (
  email text primary key references public.users(email) on delete cascade,
  pick_json jsonb not null,
  updated_at text not null
);

alter table public.mvp_picks enable row level security;
revoke all on table public.mvp_picks from anon, authenticated;
