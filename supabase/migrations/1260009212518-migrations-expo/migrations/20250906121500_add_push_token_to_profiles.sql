-- Add push_token column to profiles for storing device push tokens

alter table public.profiles add column if not exists push_token text;

create index if not exists idx_profiles_push_token on public.profiles (push_token);
