# TripFlow — Copilot / Agent Instructions (Monorepo)

You are working in the **TripFlow** monorepo.

**Goal:** build a secure, scalable web (now) + mobile (later) product for collaborative travel planning, using **Supabase (Postgres/Auth)**, a **Python FastAPI backend**, and a **Next.js (TypeScript) frontend**. Mobile will be **React Native** using the same backend and database.

These instructions are **non‑negotiable**. When unsure, ask a clarifying question before writing code.

---

## 1) Product Overview (What we are building)

TripFlow is a web + mobile application where:

### 1.1 Users / Accounts

Users can:

- Register with simple profile data: **name, email, avatar, country, city**
- Log in / log out
- Change password
- Edit their profile on a dedicated page after login

### 1.2 Travel Plans

After login, the home page allows creating a **Travel Plan**:

- User enters:
  - Destination city
  - Date range (days traveling)
- App shows a **table of days** within that range
- For each day, user can manage multiple **Plans** (itinerary items), e.g.:
  - `09:00 Breakfast at Alenis`
  - `10:30 National Museum`
- Users can add/edit/delete:
  - itinerary items (plans)
  - the entire travel plan

### 1.3 Sharing & Collaboration

Users can share a Travel Plan with others:

- Owner enters the collaborator’s **email**
- Collaborator receives an email invite
- After accepting, collaborator sees the shared Travel Plan in their home page
- Once shared, **all accepted collaborators** can add/edit/delete itinerary items and can delete the travel plan (unless we later add role-based permissions)

**Important:** The system must support:

- One user → many travel plans
- One travel plan → many plans (itinerary items)
- One travel plan ↔ many collaborators (shared users)

---

## 2) Architecture (How we build it)

### 2.1 Database: Supabase (Postgres + Auth)

- Supabase is the **system of record** for data.
- Supabase Auth manages user identities (email/password).
- Use **Row Level Security (RLS)** on all user-facing tables.
- Prefer migrations and structured schema changes (no ad-hoc manual DB changes).

### 2.2 Backend: Python + FastAPI

Even though Next.js can talk to Supabase directly, we use a Python API because:

- We want to practice Python
- We need backend capabilities (e.g., **sending emails**, webhooks, background tasks)

Backend responsibilities:

- Authenticate requests (verify Supabase JWTs)
- Enforce business rules (in addition to DB constraints/RLS)
- Handle invitations & email flows
- Provide stable APIs for web and future mobile app

### 2.3 Frontend: Next.js + TypeScript + Tailwind + Axios

- Next.js is the web client.
- Use TypeScript strictly.
- Tailwind for styling.
- Axios for calling the FastAPI backend.

### 2.4 Mobile (later): React Native

- Mobile apps (iOS/Android) will use the **same FastAPI backend** and **same Supabase database**.
- All API decisions must remain mobile-friendly (no web-only coupling, no reliance on cookies-only auth, avoid browser-only flows).

---

## 3) Monorepo Layout (expected structure)

Use a clear separation by app/service:

- `apps/web/` — Next.js (TypeScript) web app
- `apps/api/` — FastAPI service
- `packages/` — shared libraries (optional; types, API client, schemas)
- `docs/` — architecture, conventions, ADRs
- `.github/` — GitHub automation + these instructions

**Rule:** avoid cross-importing between apps except via `packages/`.

### 3.1 Frontend Folder Structure (apps/web/src/)

Follow this strict folder organization for all frontend code:

```
src/
├── components/          # Reusable UI components
│   └── [ComponentName]/ # Each component in its own folder
│       ├── index.tsx    # Component implementation
│       ├── types.ts     # TypeScript types/interfaces
│       └── index.test.tsx  # Component tests
├── pages/              # Next.js pages (Pages Router)
│   └── [page].tsx      # Page components
├── hooks/              # Custom React hooks
│   └── [hookName]/     # Each hook in its own folder
│       ├── index.ts    # Hook implementation
│       ├── types.ts    # TypeScript types/interfaces
│       └── index.test.ts  # Hook tests
├── utils/              # Utility functions
│   └── [utilityName]/  # Each utility in its own folder
│       ├── index.ts    # Utility implementation
│       ├── types.ts    # TypeScript types/interfaces (if needed)
│       └── index.test.ts  # Utility tests
├── lib/                # Third-party library configurations
│   └── api/            # API client setup
├── features/           # Feature-based modules (optional)
│   └── [featureName]/  # Each feature encapsulates related logic
├── styles/             # Global styles
└── types/              # Shared TypeScript types

```

