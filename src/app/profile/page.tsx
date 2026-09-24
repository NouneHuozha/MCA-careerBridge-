import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, CircleHelp, Compass, Edit3, Lightbulb, MapPin, Monitor, Route, Search, Target, Users, WalletCards } from "lucide-react";
import { ButtonLink, EmptyState } from "@/components/ui";
import { CounsellingJourneySidebar } from "@/components/counselling-journey";
import { counsellingStages, type CounsellingStageKey } from "@/data/counselling-journey";
import { questionsForStage } from "@/data/counselling";
import { suggestFields, type FieldSuggestion } from "@/recommendation/engine";
import { getExplorationState, getSessionState, labelFor, nextQuestion, progressFor, type StudentSnapshot } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a direction" };

const sectionByQuestion: Record<string, CounsellingStageKey> = { academics: "about", interests: "interests", strengths: "strengths", goals: "goals", practical: "practical" };
const completedSections: CounsellingStageKey[] = ["about", "interests", "strengths", "goals", "practical"];

function valueLabels(kind: "subject" | "interest" | "strength" | "goal" | "value", values: string[], limit = 2) {
  return values.slice(0, limit).map((value) => labelFor(kind, value));
}

function personalReflection(snapshot: StudentSnapshot) {
  const interests = valueLabels("interest", snapshot.interests);
  const strengths = valueLabels("strength", snapshot.strengths);
  const subjects = valueLabels("subject", snapshot.subjectsEnjoy);
  const opening = interests.length ? `You are curious about ${interests.join(" and ").toLowerCase()}` : subjects.length ? `You enjoy ${subjects.join(" and ").toLowerCase()}` : "You are still discovering what interests you";
  const middle = strengths.length ? ` and you see ${strengths.join(" and ").toLowerCase()} as strengths` : " and your strengths are still taking shape";
  const ending = snapshot.locationPref === "home-district" || snapshot.locationPref === "within-nagaland" ? " You would also like to keep nearby study options in view." : " You are open to comparing routes in different places.";
  return `${opening}${middle}.${ending}`;
}

