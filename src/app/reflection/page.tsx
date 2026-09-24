import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Heart, Lightbulb, MapPin, Puzzle, UserRound } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AnswerTag, GuidanceTag, OpenQuestionCard, OpenTag, PrimaryAction, QuestionLink, ReflectionDisclosure, ReflectionHero, SecondaryAction, SectionHeading, SourceTag, StageBadge, StartingPointShell, SummaryCard, TagRow } from "@/components/starting-point-shell";
import { findQuestion, optionalQuestionsForStage } from "@/data/counselling";
import { getSessionState, labelFor } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "My starting point" };

const priorityOptionalQuestions = ["work_style", "subjects_difficult", "scholarship_need", "home_district"];

function answerLabels(state: Awaited<ReturnType<typeof getSessionState>>, key: string, kind?: "subject" | "interest" | "strength" | "goal" | "value") {
  if (!state) return [];
  const values = state.answers[key]?.values ?? [];
  const question = findQuestion(key);
  return values.map((value) => {
    const option = question?.options?.find((item) => item.value === value);
    if (option) return option.label;
    return kind ? labelFor(kind, value) : value.replace(/-/g, " ");
  });
}

function preferenceLabel(value: string | null) {
  if (!value) return [];
  const labels: Record<string, string> = {
    "home-district": "Near my district",
    "within-nagaland": "Within Nagaland",
    "outside-open": "Open to studying outside Nagaland",
    "with-people": "Working with people",
    independent: "Working independently",
    "hands-on": "Hands-on learning",
    outdoors: "Outdoors and on the move",
    mixed: "A mix of activities",
    government: "Prefer government institutions",
    private: "Prefer private institutions",
    either: "Open to either",
    yes: "Scholarships matter",
    maybe: "Scholarships may help",
    no: "Scholarships are not a priority",
    "day-scholar": "Stay at home",
  };
  return [labels[value] ?? value.replace(/-/g, " ")];
}

