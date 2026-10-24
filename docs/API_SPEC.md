# CareerBridge API Specification

**Status:** Current route inventory plus proposed target contract boundaries. The proposed contract is not approved or versioned. Existing handlers are prototype implementation, not a promise of external API stability.

## 1. API design principles

- Keep student and admin capabilities distinct; enforce authorization server-side on every protected operation.
- Validate request shape, value sets, length and ownership at the boundary.
- Use stable, documented resource names and consistent JSON response/error shapes.
- Never expose internal recommendation scores as success probabilities.
- Include source and freshness metadata on time-sensitive catalogue facts.
- Keep unreviewed imports, drafts and source proposals out of student-facing responses.
- Distinguish empty results from unavailable storage, missing records and invalid input.
- Avoid leaking private student data through logs or errors.

Versioning, pagination conventions, rate limits, idempotency and a final common error envelope remain open decisions. The current app uses same-origin Next.js routes; whether a separately versioned public API is needed is undecided.

## 2. Current route inventory

Methods below are those observed in `src/app/api/**/route.ts`. Read routes are same-origin Next.js handlers. This inventory is not a complete wire-level contract; exact request/response schemas, validation and authorization must be confirmed from the current handler before any client depends on them.

### Student and general routes

| Route | Observed methods | Purpose |
|---|---|---|
| `/api/action-plan` | `GET`, `POST` | Read/create or update action-plan context |
| `/api/auth/[action]` | `POST` | Authentication action handler |
| `/api/auth/sign-out` | `POST` | End current session |
| `/api/catalog/[resource]` | `GET` | Read fields, careers, courses, pathways, exams, scholarships or opportunities |
| `/api/comparisons` | `POST` | Save comparison |
| `/api/counselling` | `GET`, `POST` | Read counselling state and submit/skip/complete an answer flow |
| `/api/exploration` | `GET`, `POST`, `PATCH`, `DELETE` | Read/create/update/delete exploration state |
| `/api/exploration/switch-options` | `GET` | List possible direction-switch options |
| `/api/feedback-flags` | `POST` | Submit catalogue feedback/report |
| `/api/health` | `GET` | Health/status endpoint |
| `/api/institutions` | `GET` | Search/filter institutions |
| `/api/institutions/[code]` | `GET` | Read an institution |
| `/api/mentor` | `GET`, `POST` | Read/create Mentor interaction |
| `/api/profile` | `GET` | Read current profile |
| `/api/profile/correction` | `POST` | Correct profile/counselling answers |
| `/api/recommendations` | `GET` | Read direction suggestions |
| `/api/saved` | `GET`, `POST`, `DELETE` | List, save and unsave catalogue records |
| `/api/search` | `GET` | Search catalogue |

### Admin routes

| Route | Observed methods | Purpose |
|---|---|---|
| `/api/admin/admissions/[code]` | `POST` | Save/review admission information |
| `/api/admin/change-history/conflicts/[caseKey]` | `POST` | Decide a source conflict |
| `/api/admin/change-proposals` | `POST` | Create a catalogue change proposal |
| `/api/admin/change-proposals/[id]` | `POST` | Decide/review a proposal |
| `/api/admin/courses` | `POST` | Create course |
| `/api/admin/courses/[slug]` | `PATCH` | Update course |
| `/api/admin/exams` | `POST` | Create exam |
| `/api/admin/exams/[slug]` | `PATCH` | Update/review exam |
| `/api/admin/feedback-flags/[id]` | `PATCH` | Review/update a feedback flag |
| `/api/admin/institution-courses` | `POST`, `PATCH` | Create/update institution-course link |
| `/api/admin/institutions` | `POST` | Create institution |
| `/api/admin/institutions/[code]` | `PATCH` | Update institution |
| `/api/admin/profile` | `GET` | Read admin profile |
| `/api/admin/scholarships` | `POST`, `PATCH` | Create/update scholarship |
| `/api/admin/scholarships/[slug]` | `PATCH` | Update/review scholarship |
| `/api/admin/settings` | `GET`, `PUT` | Read/update admin workspace settings |
| `/api/admin/sources/metadata` | `PATCH` | Update source metadata |
| `/api/admin/sources/settings` | `PATCH` | Update source refresh preference |
| `/api/admin/team` | `GET`, `PATCH` | Read/update admin team |