function TagList({ values, tone = "bg-[#f3f0ff] text-[#5c46ae]" }: { values: string[]; tone?: string }) {
  if (!values.length) return <span className="text-sm text-ink-400">Not shared yet</span>;
  return <div className="flex flex-wrap gap-2">{values.map((value) => <span key={value} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tone}`}>{value}</span>)}</div>;
}

function DirectionCard({ suggestion, index }: { suggestion: FieldSuggestion; index: number }) {
  const colors = ["border-[#b9dfd0] bg-[#f1fbf6]", "border-[#d4c8f3] bg-[#f8f5ff]", "border-[#f0d99a] bg-[#fffaf0]"];
  const reason = suggestion.reasons[0]?.detail ?? "This is a broad direction many students explore from your stage.";
  return <article className={`flex flex-col rounded-[1.5rem] border-2 p-5 shadow-[0_12px_28px_-24px_rgba(12,57,44,.5)] ${colors[index % colors.length]}`}><div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg font-bold text-[#287d65]">{String(index + 1).padStart(2, "0")}</span><span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[.08em] text-[#28775f]">Possible direction</span></div><h3 className="mt-6 text-2xl font-semibold tracking-[-.03em] text-[#092b25]">{suggestion.field.name}</h3><p className="mt-2 text-sm leading-relaxed text-ink-600">{suggestion.field.overview}</p><div className="mt-5 rounded-xl bg-white/75 p-3.5"><p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#28775f]">Why it appeared for you</p><p className="mt-2 text-sm leading-relaxed text-[#28584c]">{reason}</p></div><div className="mt-auto pt-5"><form action="/api/exploration" method="post"><input type="hidden" name="directionSlug" value={suggestion.field.slug} /><button type="submit" className="cb-button cb-button-primary w-full justify-center">Choose this direction<ArrowRight className="h-4 w-4" /></button></form></div></article>;
}

function IncompleteProfile({ state }: { state: NonNullable<Awaited<ReturnType<typeof getSessionState>>> }) {
  const progress = progressFor(state.stage, state.snapshot.answeredKeys);
  const currentQuestion = nextQuestion(state.stage, state.snapshot.answeredKeys);
  const currentSection = currentQuestion ? sectionByQuestion[currentQuestion.section] : "reflection";
  const coreQuestions = questionsForStage(state.stage);
  const doneSections = counsellingStages.filter((stage) => stage.key !== currentSection && stage.key !== "reflection").filter((stage) => coreQuestions.filter((question) => sectionByQuestion[question.section] === stage.key).every((question) => state.snapshot.answeredKeys.includes(question.key))).map((stage) => stage.key);
  const percent = Math.round((progress.answered / Math.max(1, progress.total)) * 100);
  return <div className="flex min-w-0"><CounsellingJourneySidebar currentSection={currentSection} completedSections={doneSections} progress={{ current: currentQuestion ? Math.min(progress.answered + 1, progress.total) : progress.total, total: progress.total }} /><main className="min-w-0 flex-1"><div className="cb-container cb-page mx-auto max-w-[980px]"><p className="cb-eyebrow">Your journey is in progress</p><h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,4.5vw,4rem)] font-semibold leading-[1.04] tracking-[-.05em] text-[#092b25]">Finish your reflection before choosing a direction.</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-500">Your answers help us make the first suggestions useful to you instead of showing a random catalogue.</p><section className="mt-8 rounded-[1.75rem] border border-[#d6e7e2] bg-[#effaf5] p-6 sm:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#155b4d]">Your reflection</p><p className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#092b25]">{progress.answered} of {progress.total} answered</p></div><span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[#28775f]">{percent}% complete</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#d1e8dc]"><div className="h-full rounded-full bg-[#2a9b79]" style={{ width: `${Math.max(4, percent)}%` }} /></div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><ButtonLink href="/counselling">Continue reflection<ArrowRight className="h-4 w-4" /></ButtonLink><ButtonLink href="/" variant="secondary">Return home</ButtonLink></div></section><div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#d2e2f4] bg-[#eff7ff] px-5 py-4"><CircleHelp className="mt-0.5 h-5 w-5 shrink-0 text-[#2877df]" /><p className="text-sm leading-relaxed text-ink-600">When you finish, you will choose a direction to explore first. You do not have to choose a career today.</p></div></div></main></div>;
}

export default async function ProfilePage() {
  const state = await getSessionState();
  if (!state) return <div className="cb-container cb-page"><EmptyState icon={<Compass className="h-5 w-5" />} title="Let’s find your starting point." description="A few short questions help us understand what you want to explore." action={<ButtonLink href="/start">Start here<ArrowRight className="h-4 w-4" /></ButtonLink>} /></div>;
  const progress = progressFor(state.stage, state.snapshot.answeredKeys);
  if (state.status !== "completed" || progress.answered < progress.total) return <IncompleteProfile state={state} />;
  const exploration = await getExplorationState();
  if (exploration) redirect("/my-direction");

  const snapshot = state.snapshot;
  const allSuggestions = await suggestFields(snapshot, 6);
  const suggestions = allSuggestions.slice(0, 3);
  const alternatives = allSuggestions.slice(3, 6);
  const reflection = personalReflection(snapshot);
  const subjects = valueLabels("subject", snapshot.subjectsEnjoy, 4);
  const interests = valueLabels("interest", snapshot.interests, 4);
  const strengths = valueLabels("strength", snapshot.strengths, 4);
  const location = snapshot.locationPref === "home-district" ? "near my own district" : snapshot.locationPref === "within-nagaland" ? "within Nagaland" : "in different places";
  return <div className="flex min-w-0"><CounsellingJourneySidebar currentSection="reflection" completedSections={completedSections} progress={{ current: progress.total, total: progress.total }} /><main className="min-w-0 flex-1"><div className="cb-container cb-page mx-auto max-w-[1200px]"><header className="rounded-[2rem] border border-[#cfe8dc] bg-[#effaf5] px-6 py-8 sm:px-10 sm:py-10"><p className="cb-eyebrow">Reflection complete · Next, choose a direction</p><h1 className="mt-3 max-w-3xl text-[clamp(2.3rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.06em] text-[#092b25]">Choose what you want to explore first.</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">You do not have to choose a career today. Choose one direction to understand, compare, and follow through the next steps.</p></header><section className="mt-7 rounded-[1.5rem] border border-[#d8e8e1] bg-white p-6 shadow-[0_10px_30px_-26px_rgba(12,57,44,.5)] sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-3xl"><p className="cb-eyebrow">What we understood</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em] text-[#092b25]">Your personal starting point</h2><p className="mt-4 text-base leading-relaxed text-ink-700">{reflection}</p></div><Link href="/counselling?edit=interests" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[#28775f] underline decoration-[#9bcdb9] underline-offset-4">Review my answers<Edit3 className="h-4 w-4" /></Link></div><div className="mt-5 flex flex-wrap gap-2"><TagList values={subjects} /><TagList values={interests} tone="bg-[#eaf7ef] text-[#28775f]" /><TagList values={strengths} tone="bg-[#fff4c9] text-[#836a1d]" /><span className="rounded-full bg-[#eef5ff] px-3 py-1.5 text-xs font-semibold text-[#3f70b1]">Study {location}</span></div></section><section className="mt-10"><div className="max-w-2xl"><p className="cb-eyebrow">Your first decision</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#092b25]">Which direction would you like to understand?</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">These three are based on your answers. Pick the one you want to look into first—not the one you think you must choose forever.</p></div><div className="mt-6 grid gap-5 lg:grid-cols-3">{suggestions.map((suggestion, index) => <DirectionCard key={suggestion.field.slug} suggestion={suggestion} index={index} />)}</div></section>{alternatives.length > 0 && <section className="mt-7 rounded-2xl border border-dashed border-[#cfded8] bg-[#fbfdfc] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-[#123f38]">None of these feel right?</h2><p className="mt-1 text-sm text-ink-500">That is okay. Your answers are starting points, not a decision.</p></div><Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6043bd] underline decoration-[#baa9ef] underline-offset-4">Browse all directions<Compass className="h-4 w-4" /></Link></div><div className="mt-4 flex flex-wrap gap-2">{alternatives.map((suggestion) => <form key={suggestion.field.slug} action="/api/exploration" method="post"><input type="hidden" name="directionSlug" value={suggestion.field.slug} /><button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-[#dce9e4] bg-white px-3.5 py-2.5 text-sm font-semibold text-[#28584c] transition hover:border-[#9ccfbc]">{suggestion.field.name}<ArrowRight className="h-4 w-4 text-[#287d65]" /></button></form>)}</div></section>}<section className="mt-10 rounded-[1.5rem] border border-[#dce9e4] bg-[#f7fbf9] p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#287d65]"><Route className="h-5 w-5" /></span><div><p className="cb-eyebrow">What happens after you choose</p><h2 className="mt-1 text-2xl font-semibold tracking-[-.03em] text-[#092b25]">One guided journey, one step at a time</h2></div></div><div className="mt-6 grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-white p-4"><span className="text-xs font-bold text-[#287d65]">01 · Now</span><p className="mt-2 text-sm font-semibold text-[#123f38]">Understand the direction</p></div><div className="rounded-xl border border-[#e0e9e5] p-4"><span className="text-xs font-bold text-ink-400">02 · Next</span><p className="mt-2 text-sm font-semibold text-ink-600">Compare routes</p></div><div className="rounded-xl border border-[#e0e9e5] p-4"><span className="text-xs font-bold text-ink-400">03 · Later</span><p className="mt-2 text-sm font-semibold text-ink-600">Explore courses</p></div><div className="rounded-xl border border-[#e0e9e5] p-4"><span className="text-xs font-bold text-ink-400">04 · Later</span><p className="mt-2 text-sm font-semibold text-ink-600">Find places to study</p></div></div><p className="mt-5 text-sm leading-relaxed text-ink-500">After you choose, we will keep the rest of the website focused on that direction. You can change direction later without repeating your reflection.</p></section><p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-relaxed text-ink-400">Your suggestions come from what you shared. They are not predictions or rankings, and you remain free to change your mind.</p></div></main></div>;
}
