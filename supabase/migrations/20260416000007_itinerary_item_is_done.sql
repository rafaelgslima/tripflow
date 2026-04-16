-- Add is_done flag to itinerary_item
-- Allows collaborators to mark activities as completed; visible to all plan members.

ALTER TABLE public.itinerary_item
  ADD COLUMN is_done BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.itinerary_item.is_done IS
  'Whether the activity has been marked as done by any collaborator.';

-- Rollback: ALTER TABLE public.itinerary_item DROP COLUMN is_done;
