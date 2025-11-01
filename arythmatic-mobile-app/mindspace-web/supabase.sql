-- Supabase schema for LUMI
create table if not exists public.mood_events (
  id uuid primary key default gen_random_uuid(),
  inserted_at timestamptz not null default now(),
  label text not null,
  score double precision not null
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  inserted_at timestamptz not null default now(),
  message_id text,
  helpful boolean not null default false,
  emotion text
);

create table if not exists public.tracks (
  id text primary key,
  title text not null,
  mood text,
  file_url text
);

create table if not exists public.user_tracks (
  id uuid primary key default gen_random_uuid(),
  inserted_at timestamptz not null default now(),
  user_id text not null,
  track_id text not null references public.tracks(id),
  favourite boolean default true,
  play_count integer default 0
);

-- RLS policies (allow insert from anon)
alter table public.mood_events enable row level security;
create policy if not exists mood_events_insert on public.mood_events for insert to anon with check (true);

alter table public.feedback enable row level security;
create policy if not exists feedback_insert on public.feedback for insert to anon with check (true);

alter table public.user_tracks enable row level security;
create policy if not exists user_tracks_insert on public.user_tracks for insert to anon with check (true);
