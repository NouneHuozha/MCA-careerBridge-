# CareerBridge Product Requirements

**Status:** Working draft

**Basis:** Project PDFs, current prototype, and decisions discussed with the project owner

**Product purpose:** Stable

**Implementation and scope:** Evolving

This document distinguishes the product intent from the current prototype. It is not a claim that planned integrations or catalogue coverage are complete.

## 1. Product summary

CareerBridge is a career and education guidance platform for students primarily at the Class 10 and Class 12 stages. It begins with Nagaland and is intended to support expansion to the other Northeastern states.

It helps a student understand possible directions, learn how careers connect to education routes and opportunities, compare choices, and identify a practical next step. It guides; it does not choose a career or guarantee an outcome.

## 2. Problem

Students may be unsure what to do after Class 10 or Class 12. Information about careers, courses, pathways, institutions, entrance examinations, scholarships, eligibility and application steps is often distributed across sources, difficult to interpret, incomplete, or out of date. Students may also have limited access to individual counselling and may not know how to compare several options.

CareerBridge should reduce that confusion by presenting understandable, region-aware information and a supportive exploration process.

## 3. Product principles

1. **Guide, do not decide.** Recommendations are exploratory suggestions, not predictions, rankings, diagnoses or guarantees.
2. **Explain relevance.** Personalized directions should say which student-provided signals contributed to their appearance.
3. **Keep choices open.** Students can explore more than one possibility, change answers and return to earlier work without losing saved exploration.
4. **Separate general from personalized.** Browsing before counselling must not imply that content was selected for that student.
5. **Be honest about evidence.** Source, freshness, uncertainty and missing information must be visible. A blank value must not imply a negative fact.
6. **Use student-friendly language.** Questions and guidance should be understandable without prior knowledge of career terminology.
7. **Respect students' privacy and agency.** Ask only for information needed for guidance; many users may be minors.
8. **Design for regional relevance.** Start with Nagaland, while allowing national and Northeast-wide opportunities and future state expansion.

## 4. Users

### Primary

- Students currently studying in Class 10 or Class 12.
- Students who have completed Class 10 or Class 12.
- Students awaiting results or unsure about their next step.

### Supporting users

Parents and guardians, teachers, career counsellors, mentors, school or college support staff, and student-support organizations may use the platform to support conversations with students. Their permissions and access to student data are not yet specified.

## 5. Product experiences

### 5.1 Explore before counselling

Students can browse general career areas, careers, pathways, courses, institutions, exams, scholarships and other opportunities. This experience should work without counselling answers and should clearly identify general guidance versus current, source-dependent facts.

The precise guest save behavior for this area is an open product decision.

### 5.2 My Guidance after counselling

The personalized experience is based on the student's reviewed and confirmed starting picture. The intended flow is:

1. Start and select education stage.
2. Answer accessible questions at the student's pace; allow "Not sure yet" and permitted skips.
3. Review and edit what CareerBridge understood.
4. Confirm the profile as a starting picture, not a final assessment.
5. Explore a manageable set of explainable directions without pressure to choose.
6. Understand a direction, then explore routes and courses.
7. Explore relevant institutions, application requirements, exams and scholarships.
8. Compare choices.
9. Create a small, practical action plan and return to saved work.
10. Ask the Mentor for bounded help understanding or comparing information.

The flow is navigable, not a mandatory linear checklist. Students may enter related details by context and go back safely.

## 6. Functional requirements

### Explore Library

- Browse the general catalogue independently of counselling.
- Search and filter catalogue records where the information is available.
- Distinguish general educational descriptions from institution-specific/current facts.
- Show explicit unavailable, unverified and stale-source states.

### Counselling and profile

- Capture education stage and relevant self-reported academic interests, interests, strengths, goals, values and practical preferences.
- Use plain language and permit uncertainty; avoid collecting unnecessary sensitive information.
- Save progress and allow answers to be revisited and corrected.
- Show the student what they said, what the platform understood and what remains unclear.
- Provide a confirmation step before using the profile for personalized directions.
- Do not imply that answers form a permanent label.

### Directions and exploration

- Present several possible directions supported by the student's answers.
- Explain reasons in student-facing language and identify relevant cautions where appropriate.
- Do not display unsupported match probabilities, fit percentages or claims of a single correct choice.
- Preserve separate exploration state by direction so switching does not erase previous work.
- Allow the student to explore another direction without repeating counselling.

