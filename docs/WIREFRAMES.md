# CareerBridge Low-Fidelity Wireframes

**Status:** Structural descriptions for discussion, not visual approval. The palette and screen styling are described in `DESIGN_BRIEF.md`.

## 1. Shared layout concepts

### Public/Explore shell

```text
+----------------------------------------------------------------+
| CareerBridge     Explore Library     How it works     Sign in   |
+----------------------------------------------------------------+
| Page title / short context                                      |
| Main content                                                     |
|                                                                  |
| Footer: limits, privacy, help, sources                           |
+----------------------------------------------------------------+
```

Navigation labels and exact items are not yet final. At mobile widths, provide a clear accessible navigation pattern; do not merely shrink desktop navigation until unreadable.

### My Guidance shell

```text
+----------------------------------------------------------------+
| CareerBridge   My Guidance   My Explorations   Explore   Profile|
+----------------------------------------------------------------+
| < Named return destination   Exploring [direction] · [section]   |
+----------------------------------------------------------------+
| Page-specific content                                            |
+----------------------------------------------------------------+
```

The post-counselling specification describes this as a target model. The exact global header and context bar remain subject to confirmation against the current app.

## 2. Public landing

```text
+----------------------------------------------------------------+
| Brand/navigation                                                |
|                                                                  |
| Main statement: guidance helps you explore, it does not decide   |
| Short explanation                                               |
| [Begin counselling]          [Explore without counselling]       |
|                                                                  |
| How it works: understand -> explore -> compare -> plan            |
| Explore categories: fields/careers, routes, courses, places, etc. |
+----------------------------------------------------------------+
```

Prioritize the two distinct entry points. Do not imply that browsing requires a profile or that counselling guarantees an answer.

## 3. Explore Library index and detail

### Index

```text
+----------------------------------------------------------------+
| Explore Library / category title                                |
| General information label                                        |
| [Search........................] [Filters]                      |
| Category/filter chips (where supported)                          |
| Result count and data/source note                                |
| [Item] [Item] [Item]                                             |
| Empty/error/loading state                                        |
+----------------------------------------------------------------+
```

### Detail

```text
+----------------------------------------------------------------+
| Named back link / breadcrumb                                    |
| Item name + category + general/current-data status              |
| Plain-language summary                                          |
| Key information sections                                        |
| Related paths/items (only where data relationship exists)        |
| Source, verification state and checked date                      |
| [Save, if supported] [Compare, if supported] [Official source]   |
+----------------------------------------------------------------+
```

Do not render unavailable source links as active buttons. Mark the content as general guidance when it is not tied to a current official record.

## 4. Counselling

### Orientation

```text
+----------------------------------------------------------------+
| A supportive introduction                                       |
| What the questions are for; no right answer; can be unsure       |
| Privacy reassurance, without overstating privacy guarantees     |
| [Start counselling]                                             |
+----------------------------------------------------------------+
```

### Question screen

```text
+----------------------------------------------------------------+
| Stage and progress (clear, not exam-like)                        |
| Question group/name                                              |
| Plain-language prompt + short helper                             |
| [Option] [Option] [Not sure yet]                                 |
| Optional other response where appropriate                        |
| [Back]                         [Save/continue]                  |
+----------------------------------------------------------------+
```

Use visible selection states and preserve answers when moving backward. Ensure optional questions are not confused with required questions.

## 5. Profile review and confirmation

### Review

```text
+----------------------------------------------------------------+
| "Here is what we understood"                                    |
| Starting-picture reminder                                        |
| Tabs/sections: Where you are | Interests | Priorities | Context  |
| You told us: ...          [Change]                               |
| We understood: ...        [Change]                               |
| Still unclear: ...                                               |
| [Add optional detail]                                            |
| [Confirm this starting picture]                                 |
+----------------------------------------------------------------+
```

### Confirmation

```text
+----------------------------------------------------------------+
| Starting picture confirmed                                      |
| Compact profile recap                                            |
| "This guides exploration; it does not decide your future."       |
| [Explore possible directions] [Edit answers]                     |
+----------------------------------------------------------------+
```

Confirmation must not be represented as a final result or lock.

## 6. Possibility map

```text
+----------------------------------------------------------------+
| A few directions to explore                                     |
| Short explanation: suggestions are not ranking/prediction        |
| [Direction]           [Direction]           [Direction]          |
| What it is / why it may connect / a caution where relevant       |
| [Explore this possibility] on each direction                    |
| [Not sure yet - help me look around] [Review my answers]         |
+----------------------------------------------------------------+
```