**Required patterns:**

- Every component must be in its own folder with `index.tsx`, `types.ts`, and `index.test.tsx`
- Every custom hook must be in its own folder with `index.ts`, `types.ts`, and `index.test.ts`
- Every utility must be in its own folder with `index.ts`, `types.ts` (if needed), and `index.test.ts`
- **Always export types/interfaces from a separate `types.ts` file** - never define interfaces inline in component/hook files
- Always colocate tests with implementation
- Use named exports for components, hooks, and utilities
- Import from folder path (e.g., `@/components/Button` not `@/components/Button/index`)
- Import types using `import type { TypeName } from "./types"` for type-only imports
- **Identify and extract duplicate code into reusable components** - whenever similar UI patterns or logic appear in multiple places, create a shared component with appropriate props to avoid duplication

---

## 4) API Design Rules (Web + Mobile compatible)

### 4.1 API Style

- Use REST with predictable resource paths (unless we explicitly decide otherwise).
- Use consistent request/response shapes and error formatting.
- Use OpenAPI generation from FastAPI and keep it accurate.

### 4.2 Auth

- Clients authenticate with **Supabase Auth** and obtain an access token (JWT).
- Clients call FastAPI using:
  - `Authorization: Bearer <access_token>`
- Backend must verify JWT signatures/claims using Supabase/JWKS.
- Do not rely on “client says user_id”; always derive user identity from JWT.

### 4.3 Idempotency & Safety

- Email invite creation should be idempotent (avoid multiple invites to same email for same travel plan unless intended).
- Validate inputs; never trust client payloads.

### 4.4 Versioning

- If versioning is needed, prefer `/v1/...` routes early to avoid breaking mobile later.

---

## 5) Data Model Guidance (high-level, stable concepts)

Core entities:

- **profile**: user profile data (name, avatar, country, city)
- **travel_plan**: a trip to a city with date range
- **travel_day** (optional): derived table OR computed by date range (prefer computed unless needed)
- **itinerary_item** (plan): items with date/time and description
- **travel_plan_share / collaborator**:
  - travel_plan_id
  - invited_email
  - invited_user_id (nullable until accepted)
  - status: pending/accepted/declined/revoked
  - invited_by_user_id
  - timestamps

**Rule:** Always design for collaboration:

- A travel plan belongs to a “workspace” of users (owner + collaborators)
- Permissions should be enforced in both:
  - DB (RLS)
  - API (FastAPI checks)

---

## 6) Email Invites (Backend responsibility)

Invitation flow:

1. Authenticated user requests to share a travel plan with an email
2. Backend:
   - Validates requester has access to the travel plan
   - Creates an invite record (pending)
   - Sends email containing an accept link (with secure token)
3. Recipient accepts:
   - If logged in (or after login), backend verifies token
   - Marks invite as accepted and links to recipient user id

**Security rules:**

- Invite tokens must be single-use or short-lived.
- Do not expose internal IDs in insecure ways.
- Always verify the accepting user controls the invited email (or treat acceptance carefully).

---

## 7) Security Rules (non-negotiable)

### 7.1 Secrets

- Never commit secrets.
- Never put Supabase **service role key** in frontend code.
- Frontend may use only public keys meant for client usage.
- Backend may use service role keys only on the server.

### 7.2 Database Security

- **RLS required** for all tables containing user data.
- Every query must be safe under multi-tenant/collaboration access rules.
- Always add DB constraints:
  - foreign keys
  - unique constraints
  - check constraints where appropriate

### 7.3 API Security

- Validate all inputs with Pydantic.
- Use rate limiting (if/when needed) for invite endpoints and auth-adjacent operations.
- Ensure CORS is configured appropriately (web now, mobile later).

