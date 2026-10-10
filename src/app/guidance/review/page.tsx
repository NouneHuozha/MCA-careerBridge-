import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Info, Pencil } from "lucide-react";
import { findQuestion } from "@/data/counselling";
import { getSessionState, labelFor } from "@/services/profile";
import { ProfileCorrection } from "@/components/guidance/profile-correction";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages } from "@/data/counselling-journey";

export const dynamic = "force-dynamic";
export const metadata = { title: "Here’s what we understood" };

type ReviewItem = { label: string; value: string };

type SessionState = NonNullable<Awaited<ReturnType<typeof getSessionState>>>;

const stageLabels = { class10: "Class 10", class12: "Class 12" } as const;
const stageDetails: Record<string, string> = {
  studying: "Currently studying",
  completed: "Course completed",
  awaiting_results: "Waiting for results",
  deciding: "Still deciding",
};
const preferenceLabels: Record<string, string> = {
  "home-district": "Near home",
  "within-nagaland": "Within Nagaland",
  "outside-open": "Open to studying outside Nagaland",
  "with-people": "Working closely with people",
  independent: "Working mostly on my own",
  "hands-on": "Hands-on, practical work",
  outdoors: "Outdoors and moving around",
  mixed: "A mix, with variety",
  government: "Government institutions",
  private: "Private institutions",
  either: "Either government or private institutions",
  low: "Lower-fee options would be helpful",
  moderate: "Moderate fees may be possible",
  flexible: "Fees are not the main constraint",
  unsure: "Not sure about course fees yet",
  "prefer-not": "Prefer not to answer",
  yes: "Scholarship information would help",
  maybe: "Keeping scholarship information in view",
  no: "Scholarships are not a priority right now",
};

function labelsFor(state: SessionState, key: string, kind?: "subject" | "interest" | "strength" | "goal" | "value") {
  const values = state.answers[key]?.values ?? [];
  const question = findQuestion(key);
  return values.map((value) => value === "not-sure" ? "Not sure yet" : question?.options?.find((option) => option.value === value)?.label ?? (kind ? labelFor(kind, value) : preferenceLabels[value] ?? value.replace(/-/g, " ")));
}

function joinValues(values: string[], fallback: string) {
  return values.length ? values.join(", ") : fallback;
}

function editProfileHref() {
  return "/guidance/review?mode=correct";
}

