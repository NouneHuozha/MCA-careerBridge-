# CareerBridge Work Breakdown

**Status:** Planning backlog; no dates, owners or release commitments have been assigned. Items labeled "proposal" require review before implementation.

Use this file as a working list, not as evidence that a task is in progress or complete. Update statuses only after confirming the current codebase and environment.

## 1. Establish current baseline

- [ ] Record current prototype route, data and test behavior as a baseline.
- [ ] Confirm which existing uncommitted code changes are intended to remain in the project.
- [ ] Establish a repeatable local development and preview workflow.
- [ ] Add/confirm a canonical Playwright test script; the current package does not define `npm run test`.
- [ ] Run typecheck, lint, tests and build against a documented environment; resolve failures without hiding them.

## 2. Confirm product scope and student flow

- [ ] Confirm first-release outcomes and explicitly defer non-MVP features.
- [ ] Review the Explore Library and My Guidance navigation distinction.
- [ ] Validate the counselling questions and profile review with intended students.
- [ ] Confirm how an unsure student explores without being forced to choose.
- [ ] Confirm My Guidance, My Explorations, saved items, comparison and action-plan scope.
- [ ] Agree success measures and a student feedback/research approach.

## 3. Confirm privacy, identity and persistence

- [ ] Define anonymous journey identity, persistence duration and recovery.
- [ ] Specify guest-to-account migration and conflict handling.
- [ ] Define sign-out/shared-device behavior and account deletion.
- [ ] Decide what student information is necessary, optional and prohibited.
- [ ] Decide consent, retention, deletion and access rules appropriate for minors.
- [ ] Define Mentor conversation retention and whether conversation history is saved.

## 4. Establish authoritative catalogue data

- [ ] Locate or create the authoritative workbook(s); identify owner and update cadence.
- [ ] Agree workbook templates, required columns, stable identifiers and allowed values.
- [ ] Reconcile current bundled sample data against verified records; retain sample labels until approved.
- [ ] Define source authority and verification vocabulary.
- [ ] Decide which Nagaland records/categories are needed for the first release.
- [ ] Verify institution, course, exam and scholarship relationships.
- [ ] Record source URL/title and checked date for all time-sensitive facts.
- [ ] Validate regional/national opportunity scope and catalogue counts.

## 5. Build and validate catalogue import workflow

- [ ] Define file storage, access, size/type limits and original workbook retention.
- [ ] Implement staged workbook upload and parsing.
- [ ] Implement row-level validation for required fields, duplicates, references and formats.
- [ ] Preview diffs and validation results before approval.
- [ ] Add review roles, approval rules, rejection reasons and audit records.
- [ ] Publish approved rows transactionally and preserve import history.
- [ ] Define rollback/correction procedure and test partial-failure behavior.
- [ ] Keep draft/unapproved values out of public and personalized catalogue APIs.

## 6. Design official-source refresh and review

- [ ] Define approved sources and which facts each source can authoritatively support.
- [ ] Decide schedule, refresh scope, retry limits and operational owner.
- [ ] Select fetch/parser runtime and evaluate source terms, access restrictions and reliability.
- [ ] Store observations, retrieved timestamp and evidence separately from approved facts.
- [ ] Generate change proposals; do not automatically publish unreviewed differences.
- [ ] Detect changed-current-value conflicts and support review decisions.
- [ ] Define stale-data thresholds and student-facing fallback language.
- [ ] Test source failures, changed layouts, contradictory sources and expired cycles.

## 7. Confirm and implement target architecture

- [ ] Confirm production hosting, PostgreSQL provider, environments and operations owner.
- [ ] Confirm whether the API remains same-origin Next.js routes or becomes separately versioned.
- [ ] Normalize authorization, validation, errors, pagination and cache semantics.
- [ ] Reconcile Drizzle schema and manual SQL migrations; establish one recorded migration process.
- [ ] Add required foreign keys, uniqueness constraints and indexes after data-model review.
- [ ] Test backup, restore and data migration with a disposable database.
- [ ] Define observability and operational alerting without logging unnecessary student data.

## 8. Complete student product behavior

- [ ] Verify profile edits update recommendations and preserve saved direction state.
- [ ] Confirm direction-specific history, return points and state persistence.
- [ ] Complete comparisons for approved item types and define missing-value behavior.
- [ ] Finalize action plan tasks/statuses and avoid universal, unverified application advice.
- [ ] Add verified-source and freshness states consistently across catalogue detail pages.
- [ ] Decide whether reminders/maps are in scope and specify consent/data needs before implementation.
- [ ] Define Mentor grounding, citations, limits, insufficient-evidence response and provider fallback.

## 9. Design-system and accessibility work

- [ ] Confirm primary palette use and supporting-color policy.
- [ ] Audit local inline styling and establish shared semantic tokens.
- [ ] Approve global/mobile navigation and contextual return pattern.
- [ ] Produce screen-specific behavior and responsive references before redesign implementation.
- [ ] Audit keyboard, screen reader, reduced motion and contrast on both product areas.
- [ ] Conduct usability testing at target widths and with students before making usability claims.

## 10. Quality and release readiness

- [ ] Expand unit and integration tests for recommendation, import, source review and authorization.
- [ ] Add guest/account ownership and cross-user access tests.
- [ ] Add tests for no-data, stale-data, DB outage, source outage and conflict states.
- [ ] Add contract tests after API_SPEC contracts are approved.
- [ ] Add automated migration and disposable PostgreSQL integration checks.
- [ ] Define release acceptance criteria, privacy review and operational runbooks.
- [ ] Verify approved catalogue records and source freshness before any public launch.

## 11. Suggested dependency order

The ordering below is a planning suggestion, not a committed schedule:

1. Establish baseline and confirm product scope.
2. Decide privacy, identity and persistence requirements.
3. Identify authoritative workbook and source owners.
4. Approve data model and ingestion/source review workflows.
5. Confirm API and migration strategy.
6. Implement a narrow vertical slice using verified data.
7. Test the student journey and iterate with users.
8. Expand catalogue coverage and integrations after the slice is validated.