### 7.4 JWT Validation Requirements

- Validate and enforce JWT claims: `exp`, `nbf`, `iat`, `iss`, `aud`, `sub`.
- Reject tokens with invalid signature, wrong issuer/audience, or missing required claims.
- Allow small clock skew tolerance only (e.g., <= 60s).
- Never accept unsigned tokens or algorithm downgrades.

### 7.5 Authorization & Permission Model

- Use explicit permission checks in services for every write operation.
- Treat ownership and collaboration as separate permission paths and test both.
- Deny by default when access cannot be proven.
- Add negative tests for unauthorized access on each protected endpoint.

### 7.6 Data Protection & Privacy

- Minimize PII collection and storage to required fields only.
- Redact secrets and tokens from logs, errors, and telemetry.
- Store invite tokens hashed (or signed and short-lived) and never persist raw tokens.
- Define retention/cleanup rules for expired invites, revoked shares, and stale audit entries.

### 7.7 Supply Chain & Dependency Security

- Pin dependency versions and keep lockfiles committed.
- Run dependency vulnerability scanning in CI for frontend and backend.
- Enable secret scanning and fail CI on detected leaked credentials.

---

## 8) Testing Rules (TDD is mandatory)

### 8.1 The TDD workflow (must follow)

**Never implement a component or feature directly.**

Required workflow:

1. Write tests first (unit tests by default).
2. Run tests; confirm they fail for the expected reason.
3. Implement the smallest change to make tests pass.
4. Refactor as needed; tests must stay green.
5. Only then proceed.

### 8.2 Non-negotiable requirement

- **Every component must have a unit test.**
- Do not create UI components without tests.
- If asked to implement something without tests, stop and propose the tests first.

### 8.3 What to test

- Frontend:
  - component behavior (rendering, interactions)
  - hooks/utilities
  - API client logic
- Backend:
  - service logic
  - route behavior
  - permission checks
  - invitation flows
- Prefer fast unit tests; add integration tests where critical (invites, auth boundaries).

---

## 9) Modern & Recommended Implementation Patterns (always follow)

### 9.1 Frontend (Next.js + TS)

- Prefer modern Next.js patterns:
  - Pages Router (as currently used in this repo)
  - Keep API calls in a dedicated client module (`lib/api/*`)
- Use typed API clients (generated from OpenAPI if possible).
- **Strict folder structure** (see section 3.1):
  - Components in `components/[ComponentName]/` with index.tsx, types.ts, index.test.tsx
  - Hooks in `hooks/[hookName]/` with index.ts, types.ts, index.test.ts
  - Utils in `utils/[utilityName]/` with index.ts, types.ts, index.test.ts
- Keep UI logic separated from data fetching:
  - `lib/api/*` for API calls
  - `components/*` for UI
  - `hooks/*` for custom hooks
  - `utils/*` for utility functions
  - `features/*` for domain modules (optional, when grouping related functionality)

### 9.2 Backend (FastAPI)

- Use:
  - Pydantic models for request/response
  - dependency injection for auth (`Depends`)
  - clear layering:
    - `routers/` (HTTP layer)
    - `services/` (business logic)
    - `repositories/` (DB access)
- Keep endpoints thin; put logic into services.
- Always return consistent error responses.

### 9.3 Shared Contracts

- Prefer a single source of truth for API schemas:
  - FastAPI OpenAPI → generate TypeScript client/types
- Avoid duplicating types manually across web/mobile/backend when possible.

### 9.4 Database Access

- Favor explicit SQL/schema constraints and migrations.
- For collaboration permissions, design queries assuming:
  - the requester might be owner or collaborator
  - all reads/writes must check membership

### 9.5 Performance by Default

- All list endpoints must support pagination (`limit` + cursor or offset) and stable ordering.
- Avoid N+1 query patterns; batch reads and select only required columns.
- Add indexes for high-frequency filters and joins (`owner_user_id`, `travel_plan_id`, `status`, date fields).
- Email sending and other slow side-effects must run asynchronously (background jobs/queue).
- Define p95 latency targets for critical endpoints and measure them.

