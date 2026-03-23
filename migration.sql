-- ============================================================
-- FOUNDR - Migration Script
-- Run in your Supabase SQL Editor AFTER the main schema.sql
-- ============================================================

-- ============================================================
-- MIGRATION 1: Stripe Plan Columns on profiles
-- ============================================================
alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists plan_type text default 'free'
    check (plan_type in ('free', 'basic', 'premium')),
  add column if not exists plan_expires_at timestamptz;

-- Index for webhook lookups by stripe_customer_id
create index if not exists idx_profiles_stripe_customer_id
  on public.profiles(stripe_customer_id);

-- ============================================================
-- MIGRATION 2: Consent Records for LGPD Compliance
-- ============================================================
create table if not exists public.consent_records (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  terms_version text not null default '1.0',
  consented_at timestamptz not null default now(),
  ip_address   text,
  user_agent   text,
  created_at   timestamptz default now()
);

-- Index for user lookups
create index if not exists idx_consent_records_user_id
  on public.consent_records(user_id);

-- Row Level Security
alter table public.consent_records enable row level security;

create policy "Usuários podem registrar seu próprio consentimento"
  on public.consent_records for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Usuários podem visualizar seu próprio consentimento"
  on public.consent_records for select to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- MIGRATION 3: Update handle_new_user trigger
-- Ensures new email/password users also get a profile
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
