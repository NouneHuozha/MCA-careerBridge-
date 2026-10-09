"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpen, Check, GraduationCap, Info, MapPin, Sprout } from "lucide-react";
import { QUESTIONS, type Stage } from "@/data/counselling";

type Answers = Record<string, { values: string[]; text: string | null }>;
type CorrectionData = { stage: Stage; stageDetail: string; answers: Record<string, string[]> };
type CorrectionSectionKey = "where" | "enjoy" | "matters" | "location";

const questionByKey = new Map(QUESTIONS.map((question) => [question.key, question]));
const correctionGroups: { key: CorrectionSectionKey; title: string; icon: typeof GraduationCap; questions: string[] }[] = [
  { key: "where", title: "Where you are now", icon: GraduationCap, questions: [] },
  { key: "enjoy", title: "What you enjoy and feel comfortable with", icon: BookOpen, questions: ["subjects_enjoy", "interests", "strengths", "work_style"] },
  { key: "matters", title: "What matters to you", icon: Sprout, questions: ["goals", "values", "budget", "scholarship_need"] },
  { key: "location", title: "Study location", icon: MapPin, questions: ["location_pref"] },
];

function asCorrectionData(stage: Stage, stageDetail: string | null, answers: Answers): CorrectionData {
  return {
    stage,
    stageDetail: stageDetail ?? "studying",
    answers: Object.fromEntries(Object.entries(answers).map(([key, answer]) => [key, [...answer.values]])),
  };
}

function valuesFor(data: CorrectionData, key: string) {
  return data.answers[key] ?? [];
}

function sameSection(section: (typeof correctionGroups)[number], left: CorrectionData, right: CorrectionData) {
  if (section.key === "where") return left.stage === right.stage && left.stageDetail === right.stageDetail;
  return section.questions.every((key) => JSON.stringify(valuesFor(left, key)) === JSON.stringify(valuesFor(right, key)));
}

function answerSummary(data: CorrectionData, keys: string[]) {
  const labels = keys.flatMap((key) => valuesFor(data, key).map((value) => {
    if (value === "not-sure") return "Not sure yet";
    const option = questionByKey.get(key)?.options?.find((item) => item.value === value);
    return option?.label ?? value;
  }));
  return labels.length ? labels.join(" · ") : "Not shared yet";
}

function stageDetailLabel(stage: Stage, detail: string) {
  if (detail === "studying") return "Currently studying";
  if (detail === "awaiting_results") return "Awaiting results";
  if (detail === "deciding") return "Taking some time to decide";
  return stage === "class12" ? "Results available" : "Course completed";
}

function updateQuestion(data: CorrectionData, key: string, value: string, single: boolean, maxSelections: number | undefined, setData: (next: CorrectionData) => void) {
  const current = valuesFor(data, key);
  let next: string[];
  if (single) {
    next = current.includes(value) ? [] : [value];
  } else if (value === "not-sure") {
    next = current.includes(value) ? [] : [value];
  } else if (current.includes(value)) {
    next = current.filter((item) => item !== value && item !== "not-sure");
  } else {
    const withoutNotSure = current.filter((item) => item !== "not-sure");
    next = maxSelections && withoutNotSure.length >= maxSelections ? withoutNotSure : [...withoutNotSure, value];
  }
  setData({ ...data, answers: { ...data.answers, [key]: next } });
}

