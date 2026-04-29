-- Planutrip Performance Indexes
-- Optimizes common query patterns

-- ============================================================================
-- PROFILE TABLE INDEXES
-- ============================================================================
-- Email lookup (for invitations and user search)
CREATE INDEX idx_profile_email ON public.profile(email);

-- ============================================================================
-- TRAVEL_PLAN TABLE INDEXES
-- ============================================================================
-- Owner lookup (list user's travel plans)
CREATE INDEX idx_travel_plan_owner ON public.travel_plan(owner_user_id);

-- Date range queries (find active/upcoming trips)
CREATE INDEX idx_travel_plan_dates ON public.travel_plan(start_date, end_date);

-- Composite index for owner + dates (common query pattern)
CREATE INDEX idx_travel_plan_owner_dates ON public.travel_plan(owner_user_id, start_date, end_date);

-- ============================================================================
-- ITINERARY_ITEM TABLE INDEXES
-- ============================================================================
-- Travel plan lookup (list all items for a trip)
CREATE INDEX idx_itinerary_travel_plan ON public.itinerary_item(travel_plan_id);

-- Date + time sorting (show items in chronological order)
CREATE INDEX idx_itinerary_date_time ON public.itinerary_item(travel_plan_id, date, time);

-- Creator lookup (optional, for filtering by who added items)
CREATE INDEX idx_itinerary_creator ON public.itinerary_item(created_by_user_id);

-- ============================================================================
-- TRAVEL_PLAN_SHARE TABLE INDEXES
-- ============================================================================
-- Travel plan lookup (list all shares for a plan)
CREATE INDEX idx_share_travel_plan ON public.travel_plan_share(travel_plan_id);

-- Invited user lookup (find plans shared with a user)
CREATE INDEX idx_share_invited_user ON public.travel_plan_share(invited_user_id) WHERE invited_user_id IS NOT NULL;

-- Invited email lookup (find pending invites by email)
CREATE INDEX idx_share_invited_email ON public.travel_plan_share(invited_email);

-- Status filter (find pending/accepted shares)
CREATE INDEX idx_share_status ON public.travel_plan_share(status);

-- Composite index for user + status (common query: accepted shares for user)
CREATE INDEX idx_share_user_status ON public.travel_plan_share(invited_user_id, status) WHERE invited_user_id IS NOT NULL;

-- Invite token lookup (for accepting invitations)
CREATE INDEX idx_share_invite_token ON public.travel_plan_share(invite_token) WHERE invite_token IS NOT NULL;

-- Inviter lookup (see who invited whom)
CREATE INDEX idx_share_invited_by ON public.travel_plan_share(invited_by_user_id);
