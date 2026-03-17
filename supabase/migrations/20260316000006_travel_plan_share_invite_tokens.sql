-- Add secure invite token tracking to travel_plan_share
-- We store only a hash of the invite token (never the raw token), plus expiry + used timestamps.

ALTER TABLE public.travel_plan_share
  DROP COLUMN IF EXISTS invite_token,
  ADD COLUMN IF NOT EXISTS invite_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS invite_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invite_token_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Ensure lookup is fast and tokens are unique when present
CREATE UNIQUE INDEX IF NOT EXISTS travel_plan_share_invite_token_hash_unique
  ON public.travel_plan_share (invite_token_hash)
  WHERE invite_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS travel_plan_share_invite_token_hash_idx
  ON public.travel_plan_share (invite_token_hash)
  WHERE invite_token_hash IS NOT NULL;
