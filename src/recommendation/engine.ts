/**
 * Career Exploration & Guidance Engine
 * -----------------------------------------------------------------------------
 * This module deliberately does NOT predict careers. It compares what the
 * student told us with the tags on each field/pathway and returns "areas worth
 * exploring", each with the specific reasons behind it, honest cautions, and
 * scenario alternatives.
 *
 * `relevance` is an internal ordering signal only. It is never shown to the
 * student as a percentage, probability, or match score.
 */
import type { Field, Pathway } from "@/services/catalog";
import { getFields, getPathways } from "@/services/catalog";
import { labelFor, type StudentSnapshot } from "@/services/profile";

export type ReasonFactor = "interest" | "academic" | "strength" | "goal" | "value" | "practical";

export type Reason = { factor: ReasonFactor; detail: string; weight: number };

export type FieldSuggestion = {
  field: Field;
  relevance: number;
  headline: string;
  reasons: Reason[];
  cautions: string[];
  overlap: {
    interests: string[];
    subjects: string[];
    strengths: string[];
    goals: string[];
    values: string[];
  };
};

export const FACTOR_LABELS: Record<ReasonFactor, string> = {
  interest: "Interest",
  academic: "Academic preference",
  strength: "Strengths",
  goal: "Goals",
  value: "What you value",
  practical: "Practical preferences",
};

function overlap(a: string[] | null | undefined, b: string[] | null | undefined): string[] {
  const setB = new Set(b ?? []);
  return (a ?? []).filter((item) => setB.has(item));
}