The exact semantics for routes with multiple write methods, such as `/api/admin/scholarships`, should be verified against implementation before freezing a target contract.

## 3. Current behavior notes

- `/api/counselling` currently accepts answer/skip/complete actions. It restricts question keys to the question bank and constrains answer size/value count; inspect the handler for the authoritative validation rules.
- `/api/catalog/[resource]` is a read-only resource switch and returns 404 for unknown catalogue resources.
- Catalog services may serve bundled fallback data when DB seeding/query is unavailable; callers must not treat that content as verified production data.
- Admin workflows use route-specific authorization and validation. They should not be treated as one uniform permission model without a route-by-route review.
- The current API response shapes and error strings are not normalized in a published schema.

## 4. Proposed target resource map

This map expresses conceptual responsibilities, generally aligned to existing same-origin routes. It does **not** approve exact endpoint paths or payload schemas.

| Resource area | Target operations |
|---|---|
| Counselling | Read current journey; start/resume; save answer; skip where allowed; complete |
| Profile | Read reviewed profile; correct answers; confirm starting picture; read/change profile version |
| Recommendations | Generate/read explainable possibilities from a confirmed profile |
| Exploration | Create/open direction workspace; update useful return point; switch while preserving existing state |
| Catalogue | Search/read fields, careers, pathways, courses, institutions, exams, scholarships and opportunities |
| Student saved work | List/save/remove items; read/write comparisons; read/update action plans and checklist items |
| Mentor | Read/create conversation and messages, return citations and explicit insufficient-evidence state |
| Admin catalogue | Import workbook to staging; validate; preview diff/errors; approve/reject/publish; inspect import history |
| Admin source review | Manage approved sources; fetch/record observations; review proposals/conflicts; publish decisions; inspect audit history |
| Feedback | Submit report; assign/review/resolve/dismiss without directly mutating published catalogue facts |

## 5. Proposed response semantics

### Catalogue record

Target catalogue responses should distinguish:

- Stable descriptive content.
- Current/cycle-dependent facts.
- Source identity and official URL where available.
- Retrieved/checked timestamp and verification status.
- Missing/unknown/not-confirmed fields.

Do not convert missing data to zero, false, free, not required or ineligible.

### Recommendation

Return direction identity, non-directive explanation grounded in profile inputs, relevant cautions and enough provenance to show why it appeared. Internal ordering/rank may exist but must not be exposed as a probability or a claim of suitability.

### Errors

Proposed categories: invalid request, unauthenticated, forbidden, not found, conflict/stale update, rate-limited, unavailable dependency and unexpected server failure. Final status codes and JSON schema need agreement. Errors must be actionable without leaking secrets or private profile details.

### Import and review

Import APIs should be asynchronous only if the chosen workbook size/runtime requires it. The endpoint should return an import identifier and explicit status; row errors must be addressable; publish must require authorization and successful review. This is a proposal, not a current implementation claim.

## 6. Authorization boundary (target requirement)

- Public/general catalogue reads may be available to guests subject to product decision.
- A student may read/update only their own counselling, profile, saved items, comparisons and plans.
- Anonymous data must be scoped to a server-controlled journey identity and must not be selectable by arbitrary client-supplied owner IDs.
- Admin data reads/writes require an authorized admin role and audit records for consequential changes.
- Feedback submission should not directly publish a catalogue correction.

## 7. Contract work required before implementation

- Confirm same-origin internal API versus separately versioned API.
- Define canonical error envelope, pagination/filter conventions and cache policy.
- Document each route's schema, status codes, authorization, idempotency and side effects.
- Decide whether writes use route handlers, server actions or both and how their behavior is shared.
- Define anonymous identity, account migration and ownership checks.
- Define source/freshness schemas and conflict handling.
- Generate or maintain machine-readable request/response schemas and contract tests.
