-- ============================================================
-- FOUNDR - Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  age         int,
  gender      text check (gender in ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  categories  text[],
  bio_raw     text,
  bio_summary text,
  avatar_url  text,
  is_onboarded boolean default false,
  created_at  timestamptz default now()
);

-- Auto-create profile on user sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- IDEAS TABLE
-- ============================================================
create table public.ideas (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  title          text not null,
  description    text not null,
  needed_skills  text[],
  is_active      boolean default true,
  created_at     timestamptz default now()
);

-- Function to count active ideas per user
create or replace function public.count_active_ideas(p_owner_id uuid)
returns integer
language sql security definer
as $$
  select count(*)::integer
  from public.ideas
  where owner_id = p_owner_id and is_active = true;
$$;

-- Trigger to enforce 2-idea limit
create or replace function public.check_idea_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.ideas where owner_id = new.owner_id and is_active = true) >= 2 then
    raise exception 'Você já atingiu o limite de 2 ideias ativas. Desative uma ideia para criar outra.';
  end if;
  return new;
end;
$$;

create or replace trigger enforce_idea_limit
  before insert on public.ideas
  for each row execute procedure public.check_idea_limit();

-- ============================================================
-- APPLICATIONS TABLE
-- ============================================================
create type application_status as enum ('pending', 'accepted', 'rejected');

create table public.applications (
  id           uuid primary key default uuid_generate_v4(),
  idea_id      uuid not null references public.ideas(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message      text not null,
  status       application_status default 'pending',
  created_at   timestamptz default now(),
  unique (idea_id, applicant_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
create table public.messages (
  id         uuid primary key default uuid_generate_v4(),
  idea_id    uuid not null references public.ideas(id) on delete cascade,
  sender_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROFILES
alter table public.profiles enable row level security;

create policy "Profiles are viewable by all authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- IDEAS
alter table public.ideas enable row level security;

create policy "Ideas are viewable by all authenticated users"
  on public.ideas for select to authenticated using (true);

create policy "Users can create ideas"
  on public.ideas for insert to authenticated with check (auth.uid() = owner_id);

create policy "Users can update their own ideas"
  on public.ideas for update to authenticated using (auth.uid() = owner_id);

create policy "Users can delete their own ideas"
  on public.ideas for delete to authenticated using (auth.uid() = owner_id);

-- APPLICATIONS
alter table public.applications enable row level security;

create policy "Idea owners can view applications for their ideas"
  on public.applications for select to authenticated
  using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.ideas where id = idea_id and owner_id = auth.uid()
    )
  );

create policy "Authenticated users can apply to ideas"
  on public.applications for insert to authenticated
  with check (auth.uid() = applicant_id);

create policy "Idea owners can update application status"
  on public.applications for update to authenticated
  using (
    exists (
      select 1 from public.ideas where id = idea_id and owner_id = auth.uid()
    )
  );

-- MESSAGES
alter table public.messages enable row level security;

create policy "Accepted members can view messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.ideas where id = idea_id and owner_id = auth.uid()
    )
    or exists (
      select 1 from public.applications
      where idea_id = messages.idea_id
        and applicant_id = auth.uid()
        and status = 'accepted'
    )
  );

create policy "Accepted members can send messages"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and (
      exists (
        select 1 from public.ideas where id = idea_id and owner_id = auth.uid()
      )
      or exists (
        select 1 from public.applications
        where idea_id = messages.idea_id
          and applicant_id = auth.uid()
          and status = 'accepted'
      )
    )
  );

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for messages table
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.applications;
