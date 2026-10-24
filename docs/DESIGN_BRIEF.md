# CareerBridge Design Brief

**Status:** Working direction; screen-specific approval and student testing remain necessary.

## 1. Design purpose

Design a calm, clear and encouraging guidance experience for Class 10 and Class 12 students. Reduce uncertainty by making it easy to understand where the student is, why information is shown, what they can do next and how to return or change direction.

The interface must support two different modes:

- **Explore Library:** general information, not personalized.
- **My Guidance:** personalized, evidence-based exploration after counselling.

Do not make the personalized area look like a test result, career assignment or rigid completion funnel.

## 2. Brand palette

The following are the primary brand colors provided by the project owner. They are the visual foundation, not a strict restriction on supporting colors.

| Role | Name | Hex |
|---|---|---|
| Primary | Deep Forest | `#09332A` |
| Background | Soft Ivory | `#F7F8F5` |
| Surface | Pale Sage | `#DDE4DF` |
| Text | Near Black Green | `#17201B` |
| Accent | Muted Green | `#6F887B` |
| Signature accent | Warm Gold | `#F2CF78` |

Supporting colors may be introduced when they improve accessible contrast, communicate a distinct content category or state, or help navigation. They should complement—not displace—the primary palette. Color must not be the only way to convey a state.

The current global CSS already defines these core colors as tokens; many pages also contain local/inline color values. A later design-system pass should decide which values become shared semantic tokens.

## 3. Visual direction

- Calm, warm, trustworthy and student-respectful; avoid institutional heaviness and childish decoration.
- Keep content scannable and progressively disclosed rather than placing the full education journey on one screen.
- Use equal visual weight for exploratory possibilities; avoid "top match", leaderboard, score and winner treatments.
- Use illustrations and photography only when they support understanding and are appropriately licensed/owned.
- Use clear typography, readable line lengths and strong contrast. The current code uses DM Sans for sans-serif reading/control text and Lora for selected editorial headings; confirm before treating those as permanent typography rules.
- Primary actions should be visually clear and consistent. Secondary actions should not compete with the one main action on each screen.

## 4. Experience patterns

### Explore Library

- Label the area as general exploration.
- Provide browsing/search/filter patterns appropriate to available data.
- Show item facts with their source/freshness status where relevant.
- Do not show an inferred personal relevance rationale without a counselling profile.

### Counselling

- Reassuring introduction before asking personal reflection questions.
- One manageable question or group at a time, clear progress, back/edit support and "Not sure yet" where applicable.
- Make optional questions visibly optional.
- Do not use answer states that imply a diagnosis or judgment.

### Profile review and confirmation

- Make the student's answers and editing controls the priority.
- Distinguish what the student said, what the system understood and what remains unclear.
- Clearly state that confirmation creates a starting point, not a commitment.

### Possibilities and direction workspace

- Show a small, data-driven set of directions with equal prominence and concise reasons grounded in answers.
- Provide an unsure/broad exploration path without forcing a choice.
- Keep a contextual orientation bar or equivalent so students know the direction and section; back controls name destinations.
- Preserve a direction's saved exploration when another direction is opened.

### Catalogue detail and current facts

- Separate stable educational explanation from changing or institution-specific details.
- Use explicit source states such as verified official source, needs verification, source unavailable or information not provided.
- Missing data must not be presented as a negative fact.
- Avoid unsupported maps, coordinates, costs, eligibility or deadlines.

### My Guidance and My Explorations

- My Guidance is the personalized home/resume surface.
- My Explorations preserves meaningful state by direction, not a raw click log.
- Use a small number of clear next actions; avoid completion percentages or a huge dashboard.

## 5. Design tokens and components

The primary palette should eventually map to semantic tokens for:

- Page background, elevated surface, border and text levels.
- Primary action, hover, focus and disabled states.
- Positive/verified, caution/needs-review, unavailable/error and informational states.
- Source-status badges, saved state, comparison state and student answer state.

Component patterns to standardize include global and mobile navigation, contextual back bar, buttons, links, cards, tabs/disclosures, form controls, progress, source links/status, empty/error/loading states, save confirmation and comparison rows.

Do not set final component tokens or supporting-color values solely from existing local page styling; review contrast and consistency first.

## 6. Accessibility and responsive requirements

- Semantic headings, landmarks, lists, form labels and buttons/links with accessible names.
- Full keyboard support and visible focus indicators.
- Do not communicate meaning by color alone.
- Maintain readable text and WCAG AA contrast as a design target.
- Support reduced-motion preferences.
- Specify mobile navigation and responsive behavior before approving each screen.
- The Project Summary names reference widths 320, 390, 768, 1024 and 1440 px; verify actual breakpoints and test real content at these widths.

## 7. Content and tone

- Plain language; explain unfamiliar terms.
- Use non-directive language: "may be worth exploring", "commonly", "varies by institution".
- Avoid promises about success, employment, admission, scholarship eligibility or suitability.
- Tell students what to check and where to verify it.
- Be transparent when data is missing, stale or not confirmed.
- Mentor content should support understanding and comparison, not replace official sources or human advice.

## 8. Approval and validation

Each screen should have an approved behavior specification alongside any visual reference: entry conditions, purpose, required data, uncertain facts, actions, return path, switch behavior, saved state, empty/error states, mobile behavior, accessibility and source/freshness behavior.

Design references are not evidence of correct data or system behavior. Test with students, including the intended age group, before claiming usability success.

## 9. Open design decisions

- Canonical global navigation labels and mobile navigation pattern.
- Final typography and image/illustration rules.
- Supporting color set and semantic status colors.
- Whether each current prototype screen remains in the target product.
- Exact visual style and content density for Explore and My Guidance.
- Student research process, consent and participant safeguards.
