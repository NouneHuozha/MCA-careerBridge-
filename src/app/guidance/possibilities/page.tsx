import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, HeartPulse, Leaf, Monitor, UsersRound } from "lucide-react";
import { findQuestion } from "@/data/counselling";
import { suggestFields, type FieldSuggestion } from "@/recommendation/engine";
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

function answerLabels(state: NonNullable<Awaited<ReturnType<typeof getSessionState>>>, key: string, kind: "subject" | "interest" | "strength" | "goal" | "value") {
  const question = findQuestion(key);
  return (state.answers[key]?.values ?? []).map((value) => question?.options?.find((option) => option.value === value)?.label ?? labelFor(kind, value));
}

function reasonFor(suggestion: FieldSuggestion) {
  return suggestion.reasons[0]?.detail ?? "This is a broad area you can understand before deciding whether it feels useful to explore.";
}

function DirectionCard({ suggestion }: { suggestion: FieldSuggestion }) {
  return <article className="flex min-w-0 flex-col rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-6 shadow-[0_5px_22px_-20px_rgba(40,69,60,.5)] sm:px-7 sm:py-7"><div className="grid h-20 w-20 place-items-center self-center rounded-full bg-[#e8f0ec] text-[#286b61]"><DirectionIcon slug={suggestion.field.slug} /></div><h2 className="mt-6 text-center font-serif text-[1.55rem] leading-[1.12] text-[#26312c]">{suggestion.field.name}</h2><p className="mt-4 min-h-[72px] font-serif text-[1.05rem] leading-[1.42] text-[#525950]">{suggestion.field.overview}</p><div className="mt-5 border-t border-[#e7e3da] pt-4"><p className="font-serif text-[1rem] leading-[1.4] text-[#525950]">{reasonFor(suggestion)}</p></div><Link href={`/guidance/direction/${encodeURIComponent(suggestion.field.slug)}`} className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-[#286b61] px-5 py-3 text-center font-serif text-[1.05rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4">Explore this possibility</Link></article>;
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

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1220px]">
    <div className="text-center"><h1 className="font-serif text-[clamp(2.25rem,5vw,3.9rem)] leading-[1.06] tracking-[-.045em] text-[#202522]">Here are a few directions to explore</h1><p className="mx-auto mt-4 max-w-[850px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">These possibilities are based on what you shared. They are starting points, not predictions or final answers.</p></div>
    <section aria-labelledby="account-title" className="mt-7 flex flex-col gap-4 rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-5 sm:flex-row sm:items-center sm:px-7"><h2 id="account-title" className="shrink-0 font-serif text-[1.45rem] leading-tight text-[#26312c]">What we’re taking into account</h2><div className="flex min-w-0 flex-1 flex-wrap gap-x-6 gap-y-3 sm:justify-end">{signals.length ? signals.map((signal) => <span key={signal} className="inline-flex items-center gap-2 font-serif text-[1rem] text-[#525950]"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#386d63]">•</span>{signal}</span>) : <span className="font-serif text-[1rem] text-[#77786f]">What you choose to share as you explore</span>}</div></section>
    {suggestions.length ? <div className="mt-4 grid gap-4 lg:grid-cols-3">{suggestions.map((suggestion) => <DirectionCard key={suggestion.field.slug} suggestion={suggestion} />)}</div> : <section className="mt-4 rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] p-8 text-center"><h2 className="font-serif text-2xl text-[#26312c]">We need a little more to show possibilities</h2><p className="mt-3 text-sm leading-relaxed text-[#626b63]">You can go back and add or change an answer before exploring.</p><Link href="/guidance/review" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#9ebfb2] px-5 text-sm font-semibold text-[#35675b]">Review my answers</Link></section>}
    <section className="mx-auto mt-5 max-w-[600px] border-t border-[#e5e2d8] pt-5 text-center"><h2 className="font-serif text-[1.45rem] text-[#26312c]">Not ready to choose a direction?</h2><Link href="/guidance/not-sure" className="mt-3 inline-flex min-h-11 items-center rounded-xl border border-[#6d9e93] px-5 text-sm font-medium text-[#35675b] transition hover:bg-[#eef5f1]">I’m not sure yet — help me look around</Link><p className="mt-5 font-serif text-[15px] text-[#77786f]">You can explore more than one possibility and change direction later.</p></section>
  </section></main>;
}
