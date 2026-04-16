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

**Pure functions never live in hooks or components.** Any function that takes inputs, returns a value, and has no side effects must live in `utils/`. This applies even if the function is currently only used in one place — co-locating it inside a hook or component makes it invisible to other code and untestable in isolation. Examples of functions that belong in utils, not inline:
- Date formatting / manipulation (`formatDayHeader`, `getDaysArray`, `formatDateRange` → `utils/dateUtils/`)
- Time normalization / formatting / sorting (`normalizeTime`, `formatTime`, `sortItemsByTime`, `TIME_OPTIONS` → `utils/timeOptions/`)
- Validation helpers, string transforms, math utilities

When you see an inline `const fn = () => ...` or `function fn()` inside a component or hook that has no closure dependencies, move it to `utils/`.

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

## Activity Timing

Itinerary items have an optional `time` field (HH:MM 24-hour format, e.g. `"09:30"`).

**Storage:**
- `itinerary_item.time` is a PostgreSQL `TIME` column — no migration needed, column already exists.
- PostgreSQL returns `TIME` values as `"HH:MM:SS"`. Always normalize to `"HH:MM"` when mapping API responses to UI types (see `normalizeTime` in `hooks/useDayPlans/index.ts`). Never pass raw DB time values back to the API — the server validator only accepts `"HH:MM"`.
- The server-side time validator: `TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/`. Accepts `HH:MM` only; `null`/`undefined`/`""` treated as no time.

**UI input:**
- Time is selected via a `<select>` with 30-minute interval options (00:00–23:30). Options are generated by `TIME_OPTIONS` in `utils/timeOptions/index.ts`.
- Display format: 12-hour with AM/PM (e.g. `"9:00 AM"`), rendered by `formatTime()` in the same utility.
- "No time" is always an option (empty string → stored as `null`).

**Ordering:**
- Items are sorted chronologically within each day: timed items first (ascending by time), untimed items last.
- Sort logic lives in `sortItemsByTime()` in `utils/timeOptions/index.ts`.
- After any create, update, or drag-reorder that changes times, call `reorderDayPlans` with the new sorted ID order to persist `sort_order` in the DB.

**Drag-and-drop time swap:**
- Dragging item A onto item B's position swaps their times. Both items are updated via `PUT` (description + new time).
- After the swap, the list is re-sorted by time. Only sort when at least one item has a time — if all items are untimed, use `arrayMove` order only (no sort).
- Never call API functions (updateDayPlan, reorderDayPlans) inside a React state updater function. Compute the new state first, call `setItineraryItems(() => newState)`, then fire API calls at the top level.

**Responsive rendering:**
- Desktop and mobile `DayColumn` instances are rendered with JavaScript-based conditional rendering (`useMediaQuery`), NOT CSS `hidden/md:block`. This ensures only one set is mounted at a time so state is always in sync.

---

## Activity Editing (DayColumn)

Itinerary items are edited **inline** within the day column — never in a modal.

- Clicking the pencil icon on an activity card (`SortableDayPlanItem`) sets `editingItemId` in `DayColumn`.
- The item card is replaced in-place by `InlineEditActivity`, a compact form with:
  - A text input (pre-filled with the current description)
  - `[✗ cancel]` — icon-only, fixed 32px width
  - `[✓ Save]` — flex-1, fills remaining width
  - `[🗑 delete]` — icon-only, fixed 32px width
- The layout `[✗] [── Save ──] [🗑]` always fits inside the 200px column — never use full-text buttons inline in a narrow column.
- The "Add activity" button is hidden while editing to keep the column clean.
- Drag handle (`{...listeners}`) is on a separate `<span>` inside `SortableDayPlanItem`, not on the whole item, so the edit button's `onClick` fires without dnd-kit interference.

---

## Share Status Display

Each travel plan card displays who has access to the plan, excluding the current user.

**What is shown:**
- The plan **owner** is always included as an entry (even though they are not in `travel_plan_share`).
- All `pending` and `accepted` entries from `travel_plan_share` are included.
- The current logged-in user is filtered out client-side — you never see your own name.
- `declined` and `revoked` statuses are excluded.

**Display text:**
- Accepted: `✓ Shared with [Name]` — green — name comes from `auth.user_metadata.name`; falls back to email.
- Pending: `⏳ Shared with [email] — waiting for acceptance` — amber.
- On mobile: left-aligned, emails use `break-all` to prevent overflow.
- On desktop (`md:`): right-aligned.

**Implementation:**
- `GET /api/travel-plans/[id]/shares` returns owner entry + collaborator entries. Owner name/email is resolved via `supabase.auth.admin.getUserById(owner_user_id)`. Collaborator names also resolved via `auth.admin.getUserById` (NOT the `profile` table — names live in `user_metadata.name`).
- The status list refreshes automatically after a new invite is sent via `refreshKey` prop pattern in `TravelPlansList`.
- Status is persisted in `travel_plan_share` — survives logout/login.
- Components: `ShareStatusList` (display, `md:items-end` for right-align on desktop) + `useTravelPlanShares` hook (fetches, filters out current user by email).
- `ShareStatusList` is rendered below the full header row in `TravelPlansList` (not inside the buttons column) so it has full card width on mobile.

---

## Auth API Routes

Auth operations that need `APP_BASE_URL` (for email redirect URLs) must go through server-side API routes — never call Supabase auth directly from the client for these flows.

- **Signup**: `POST /api/auth/signup` — calls `supabase.auth.signUp` with `emailRedirectTo: APP_BASE_URL/login`.
- **Forgot password**: `POST /api/auth/forgot-password` — calls `supabase.auth.resetPasswordForEmail` with `redirectTo: APP_BASE_URL/reset-password`.
- `APP_BASE_URL` is a server-only env var (`process.env.APP_BASE_URL`). Never use `window.location.origin` as a substitute when `APP_BASE_URL` is available server-side.
- User names are stored in Supabase `auth.user_metadata.name` (set at signup via `options.data.name`). The `profile` table does not store names — always read names from `auth.admin.getUserById().user_metadata.name`.

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