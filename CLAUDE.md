# TripFlow — Project Instructions

Monorepo for a collaborative travel planning app: **Supabase (Postgres/Auth)** + **Python FastAPI backend** + **Next.js (TypeScript) frontend**. Mobile (React Native) comes later, using the same backend and database.

When unsure, ask a clarifying question before writing code.

---

## Product

**Users:** register with name, email, avatar, country, city. Login/logout, change password, edit profile.

**Travel Plans:** destination city + date range → table of days. Each day has itinerary items (time + description). Users can add/edit/delete items and the whole plan.

**Collaboration:** owner shares a plan by email → collaborator gets an invite → after accepting, the plan appears on their home page. All accepted collaborators can add/edit/delete items and delete the plan.

Relations: user → many travel plans; travel plan → many itinerary items; travel plan ↔ many collaborators.

---

## Architecture

| Layer | Tech |
|---|---|
| Database | Supabase (Postgres + Auth) |
| Backend | Next.js API Routes (pages/api/) |
| Frontend | Next.js + TypeScript + Tailwind + Axios |
| Mobile (later) | React Native (same backend + DB) |

- Supabase is the system of record. Use RLS on all user-facing tables. Schema changes via migrations only — no ad-hoc SQL.
- Next.js API routes verify Supabase JWTs, enforce business rules, handle email/invite flows.
- All API decisions must remain mobile-friendly (no cookie-only auth, no browser-only flows).
- `SUPABASE_SERVICE_ROLE_KEY` is server-side only — never expose to the browser.

---

## Monorepo Layout

```
apps/web/      — Next.js web app
apps/api/      — FastAPI service
packages/      — shared types/client (optional)
docs/          — architecture, ADRs
```

No cross-imports between apps except via `packages/`.

---

## Frontend Folder Structure (`apps/web/src/`)

```
components/[ComponentName]/
  index.tsx         # implementation
  types.ts          # types/interfaces
  index.test.tsx    # tests

hooks/[hookName]/
  index.ts
  types.ts
  index.test.ts

utils/[utilityName]/
  index.ts
  types.ts          # if needed
  index.test.ts

lib/api/            # API client setup
pages/              # Next.js Pages Router
features/           # optional domain modules
styles/
types/              # shared TS types
```

**Rules:**
- Types always in a separate `types.ts` — never inline in component/hook files.
- Use named exports. Import from folder path (`@/components/Button`, not `…/Button/index`).
- Type-only imports: `import type { Foo } from "./types"`.
- All imports at the top of the file.
- Colocate tests with implementation.

---

## Code Quality Rules

**No duplication.** Before writing code, check if similar logic exists. Extract shared logic into hooks, components, or utils. Common patterns:
- Stateful logic / side effects / API calls → `hooks/`
- UI patterns → `components/`
- Pure functions → `utils/`

**No unnecessary code.** Only implement what's actually needed. No unused imports, state, or functions. Don't add logic "just in case." Remove dead code immediately.

---

## API Design

- REST with consistent request/response shapes and error formatting.
- Auth: clients send `Authorization: Bearer <access_token>` (Supabase JWT). Backend verifies via JWKS — never trust a client-supplied user ID.
- Validate JWT claims: `exp`, `nbf`, `iat`, `iss`, `aud`, `sub`. Reject invalid signatures, wrong issuer/audience, algorithm downgrades. Max clock skew: 60s.
- Inputs validated with Pydantic. Never trust client payloads.
- Email invite creation must be idempotent.
- Prefer `/v1/...` routes for future mobile compatibility.
- Error responses: consistent envelope with machine-readable `code` and human-readable `message`. Never leak stack traces, SQL, tokens, or internal IDs.
- All list endpoints: pagination (`limit` + cursor/offset) and stable ordering.

---

## Data Model

- **profile**: name, avatar, country, city
- **travel_plan**: destination city, date range, owner
- **itinerary_item**: travel_plan_id, date/time, description
- **travel_plan_share**: travel_plan_id, invited_email, invited_user_id (nullable), status (pending/accepted/declined/revoked), invited_by_user_id, timestamps

Always design for collaboration: a travel plan is a workspace (owner + collaborators). Permissions enforced in both RLS and FastAPI.

---

## Email Invite Flow

**Sending side:**
1. Authenticated user opens a travel plan and clicks Share.
2. User types a friend's email and confirms.
3. Backend: validates access → upserts pending invite → generates a secure single-use token (stored hashed) → sends invite email with an accept link (`/share/accept?token=<raw_token>`).
4. Email is sent FROM the app's configured sender TO the friend's email (any address).

