-- Create device_tokens table to store multiple device push tokens per user

create table if not exists public.device_tokens (
  id bigint primary key generated always as identity,
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  provider text, -- e.g. 'expo', 'fcm', 'apns'
  platform text, -- e.g. 'ios', 'android', 'web'
  meta jsonb default '{}'::jsonb,
  active boolean default true,
  last_seen timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.device_tokens enable row level security;

-- Allow users to read their own device tokens
drop policy if exists "select_own" on public.device_tokens;
create policy "select_own" on public.device_tokens
  for select using ( auth.uid() = user_id );

-- Allow service role to insert (server-side registrations/cleanup)
drop policy if exists "insert_by_service" on public.device_tokens;
create policy "insert_by_service" on public.device_tokens
  for insert with check ( auth.role() = 'service_role' );

-- Allow users to insert their own device tokens (client-side registration)
drop policy if exists "insert_own" on public.device_tokens;
create policy "insert_own" on public.device_tokens
  for insert with check ( auth.uid() = user_id );

-- Allow users to update their own device tokens (e.g., mark inactive, refresh meta)
drop policy if exists "update_own" on public.device_tokens;
create policy "update_own" on public.device_tokens
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

-- Allow users to delete their own device tokens
drop policy if exists "delete_own" on public.device_tokens;
create policy "delete_own" on public.device_tokens
  for delete using ( auth.uid() = user_id );

-- Indexes
create index if not exists idx_device_tokens_user_id on public.device_tokens(user_id);
create unique index if not exists idx_device_tokens_token on public.device_tokens(token);
create index if not exists idx_device_tokens_active on public.device_tokens(active);