function listToSentence(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** Fields that usually require studying outside Nagaland for the main route. */
const OUTSIDE_STATE_HEAVY = new Set(["law", "arts-design", "media"]);
/** Fields with long study paths before independent work. */
const LONG_PATH = new Set(["healthcare", "science-research", "law"]);

export function scoreField(field: Field, snapshot: StudentSnapshot): FieldSuggestion {
  const interests = overlap(field.interestTags, snapshot.interests);
  const subjects = overlap(field.subjectTags, snapshot.subjectsEnjoy);
  const strengths = overlap(field.strengthTags, snapshot.strengths);
  const goals = overlap(field.goalTags, snapshot.goals);
  const values = overlap(field.valueTags, snapshot.values);

  const reasons: Reason[] = [];
  let relevance = 0;

  if (interests.length) {
    relevance += Math.min(interests.length, 3) * 12;
    reasons.push({
      factor: "interest",
      detail: `You told us you're interested in ${listToSentence(interests.map((i) => labelFor("interest", i).toLowerCase()))}.`,
      weight: Math.min(interests.length, 3) * 12,
    });
  }
  if (subjects.length) {
    relevance += Math.min(subjects.length, 3) * 9;
    reasons.push({
      factor: "academic",
      detail: `You said you enjoy ${listToSentence(subjects.map((s) => labelFor("subject", s)))} — subjects that come up often in this field.`,
      weight: Math.min(subjects.length, 3) * 9,
    });
  }
  if (strengths.length) {
    relevance += Math.min(strengths.length, 3) * 8;
    reasons.push({
      factor: "strength",
      detail: `Your stated strengths in ${listToSentence(strengths.map((s) => labelFor("strength", s).toLowerCase()))} are used regularly here.`,
      weight: Math.min(strengths.length, 3) * 8,
    });
  }
  if (goals.length) {
    relevance += Math.min(goals.length, 2) * 7;
    reasons.push({
      factor: "goal",
      detail: `It can fit the kind of future you described: ${listToSentence(goals.map((g) => labelFor("goal", g).toLowerCase()))}.`,
      weight: Math.min(goals.length, 2) * 7,
    });
  }
  if (values.length) {
    relevance += Math.min(values.length, 2) * 5;
    reasons.push({
      factor: "value",
      detail: `You said ${listToSentence(values.map((v) => labelFor("value", v).toLowerCase()))} matters to you, which this field can offer — though it varies by role.`,
      weight: Math.min(values.length, 2) * 5,
    });
  }

  // Practical signals adjust ordering slightly, and are always explained.
  const cautions: string[] = [];
  const staysLocal = snapshot.locationPref === "home-district" || snapshot.locationPref === "within-nagaland";
  if (staysLocal && OUTSIDE_STATE_HEAVY.has(field.slug)) {
    relevance -= 6;
    cautions.push(
      "You preferred studying within Nagaland. Several of the strongest programmes in this field are located outside the state, so local options may be limited.",
    );
  }
  if (staysLocal && !OUTSIDE_STATE_HEAVY.has(field.slug)) {
    reasons.push({
      factor: "practical",
      detail: "Routes into this field exist within Nagaland, which matches your preference to study closer to home.",
      weight: 4,
    });
    relevance += 4;
  }
  if (snapshot.budget === "low") {
    if (["skilled-trades", "education", "agriculture-environment", "government"].includes(field.slug)) {
      relevance += 4;
      reasons.push({
        factor: "practical",
        detail: "Lower-fee government and vocational routes exist here, which fits the budget range you indicated.",
        weight: 4,
      });
    }
    if (field.slug === "healthcare" || field.slug === "law") {
      cautions.push("Some routes in this field involve higher course fees or longer study before earning. Check scholarships early.");
    }
  }
  if (snapshot.performance === "struggling" && LONG_PATH.has(field.slug)) {
    cautions.push(
      "You mentioned studies feel hard right now. This field usually involves a long, exam-heavy path — worth planning a parallel route as well.",
    );
  }

  const difficultClash = overlap(field.subjectTags, snapshot.subjectsDifficult);
  if (difficultClash.length) {
    relevance -= difficultClash.length * 4;
    cautions.push(
      `You said ${listToSentence(difficultClash.map((s) => labelFor("subject", s)))} feel difficult right now, and ${field.name.toLowerCase()} leans on them. That does not rule it out, but it is worth planning support.`,
    );
  }

  if (snapshot.workStyle === "outdoors" && ["agriculture-environment", "engineering", "skilled-trades"].includes(field.slug)) {
    relevance += 5;
    reasons.push({ factor: "practical", detail: "You preferred outdoor work, which is common in this field.", weight: 5 });
  }
  if (snapshot.workStyle === "with-people" && ["healthcare", "education", "social-sciences", "hospitality-tourism"].includes(field.slug)) {
    relevance += 5;
    reasons.push({ factor: "practical", detail: "You preferred working closely with people, which this field involves daily.", weight: 5 });
  }

  const headline = reasons.length
    ? `Worth exploring because of ${listToSentence(
        [...new Set(reasons.slice(0, 2).map((r) => FACTOR_LABELS[r.factor].toLowerCase()))],
      )}.`
    : "A broad field many students explore early on.";

  return {
    field,
    relevance: Math.max(0, Math.min(100, relevance)),
    headline,
    reasons,
    cautions: cautions.length ? cautions : (field.challenges ?? []).slice(0, 1),
    overlap: { interests, subjects, strengths, goals, values },
  };
}

export async function suggestFields(snapshot: StudentSnapshot, limit = 6): Promise<FieldSuggestion[]> {
  const fields = await getFields();
  const scored = fields.map((field) => scoreField(field, snapshot));
  const withSignal = scored.filter((s) => s.reasons.length > 0 && s.relevance > 0);
  const ordered = (withSignal.length >= 3 ? withSignal : scored).sort((a, b) => b.relevance - a.relevance);
  return ordered.slice(0, limit);
}

export type PathwaySuggestion = {
  pathway: Pathway;
  reasons: string[];
};

export async function suggestPathways(snapshot: StudentSnapshot, limit = 4): Promise<PathwaySuggestion[]> {
  const fieldSuggestions = await suggestFields(snapshot, 4);
  const topFields = new Set(fieldSuggestions.map((s) => s.field.slug));
  const all = await getPathways({ stage: snapshot.stage });

  const scored = all.map((pathway) => {
    const reasons: string[] = [];
    let score = 0;
    if (pathway.fieldSlug && topFields.has(pathway.fieldSlug)) {
      score += 10;
      reasons.push(`Connects to ${pathway.fieldSlug.replace(/-/g, " ")}, one of the areas your answers point towards.`);
    }
    if (snapshot.budget === "low" && (pathway.routeType === "vocational" || pathway.routeType === "diploma")) {
      score += 6;
      reasons.push("Shorter, lower-cost route that leads to earning sooner — relevant to the budget range you indicated.");
    }
    if (snapshot.locationPref === "home-district" && pathway.routeType !== "professional") {
      score += 3;
      reasons.push("Can usually be started within Nagaland.");
    }
    if (snapshot.stream === "science" || snapshot.stream === "science-pcm" || snapshot.stream === "science-pcb") {
      if (pathway.fieldSlug === "healthcare" || pathway.fieldSlug === "engineering" || pathway.fieldSlug === "technology" || pathway.fieldSlug === "science-research") {
        score += 5;
        reasons.push("Builds directly on the science subjects you have already studied.");
      }
    }
    if (snapshot.stream === "commerce" && pathway.fieldSlug === "business") {
      score += 5;
      reasons.push("Builds directly on your commerce background.");
    }
    if (snapshot.stream === "arts" && (pathway.fieldSlug === "social-sciences" || pathway.fieldSlug === "education")) {
      score += 5;
      reasons.push("Builds directly on your arts background.");
    }
    return { pathway, score, reasons };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ pathway, reasons }) => ({
      pathway,
      reasons: reasons.length ? reasons : ["A legitimate route from your current stage that many students overlook."],
    }));
}

