import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Check, GraduationCap, MapPin, Sprout } from "lucide-react";
import { findQuestion } from "@/data/counselling";
import { getSessionState, labelFor } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your starting picture is confirmed" };

const stageLabels = { class10: "Class 10", class12: "Class 12" } as const;
const stageDetails: Record<string, string> = { studying: "currently studying", completed: "course completed", awaiting_results: "results available", deciding: "taking some time to decide what comes next" };
const preferenceLabels: Record<string, string> = {
  "home-district": "prefer staying near my district",
  "within-nagaland": "prefer studying within Nagaland",
  "outside-open": "open to studying outside Nagaland",
  "with-people": "working closely with people",
  independent: "working mostly on my own",
  "hands-on": "learning by doing",
  outdoors: "outdoors and moving around",
  mixed: "a mix of activities",
  low: "keeping costs manageable",
  moderate: "keeping costs manageable",
  flexible: "fees are not the main constraint",
  unsure: "still learning what fees may be manageable",
  yes: "scholarship information may help",
  maybe: "keeping scholarship information in view",
  no: "scholarships are not a priority right now",
};

function labelsFor(state: NonNullable<Awaited<ReturnType<typeof getSessionState>>>, key: string, kind: "subject" | "interest" | "strength" | "goal" | "value") {
  const question = findQuestion(key);
  return (state.answers[key]?.values ?? []).map((value) => question?.options?.find((option) => option.value === value)?.label ?? labelFor(kind, value));
}

function join(values: string[], fallback: string) {
  return values.length ? values.join(" · ") : fallback;
}

export default async function ProfileConfirmationPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const snapshot = state.snapshot;
  const stage = stageLabels[state.stage];
  const stageDetail = stageDetails[state.stageDetail ?? ""];
  const subjects = labelsFor(state, "subjects_enjoy", "subject");
  const interests = labelsFor(state, "interests", "interest");
  const strengths = labelsFor(state, "strengths", "strength");
  const goals = labelsFor(state, "goals", "goal");
  const values = labelsFor(state, "values", "value");
  const location = snapshot.locationPref ? preferenceLabels[snapshot.locationPref] : null;
  const practical = [snapshot.budget ? preferenceLabels[snapshot.budget] : null, snapshot.scholarshipNeed ? preferenceLabels[snapshot.scholarshipNeed] : null].filter((value): value is string => Boolean(value));
  const summary = [
    { icon: GraduationCap, value: join([stage, ...(stageDetail ? [stageDetail] : [])], stage) },
    { icon: BookOpen, value: join([...subjects, ...interests, ...strengths].slice(0, 5), "Your interests and strengths are still taking shape") },
    { icon: Sprout, value: join([...goals, ...values, ...practical].slice(0, 5), "Your priorities are still open") },
    { icon: MapPin, value: location ?? "Study location is still open" },
  ];

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto flex max-w-[760px] flex-col items-center text-center">
    <p className="inline-flex rounded-full bg-[#e8f0ec] px-4 py-1.5 text-xs font-medium text-[#47766c]">Your profile</p>
    <span aria-hidden className="mt-5 grid h-20 w-20 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><Check className="h-10 w-10" strokeWidth={2.2} /></span>
    <h1 className="mt-5 font-serif text-[clamp(2.25rem,5vw,3.7rem)] leading-[1.07] tracking-[-.045em] text-[#202522]">Your starting picture is confirmed</h1>
    <p className="mt-4 max-w-[650px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">We’ll use this information to show possible directions worth exploring.<br className="hidden sm:block" /> It does not decide your future, and you can update it later.</p>
    <section aria-labelledby="summary-title" className="mt-8 w-full rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-5 text-left shadow-[0_5px_24px_-20px_rgba(40,69,60,.45)] sm:px-8"><h2 id="summary-title" className="font-serif text-[1.5rem] leading-tight text-[#26312c]">What we’ll keep in mind</h2><div className="mt-3">{summary.map(({ icon: Icon, value }, index) => <div key={value} className={`flex items-center gap-4 py-3.5 ${index ? "border-t border-[#e7e3da]" : ""}`}><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf2eb] text-[#386d63]"><Icon className="h-5 w-5" strokeWidth={1.7} /></span><p className="font-serif text-[1.02rem] leading-[1.35] text-[#424a43]">{value}</p></div>)}</div></section>
    <p className="mt-5 text-sm text-[#77786f]">Some details may still need checking as you explore.</p>
    <div className="mt-5 flex w-full max-w-[430px] flex-col items-center"><Link href="/guidance/possibilities" className="inline-flex min-h-[58px] w-full items-center justify-center rounded-xl bg-[#286b61] px-6 py-4 font-serif text-[1.15rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4">Explore possible directions</Link><Link href="/guidance/review?mode=correct" className="mt-2 inline-flex min-h-11 items-center px-3 font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Go back and edit my answers</Link></div>
    <p className="mt-7 w-full max-w-[560px] border-t border-[#e5e2d8] pt-5 font-serif text-[15px] text-[#77786f]">Your saved explorations will not be deleted if you update your profile later.</p>
  </section></main>;
}