export default async function ReflectionPage() {
  const [state, user] = await Promise.all([getSessionState(), getCurrentUser()]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  const snapshot = state.snapshot;

  const categories = [
    { label: "Interests", icon: Heart, values: answerLabels(state, "interests", "interest"), tone: "green" as const },
    { label: "Subjects", icon: BookOpen, values: answerLabels(state, "subjects_enjoy", "subject"), tone: "blue" as const },
    { label: "Strengths", icon: Puzzle, values: answerLabels(state, "strengths", "strength"), tone: "green" as const },
    { label: "Learning style", icon: UserRound, values: preferenceLabel(snapshot.workStyle), tone: "blue" as const },
    { label: "Location preference", icon: MapPin, values: preferenceLabel(snapshot.locationPref), tone: "yellow" as const },
  ];

  const strengths = answerLabels(state, "strengths", "strength");
  const interests = answerLabels(state, "interests", "interest");
  const subjects = answerLabels(state, "subjects_enjoy", "subject");
  const guidance = [
    ...(strengths.some((value) => /problem|analytical|research/i.test(value)) || interests.some((value) => /technology|engineering|science|research/i.test(value))
      ? [{ title: "You enjoy solving problems and finding things out.", detail: "Technical, research and analytical directions may be useful to explore." }]
      : []),
    ...(strengths.some((value) => /practical|hands-on|creativity/i.test(value)) || snapshot.workStyle === "hands-on"
      ? [{ title: "You value learning by doing.", detail: "Look into paths that involve building, making or practical experience." }]
      : []),
    ...(snapshot.locationPref
      ? [{ title: "Where you study matters to your choices.", detail: "We’ll keep your location preference in view while showing options." }]
      : []),
    ...(subjects.some((value) => /math|physics|computer|science/i.test(value))
      ? [{ title: "Some of your favourite subjects involve structured thinking.", detail: "Compare a few different study areas that use those foundations." }]
      : []),
  ].slice(0, 3);
  if (!guidance.length) guidance.push({ title: "There is more than one way to build a future.", detail: "Your interests and strengths can help you compare a few directions at a time." });

  const optional = optionalQuestionsForStage(state.stage);
  const unanswered = priorityOptionalQuestions
    .map((key) => optional.find((question) => question.key === key))
    .filter((question): question is NonNullable<typeof question> => Boolean(question && !snapshot.answeredKeys.includes(question.key)))
    .slice(0, 2);
  const summaryValues = [...interests, ...subjects, ...strengths].slice(0, 7);
  const userName = user?.name ?? null;

  return <StartingPointShell stage={state.stage} studentName={userName} studentEmail={user?.email ?? null} signedIn={Boolean(user)}>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><StageBadge stage={state.stage} /><h1 className="mt-3 text-[clamp(2.1rem,3.1vw,2.75rem)] font-semibold leading-tight tracking-[-.045em] text-[#17372e]">What we learned about you</h1><p className="mt-1 text-sm text-[#687874]">A starting point, not a label.</p></div>
      <div className="flex flex-wrap gap-2.5"><SecondaryAction href="/counselling?edit=interests">Edit my answers</SecondaryAction><PrimaryAction href="/my-journey/direction">Explore possibilities</PrimaryAction></div>
    </div>

    <ReflectionHero>
      <div className="max-w-xl">
        <span className="mb-3 inline-grid h-9 w-9 place-items-center rounded-xl bg-[#e5f3ec] text-[#368360]"><span aria-hidden className="text-lg leading-none">✦</span></span>
        <h2 className="text-lg font-semibold text-[#1b4337]">We looked at your answers.</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5d716b]">Here’s a clear summary of your interests, strengths and learning preferences — and what they may open up for you.</p>
      </div>
    </ReflectionHero>

    <div className="mt-5 grid items-stretch gap-4 xl:grid-cols-3">
      <SummaryCard>
        <div className="flex items-center justify-between gap-2"><SectionHeading><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#e8f5f0] text-[#2b8c75]"><UserRound aria-hidden className="h-4 w-4" /></span>What you told us</SectionHeading><SourceTag /></div>
        <div className="mt-4 space-y-3.5">
          {categories.map(({ label, icon: Icon, values, tone }) => <div key={label} className="grid grid-cols-[minmax(96px,.68fr)_minmax(0,1.32fr)] items-start gap-2.5">
            <div className="flex items-center gap-2 pt-1 text-xs font-medium text-[#40564f]"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[#f0f5f5] text-[#428273]"><Icon aria-hidden className="h-3.5 w-3.5" /></span>{label}</div>
            <TagRow>{values.length ? values.slice(0, 3).map((value) => <AnswerTag key={value} tone={tone}>{value}</AnswerTag>) : <span className="pt-1 text-xs text-[#83908c]">Not shared yet</span>}</TagRow>
          </div>)}
        </div>
      </SummaryCard>

      <SummaryCard>
        <div className="flex items-center justify-between gap-2"><SectionHeading><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#fff5df] text-[#a1873b]"><Lightbulb aria-hidden className="h-4 w-4" /></span>What this may suggest</SectionHeading><GuidanceTag>General guidance</GuidanceTag></div>
        <div className="mt-4 space-y-2.5">{guidance.map(({ title, detail }) => <div key={title} className="flex gap-2.5 rounded-xl bg-[#f2f8f5] p-3"><span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#198466] text-white"><span className="text-[11px] leading-none">✓</span></span><div><p className="text-xs font-medium leading-relaxed text-[#364b44]">{title}</p><p className="mt-1 text-xs leading-relaxed text-[#697972]">{detail}</p></div></div>)}</div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#7c8985]">These are ideas to explore, not predictions or a final decision.</p>
      </SummaryCard>

      <SummaryCard>
        <div className="flex items-center justify-between gap-2"><SectionHeading><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f0edff] text-[#6550be]"><span aria-hidden className="text-base font-semibold">?</span></span>What is still unknown</SectionHeading><OpenTag /></div>
        <p className="mt-3 text-xs leading-relaxed text-[#75817d]">A few optional answers could make your suggestions more specific. You can skip these for now.</p>
        <div className="mt-3 space-y-2.5">{unanswered.length ? unanswered.map((question) => <OpenQuestionCard key={question.key}><p className="text-xs font-medium leading-relaxed text-[#384d46]">{question.prompt}</p><div className="mt-1 flex flex-wrap items-center justify-between gap-2"><QuestionLink href={`/counselling?edit=${question.key}`}>Explore this question</QuestionLink><Link href="/my-journey/direction" className="min-h-9 px-2 py-2 text-xs text-[#76827e] underline underline-offset-2">Answer later</Link></div></OpenQuestionCard>) : <p className="rounded-xl bg-[#f6f4fb] p-3.5 text-xs leading-relaxed text-[#66756f]">You’ve answered the optional questions we highlight here. You can still review any answer whenever you like.</p>}</div>
      </SummaryCard>
    </div>

    <ReflectionDisclosure>
      {summaryValues.length ? <p>Your suggestions reflect the interests, subjects and strengths you shared: <span className="font-medium text-[#40564f]">{summaryValues.join(" · ")}</span>.{snapshot.locationPref ? " Your study-location preference is also kept in view." : " We have not assumed a study-location preference."}</p> : <p>We’ll use what you choose to share as a guide. You can add or change answers at any time; nothing here locks you into a choice.</p>}
      <p className="mt-2">We do not use this page as a test score or to predict one “right” career.</p>
    </ReflectionDisclosure>

  </StartingPointShell>;
}
