-- Migrate existing push_token values from profiles to device_tokens, then drop the legacy column
-- WARNING: run this with a DB backup or in a controlled migration window.

BEGIN;

-- Insert existing non-empty push tokens into device_tokens.
-- Use ON CONFLICT to avoid duplicate tokens (device_tokens.token is unique).
INSERT INTO public.device_tokens (user_id, token, provider, platform, active, created_at, updated_at)
SELECT
  id AS user_id,
  push_token AS token,
  'expo'::text AS provider,
  NULL::text AS platform,
  true AS active,
  now() AS created_at,
  now() AS updated_at
FROM public.profiles
WHERE push_token IS NOT NULL AND length(trim(push_token)) > 0
ON CONFLICT (token) DO UPDATE
  SET active = EXCLUDED.active,
      updated_at = EXCLUDED.updated_at;

-- Remove legacy index on profiles.push_token (if present)
DROP INDEX IF EXISTS idx_profiles_push_token;

-- Drop the legacy column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS push_token;

COMMIT;
