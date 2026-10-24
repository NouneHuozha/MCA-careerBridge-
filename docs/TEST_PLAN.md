# CareerBridge Test Plan

**Status:** Working draft; current repository coverage is separated from target acceptance.

## 1. Objectives

- Verify general browsing and post-counselling guidance remain distinct and understandable.
- Verify counselling is editable, non-judgmental and does not make unsupported predictions.
- Verify guest/account data access and saved progress are correctly scoped.
- Verify catalogue facts communicate source, freshness, missing and unverified states honestly.
- Verify import/review flows do not publish unapproved values.
- Verify responsive, keyboard and reduced-motion behavior.

## 2. Current test setup

- Playwright tests live in `tests/*.spec.ts`.
- `playwright.config.ts` targets Chromium, one worker, reduced motion, and an already-running preview URL (`CAREERBRIDGE_TEST_URL` or `http://localhost:3000`); it does not start a server.
- Current package scripts include `lint` and `typecheck`; there is no `test` script in the current `package.json`.
- The project summary mentions `npm run test`, but that command is not currently configured. Agree and add the canonical test scripts before CI documentation claims that command exists.
- The repo includes tests for UX, progress, profile correction, counselling subjects, legacy route redirects, post-counselling review, and recommendation tag matching.

Do not assume a connected production database or use production student data in tests. Use isolated test identities and disposable test databases/fixtures.

## 3. Existing coverage indicated by test names

| Area | Current test evidence |
|---|---|
| Landing and public entry points | `ux.spec.ts`: landing actions, orientation and visual interactions |
| Counselling | `ux.spec.ts`, `counselling-subjects.spec.ts`: Class 10/12, grouped choices, back/edit, not-sure, optional text, validation and mobile behavior |
| Profile review/correction | `progress.spec.ts`, `profile-correction.spec.ts`, `guidance-review.spec.ts`: review, correction, optional details, retry/error and responsive behavior |
| Recommendation mapping | `recommendation-tag-matches.spec.ts`: subject/strength/value mapping and stream-specific pathway fit |
| Post-counselling journey | `progress.spec.ts`: review, confirmation, possibilities and My Guidance |
| Persistence and shared devices | `progress.spec.ts`: journey persistence/sign-out behavior and action checklist persistence |
| Catalogue interactions | `ux.spec.ts`: source links, filters, map and comparisons |
| Mentor | `ux.spec.ts`: bounded chat interaction |
| Routing | `legacy-routes.spec.ts`: legacy redirects and general routes not redirected |
| Accessibility/responsive | Tests include mobile width/overflow, keyboard focus and reduced-motion configuration; coverage is partial and should be audited |

Test names are evidence of intended checks, not a claim that every behavior has been fully validated.

## 4. Target test layers

### Unit tests

- Recommendation rationale and caution generation for each input category.
- Profile snapshot building and stage-specific question behavior.
- Source-state rendering and freshness classification.
- Workbook parsing, validation, duplicate detection and relationship validation.
- Source change comparison, conflict creation and reviewed publication.
- Ownership and role authorization helpers.

### Integration tests

- Counselling persistence for guest and authenticated profiles.
- Guest-to-account migration, duplicate/conflicting sessions and retries.
- Catalogue read behavior with DB success, empty DB, unavailable DB and clearly labeled sample fallback.
- Admin import transaction boundaries, draft/publish distinction, audit records and rollback.
- Official-source observation, proposal review and conflict handling; no direct publication on fetch.
- Mentor retrieval citation and insufficient-evidence behavior.
- API validation, status codes, authorization and cache behavior.

### End-to-end tests

- Browse general Explore without counselling; verify content is not presented as personalized.
- Complete counselling, review/edit, confirm and see explainable possibilities.
- Explore multiple directions and return to earlier direction without state loss.
- Compare options and create/update a practical plan.
- Verify missing/stale/unverified facts are explicit and official links are only active when valid.
- Exercise admin workbook import through staged review and explicit publication.
- Exercise scheduled-source update through proposal, review and publication using test sources.

## 5. Critical acceptance scenarios

1. A student can begin exploring general information without completing counselling.
2. Personalized suggestions cannot appear as confirmed guidance before profile review/confirmation.
3. Every shown suggestion has an understandable evidence-based explanation; no displayed probability or unsupported "best" claim.
4. Changing an answer refreshes relevant guidance without deleting saved explorations.
5. Switching directions preserves each direction's resume point and saved work.
6. An anonymous student cannot access another anonymous journey by guessing an identifier.
7. An authenticated student cannot read another user's profile, answers, saves, comparisons or action plan.
8. Signing out on a shared device hides the previous journey; account-owned data remains available only after the correct account signs in.
9. A missing fee/deadline/hostel/source remains unknown, not zero, free, absent or not required.
10. A fetched catalogue change is not student-visible until an authorized review/publish decision.
11. A workbook with invalid or ambiguous rows cannot be silently partially published.
12. API/database failures are visible and do not produce success-shaped save messages.

## 6. Accessibility and visual checks

- Keyboard-only journey through navigation, forms, tabs, dialogs, comparisons and admin review.
- Screen-reader labels, headings, live status messages and error association.
- Focus visibility and logical focus order.
- Reduced-motion behavior.
- Contrast target WCAG AA, including disabled, warning, error and source states.
- Responsive widths proposed in the Project Summary: 320, 390, 768, 1024 and 1440 px.
- Verify no horizontal overflow and ensure primary actions, source links and status text remain legible.

## 7. Data correctness checks

- Verify sample data is labeled as sample and never presented as a verified official catalogue.
- Reconcile institution/exam/scholarship counts with the approved master data before quoting counts.
- Confirm each current fact has source URL/title, cycle/context and checked date as required.
- Confirm not-confirmed, not-provided, not-required and unavailable are distinct states.
- Test duplicate, stale and conflicting source observations.

## 8. Release checks

Current executable checks include:

- `npm run typecheck`
- `npm run lint`
- Playwright invocation using the configured preview URL (canonical command to be added/confirmed)
- `npm run build`

Before production, add migration checks and integration tests against a disposable PostgreSQL database, dependency/security checks, accessibility checks, and backup/restore verification. Ownership and thresholds remain to be decided.

## 9. Test data and safety

- Use synthetic student profiles, never real student records.
- Use sample/fixture catalogue records clearly marked as test data.
- Use test-only sources for fetcher/proposal tests.
- Isolate test accounts and clean up only test-created records.
- Keep secrets out of fixtures, logs and screenshots.
