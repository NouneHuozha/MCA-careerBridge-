import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { findQuestion } from "@/data/counselling";
import { FACTOR_LABELS, suggestFields } from "@/recommendation/engine";
import { getSessionState, labelFor } from "@/services/profile";
import { DirectionStudio, type DirectionStudioOption } from "@/components/guidance/direction-studio";

export const dynamic = "force-dynamic";
export const metadata = { title: "Possibilities to explore" };

function answerLabels(state: NonNullable<Awaited<ReturnType<typeof getSessionState>>>, key: string, kind: "subject" | "interest" | "strength" | "goal" | "value") {
  const question = findQuestion(key);
  return (state.answers[key]?.values ?? []).map((value) => question?.options?.find((option) => option.value === value)?.label ?? labelFor(kind, value));
}

export default async function PossibilityMapPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const suggestions = await suggestFields(state.snapshot, 3);
  const signals = [
    ...answerLabels(state, "interests", "interest"),
    ...answerLabels(state, "subjects_enjoy", "subject"),
    ...answerLabels(state, "strengths", "strength"),
    ...answerLabels(state, "goals", "goal"),
    ...answerLabels(state, "values", "value"),
  ].filter((value, index, values) => values.indexOf(value) === index).slice(0, 3);
  const options: DirectionStudioOption[] = suggestions.map((suggestion) => ({
    slug: suggestion.field.slug,
    name: suggestion.field.name,
    overview: suggestion.field.overview,
    tagline: suggestion.field.tagline ?? null,
    headline: suggestion.headline,
    reasons: suggestion.reasons.slice(0, 3).map((reason) => ({ label: FACTOR_LABELS[reason.factor], detail: reason.detail })),
    caution: suggestion.cautions[0] ?? null,
    whatPeopleDo: suggestion.field.whatPeopleDo ?? [],
    usefulSubjects: suggestion.field.usefulSubjects ?? [],
    skills: suggestion.field.skills ?? [],
    pros: suggestion.field.pros ?? [],
    challenges: suggestion.field.challenges ?? [],
    alternatives: suggestion.field.alternatives ?? [],
  }));

  return <main className="cb-possibilities-page">
    <div className="cb-possibilities-wrap">
      {options.length ? <DirectionStudio options={options} signals={signals} /> : <section className="cb-possibilities-empty">
        <p>YOUR PERSONALISED EXPLORATION</p>
        <h1>We need a little more to show possibilities</h1>
        <span>You can go back and add or change an answer before exploring.</span>
        <Link href="/guidance/review">Review my answers <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      </section>}
    </div>
  </main>;
}
