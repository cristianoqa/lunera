-- Force RLS so table owners cannot bypass policies (defense in depth).
alter table public.anonymous_profiles force row level security;
alter table public.encrypted_health_blobs force row level security;
