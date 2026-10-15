import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, HeartPulse, Leaf, Monitor, UsersRound } from "lucide-react";
import { findQuestion } from "@/data/counselling";
import { FACTOR_LABELS, suggestFields, type FieldSuggestion } from "@/recommendation/engine";
import { getSessionState, labelFor } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Possibilities to explore" };

function DirectionIcon({ slug }: { slug: string }) {
  if (slug === "technology") return <Monitor aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
  if (slug === "healthcare") return <HeartPulse aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
  if (slug === "government" || slug === "social-sciences") return <UsersRound aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
  if (slug === "agriculture-environment") return <Leaf aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
  return <BriefcaseBusiness aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
}
function SignalIcon({ index }: { index: number }) {
  if (index === 0) return <Monitor aria-hidden className="h-4 w-4" strokeWidth={1.6} />;
  if (index === 1) return <Leaf aria-hidden className="h-4 w-4" strokeWidth={1.6} />;
  return <BriefcaseBusiness aria-hidden className="h-4 w-4" strokeWidth={1.6} />;
}

function answerLabels(state: NonNullable<Awaited<ReturnType<typeof getSessionState>>>, key: string, kind: "subject" | "interest" | "strength" | "goal" | "value") {
  const question = findQuestion(key);
  return (state.answers[key]?.values ?? []).map((value) => question?.options?.find((option) => option.value === value)?.label ?? labelFor(kind, value));
}

function DirectionCard({ suggestion }: { suggestion: FieldSuggestion }) {
  const reasons = suggestion.reasons.slice(0, 2);
  const caution = suggestion.cautions[0];
  return <article className="grid gap-6 border-t border-[var(--cb-line)] py-7 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(250px,.82fr)_minmax(0,1.18fr)] lg:gap-10 lg:py-8">
    <div className="flex items-start gap-5">
      <span aria-hidden className="mt-1 grid h-12 w-12 shrink-0 place-items-center border border-[var(--cb-line)] bg-[var(--cb-surface)] text-[var(--cb-primary)]"><DirectionIcon slug={suggestion.field.slug} /></span>
      <div className="min-w-0"><h2 className="font-serif text-[1.8rem] leading-tight tracking-[-.025em] text-[var(--cb-ink-strong)]">{suggestion.field.name}</h2><p className="mt-3 text-base leading-relaxed text-[var(--cb-ink)]">{suggestion.field.overview}</p></div>
    </div>
    <div className="min-w-0">
      <h3 className="text-sm font-semibold uppercase tracking-[.1em] text-[var(--cb-muted)]">Why it may connect</h3>
      {reasons.length ? <ul className="mt-3 space-y-3">{reasons.map((reason) => <li key={`${reason.factor}:${reason.detail}`} className="border-l-2 border-[var(--cb-secondary-soft)] pl-4"><span className="text-sm font-semibold text-[var(--cb-primary)]">{FACTOR_LABELS[reason.factor]}</span><p className="mt-1 text-base leading-relaxed text-[var(--cb-ink)]">{reason.detail}</p></li>)}</ul> : <p className="mt-3 text-base leading-relaxed text-[var(--cb-ink)]">This is a broad area to learn about; it is not being suggested from a specific answer match.</p>}
      {caution ? <aside className="mt-4 border-l-2 border-[#c9942d] bg-[#fff8e8] px-4 py-3"><h3 className="text-base font-semibold text-[#6b5624]">Worth keeping in mind</h3><p className="mt-1 text-[15px] leading-relaxed text-[#665d49]">{caution}</p></aside> : null}
      <div className="mt-5"><Link href={`/guidance/direction/${encodeURIComponent(suggestion.field.slug)}`} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-lg bg-[var(--cb-primary)] px-5 text-base font-semibold text-white transition hover:bg-[var(--cb-primary-hover)] focus-visible:outline-offset-4">Explore {suggestion.field.name}<span aria-hidden>→</span></Link></div>
    </div>
  </article>;
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

  return <main className="min-h-[calc(100dvh-77px)] bg-[var(--cb-canvas)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:px-12">
    <section className="mx-auto max-w-[1220px]">
      <header className="grid gap-8 border-b border-[var(--cb-line)] pb-7 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)] lg:items-end lg:gap-12">
        <div><p className="text-sm font-semibold uppercase tracking-[.12em] text-[var(--cb-primary)]">A place to begin exploring</p><h1 className="mt-3 max-w-[16ch] font-serif text-[clamp(2.5rem,5vw,4.4rem)] leading-[1.02] tracking-[-.05em] text-[var(--cb-ink-strong)]">A few directions worth looking into.</h1><p className="mt-4 max-w-[62ch] text-[1.05rem] leading-relaxed text-[var(--cb-ink)]">These possibilities reflect some of what you shared. They are starting points—not a ranking, prediction, or final answer.</p></div>
        <section aria-labelledby="account-title" className="border-l-2 border-[var(--cb-secondary-soft)] bg-[var(--cb-surface)] px-5 py-4 sm:px-6"><h2 id="account-title" className="font-serif text-[1.45rem] leading-tight text-[var(--cb-ink-strong)]">What we considered</h2><p className="mt-2 text-[15px] leading-relaxed text-[var(--cb-muted)]">A few signals from your conversation that may be useful while you explore.</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">{signals.length ? signals.map((signal, index) => <span key={signal} className="inline-flex items-center gap-2 text-base text-[var(--cb-ink)]"><span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center border border-[var(--cb-line)] bg-[var(--cb-surface-soft)] text-[var(--cb-primary)]"><SignalIcon index={index} /></span>{signal}</span>) : <span className="text-base text-[var(--cb-muted)]">What you choose to share as you explore</span>}</div></section>
      </header>
      <section aria-label="Possible directions" className="mt-7">
        {suggestions.length ? suggestions.map((suggestion) => <DirectionCard key={suggestion.field.slug} suggestion={suggestion} />) : <div className="border-t border-[var(--cb-line)] py-8"><h2 className="font-serif text-2xl text-[var(--cb-ink-strong)]">We need a little more to show possibilities</h2><p className="mt-3 max-w-[60ch] text-base leading-relaxed text-[var(--cb-ink)]">You can go back and add or change an answer before exploring.</p><Link href="/guidance/review" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[var(--cb-line-strong)] bg-[var(--cb-surface)] px-5 text-[15px] font-semibold text-[var(--cb-primary)]">Review my answers</Link></div>}
      </section>
      <section className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--cb-line)] pt-5"><div><h2 className="font-serif text-[1.55rem] text-[var(--cb-ink-strong)]">Not ready to choose?</h2><p className="mt-1 text-base text-[var(--cb-muted)]">You can look around without committing to a direction.</p></div><Link href="/guidance/not-sure" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--cb-line-strong)] bg-[var(--cb-surface)] px-5 text-[15px] font-semibold text-[var(--cb-primary)] transition hover:bg-[var(--cb-surface-soft)]">Help me look around<ArrowRight aria-hidden className="ml-2 h-4 w-4" /></Link></section>
    </section>
  </main>;
}
