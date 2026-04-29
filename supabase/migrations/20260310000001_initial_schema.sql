-- Planutrip Initial Schema Migration
-- Creates core tables: profile, travel_plan, itinerary_item, travel_plan_share

-- Enable UUID extension (pgcrypto provides gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILE TABLE
-- ============================================================================
-- Stores user profile information (extends Supabase Auth users)
CREATE TABLE public.profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE public.profile IS 'User profile data extending Supabase Auth';

-- ============================================================================
-- 2. TRAVEL_PLAN TABLE
-- ============================================================================
-- Stores travel plans (trips)
CREATE TABLE public.travel_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
    destination_city TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    CONSTRAINT destination_not_empty CHECK (LENGTH(TRIM(destination_city)) > 0)
);

-- Add comment
COMMENT ON TABLE public.travel_plan IS 'Travel plans with destination and date range';

-- ============================================================================
-- 3. ITINERARY_ITEM TABLE
-- ============================================================================
-- Stores individual itinerary items (plans) for each day
CREATE TABLE public.itinerary_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_plan_id UUID NOT NULL REFERENCES public.travel_plan(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME,
    description TEXT NOT NULL,
    created_by_user_id UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT description_not_empty CHECK (LENGTH(TRIM(description)) > 0)
);

-- Add comment
COMMENT ON TABLE public.itinerary_item IS 'Individual itinerary items (plans) for each day of a trip';

-- ============================================================================
-- 4. TRAVEL_PLAN_SHARE TABLE
-- ============================================================================
-- Manages travel plan sharing and collaboration
CREATE TYPE share_status AS ENUM ('pending', 'accepted', 'declined', 'revoked');

CREATE TABLE public.travel_plan_share (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_plan_id UUID NOT NULL REFERENCES public.travel_plan(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    invited_user_id UUID REFERENCES public.profile(id) ON DELETE CASCADE,
    invited_by_user_id UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
    status share_status NOT NULL DEFAULT 'pending',
    invite_token TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_invite_per_plan UNIQUE (travel_plan_id, invited_email),
    CONSTRAINT email_format CHECK (invited_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add comment
COMMENT ON TABLE public.travel_plan_share IS 'Travel plan sharing and collaboration invitations';

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.travel_plan
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.itinerary_item
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.travel_plan_share
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
