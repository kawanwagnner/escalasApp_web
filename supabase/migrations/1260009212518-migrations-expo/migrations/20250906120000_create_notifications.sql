-- Create notifications table and RLS policies

create table if not exists notifications (
  id bigint primary key generated always as identity,
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  body text,
  data jsonb default '{}'::jsonb,
  type text,
  source text,
  external_id text,
  read boolean default false,
  delivered_at timestamptz default now(),
  created_at timestamptz default now()
);

alter table notifications enable row level security;

-- Allow users to read their own notifications
drop policy if exists "select_own" on notifications;
create policy "select_own" on notifications
  for select using ( auth.uid() = user_id );

-- Allow server/service role to insert notifications (server should use service_role key)
drop policy if exists "insert_by_service" on notifications;
create policy "insert_by_service" on notifications
  for insert with check ( auth.role() = 'service_role' );

-- Allow users to insert notifications for themselves (rare, but used by client)
drop policy if exists "insert_own" on notifications;
create policy "insert_own" on notifications
  for insert with check ( auth.uid() = user_id );

-- Allow users to update their own read flag
drop policy if exists "update_read_own" on notifications;
create policy "update_read_own" on notifications
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists notifications_user_read_idx on notifications(user_id, read);
create index if not exists notifications_external_idx on notifications(external_id);
