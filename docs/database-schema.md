# Planutrip Database Schema

## Overview

This document describes the database schema for Planutrip's collaborative travel planning application.

## Tables

### 1. profile

Stores user profile information (extends Supabase Auth).

**Columns:**

- `id` (UUID, PK) - References auth.users(id), unique user identifier
- `email` (TEXT, UNIQUE, NOT NULL) - User's email address
- `name` (TEXT, NOT NULL) - User's full name
- `avatar_url` (TEXT) - URL to profile picture
- `country` (TEXT) - User's country
- `city` (TEXT) - User's city
- `created_at` (TIMESTAMPTZ, NOT NULL) - When profile was created
- `updated_at` (TIMESTAMPTZ, NOT NULL) - Last update timestamp

**Relationships:**

- Links to Supabase Auth users
- One profile → many travel plans (as owner)
- One profile → many itinerary items (as creator)
- One profile → many shares (as inviter or invitee)

---

### 2. travel_plan

Stores travel plans (trips to destinations).

**Columns:**

- `id` (UUID, PK) - Unique travel plan identifier
- `owner_user_id` (UUID, NOT NULL, FK) - References profile(id)
- `destination_city` (TEXT, NOT NULL) - Destination city name
- `start_date` (DATE, NOT NULL) - Trip start date
- `end_date` (DATE, NOT NULL) - Trip end date
- `created_at` (TIMESTAMPTZ, NOT NULL) - When plan was created
- `updated_at` (TIMESTAMPTZ, NOT NULL) - Last update timestamp

**Constraints:**

- `valid_date_range`: end_date >= start_date
- `destination_not_empty`: destination city cannot be empty/whitespace

**Relationships:**

- Many travel plans → one profile (owner)
- One travel plan → many itinerary items
- One travel plan → many shares (collaborators)

---

### 3. itinerary_item

Stores individual itinerary entries (plans for specific times).

**Columns:**

- `id` (UUID, PK) - Unique item identifier
- `travel_plan_id` (UUID, NOT NULL, FK) - References travel_plan(id)
- `date` (DATE, NOT NULL) - The date for this item
- `time` (TIME) - Optional time of day
- `description` (TEXT, NOT NULL) - Item description (e.g., "Breakfast at Alenis")
- `created_by_user_id` (UUID, NOT NULL, FK) - References profile(id)
- `created_at` (TIMESTAMPTZ, NOT NULL) - When item was created
- `updated_at` (TIMESTAMPTZ, NOT NULL) - Last update timestamp

**Constraints:**

- `description_not_empty`: description cannot be empty/whitespace

**Relationships:**

- Many itinerary items → one travel plan
- Many itinerary items → one profile (creator)

---

### 4. travel_plan_share

Manages travel plan sharing and collaboration invitations.

**Columns:**

- `id` (UUID, PK) - Unique share identifier
- `travel_plan_id` (UUID, NOT NULL, FK) - References travel_plan(id)
- `invited_email` (TEXT, NOT NULL) - Email of invited user
- `invited_user_id` (UUID, FK) - References profile(id), nullable until accepted
- `invited_by_user_id` (UUID, NOT NULL, FK) - References profile(id), who sent invite
- `status` (share_status, NOT NULL) - Enum: pending/accepted/declined/revoked
- `invite_token` (TEXT) - Secure token for accepting invitation
- `created_at` (TIMESTAMPTZ, NOT NULL) - When share was created
- `updated_at` (TIMESTAMPTZ, NOT NULL) - Last update timestamp

**Constraints:**

- `unique_invite_per_plan`: Each email can only be invited once per travel plan
- `cannot_invite_self`: Users cannot invite themselves
- `email_format`: Basic email format validation

**Relationships:**

- Many shares → one travel plan
- Many shares → one profile (inviter)
- Many shares → one profile (invitee, when accepted)

---

## Security (Row Level Security)

All tables have RLS enabled. Key policies:

### Profile

- Users can view/update their own profile
- Users can view profiles of collaborators

### Travel Plan

- Owners can view/edit/delete their plans
- Collaborators can view/edit/delete shared plans (after accepting invite)

### Itinerary Item

- Owners and collaborators can view/add/edit/delete items
- Must be authenticated to perform any action

### Travel Plan Share

- Owners can create/view/manage shares for their plans
- Invitees can view and update their invitation status
- Collaborators can view shares for plans they collaborate on

---

## Indexes

Performance indexes on:

- `profile.email` - Email lookups
- `travel_plan.owner_user_id` - Owner queries
- `travel_plan` dates - Date range queries
- `itinerary_item.travel_plan_id` - Plan item lookups
- `itinerary_item` date/time - Chronological sorting
- `travel_plan_share.invited_user_id` - User invitation lookups
- `travel_plan_share.invited_email` - Email invitation lookups
- `travel_plan_share.status` - Status filtering
- `travel_plan_share.invite_token` - Token validation

---

## Migrations

Migrations are located in `supabase/migrations/`:

1. `20260310000001_initial_schema.sql` - Creates all tables, constraints, triggers
2. `20260310000002_rls_policies.sql` - Implements Row Level Security policies
3. `20260310000003_indexes.sql` - Creates performance indexes

To apply migrations:

```bash
# Test locally
supabase start
supabase db reset

# Push to cloud
supabase db push
```

---

## Notes

- All timestamps use `TIMESTAMPTZ` (timezone-aware)
- UUIDs are used for all primary keys
- Foreign keys have `ON DELETE CASCADE` to maintain referential integrity
- `updated_at` is automatically maintained via triggers
- Collaboration model: owner + accepted collaborators have equal permissions (can delete plan)