**Accepting side (friend clicks the link):**
- If the friend **has an account**: they must be logged in (or are prompted to log in). Once authenticated, if the token is valid and the invite email matches their account email, the invite is marked accepted and the travel plan appears on their home page.
- If the friend **has no account**: they are prompted to sign up. After creating an account with the invited email, the same token is re-verified and the invite is accepted automatically.
- If the token is **expired or already used**: the friend sees a clear error message explaining the invite is no longer valid.

**Token rules:** single-use, 48h TTL, stored as SHA-256 hash. Raw token only ever appears in the email link — never in logs or API responses.

**Email dispatch:** currently a no-op stub (logs accept URL to console). See `apps/web/src/lib/api-server/email.ts`. Pending decision on email provider — need a sender that supports sending FROM a personal/unverified email TO any recipient without a custom domain (e.g. SendGrid single-sender, Gmail SMTP).

---

## Security

- Never commit secrets. Supabase service role key: backend only. Frontend uses only public keys.
- RLS on all user-facing tables.
- DB constraints: foreign keys, unique, check constraints.
- Rate limiting on invite and auth-adjacent endpoints.
- CORS configured for web (and later mobile).
- Explicit permission checks in services for every write. Deny by default.
- Add negative tests for unauthorized access on each protected endpoint.
- Minimize PII. Redact secrets/tokens from logs.
- Pin dependency versions, commit lockfiles. Run vulnerability + secret scanning in CI.

---

## TDD Workflow (mandatory)

1. Write tests first.
2. Run them — confirm they fail for the expected reason.
3. Implement the minimum to make them pass.
4. Refactor; keep tests green.

Every component, hook, and utility must have a test. Do not create UI without tests. If asked to implement without tests, propose the tests first.

**What to test:**
- Frontend: component rendering/interactions, hooks, utils, API client logic.
- Backend: service logic, route behavior, permission checks, invite flows.
- Include negative tests for unauthorized access.

---

## Backend Patterns (Next.js API Routes)

API routes live in `apps/web/src/pages/api/`. Server-side utilities in `apps/web/src/lib/api-server/`.

- Thin route handlers → validation → Supabase admin client queries.
- Auth via `getAuthenticatedUser()` (verifies JWT using `supabase.auth.getUser()`).
- Input validation via manual TypeScript validators in `lib/api-server/validation.ts`.
- Consistent error envelope: `{ code, message }` via `sendError()` in `lib/api-server/errors.ts`.
- Use `.maybeSingle()` (not `.single()`) for optional Supabase lookups.
- Avoid N+1 queries; select only needed columns.
- Email via `lib/api-server/email.ts` (currently SendGrid, TODO: migrate to Resend once domain is ready).

---

## Frontend Patterns (Next.js)

- Pages Router (current). API calls in `lib/api/`. UI in `components/`. Logic in `hooks/`. Pure functions in `utils/`.
- Airbnb React style guide as baseline: https://github.com/airbnb/javascript/tree/master/react. Project rules take precedence when they conflict.
- Cache API responses (SWR/React Query) with explicit invalidation.
- Lazy-load heavy modules.

### Styling — Tailwind only, no inline CSS

**Never use React `style={{ }}` props.** All styling must use Tailwind CSS classes.

- Use the named design tokens in `tailwind.config.ts` for theme values: `bg-tf-bg`, `text-tf-text`, `text-tf-amber`, `border-tf-border`, `font-cormorant`, `font-outfit`, etc.
- For values not on Tailwind's default scale, use arbitrary syntax: `text-[13px]`, `rounded-[20px]`, `tracking-[-0.02em]`.
- The only permitted exceptions are values that are **genuinely impossible** to express in Tailwind (e.g. multi-stop `radial-gradient` backgrounds, runtime-computed transforms from libraries like `@dnd-kit`). In those cases, keep only the inexpressible properties in `style={{}}` and move everything else to `className`.

---

## When Implementing a Feature

1. Propose a plan (files to change, tests to add) before writing code.
2. Write tests first.
3. Implement incrementally.
4. Ask before creating a new component if not yet confirmed.

**Definition of Done:** tests pass, lint/typecheck passes, security rules respected, OpenAPI updated, no secrets introduced, mobile-compatible.

---

## Database Migrations

Every schema change comes from a migration file. Include rollback strategy in the PR. Add/update indexes and constraints in the same migration. No manual one-off SQL in production.

---

## Open Questions (confirm before implementing)

- Can collaborators delete the entire travel plan, or only the owner?
- Should itinerary items store timezone explicitly?
- Data retention for deleted plans and revoked shares?
- Which email provider to use for invite dispatch (pending — must support sending to any recipient without a custom domain).