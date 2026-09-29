import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, GraduationCap, MapPin, Pencil, Sprout, UserRound } from "lucide-react";
import { findQuestion } from "@/data/counselling";
import { getSessionState, labelFor } from "@/services/profile";
import { ProfileCorrection } from "@/components/guidance/profile-correction";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review what we understood" };

type ReviewItem = { key: string; value: string };
type ReviewSection = { title: string; icon: typeof GraduationCap; told: string; understood: string; editKey: string; open?: boolean };

const stageLabels = { class10: "Class 10", class12: "Class 12" } as const;
const stageDetails: Record<string, string> = { studying: "currently studying", completed: "course completed", awaiting_results: "waiting for results" };
const preferenceLabels: Record<string, string> = {
  "home-district": "near my own district",
  "within-nagaland": "within Nagaland",
  "outside-open": "open to studying outside Nagaland",
  "with-people": "working closely with people",
  independent: "working mostly on my own",
  "hands-on": "hands-on, practical work",
  outdoors: "outdoors and moving around",
  mixed: "a mix of activities",
  government: "government institutions",
  private: "private institutions",
  either: "either government or private institutions",
  low: "lower-fee options",
  moderate: "moderate fees",
  flexible: "fees are not the main constraint",
  unsure: "not sure about course fees yet",
  yes: "scholarship information",
  maybe: "keeping scholarship information in view",
  no: "scholarships are not a priority right now",
};

function labelsFor(state: NonNullable<Awaited<ReturnType<typeof getSessionState>>>, key: string, kind?: "subject" | "interest" | "strength" | "goal" | "value") {
  const values = state.answers[key]?.values ?? [];
  const question = findQuestion(key);
  return values.map((value) => question?.options?.find((option) => option.value === value)?.label ?? (kind ? labelFor(kind, value) : preferenceLabels[value] ?? value.replace(/-/g, " ")));
}

function joinValues(values: string[], fallback: string) {
  return values.length ? values.join(" · ") : fallback;
}

function editHref(key: string) {
  return `/counselling?edit=${encodeURIComponent(key)}&returnTo=${encodeURIComponent("/guidance/review")}`;
}

function ReviewCard({ section }: { section: ReviewSection }) {
  const Icon = section.icon;
  return <article className="rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-5 shadow-[0_4px_18px_-18px_rgba(40,69,60,.45)] sm:px-7 sm:py-5">
    <div className="grid gap-5 md:grid-cols-[76px_minmax(0,1fr)_minmax(0,1fr)_48px] md:items-start md:gap-5">
      <span aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-[#edf2eb] text-[#386d63]"><Icon className="h-8 w-8" strokeWidth={1.5} /></span>
      <div className="min-w-0"><h2 className="font-serif text-[1.35rem] leading-tight text-[#26312c]">{section.title}</h2><p className="mt-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#778079]">You told us</p><p className="mt-1 font-serif text-[1.02rem] leading-[1.35] text-[#424a43]">{section.told}</p></div>
      <div className="min-w-0 border-t border-[#e7e3da] pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#778079]">We understood</p><p className="mt-1 font-serif text-[1.02rem] leading-[1.35] text-[#424a43]">{section.understood}</p></div>
      <Link href={editHref(section.editKey)} className="inline-flex min-h-10 items-center justify-start gap-1 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42] md:justify-end" aria-label={`Edit ${section.title}`}><span className="md:hidden">Edit</span><Pencil aria-hidden className="h-4 w-4" /><span className="hidden md:inline">Edit</span></Link>
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
  const stage = stageLabels[state.stage];
  const stageDetail = stageDetails[state.stageDetail ?? ""];
  const subjects = labelsFor(state, "subjects_enjoy", "subject");
  const interests = labelsFor(state, "interests", "interest");
  const strengths = labelsFor(state, "strengths", "strength");
  const workStyle = snapshot.workStyle ? preferenceLabels[snapshot.workStyle] : null;
  const goals = labelsFor(state, "goals", "goal");
  const values = labelsFor(state, "values", "value");
  const location = snapshot.locationPref ? preferenceLabels[snapshot.locationPref] : null;
  const practical = [snapshot.budget ? preferenceLabels[snapshot.budget] : null, snapshot.scholarshipNeed ? preferenceLabels[snapshot.scholarshipNeed] : null].filter((value): value is string => Boolean(value));
  const sections: ReviewSection[] = [
    { title: "Where you are now", icon: GraduationCap, told: `I am in ${stage}${stageDetail ? ` and I am ${stageDetail}` : "."}`, understood: `${stage}${stageDetail ? ` · ${stageDetail}` : ""}`, editKey: state.stage === "class10" ? "stream_intent" : "stream_current" },
    { title: "What you enjoy and feel comfortable with", icon: BookOpen, told: joinValues([...subjects, ...interests, ...strengths, ...(workStyle ? [workStyle] : [])].slice(0, 6), "You have not added these details yet."), understood: joinValues([...subjects, ...interests, ...strengths].slice(0, 5), "We are still learning what you enjoy and feel comfortable with."), editKey: "interests" },
    { title: "What matters to you", icon: Sprout, told: joinValues([...goals, ...values, ...practical].slice(0, 6), "You have not added these priorities yet."), understood: joinValues([...goals, ...values].slice(0, 5), "We will keep your priorities open while you review your profile."), editKey: "goals" },
    { title: "What we are still learning", icon: MapPin, told: location ? `I would prefer studying ${location}.` : "I have not shared a study-location preference yet.", understood: location ? `Your study location matters: ${location}.` : "Your study-location preference is still open.", editKey: "location_pref", open: true },
  ];

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1100px]">
    <div className="text-center"><p className="mx-auto inline-flex rounded-full bg-[#e8f0ec] px-4 py-1.5 text-xs font-medium text-[#47766c]">Your profile</p><h1 className="mt-4 font-serif text-[clamp(2.35rem,5vw,4rem)] leading-[1.05] tracking-[-.045em] text-[#202522]">Here’s what we understood</h1><p className="mx-auto mt-4 max-w-[760px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">This is a starting picture, not a final judgement. Check each section and change anything that does not feel right.</p></div>
    <div className="mt-8 space-y-3">{sections.map((section) => <ReviewCard key={section.title} section={section} />)}</div>
    <div className="mx-auto mt-4 flex max-w-[430px] flex-col items-center text-center"><Link href="/guidance/confirm" className="inline-flex min-h-[58px] w-full items-center justify-center rounded-xl bg-[#286b61] px-6 py-4 font-serif text-[1.15rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4">This looks right — continue</Link><Link href="/guidance/complete" className="mt-2 inline-flex min-h-11 items-center px-3 font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Go back and change an answer</Link></div>
    <div className="mx-auto mt-7 flex max-w-[540px] items-center justify-center gap-2 border-t border-[#e5e2d8] pt-5 text-center font-serif text-[15px] text-[#77786f]"><UserRound aria-hidden className="h-4 w-4" />You can update this later. Your saved explorations will not be deleted.</div>
  </section></main>;
}
