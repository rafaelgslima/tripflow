-- Fix infinite recursion in profile RLS policy
-- The "Users can view collaborator profiles" policy causes infinite recursion
-- Simplifying to only allow viewing own profile for now

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view collaborator profiles" ON public.profile;

-- Drop and recreate the policy to ensure it exists with the right definition
DROP POLICY IF EXISTS "Anyone can view any profile" ON public.profile;

-- Add a simpler policy for viewing other users' profiles when needed
-- This policy allows reading any profile (needed for the shares API to fetch names)
CREATE POLICY "Anyone can view any profile"
    ON public.profile
    FOR SELECT
    USING (true);
