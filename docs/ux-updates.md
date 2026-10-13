# CareerBridge UX updates

The existing Next.js, PostgreSQL/Drizzle, guidance engine and catalogue remain in place.

## Interface

- Main content uses a fluid viewport-width layout with responsive edge gutters. Short sign-in and stage-selection forms keep a readable measure.
- Green filled actions are primary. Tinted green controls are secondary; lavender controls save an item.
- Official sources use a dedicated `SourceLink` component, descriptive labels, an external-link icon, and a new-tab notice for assistive technology.
- A persistent back control has a same-app history check and a parent fallback for direct arrivals.
- Detail screens display one topic at a time with keyboard-accessible tabs. Deep links such as `/explore/technology#pathways` select the correct tab.
- The profile makes the next exploration action explicit and keeps every answer editable.
- The mentor is available in a modeless corner panel and on its own page. Chat logs have bounded heights and independent scrolling; long replies and citations can be expanded.
- Counselling retains eight core questions, optional extra details, progress, previous answers, and a non-judgmental “Not sure yet” answer. Finishing opens the profile directly; its exploration actions come first on mobile.
- Anonymous journey answers are attached to the account on sign-in. Signing out clears local journey access on shared devices without deleting account progress. Sign-in return destinations are limited to safe, same-app pages.
- Moving guidance tiles have a pause control. Reduced-motion preferences are respected.
- The two requested footer sentences are removed. Sample-data and verification labels remain beside catalogue facts.

## Images

All editorial photographs are in `public/images/`. `src/lib/images.ts` uses static imports for Next Image optimization and blur placeholders. The main portrait is `public/images/hero-student.png`.

The map can use the existing Google Static Maps integration when a restricted public key is configured. Without it, an explicitly labelled location sketch supports marker selection and institution/directions links. It is not a road map.

## Browser checks

The browser suite is in `tests/ux.spec.ts`, with configuration in `playwright.config.ts`. Run it against the running production preview:

1. `npx playwright install --with-deps chromium`
2. `npx playwright test`

Use `CAREERBRIDGE_TEST_URL` to target a different preview. Tests never launch an additional app server. Screenshots are written to ignored `artifacts/`; traces are in `/tmp/careerbridge-test-results`.

Tests create isolated student accounts under `example.test`; they do not modify the institution catalogue or existing student accounts.

## Admin source refresh settings

- `/admin/sources/settings` stores a source-specific refresh preference (daily, weekly, monthly, quarterly, or manual) and writes every change to the audit history.
- Apply `src/db/migrations/0001_source_refresh_settings.sql` before using the save action in a database-backed environment.
- The scheduled fetcher, parser, and refresh-run history are not implemented yet. The UI labels saved cadence as a preference only and does not claim that a check ran or is scheduled.

## Proposed catalogue change review (item 14)

- `/admin/change-history/proposed/[id]` compares the approved value with a proposed value, displays source evidence and prior decisions, and supports approve, edit-and-approve, keep-current, reject, or keep-pending.
- Apply `src/db/migrations/0002_catalogue_change_proposals.sql` before using proposal storage or decisions in a database-backed environment. The change-history page distinguishes unavailable storage from an empty queue.
- Approved values are applied only to allowlisted text fields after checking that the current catalogue value still matches the proposal's captured value. A concurrent edit leaves the proposal unchanged and returns a conflict message.
- Proposals may be created through the admin-only `/api/admin/change-proposals` endpoint. The scheduled source fetcher/parser that would discover and submit proposals remains unimplemented; no proposal is fabricated from sample data.
