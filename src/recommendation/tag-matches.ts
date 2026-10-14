export type RecommendationTagKind = "subject" | "strength" | "value";

/**
 * Questionnaire labels are intentionally more natural than the field catalog's
 * original tag vocabulary. Keep these aliases here so recommendations can match
 * the new answer IDs without rewriting what the student actually selected.
 */
const ANSWER_TAG_ALIASES: Record<RecommendationTagKind, Record<string, readonly string[]>> = {
  subject: {
    "information-technology": ["computer-science"],
  },
  strength: {
    teamwork: ["people", "communication"],
    "listening-understanding-people": ["people", "communication", "teaching"],
    "patience-persistence": ["practical", "research", "teaching"],
  },
  value: {
    family: ["location", "work-life-balance"],
  },
};

/** Return original answer IDs whose catalog tags match, directly or by alias. */
export function matchingAnswerValues(
  fieldTags: readonly string[] | null | undefined,
  answerValues: readonly string[] | null | undefined,
  kind: RecommendationTagKind,
): string[] {
  const available = new Set(fieldTags ?? []);
  const aliases = ANSWER_TAG_ALIASES[kind];
  return (answerValues ?? []).filter((answer) =>
    available.has(answer) || (aliases[answer] ?? []).some((tag) => available.has(tag)),
  );
}

/** Work-style signals are deliberately modest and only use existing field tags. */
export function matchedWorkStyle(
  fieldStrengthTags: readonly string[] | null | undefined,
  workStyle: string | null | undefined,
): "hands-on" | "independent" | null {
  const tags = new Set(fieldStrengthTags ?? []);
  if (workStyle === "hands-on" && tags.has("practical")) return "hands-on";
  if (
    workStyle === "independent" &&
    ["analytical", "research", "writing", "problem-solving"].some((tag) => tags.has(tag))
  ) {
    return "independent";
  }
  return null;
}