function QuestionChoices({ questionKey, data, setData }: { questionKey: string; data: CorrectionData; setData: (next: CorrectionData) => void }) {
  const question = questionByKey.get(questionKey);
  if (!question) return null;
  const selected = valuesFor(data, questionKey);
  const options = [...(question.options ?? [])];
  for (const value of selected) {
    if (value !== "not-sure" && !options.some((option) => option.value === value)) options.push({ value, label: value });
  }
  options.push({ value: "not-sure", label: "Not sure yet" });
  const single = question.answerType === "single";

  return <fieldset className="mt-2 min-w-0">
    <legend className="text-xs font-semibold text-[#73796f]">{question.prompt}</legend>
    {question.helper ? <p className="mt-1 text-xs leading-relaxed text-[#85867e]">{question.helper}</p> : null}
    <div className="mt-2 flex flex-wrap gap-2" role={single ? "radiogroup" : undefined} aria-label={question.prompt}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return <button key={option.value} type="button" role={single ? "radio" : "checkbox"} aria-checked={active} onClick={() => updateQuestion(data, questionKey, option.value, single, question.maxSelections, setData)} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-xs leading-snug transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] ${active ? "border-[#8bb8a8] bg-[#e7f2ec] font-semibold text-[#174d42]" : "border-[#e2e5dd] bg-white text-[#525d54] hover:border-[#adc8bc] hover:bg-[#f8fbf8]"}`}>
          {active ? <Check aria-hidden className="h-3.5 w-3.5 shrink-0" /> : null}{option.label}
        </button>;
      })}
    </div>
    {question.maxSelections ? <p className="mt-1.5 text-[11px] text-[#85867e]">Choose up to {question.maxSelections}.</p> : null}
  </fieldset>;
}

function CorrectionCard({ section, draft, staged, setDraft, setStaged, stagedSections }: {
  section: (typeof correctionGroups)[number]; draft: CorrectionData; staged: CorrectionData;
  setDraft: (next: CorrectionData) => void; setStaged: (next: CorrectionData) => void; stagedSections: Set<CorrectionSectionKey>;
}) {
  const Icon = section.icon;
  const sectionData = draft;
  const resetSection = () => {
    if (section.key === "where") {
      setDraft({ ...draft, stage: staged.stage, stageDetail: staged.stageDetail });
      return;
    }
    const answers = { ...draft.answers };
    for (const key of section.questions) answers[key] = [...valuesFor(staged, key)];
    setDraft({ ...draft, answers });
  };
  const stageSection = () => {
    if (section.key === "where") setStaged({ ...staged, stage: draft.stage, stageDetail: draft.stageDetail });
    else {
      const answers = { ...staged.answers };
      for (const key of section.questions) answers[key] = [...valuesFor(draft, key)];
      setStaged({ ...staged, answers });
    }
  };
  const wasStaged = stagedSections.has(section.key);
  const hasDraftChanges = !sameSection(section, draft, staged);
  const told = section.key === "where"
    ? `${draft.stage === "class10" ? "Class 10" : "Class 12"} · ${stageDetailLabel(draft.stage, draft.stageDetail)}`
    : answerSummary(draft, section.questions);

  return <article className="grid gap-4 rounded-xl border border-[#e4e2d9] bg-[#fffefa] px-4 py-5 shadow-[0_5px_20px_-18px_rgba(40,69,60,.45)] sm:px-5 lg:grid-cols-[minmax(230px,.88fr)_minmax(0,1.35fr)_150px] lg:items-center lg:gap-5">
    <div className="flex min-w-0 items-start gap-3">
      <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e8f1ec] text-[#286b61]"><Icon className="h-6 w-6" strokeWidth={1.7} /></span>
      <div className="min-w-0"><h2 className="font-serif text-[1.3rem] leading-tight text-[#26312c]">{section.title}</h2><p className="mt-2 text-[10px] font-semibold uppercase tracking-[.12em] text-[#778079]">You told us</p><p className="mt-1 font-serif text-[.98rem] leading-[1.35] text-[#424a43]">{section.key === "where" ? `I am in ${draft.stage === "class10" ? "Class 10" : "Class 12"} · ${stageDetailLabel(draft.stage, draft.stageDetail).toLowerCase()}.` : told}</p></div>
    </div>

    <div className="min-w-0 border-t border-[#e7e3da] pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
      {section.key === "where" ? <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-[#69736b]">Current class<select value={sectionData.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value as Stage })} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d9ded7] bg-white px-3 text-sm text-[#26312c] outline-none focus:border-[#6e9d8d] focus:ring-2 focus:ring-[#dcebe3]"><option value="class10">Class 10</option><option value="class12">Class 12</option></select></label>
        <label className="block text-xs font-medium text-[#69736b]">Current situation<select value={sectionData.stageDetail} onChange={(event) => setDraft({ ...draft, stageDetail: event.target.value })} className="mt-1.5 min-h-11 w-full rounded-lg border border-[#d9ded7] bg-white px-3 text-sm text-[#26312c] outline-none focus:border-[#6e9d8d] focus:ring-2 focus:ring-[#dcebe3]"><option value="studying">Currently studying</option><option value="completed">{sectionData.stage === "class12" ? "Results available" : "Class completed"}</option><option value="awaiting_results">Awaiting results</option><option value="deciding">Taking some time to decide</option></select></label>
      </div> : <div className="max-h-[250px] space-y-3 overflow-y-auto pr-1 sm:max-h-[300px]">
        {section.questions.map((key) => <QuestionChoices key={key} questionKey={key} data={draft} setData={setDraft} />)}
      </div>}
      <p className="mt-2 text-right text-[11px] text-[#85867e]">{hasDraftChanges ? "Unsaved changes" : wasStaged ? "Saved for review" : "Changes are held until you review the updated picture."}</p>
    </div>

    <div className="flex flex-row gap-2 lg:flex-col lg:items-stretch">
      <button type="button" onClick={stageSection} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-[#286b61] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#1f5b53] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Save this change</button>
      <button type="button" onClick={resetSection} className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-[#cdd3cb] bg-white px-3 py-2 text-sm font-medium text-[#35675b] transition hover:bg-[#f4f7f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Cancel</button>
    </div>
  </article>;
}

export function ProfileCorrection({ stage, stageDetail, answers }: { stage: Stage; stageDetail: string | null; answers: Answers }) {
  const router = useRouter();
  const initial = asCorrectionData(stage, stageDetail, answers);
  const [draft, setDraft] = useState<CorrectionData>(initial);
  const [staged, setStaged] = useState<CorrectionData>(initial);
  const [stagedSections, setStagedSections] = useState<Set<CorrectionSectionKey>>(new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasUnstagedChanges = correctionGroups.some((section) => !sameSection(section, draft, staged));

  function saveSection(section: CorrectionSectionKey, next: CorrectionData) {
    setStaged(next);
    setStagedSections((current) => new Set(current).add(section));
  }

  async function reviewUpdatedPicture() {
    if (pending) return;
    if (hasUnstagedChanges) {
      setError("Save or cancel each section with unsaved changes before reviewing the updated picture.");
      return;
    }
    setPending(true);
    setError(null);
    const changedAnswers: Record<string, string[]> = {};
    const answerKeys = new Set([...Object.keys(initial.answers), ...Object.keys(staged.answers)]);
    for (const key of answerKeys) {
      const before = initial.answers[key] ?? [];
      const after = staged.answers[key] ?? [];
      if (JSON.stringify(before) !== JSON.stringify(after)) changedAnswers[key] = after;
    }
    try {
      const response = await fetch("/api/profile/correction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stage: staged.stage, stageDetail: staged.stageDetail, answers: changedAnswers }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Your changes could not be saved. Please try again.");
      router.push("/guidance/confirm");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your changes could not be saved. Please try again.");
      setPending(false);
    }
  }

  function returnWithoutChanging() {
    router.push("/guidance/confirm");
  }

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-7 sm:px-8 sm:pt-9 lg:pt-10">
    <section className="mx-auto max-w-[1120px]">
      <header className="mx-auto max-w-[850px] text-center">
        <p className="mx-auto inline-flex rounded-full bg-[#e8f0ec] px-4 py-1.5 text-xs font-medium text-[#47766c]">Your profile</p>
        <h1 className="mt-4 font-serif text-[clamp(2.3rem,5vw,3.8rem)] leading-[1.04] tracking-[-.045em] text-[#102c43]">Change what we understood</h1>
        <p className="mt-3 font-serif text-[clamp(1.02rem,1.8vw,1.3rem)] leading-[1.4] text-[#4d5d55]">Update any part of your starting picture. Your saved explorations will stay safe.</p>
      </header>

      <div role="note" className="mx-auto mt-5 flex max-w-[1000px] items-start justify-center gap-3 rounded-lg border border-[#e8e3c9] bg-[#fffdf2] px-4 py-3 text-center font-serif text-sm leading-relaxed text-[#55584f] sm:items-center"><Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#34786d] sm:mt-0" /><p>Changing an answer may change the possibilities we explain next. It will not delete your saved explorations.</p></div>

      <div className="mt-4 space-y-3">
        {correctionGroups.map((section) => <CorrectionCard key={section.key} section={section} draft={draft} staged={staged} setDraft={setDraft} setStaged={(next) => saveSection(section.key, next)} stagedSections={stagedSections} />)}
      </div>

      {error ? <p className="mx-auto mt-4 max-w-[760px] rounded-lg border border-[#e8c8bc] bg-[#fff5f0] px-4 py-3 text-sm text-[#8a3926]" role="alert">{error}</p> : null}
      <div className="mx-auto mt-5 flex max-w-[680px] flex-col justify-center gap-2 sm:flex-row">
        <button type="button" onClick={() => void reviewUpdatedPicture()} disabled={pending} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-[#286b61] px-5 py-3 font-serif text-base font-semibold text-white transition hover:bg-[#1f5b53] disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">{pending ? "Saving your updated picture…" : "Review updated picture"}</button>
        <button type="button" onClick={returnWithoutChanging} disabled={pending} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-[#cdd3cb] bg-white px-5 py-3 font-serif text-base text-[#35675b] transition hover:bg-[#f4f7f3] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Return without changing</button>
      </div>
      <p className="mt-2 text-center font-serif text-sm text-[#77786f]">We will show what changed before using the updated picture.</p>
      <p className="sr-only" aria-live="polite">{stagedSections.size ? `${stagedSections.size} section${stagedSections.size === 1 ? "" : "s"} saved for review.` : "No changes have been saved."}</p>
      <div className="mt-5 text-center"><Link href="/guidance" className="inline-flex min-h-10 items-center px-3 text-sm text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Leave profile correction and return to My Guidance</Link></div>
    </section>
  </main>;
}