### Catalogue and practical decision support

- Connect fields and careers to pathways, courses, institutions, exams, scholarships, skills and next steps where reviewed relationships exist.
- Support comparisons that show meaningful differences without declaring a universal winner.
- Let students save relevant catalogue items and maintain action plans when persistence is available.
- Identify eligibility and application details as institution- or cycle-dependent unless verified.
- Show official source, source status and checked/retrieved date for changing facts.

### Data administration

- Support a reviewed import workflow for stable structured data prepared in Excel.
- Preserve the source workbook/import record and report validation errors before publication.
- Keep unreviewed data from appearing as approved student-facing information.
- Provide admin review and audit capabilities with role-restricted access.
- Support periodic source checking for changing facts, using approved official sources and a review step before publishing changes.

### Accounts and persistence

- Intended direction: allow students to begin without an account; accounts may support cross-session persistence.
- Intended direction: migrate a student's guest progress when they choose to create or sign into an account.
- Exact persistence duration, deletion behavior, account recovery, consent and shared-device policies need confirmation.

## 7. Geographic and catalogue scope

- Initial focus: Nagaland.
- Future direction: state-by-state expansion across Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Sikkim and Tripura.
- National and Northeast-wide opportunities should remain available when relevant.
- The PDFs report approximate supplied catalogue counts of 423 institutions, 79 examinations and 66 scholarships. These are not verified production counts and must be rechecked against the authoritative dataset before publication.
- The repository's institution seed labels itself a sample dataset. It is not the confirmed master catalogue.

## 8. Non-functional and responsible-use requirements

- Responsive and mobile-first layouts; readable at narrow widths.
- Semantic, keyboard-accessible controls; visible focus; screen-reader support; reduced-motion handling; target WCAG AA contrast.
- Do not reveal one student's profile, answers or saved work to another student.
- Restrict admin functions to authorized users.
- Minimize personal data collection, especially because users may be minors.
- Preserve source attribution and review history for published catalogue facts.
- The Mentor must state when evidence is insufficient, cite sources when available, and not invent current facts.
- CareerBridge is not a school teacher, qualified counsellor, admission authority, scholarship authority, exam body, employment guarantee or future-prediction system.

Legal/compliance requirements, consent flows, retention periods, and the precise target accessibility conformance process are open decisions.

## 9. Success measures

The project PDFs define success through student outcomes: students can begin without confusion, answer questions comfortably, understand the profile and recommendation rationale, see multiple directions, explore related routes, compare without pressure, verify important facts, create a realistic next step and return later.

Quantitative targets, evaluation methods and a student-testing plan have not yet been agreed. Do not invent numeric thresholds in this draft.

## 10. Current prototype versus intended product

### Present in the repository

- Next.js app with general browsing and post-counselling routes.
- Counselling questions, profile review/correction and a recommendation engine.
- Bundled sample/seed catalogue data and a substantial Drizzle schema.
- API route handlers, account/authentication code, admin catalogue/source review screens and Playwright browser tests.
- UI scaffolding for catalogue imports and source-review preferences.

### Not established as production-integrated

- The project owner describes the app as a prototype with hardcoded/sample data and API/database integration still in progress.
- A connected production database, authoritative complete workbook, reviewed production catalogue, scheduled fetcher/parser, operational source-review process and deployment/service-level commitments have not been verified.
- Existing handlers and schema are implementation scaffolding, not proof of an approved stable external API or production data pipeline.

## 11. Open product decisions

- Which exact capabilities constitute the first public/MVP release?
- What can a guest save, for how long, and what exactly migrates to an account?
- Which non-student users may have accounts, and what student-data access is permitted?
- What is the official master workbook, its owner, format and update responsibility?
- Which categories and fields are in-scope for the first verified Nagaland catalogue?
- Which features (Mentor, reminders, maps, external source refresh) are launch requirements versus later experiments?
- What are the consent, privacy, retention and deletion rules for minors and all users?
- What quantitative student-success measures and validation activities will be used?

## 12. Source documents

- `CareerBridge_Project_Documentation.pdf`
- `CareerBridge_Project_Summary.pdf`
- `CareerBridge_Post-Counselling_Architecture_and_UI_Specification.pdf`
- Current application code and tests in `src/` and `tests/`

---

When decisions change, update this document and related flow, architecture, data, API, design and test documents together.