function EditLink({ section }: { section: string }) {
  return <Link href={editProfileHref()} aria-label={`Edit ${section}`} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-[#176b62] transition hover:bg-[#f0f6f2] hover:text-[#124e46] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]"><Pencil aria-hidden className="h-4 w-4" strokeWidth={1.8} />Edit</Link>;
}

function SummaryCard({ title, items, editSection }: { title: string; items: ReviewItem[]; editSection: string }) {
  return <article className="min-w-0 rounded-xl border border-[#dfe5df] bg-white px-5 py-4 shadow-[0_4px_18px_-18px_rgba(40,69,60,.45)] sm:px-6 sm:py-5">
    <header className="flex items-start justify-between gap-3">
      <h2 className="font-semibold leading-tight tracking-[-.025em] text-[#20272b] sm:text-[1.15rem]">{title}</h2>
      <EditLink section={editSection} />
    </header>
    <dl className="mt-3 divide-y divide-[#e7e9e5]">
      {items.map((item) => <div key={item.label} className="grid min-w-0 grid-cols-[minmax(92px,.42fr)_minmax(0,1fr)] gap-x-3 py-2.5 text-sm leading-snug sm:grid-cols-[minmax(110px,.42fr)_minmax(0,1fr)]">
        <dt className="text-[#27333a]">{item.label}</dt>
        <dd className="m-0 min-w-0 break-words text-[#68758a]">{item.value}</dd>
      </div>)}
    </dl>
  </article>;
}

function StillOpenCard({ detail }: { detail: string | null }) {
  const optionalDetailHref = "/counselling?edit=anything_else&returnTo=%2Fguidance%2Freview";
  return <article className="min-w-0 rounded-xl border border-[#eee5d4] bg-[#fffdf7] px-5 py-4 shadow-[0_4px_18px_-18px_rgba(40,69,60,.35)] sm:px-6 sm:py-5">
    <header className="flex items-start justify-between gap-3">
      <h2 className="font-semibold leading-tight tracking-[-.025em] text-[#20272b] sm:text-[1.15rem]">Still open</h2>
      <Link href={optionalDetailHref} aria-label="Edit optional detail" className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-[#176b62] transition hover:bg-[#f3f5ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]"><Pencil aria-hidden className="h-4 w-4" strokeWidth={1.8} />Edit</Link>
    </header>
    <p className="mt-3 text-sm leading-relaxed text-[#68758a]">You have not told us everything, and that is okay. You can add more later if it feels useful.</p>
    {detail ? <p className="mt-3 rounded-lg border border-[#eee9dc] bg-white/80 px-3 py-2.5 text-sm leading-relaxed text-[#4c5a54]"><span className="font-medium text-[#344740]">Extra detail you shared:</span> {detail}</p> : null}
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <Link href={optionalDetailHref} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#3d927f] bg-[#f5fbf7] px-4 text-center text-sm font-semibold text-[#176b62] transition hover:bg-[#eaf5ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Add more detail</Link>
      <Link href="/guidance/confirm" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cbd8e3] bg-white px-4 text-center text-sm font-medium text-[#24344c] transition hover:bg-[#f7f9fb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Continue without adding</Link>
    </div>
  </article>;
}

export default async function ProfileReviewPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const params = await searchParams;
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  if (params.mode === "correct") return <ProfileCorrection stage={state.stage} stageDetail={state.stageDetail} answers={state.answers} />;

  const snapshot = state.snapshot;
  const streamKey = state.stage === "class10" ? "stream_intent" : "stream_current";
  const streamValues = labelsFor(state, streamKey);
  const streamAnswer = (state.answers[streamKey]?.values ?? []).includes("not-sure") ? "Not decided yet" : joinValues(streamValues, "Not decided yet");
  const subjectValues = labelsFor(state, "subjects_enjoy", "subject").filter((value) => value.toLowerCase() !== "not sure yet");
  const interestValues = labelsFor(state, "interests", "interest");
  const strengthValues = labelsFor(state, "strengths", "strength");
  const goalValues = labelsFor(state, "goals", "goal");
  const careerValues = labelsFor(state, "values", "value");
  const workStyle = snapshot.workStyle ? preferenceLabels[snapshot.workStyle] ?? snapshot.workStyle.replace(/-/g, " ") : "Not shared";
  const location = snapshot.locationPref && snapshot.locationPref !== "not-sure" ? preferenceLabels[snapshot.locationPref] ?? snapshot.locationPref.replace(/-/g, " ") : "Still open";
  const budget = snapshot.budget ? preferenceLabels[snapshot.budget] ?? snapshot.budget.replace(/-/g, " ") : "Not shared";
  const stage = stageLabels[state.stage];
  const stageDetail = stageDetails[state.stageDetail ?? ""] ?? "Not shared";
  const enjoyedItems: ReviewItem[] = [
    ...(subjectValues.length ? [{ label: "Subjects", value: joinValues(subjectValues, "Not shared") }] : []),
    { label: "Interests", value: joinValues(interestValues, "Not shared") },
    { label: "Strengths", value: joinValues(strengthValues, "Not shared") },
    { label: "Work style", value: workStyle },
  ];
  const mattersItems: ReviewItem[] = [
    { label: "Goals", value: joinValues(goalValues, "Not shared") },
    { label: "Career values", value: joinValues(careerValues, "Not shared") },
    { label: "Study location", value: location },
    { label: "Cost preference", value: budget },
  ];
  const chosenSignals = [...strengthValues, ...interestValues].filter((value) => value.toLowerCase() !== "not sure yet").slice(0, 3);
  const interpretation = chosenSignals.length
    ? `You mentioned ${joinValues(chosenSignals, "")}. These may be useful clues as you explore different directions.`
    : "Some parts of your picture are still open. You can explore different directions and update this later.";
  const anythingElse = state.answers.anything_else?.text?.trim() || null;
  const completedSections = counsellingStages.filter((section) => section.key !== "reflection").map((section) => section.key);
  const answeredCount = state.snapshot.answeredKeys.length;

  return <CounsellingJourneyShell currentSection="reflection" completedSections={completedSections} progress={{ current: answeredCount, total: answeredCount }} variant="grouped">
    <section className="min-w-0 pb-5" aria-labelledby="review-heading">
      <header className="mb-5">
        <p className="inline-flex rounded-full bg-[#edf6f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-[#1b7165]">Step 5 of 5</p>
        <h1 id="review-heading" className="mt-3 font-semibold text-[clamp(2rem,4vw,3.15rem)] leading-[1.04] tracking-[-.045em] text-[#111827]">Here’s what we understood</h1>
        <p className="mt-2 max-w-[850px] text-[clamp(1rem,1.35vw,1.15rem)] leading-relaxed text-[#68758a]">This is a starting picture, not a final judgement. Check each section and change anything that doesn’t feel right.</p>
      </header>

      <div className="grid min-w-0 gap-3 lg:grid-cols-2">
        <SummaryCard title="Where you are now" editSection="Where you are now" items={[
          { label: "Study stage", value: stage },
          { label: "Current status", value: stageDetail },
          { label: "Stream / context", value: streamAnswer },
        ]} />
        <SummaryCard title="What you enjoy and bring" editSection="What you enjoy and bring" items={enjoyedItems} />
        <SummaryCard title="What matters to you" editSection="What matters to you" items={mattersItems} />
        <StillOpenCard detail={anythingElse} />
      </div>

      <aside role="note" className="mt-3 flex items-start gap-3 rounded-lg border border-[#dce5ec] bg-[#f7fafc] px-4 py-3 text-sm leading-relaxed text-[#61708b]">
        <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#607494]" />
        <p className="m-0">{interpretation}</p>
      </aside>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#e4e8e7] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={editProfileHref()} className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg px-1 text-[1rem] font-medium text-[#263b55] transition hover:text-[#176b62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]"><ArrowLeft aria-hidden className="h-5 w-5" />Go back and edit</Link>
        <Link href="/guidance/confirm" className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-lg bg-[#087663] px-5 py-3 text-center font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#066555] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286b61]">This starting picture feels right — continue<ArrowRight aria-hidden className="h-5 w-5" /></Link>
      </div>
    </section>
  </CounsellingJourneyShell>;
}
