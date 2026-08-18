-- Lunera: esquema anonimizado (Supabase Postgres + RLS)
-- El servidor NUNCA almacena síntomas en texto claro.

create extension if not exists "pgcrypto";

create table if not exists public.anonymous_profiles (
  id text primary key,
  supabase_uid uuid not null unique references auth.users (id) on delete cascade,
  email_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.encrypted_health_blobs (
  anonymous_id text primary key references public.anonymous_profiles (id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  version int not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.anonymous_profiles enable row level security;
alter table public.encrypted_health_blobs enable row level security;

create policy "Users manage own anonymous profile"
  on public.anonymous_profiles
  for all
  using (auth.uid() = supabase_uid)
  with check (auth.uid() = supabase_uid);

create policy "Users manage own encrypted blob"
  on public.encrypted_health_blobs
  for all
  using (
    anonymous_id in (
      select id from public.anonymous_profiles where supabase_uid = auth.uid()
    )
  )
  with check (
    anonymous_id in (
      select id from public.anonymous_profiles where supabase_uid = auth.uid()
    )
  );

create index if not exists idx_anonymous_profiles_uid on public.anonymous_profiles (supabase_uid);