/* ------------------------------- what-if -------------------------------- */

export type WhatIfScenario = {
  key: string;
  question: string;
  answer: string;
  suggestions: string[];
};

export function whatIfScenarios(field: Field | null, snapshot?: StudentSnapshot | null): WhatIfScenario[] {
  const name = field ? field.name.toLowerCase() : "this direction";
  const scenarios: WhatIfScenario[] = [
    {
      key: "stay-in-state",
      question: "What if I don't want to move outside Nagaland?",
      answer: `Staying in the state narrows some options in ${name}, but rarely all of them. General degrees, computer applications, commerce, education, nursing and allied health, agriculture-linked programmes, engineering diplomas and ITI trades are available within Nagaland, and NIT Nagaland offers engineering degrees.`,
      suggestions: [
        "Filter institutions by your own district first, then widen to the whole state",
        "Check whether the work can be done remotely for employers outside the state",
        "Confirm programme availability on each institution's official source",
      ],
    },
    {
      key: "lower-marks",
      question: "What if my marks are lower than expected?",
      answer:
        "Marks change which doors open immediately, not what you are capable of. Institutions have different cut-offs, diploma routes allow lateral entry into degrees later, and improvement or open-schooling options exist for specific subjects.",
      suggestions: [
        "Apply across a range of institutions rather than only the most competitive",
        "Consider a diploma route with lateral entry into the second year of a degree",
        "Talk to a teacher who knows your work before deciding to repeat a year",
      ],
    },
    {
      key: "fees",
      question: "What if I cannot afford a high-fee college?",
      answer:
        "Government colleges and polytechnics generally charge substantially less than private institutions, and several central and state scholarship schemes exist. CareerBridge shows scholarship names and official portals, but never unverified amounts or deadlines.",
      suggestions: [
        "Compare government options in the institution search",
        "Prepare scholarship documents early — most schemes ask for the same set",
        "Ask the institution directly about instalments and hostel costs",
      ],
    },
    {
      key: "government-job",
      question: "What if I want a government job?",
      answer:
        "Most administrative examinations accept a bachelor's degree in any discipline, so your subject choice matters less than steady preparation. Technical departments also recruit engineering, medical, agriculture and teaching graduates directly.",
      suggestions: [
        "Read the official syllabus in a real advertisement before buying material",
        "Keep a parallel plan while preparing — preparation cycles are long",
        "Check the state public service commission site for the actual notification",
      ],
    },
    {
      key: "not-qualify",
      question: "What if I don't qualify for the course I want?",
      answer: `Almost every field has more than one entry route. In ${name} there are usually shorter or differently-structured programmes that lead to related work, and many students re-enter their first choice later through lateral entry or postgraduate study.`,
      suggestions: [
        "Look at the alternative routes listed on the career page",
        "Consider a related course that keeps the same door open a year later",
        "Ask the mentor to compare two specific options side by side",
      ],
    },
    {
      key: "change-later",
      question: "What if I change my field later?",
      answer:
        "Changing direction is common and usually possible. Postgraduate study, professional certifications and skill-based hiring all allow movement between fields; the cost is usually time rather than a closed door.",
      suggestions: [
        "Choose a first step with more than one exit",
        "Keep general skills strong — English, mathematics, digital literacy",
        "Save the comparison so you can revisit your reasoning later",
      ],
    },
  ];

  if (snapshot?.stage === "class10") {
    scenarios.unshift({
      key: "stream-change",
      question: "What if I pick the wrong stream in Class 11?",
      answer:
        "Stream changes are possible early in Class 11 in many schools, and at graduation level most universities allow a change of direction. A stream shapes your next two years, not your whole life.",
      suggestions: [
        "Talk to your school before the cut-off date if you want to change",
        "Check which degree courses accept students from any stream",
        "Look at what people in the work you like actually studied",
      ],
    });
  }
  return scenarios;
}

/** Honest "why not" considerations for a field, personalised where possible. */
export function whyNotConsiderations(field: Field, snapshot?: StudentSnapshot | null): string[] {
  const points = [...(field.challenges ?? [])];
  if (snapshot) {
    const suggestion = scoreField(field, snapshot);
    for (const caution of suggestion.cautions) {
      if (!points.includes(caution)) points.push(caution);
    }
    if (!suggestion.overlap.interests.length && !suggestion.overlap.subjects.length) {
      points.push(
        "Nothing in your answers so far points towards this field. That does not mean it is wrong for you — but be clear about what draws you to it.",
      );
    }
  }
  return points;
}
