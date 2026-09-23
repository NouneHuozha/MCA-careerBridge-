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
