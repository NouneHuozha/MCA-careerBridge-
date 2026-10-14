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

## Student feedback flags (item 15)

- Students can report incorrect details, broken application links, outdated deadlines, course availability, missing sources, or another issue from institution, course, scholarship, entrance-exam, and opportunity detail pages. Submission requires a signed-in account.
- Reports enter `/admin/feedback-flags` and the admin home Review queue. The workspace filters by status, issue, entity and report date, supports search and CSV export, and provides assignment, review, resolve, and duplicate-dismiss actions.
- Resolving or dismissing requires a closure reason. Reports are audited and never directly edit student-facing catalogue data; admins inspect the linked catalogue record and separately decide any correction.
- Apply `src/db/migrations/0003_feedback_flag_review.sql` before using report intake and the review workflow in a database-backed environment. If storage is unavailable, the admin page explains the migration prerequisite.

## Institution admission information (item 18)

- `/admin/catalogue/institutions/[code]/admission` manages institution- and course-specific admission cycles, dates, process steps, document requirement statuses, fee notes, source evidence, and reviewer checks. It is linked from the institution verification workspace.
- Drafts are stored separately from approved admission records. Save draft never changes student-facing data; Mark verified requires all six reviewer checks, a source title/URL, a cycle, and a reviewer note, then updates the approved record and writes an audit event.
- Student application pages only read verified admission records, show the cycle label and last verification date, and preserve `Not confirmed` separately from `Not required`. Draft changes remain hidden.
- Apply `src/db/migrations/0005_admission_information_editor.sql` before saving drafts or publishing verified values in a database-backed environment. Source links are recorded but are not fetched automatically.

## Entrance exam detail review (item 19)

- `/admin/catalogue/exams/[slug]` provides an exam identity, one-cycle date editor, eligibility sections, document-status checklist, preparation notes, official source evidence, and verification checklist.
- `Save draft` stores proposed values separately from the student-facing catalogue row. The currently published values and verification status remain unchanged until an administrator verifies the draft.
- Verification requires a named cycle, application period, exam date, eligibility summary, conducting body, valid HTTP(S) official source, reviewer note, and explicit evidence confirmation. Unknown details can be recorded as “Not currently confirmed”; absence from the document list never implies “not required.”
- Draft saves and verification decisions are added to audit history. Marking verified publishes only that cycle's reviewed values; dates from separate cycles are not combined.
- Student-facing exam details render the published cycle, application/exam/correction/result dates, and per-document states. Unconfirmed details stay explicit, and generic national/undergraduate claims are not substituted for the reviewed stage.
- Apply `src/db/migrations/0005_entrance_exam_review_details.sql` before using the cycle-specific fields or draft endpoint in a database-backed environment.


## Scholarship detail review (item 20)

- `/admin/catalogue/scholarships/[slug]` reviews provider, category, education stages, cycle, deadline, eligibility sections, support, document statuses, source metadata, and the reviewer checklist.
- `Save draft` upserts a private `scholarship_review_drafts` record and leaves published catalogue values unchanged. `Mark verified` requires cycle context, a provider, stage, deadline or honest confirmation state, eligibility summary, source evidence, reviewer note, and explicit confirmation before publishing the cycle and audit entry.
- Missing dates, support details, eligibility sections, and documents remain visibly unconfirmed; unreviewed documents are not represented as required. The student-facing page shows each document as Required, Not required, or Not currently confirmed, and displays the published fields and source title/retrieval metadata.
- Apply `src/db/migrations/0006_scholarship_detail_review.sql` before using draft storage or cycle-specific fields in a database-backed environment.


## Source conflict resolution (item 21)

- `/admin/change-history/conflicts` and `/admin/change-history/conflicts/[caseKey]` compare source title/type, checked date, value found, evidence excerpt, and an explicit primary/internal/secondary authority hierarchy.
- No conflicting value is preselected. A reviewer must choose an availability value or edit it to a supported option, add a reason, and confirm evidence review. “Not listed” is not treated as “Not offered”; unresolved records remain unpublished.
- The Screen 21 example for BCA at Modern College is labeled synthetic. It has no fabricated source links and can write only its sample decision and audit event, never a real catalogue row. Real availability publication is limited to guarded institution-course records and requires a current official-source URL plus a compare-and-set check.
- Original source rows and the previous approved value remain in the conflict record and decision audit. Apply `src/db/migrations/0007_source_conflict_resolution.sql` to enable the queue and decision actions. The source fetcher/import conflict detector is not implemented and this screen does not invent live conflicts.

## Catalogue network-error preview (task 39)

- `/admin/catalogue/network-error-preview` is a protected, explicitly labeled visual preview of the catalogue load-error state. It does not fake a live request or change catalogue data.
- The preview offers a retry link to the live catalogue page and a direct route back to the admin review queue. Failure copy makes clear that no catalogue data was changed.
- The catalogue overview links to the preview so admins can inspect the resilience state without disconnecting a service or inducing a real failure.
