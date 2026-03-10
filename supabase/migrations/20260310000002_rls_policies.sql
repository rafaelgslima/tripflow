-- TripFlow Row Level Security (RLS) Policies
-- Ensures users can only access their own data and shared travel plans

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itinerary_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_plan_share ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILE TABLE POLICIES
-- ============================================================================
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profile
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
    ON public.profile
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profile
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can read profiles of people they collaborate with
CREATE POLICY "Users can view collaborator profiles"
    ON public.profile
    FOR SELECT
    USING (
        id IN (
            SELECT DISTINCT invited_user_id
            FROM public.travel_plan_share tps
            INNER JOIN public.travel_plan tp ON tp.id = tps.travel_plan_id
            WHERE (tp.owner_user_id = auth.uid() OR tps.invited_user_id = auth.uid())
            AND tps.status = 'accepted'
            AND tps.invited_user_id IS NOT NULL
        )
        OR id IN (
            SELECT DISTINCT owner_user_id
            FROM public.travel_plan tp
            INNER JOIN public.travel_plan_share tps ON tps.travel_plan_id = tp.id
            WHERE tps.invited_user_id = auth.uid()
            AND tps.status = 'accepted'
        )
    );

-- ============================================================================
-- TRAVEL_PLAN TABLE POLICIES
-- ============================================================================
-- Users can view their own travel plans
CREATE POLICY "Users can view own travel plans"
    ON public.travel_plan
    FOR SELECT
    USING (owner_user_id = auth.uid());

-- Users can view travel plans shared with them (accepted invites)
CREATE POLICY "Users can view shared travel plans"
    ON public.travel_plan
    FOR SELECT
    USING (
        id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- Users can insert their own travel plans
CREATE POLICY "Users can create own travel plans"
    ON public.travel_plan
    FOR INSERT
    WITH CHECK (owner_user_id = auth.uid());

-- Users can update their own travel plans
CREATE POLICY "Users can update own travel plans"
    ON public.travel_plan
    FOR UPDATE
    USING (owner_user_id = auth.uid())
    WITH CHECK (owner_user_id = auth.uid());

-- Users can update shared travel plans (accepted collaborators)
CREATE POLICY "Collaborators can update shared travel plans"
    ON public.travel_plan
    FOR UPDATE
    USING (
        id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- Users can delete their own travel plans
CREATE POLICY "Users can delete own travel plans"
    ON public.travel_plan
    FOR DELETE
    USING (owner_user_id = auth.uid());

-- Collaborators can delete shared travel plans (per requirements)
CREATE POLICY "Collaborators can delete shared travel plans"
    ON public.travel_plan
    FOR DELETE
    USING (
        id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- ============================================================================
-- ITINERARY_ITEM TABLE POLICIES
-- ============================================================================
-- Users can view itinerary items from their own travel plans
CREATE POLICY "Users can view own itinerary items"
    ON public.itinerary_item
    FOR SELECT
    USING (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
    );

-- Users can view itinerary items from shared travel plans
CREATE POLICY "Users can view shared itinerary items"
    ON public.itinerary_item
    FOR SELECT
    USING (
        travel_plan_id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- Users can insert itinerary items to their own travel plans
CREATE POLICY "Users can create itinerary items for own plans"
    ON public.itinerary_item
    FOR INSERT
    WITH CHECK (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
        AND created_by_user_id = auth.uid()
    );

-- Collaborators can insert itinerary items to shared travel plans
CREATE POLICY "Collaborators can create itinerary items"
    ON public.itinerary_item
    FOR INSERT
    WITH CHECK (
        travel_plan_id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
        AND created_by_user_id = auth.uid()
    );

-- Users can update itinerary items from their own travel plans
CREATE POLICY "Users can update own itinerary items"
    ON public.itinerary_item
    FOR UPDATE
    USING (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
    );

-- Collaborators can update itinerary items from shared travel plans
CREATE POLICY "Collaborators can update shared itinerary items"
    ON public.itinerary_item
    FOR UPDATE
    USING (
        travel_plan_id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- Users can delete itinerary items from their own travel plans
CREATE POLICY "Users can delete own itinerary items"
    ON public.itinerary_item
    FOR DELETE
    USING (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
    );

-- Collaborators can delete itinerary items from shared travel plans
CREATE POLICY "Collaborators can delete shared itinerary items"
    ON public.itinerary_item
    FOR DELETE
    USING (
        travel_plan_id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- ============================================================================
-- TRAVEL_PLAN_SHARE TABLE POLICIES
-- ============================================================================
-- Users can view shares for their own travel plans (to see who they invited)
CREATE POLICY "Owners can view shares for own plans"
    ON public.travel_plan_share
    FOR SELECT
    USING (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
    );

-- Users can view shares where they are the invited user
CREATE POLICY "Users can view own invitations"
    ON public.travel_plan_share
    FOR SELECT
    USING (invited_user_id = auth.uid() OR invited_email = (SELECT email FROM public.profile WHERE id = auth.uid()));

-- Users can view shares for travel plans they collaborate on
CREATE POLICY "Collaborators can view shares for shared plans"
    ON public.travel_plan_share
    FOR SELECT
    USING (
        travel_plan_id IN (
            SELECT travel_plan_id
            FROM public.travel_plan_share
            WHERE invited_user_id = auth.uid()
            AND status = 'accepted'
        )
    );

-- Owners can create shares for their own travel plans
CREATE POLICY "Owners can create shares for own plans"
    ON public.travel_plan_share
    FOR INSERT
    WITH CHECK (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
        AND invited_by_user_id = auth.uid()
    );

-- Owners can update shares for their own travel plans (e.g., revoke)
CREATE POLICY "Owners can update shares for own plans"
    ON public.travel_plan_share
    FOR UPDATE
    USING (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
    );

-- Invited users can update their own share status (e.g., accept/decline)
CREATE POLICY "Users can update own invitation status"
    ON public.travel_plan_share
    FOR UPDATE
    USING (invited_user_id = auth.uid() OR invited_email = (SELECT email FROM public.profile WHERE id = auth.uid()));

-- Owners can delete shares for their own travel plans
CREATE POLICY "Owners can delete shares for own plans"
    ON public.travel_plan_share
    FOR DELETE
    USING (
        travel_plan_id IN (
            SELECT id FROM public.travel_plan WHERE owner_user_id = auth.uid()
        )
    );