Give directions equal visual weight. Use a data-driven number of options and evidence-based reasons; never show match percentages.

## 7. Direction workspace and routes

### Direction overview

```text
+----------------------------------------------------------------+
| < Back to possibilities | Exploring [direction] · Overview      |
| Direction name + plain-language summary                         |
| Why this may connect (profile evidence) | What the work involves |
| Skills/subjects and practical realities (short preview)          |
| [Explore routes] [See courses] [Explore another direction]       |
+----------------------------------------------------------------+
```

### Routes

```text
+----------------------------------------------------------------+
| < Back to [direction] | Exploring [direction] · Routes          |
| Route cards with equal prominence                                |
| Entry stage / route type / typical duration category             |
| What differs / what to check                                     |
| [Understand this route] [Compare routes]                         |
+----------------------------------------------------------------+
```

### Route detail and courses

```text
+----------------------------------------------------------------+
| Route identity + at-a-glance details                             |
| Plain-language route shape; variable requirements               |
| Checks before choosing a course                                  |
| [Courses in this route] [Compare route]                          |
+----------------------------------------------------------------+
| Course options: equal-weight cards; stage and route context      |
| What each course may emphasize; verified institution availability|
+----------------------------------------------------------------+
```

## 8. Course, institution and practical information

### Course detail

```text
+----------------------------------------------------------------+
| Course identity + level/duration if confirmed                    |
| What students study; possible next study/work directions         |
| Requirements and fees clearly marked as variable/source-based   |
| Related institutions only when a reviewed relationship exists   |
| [Institutions offering this course] [Save] [Compare]              |
+----------------------------------------------------------------+
```

### Institution detail

```text
+----------------------------------------------------------------+
| Institution name + location + source status                      |
| Course-specific availability and verification details            |
| Location/map only when coordinates are verified                 |
| Application/requirements: confirmed vs general preparation      |
| Official source + checked date                                   |
| [Open official source] [Compare] [Save]                           |
+----------------------------------------------------------------+
```

### Exams, scholarships and practical checks

```text
+----------------------------------------------------------------+
| Relevant opportunities/exams, with scope and cycle               |
| Appearing here does not mean the student is eligible             |
| What is confirmed / what needs checking / official source        |
| Checklist: To check | Started | Checked                          |
| One suggested next step + [Save/update action plan]               |
+----------------------------------------------------------------+
```

Avoid a generic dump of all catalogue entries, invented eligibility, blank-as-negative fields and pressure to apply.

## 9. Comparison

```text
+----------------------------------------------------------------+
| Compare [Option A] with [Option B]                               |
| Rows: level/stage, duration, requirements, location, cost/source, |
| further study, availability and uncertainty                      |
| Which differences matter to you?                                 |
| [Save comparison] [Return to exploration]                         |
+----------------------------------------------------------------+
```

Comparison highlights differences; it does not declare a universal winner. Show unknown fields explicitly.

## 10. My Guidance, My Explorations and action plan

### My Guidance

```text
+----------------------------------------------------------------+
| Welcome back / compact profile reminder                          |
| [Continue where you left off]                                    |
| A few useful next checks                                         |
| Your explorations (resume links)                                 |
| Saved items / comparisons (compact entry points)                 |
+----------------------------------------------------------------+
```

### My Explorations

```text
+----------------------------------------------------------------+
| Direction workspace list                                         |
| Each: last meaningful location, saved items, comparisons, checks  |
| [Resume this exploration]                                        |
+----------------------------------------------------------------+
```

### Action plan

```text
+----------------------------------------------------------------+
| Next steps for [focus]                                           |
| Small editable checklist; status and source/context               |
| [To check] [Started] [Checked]                                    |
| [Open relevant official source]                                  |
+----------------------------------------------------------------+
```

Do not turn this into a raw click history or a project-management dashboard.

## 11. Admin data workflows

### Workbook import

```text
+----------------------------------------------------------------+
| Upload workbook / choose dataset                                 |
| Import status and validation summary                             |
| Row-level errors and proposed changes                            |
| Review diff: current value vs workbook value                     |
| [Approve selected] [Reject] [Download error report]              |
| Published/import history and rollback entry point                |
+----------------------------------------------------------------+
```

### Changing fact review

```text
+----------------------------------------------------------------+
| Source and last checked status                                   |
| Detected value vs currently approved value                       |
| Official source link, retrieval time, evidence and conflict state |
| [Approve] [Edit and approve] [Keep current] [Reject] [Pending]    |
| Decision note and audit history                                  |
+----------------------------------------------------------------+
```

These are target structural concepts. The final admin process, roles, import formats and source automation are not fully specified.
