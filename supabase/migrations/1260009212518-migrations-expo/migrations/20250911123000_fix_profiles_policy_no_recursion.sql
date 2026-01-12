-- Fix recursive RLS policy on public.profiles causing "infinite recursion detected"
-- Replace admin-check (which self-joined profiles) with a simple authenticated read policy.

-- Ensure RLS is enabled (no-op if already)
alter table if exists public.profiles enable row level security;

-- Drop the problematic policy that referenced the same table in its USING clause
drop policy if exists "profiles_read_own_or_admin" on public.profiles;

-- Allow authenticated users to read profiles (needed for mentions, invites suggestions, etc.)
-- This avoids self-referencing the profiles table inside its own policy.
create policy "profiles_read_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- Keep existing insert/update self policies intact (defined in earlier migrations)
