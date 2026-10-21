-- DRAFT: review against the live schema before applying in Supabase SQL Editor.
-- Designed for the existing Assignment 4 profiles/generations/caption_votes schema.
-- Run as database owner. All changes are transactional. No existing data is deleted.
begin;
alter table public.profiles add column if not exists is_superadmin boolean not null default false;
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.caption_votes enable row level security;

-- Ordinary users must NEVER be able to grant themselves administrator access.
revoke insert, update, delete on public.profiles from public, anon, authenticated;
revoke insert(is_superadmin), update(is_superadmin) on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update(first_name,last_name,avatar_path) on public.profiles to authenticated;

create schema if not exists private;
-- A narrow, non-exposed definer lookup avoids recursive profile RLS.
-- It accepts no user-controlled ID, checks the authenticated user, and returns only a boolean.
create or replace function private.is_superadmin()
returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null
   and coalesce(auth.jwt()->'app_metadata'->>'provider' = 'google', false)
   and exists(select 1 from public.profiles p where p.id=auth.uid() and p.is_superadmin is true);
$$;
revoke all on function private.is_superadmin() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.is_superadmin() to authenticated;

drop policy if exists "Superadmins read profiles" on public.profiles;
create policy "Superadmins read profiles" on public.profiles for select to authenticated
using ((select private.is_superadmin()));
drop policy if exists "Superadmins read media" on public.generations;
create policy "Superadmins read media" on public.generations for select to authenticated
using ((select private.is_superadmin()));
drop policy if exists "Superadmins edit media" on public.generations;
create policy "Superadmins edit media" on public.generations for update to authenticated
using ((select private.is_superadmin())) with check ((select private.is_superadmin()));
drop policy if exists "Superadmins delete media" on public.generations;
create policy "Superadmins delete media" on public.generations for delete to authenticated
using ((select private.is_superadmin()));
drop policy if exists "Superadmins read ballots" on public.caption_votes;
create policy "Superadmins read ballots" on public.caption_votes for select to authenticated
using ((select private.is_superadmin()));
-- Existing owner creation policy and quota trigger are retained.
-- Counts, IDs and ownership remain protected from client edits.
grant select,delete on public.generations to authenticated;
grant update(scene,prompt,style,model,status,caption) on public.generations to authenticated;
grant select on public.caption_votes to authenticated;
commit;

-- FIRST ADMIN BOOTSTRAP: after signing in with Google, identify your exact account:
-- select p.id,u.email,p.is_superadmin from public.profiles p
-- join auth.users u on u.id=p.id where u.email='YOUR_EXACT_GOOGLE_EMAIL';
-- Then run this separately with that verified UUID (not a name / broad email match):
-- update public.profiles set is_superadmin=true where id='VERIFIED_AUTH_USER_UUID';
-- Verify exactly one expected profile was changed.
-- Never add self-promotion to the app or expose a service-role key to the browser.