### 9.6 Frontend Performance Patterns

- Use server components and streaming where appropriate; keep client components minimal.
- Lazy-load heavy UI modules and defer non-critical scripts.
- Cache API responses thoughtfully (SWR/React Query or Next.js cache primitives) with explicit invalidation.
- Optimize lists and tables for large travel plans (virtualization where needed).

### 9.7 Maintainability & Code Organization

- Keep domain boundaries explicit: `features/*` modules should encapsulate UI + logic per domain.
- Prefer small, single-purpose services and repositories over large multi-responsibility files.
- Do not duplicate validation/business rules across layers; centralize and reuse.
- Use consistent naming conventions and avoid implicit magic behavior.
- Add ADRs in `docs/adr/` for important architecture decisions.

### 9.8 Observability & Operability

- Use structured logs with request correlation IDs.
- Track metrics for API latency, error rate, invite success/failure, and auth failures.
- Add health/readiness checks for API service.
- Define alert thresholds for repeated auth failures and invite endpoint abuse.

### 9.9 Error Handling Contract

- Return a consistent error envelope with machine-readable `code` and human-readable `message`.
- Do not leak stack traces, SQL details, tokens, or internal IDs in API responses.
- Map domain errors to stable HTTP status codes and document them in OpenAPI.

### 9.10 Frontend Style Guide Baseline (Airbnb React)

- For frontend React/TypeScript code, use Airbnb React style guidance as a required baseline:
  - https://github.com/airbnb/javascript/tree/master/react
- Before writing or editing frontend components, the agent must review this guide and align implementation decisions with it.
- If a rule from Airbnb conflicts with project-specific instructions in this document, this document takes precedence.
- The agent should explicitly call out any intentional deviations from Airbnb rules in PR descriptions or change summaries.
- Prefer consistency with existing code in the repository when multiple valid patterns exist.

---

## 10) How Copilot should behave in PR-style changes

When asked to implement a feature:

1. Propose a small plan (files to change, tests to add).
2. Write tests first.
3. After tests pass, ask permission to implement UI/component if it’s a new component.
4. Keep changes incremental, readable, and secure.

If anything conflicts with these instructions, stop and ask.

---

## 11) Clarifying questions Copilot should ask (examples)

Ask before implementing if any of these are unclear:

- Should collaborators be allowed to delete the entire travel plan, or only the owner?
- Should sharing require the recipient to already have an account, or can invites create onboarding?
- Should itinerary items store timezone? (recommended: store times with timezone or store local time + timezone on travel plan)
- Should travel plans allow overlapping date ranges or same city duplicates? (likely yes)

---

## 12) Definition of Done (DoD)

A feature is done only if:

- Tests are written first and are passing
- Lint/typecheck passes
- Security rules above are respected
- API contracts are documented/updated (OpenAPI)
- No secrets are introduced
- It remains compatible with future React Native clients

---

## 13) CI/CD Quality Gates (required)

Every PR must pass:

- Unit tests for touched backend/frontend modules
- Lint + typecheck
- Dependency vulnerability scan
- Secret scan
- OpenAPI schema generation/validation for API changes

If a gate fails, do not merge.

---

## 14) Database Migration Discipline

- Every schema change must come from a migration file.
- Include rollback strategy in migration PR description when feasible.
- Add or update constraints/indexes in the same migration when adding new access patterns.
- Never rely on manual one-off SQL in production as the source of truth.

---

## 15) Documentation Maintenance Rules

- Keep `README.md` and relevant docs updated when setup, architecture, or workflows change.
- For new APIs, document request/response examples and authorization requirements.
- For security-sensitive flows (auth/invites), keep sequence diagrams or step-by-step flow docs in `docs/`.

---

## 16) Clarifications Required Before Implementing Sensitive Features

Before implementing auth, sharing, or deletion behaviors, confirm:

- collaborator delete permissions vs owner-only delete
- invite acceptance constraints (existing account required or onboarding allowed)
- timezone storage strategy for itinerary time data
- data retention expectations for deleted plans and revoked shares
