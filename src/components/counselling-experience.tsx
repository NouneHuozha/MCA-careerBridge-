"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronRight, CircleHelp, Pencil, Plus, ArrowLeft, ArrowRight, BookOpen, Star, MapPin, GraduationCap, Landmark, House, FileText } from "lucide-react";
import { Button, Callout, cx } from "@/components/ui";
import { findQuestion, questionsForStage, type CounsellingQuestion, type Stage } from "@/data/counselling";
import type { StudentSnapshot } from "@/services/profile";
import { useCounsellingJourney, type CounsellingStageKey } from "@/components/counselling-journey";

type Answer = { values: string[]; text: string | null };
type State = {
  started: boolean;
  stage: Stage;
  stageDetail: string | null;
  status: string;
  snapshot: StudentSnapshot;
  answers: Record<string, Answer>;
  progress: { answered: number; total: number };
  completed: boolean;
};
type StepKey = CounsellingStageKey;
type Draft = Record<string, Answer>;

const STEPS: StepKey[] = ["where", "interests", "strengths", "priorities", "review"];
const STEP_QUESTIONS: Record<StepKey, string[]> = {
  where: ["stream_intent", "stream_current"],
  interests: ["subjects_enjoy", "interests"],
  strengths: ["strengths"],
  priorities: ["goals", "values", "location_pref"],
  review: [],
};
const DETAIL_QUESTIONS = [
  { key: "subjects_difficult", title: "Subjects I find difficult", detail: "This helps us keep current challenges in mind.", icon: BookOpen },
  { key: "interest_story", title: "Something I enjoyed recently", detail: "A recent activity can add useful context.", icon: Star },
  { key: "home_district", title: "Nearby district", detail: "Helps us understand nearby study options and travel distance.", icon: MapPin },
  { key: "scholarship_need", title: "Scholarship information", detail: "Tell us whether scholarship information would be useful.", icon: GraduationCap },
  { key: "institution_pref", title: "Institution preference", detail: "Government, private, or either is fine.", icon: Landmark },
  { key: "hostel", title: "Hostel requirement", detail: "Let us know if staying away from home may be needed.", icon: House },
  { key: "anything_else", title: "Anything else", detail: "Share a situation, concern, hope, or question in your own words.", icon: FileText },
];
const SUBJECT_GROUPS: Record<string, string[]> = {
  "Science and mathematics": ["mathematics", "physics", "chemistry", "biology", "science"],
  "Technology and computing": ["computer-science", "information-technology"],
  "Languages and society": ["english", "social-science", "history", "political-science", "geography"],
  "Business and creative subjects": ["economics", "commerce", "arts"],
};
const INTEREST_GROUPS: Record<string, string[]> = {
  "Health, science, and nature": ["medicine", "science", "agriculture", "environment"],
  "Technology, engineering, and making": ["technology", "engineering", "arts"],
  "People and public life": ["government", "law", "education", "social-sciences"],
  "Business and communication": ["business", "finance", "media", "research"],
  "Practical and service work": ["hospitality", "helping"],
};
const STATUS_OPTIONS = [
  { value: "studying", label: "I’m still studying" },
  { value: "completed", label: "I’ve completed it" },
  { value: "awaiting_results", label: "I’m waiting for results" },
  { value: "deciding", label: "I’m taking some time to decide what comes next" },
];

function stepForQuestion(key?: string): StepKey {
  if (!key) return "interests";
  if (["stream_intent", "stream_current"].includes(key)) return "where";
  if (["subjects_enjoy", "interests"].includes(key)) return "interests";
  if (["strengths", "work_style"].includes(key)) return "strengths";
  if (["goals", "values", "location_pref", "budget"].includes(key)) return "priorities";
  if (findQuestion(key)) return "review";
  return "review";
}

function initialStep(initial: State, focusKey?: string): StepKey {
  if (focusKey) return stepForQuestion(focusKey);
  if (!initial.started || !initial.stageDetail) return "where";
  const answered = initial.snapshot.answeredKeys;
  const streamKey = initial.stage === "class10" ? "stream_intent" : "stream_current";
  if (!answered.includes(streamKey)) return "where";
  if (!["subjects_enjoy", "interests"].every((key) => answered.includes(key))) return "interests";
  if (!answered.includes("strengths")) return "strengths";
  if (!["goals", "values", "location_pref"].every((key) => answered.includes(key))) return "priorities";
  return "review";
}

function emptyAnswer(): Answer { return { values: [], text: null }; }
function hasContent(answer?: Answer) { return Boolean(answer && (answer.values.length > 0 || answer.text?.trim())); }
function answered(draft: Draft, key: string) {
  const value = draft[key] ?? emptyAnswer();
  return value.values.length > 0 || Boolean(value.text?.trim());
}
function labelValue(question: CounsellingQuestion | undefined, value: string) {
  if (value === "not-sure") return "Not sure yet";
  return question?.options?.find((option) => option.value === value)?.label ?? value.replace(/-/g, " ");
}
function labelsFor(state: State, key: string) {
  const question = findQuestion(key);
  const item = state.answers[key] ?? emptyAnswer();
  const labels = item.values.map((value) => labelValue(question, value));
  if (item.text?.trim()) labels.push(item.text.trim());
  return labels;
}
function statusLabel(value: string | null) {
  return STATUS_OPTIONS.find((option) => option.value === value)?.label.replace(/^I’m /, "") ?? "Not shared yet";
}

function QuestionPicker({
  question,
  answer,
  onChange,
  groups,
}: {
  question: CounsellingQuestion;
  answer: Answer;
  onChange: (answer: Answer) => void;
  groups?: Record<string, string[]>;
}) {
  const values = answer.values ?? [];
  const optionValues = question.options?.map((option) => option.value) ?? [];
  const custom = values.filter((value) => !optionValues.includes(value) && value !== "not-sure").join(", ");
  const select = (value: string) => {
    if (value === "not-sure") {
      onChange({ values: values.includes(value) ? [] : [value], text: null });
      return;
    }
    const knownAndUnsure = values.filter((item) => optionValues.includes(item) || item === "not-sure");
    const customValues = values.filter((item) => !optionValues.includes(item) && item !== "not-sure");
    const next = question.answerType === "single"
      ? knownAndUnsure.includes(value) ? [] : [value]
      : knownAndUnsure.includes(value) ? [...knownAndUnsure.filter((item) => item !== value), ...customValues] : [...knownAndUnsure.filter((item) => item !== "not-sure"), value, ...customValues].slice(0, question.maxSelections ?? 50);
    onChange({ ...answer, values: next });
  };
  const options = question.options ?? [];
  const groupedValues = new Set(Object.values(groups ?? {}).flat());
  const renderOption = (option: { value: string; label: string }, compact = false) => {
    const checked = values.includes(option.value);
    return <button type="button" key={option.value} aria-pressed={checked} onClick={() => select(option.value)} className={cx("flex min-h-11 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition", checked ? "border-[#328b76] bg-[#eef8f4] text-[#173d35]" : "border-[#e0e8e5] bg-white text-[#263b36] hover:border-[#8bc1af]", compact ? "text-sm" : "text-sm font-medium")}>
      <span className={cx("grid h-5 w-5 shrink-0 place-items-center border", question.answerType === "single" ? "rounded-full" : "rounded-md", checked ? "border-[#25866f] bg-[#25866f] text-white" : "border-[#99aaa4] bg-white")}>{checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}</span>
      <span>{option.label}</span>
    </button>;
  };
  return <div className="space-y-3">
    {groups ? Object.entries(groups).map(([group, ids], index) => {
      const groupOptions = options.filter((option) => ids.includes(option.value));
      if (!groupOptions.length) return null;
      return <details key={group} className="overflow-hidden rounded-xl border border-[#e0e8e5] bg-white" open={index === 0}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-[#183e35]"><span>{group}</span><span className="flex items-center gap-2 text-xs font-normal text-[#778680]">{values.filter((value) => ids.includes(value)).length} selected<ChevronDown className="h-4 w-4" /></span></summary>
        <div className="grid gap-1.5 border-t border-[#edf1ef] p-2.5 sm:grid-cols-2">{groupOptions.map((option) => renderOption(option, true))}</div>
      </details>;
    }) : options.map((option) => renderOption(option))}
    {groups && options.filter((option) => !groupedValues.has(option.value)).map((option) => renderOption(option, true))}
    {question.allowOther ? <label className="block rounded-xl border border-dashed border-[#c7d6d0] bg-[#fbfdfc] p-3.5"><span className="mb-2 block text-sm font-medium text-[#344c43]">Something else</span><input value={custom} onChange={(event) => { const other = event.target.value.trim(); const keep = values.filter((value) => optionValues.includes(value) || value === "not-sure"); onChange({ ...answer, values: question.answerType === "single" ? (other ? [other] : []) : [...keep.filter((value) => value !== "not-sure"), ...(other ? [other] : [])] }); }} className="w-full rounded-lg border border-[#d8e3de] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#328b76]" placeholder="Tell us in your own words (optional)" /></label> : null}
    {question.maxSelections ? <p className="text-xs text-[#778680]">Choose up to {question.maxSelections}. {values.filter((value) => value !== "not-sure").length} selected.</p> : null}
    {question.answerType === "text" ? <label className="block rounded-xl border border-[#e0e8e5] bg-white p-4"><span className="mb-2 block text-sm font-semibold text-[#243c34]">Write in your own words</span><textarea rows={5} maxLength={600} value={answer.text ?? ""} onChange={(event) => onChange({ ...answer, text: event.target.value })} className="w-full resize-y rounded-lg border border-[#d8e3de] px-3.5 py-3 text-sm outline-none focus:border-[#328b76]" placeholder={question.key === "interest_story" ? "For example: I enjoyed helping someone fix something." : "Share only what feels comfortable."} /></label> : null}
    {question.answerType !== "text" && <button type="button" aria-pressed={values.includes("not-sure")} onClick={() => select("not-sure")} className={cx("flex min-h-11 w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition", values.includes("not-sure") ? "border-[#328b76] bg-[#eef8f4] text-[#173d35]" : "border-[#e0e8e5] bg-white text-[#263b36] hover:border-[#8bc1af]")}><span className={cx("grid h-5 w-5 place-items-center rounded-full border", values.includes("not-sure") ? "border-[#25866f] bg-[#25866f] text-white" : "border-[#99aaa4]")}>{values.includes("not-sure") ? <Check className="h-3.5 w-3.5" /> : null}</span>I’m not sure yet</button>}
  </div>;
}

export function CounsellingExperience({ initial, focusKey }: { initial: State; focusKey?: string }) {
  const router = useRouter();
  const { setJourney } = useCounsellingJourney();
  const [state, setState] = useState(initial);
  const [step, setStep] = useState<StepKey>(() => initialStep(initial, focusKey));
  const [draft, setDraft] = useState<Draft>(() => ({ ...initial.answers }));
  const [stage, setStage] = useState<Stage>(initial.stage);
  const [stageDetail, setStageDetail] = useState<string>(initial.stageDetail ?? "");
  const [detailsMode, setDetailsMode] = useState(Boolean(focusKey && step === "review"));
  const [detailKey, setDetailKey] = useState<string | null>(focusKey && step === "review" ? focusKey : null);
  const [returnToReview, setReturnToReview] = useState(Boolean(focusKey));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const streamKey = stage === "class10" ? "stream_intent" : "stream_current";
  const streamQuestion = findQuestion(streamKey)!;
  const question = detailKey ? findQuestion(detailKey) : null;
  const stepIndex = STEPS.indexOf(step);
  const completedSections = useMemo(() => {
    const isAnswered = (key: string) => (draft[key]?.values?.length ?? 0) > 0 || Boolean(draft[key]?.text?.trim());
    return STEPS.filter((key) => key !== "review" && STEP_QUESTIONS[key].filter((q) => q === "stream_intent" || q === "stream_current" ? q === streamKey : true).every(isAnswered) && (key !== "where" || Boolean(stageDetail))).filter((key) => key !== step);
  }, [draft, stageDetail, step, streamKey]);

  useEffect(() => {
    const current = step;
    const answeredCore = questionsForStage(stage).filter((item) => (draft[item.key]?.values?.length ?? 0) > 0 || Boolean(draft[item.key]?.text?.trim())).length;
    setJourney({ currentSection: current, completedSections, progress: { current: answeredCore, total: questionsForStage(stage).length } });
  }, [step, completedSections, draft, stage, setJourney]);

  function updateAnswer(key: string, value: Answer) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setError(null);
  }

  async function request(body: Record<string, unknown>) {
    const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const next = await response.json() as State & { error?: string };
    if (!response.ok || next.error) throw new Error(next.error ?? "We couldn’t save that just now. Please try again.");
    setState(next);
    setDraft((previous) => ({ ...previous, ...next.answers }));
    return next;
  }

  async function saveOne(key: string, value: Answer) {
    if (!answered({ [key]: value }, key)) return state;
    return request({ action: "answer", questionKey: key, values: value.values ?? [], text: value.text ?? null, stage });
  }

  async function saveStep(keys: string[]) {
    for (const key of keys) {
      const value = draft[key] ?? emptyAnswer();
      if (answered(draft, key)) await saveOne(key, value);
    }
  }

  function validateStep() {
    const required = step === "where" ? [streamKey]
      : step === "interests" ? ["subjects_enjoy", "interests"]
        : step === "strengths" ? ["strengths"]
          : step === "priorities" ? ["goals", "values", "location_pref"] : [];
    const missing = required.filter((key) => !answered(draft, key));
    if (missing.length) {
      setError("Choose an answer or select “I’m not sure yet” to continue. You can change it later.");
      return false;
    }
    return true;
  }

  async function continueStep() {
    if (!validateStep()) return;
    setPending(true); setError(null); setNotice(null);
    try {
      if (step === "where") {
        await request({ action: "context", stage, stageDetail });
        await saveStep([streamKey]);
      } else if (step === "interests") await saveStep(STEP_QUESTIONS.interests);
      else if (step === "strengths") await saveStep(["strengths", "work_style"]);
      else if (step === "priorities") await saveStep(["goals", "values", "location_pref", "budget"]);
      if (returnToReview && step !== "review") {
        setStep("review"); setReturnToReview(false); setDetailsMode(false); setDetailKey(null);
      } else {
        setStep(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn’t save that just now. Please try again.");
    } finally { setPending(false); }
  }

  async function saveDetail() {
    if (!question || !detailKey) return;
    const value = draft[detailKey] ?? emptyAnswer();
    setPending(true); setError(null);
    try {
      if (answered(draft, detailKey)) await saveOne(detailKey, value);
      else if (question.allowSkip) await request({ action: "skip", questionKey: detailKey, stage });
      setDetailKey(null); setNotice("Saved. You can add another detail or continue.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn’t save that just now. Please try again.");
    } finally { setPending(false); }
  }

  async function skipDetail() {
    if (!detailKey || !question) return;
    setPending(true); setError(null);
    try {
      await request({ action: "skip", questionKey: detailKey, stage });
      setDetailKey(null); setNotice("Skipped. You can add it later if you want.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn’t save that just now. Please try again.");
    } finally { setPending(false); }
  }

  async function finish() {
    setPending(true); setError(null);
    try {
      await request({ action: "complete", stage });
      router.push("/reflection");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Finish the required questions before continuing.");
    } finally { setPending(false); }
  }

  function editStep(next: StepKey) {
    setReturnToReview(true);
    setDetailsMode(false);
    setDetailKey(null);
    setStep(next);
    setError(null);
    setNotice(null);
  }

  function startDetail(key: string) {
    setDetailKey(key);
    const prior = state.answers[key] ?? emptyAnswer();
    setDraft((previous) => ({ ...previous, [key]: prior }));
    setError(null); setNotice(null);
  }

  const currentAnsweredLabels = (key: string) => labelsFor({ ...state, answers: { ...state.answers, ...draft } }, key);
  const sectionTitle = step === "where" ? "Where you are now" : step === "interests" ? "What interests you" : step === "strengths" ? "What you bring" : step === "priorities" ? "What matters to you" : "What we understood";
  const questionTitle = (key: string) => findQuestion(key)?.prompt ?? "";
  const goBack = () => {
    if (detailKey) { setDetailKey(null); return; }
    if (detailsMode) { setDetailsMode(false); return; }
    if (step === "review" && returnToReview) setReturnToReview(false);
    setStep(STEPS[Math.max(0, STEPS.indexOf(step) - 1)]);
    setError(null);
  };

  return <main className="cb-container cb-page mx-auto w-full max-w-[1120px] pb-10">
    <div className="mb-5 flex items-center justify-between gap-3 lg:hidden"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#397967]">Step {stepIndex + 1} of 5</p><Link href="/profile" className="text-sm font-medium text-[#28775f] underline underline-offset-4">Save and return later</Link></div>
    <div className="flex items-center justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#32806c]">{detailsMode || detailKey ? "Step 5 of 5 · Optional" : `Step ${stepIndex + 1} of 5`}</p><h1 className="mt-2 text-[clamp(1.8rem,4vw,2.75rem)] font-semibold leading-tight tracking-[-.04em] text-[#132d27]">{detailKey ? question?.prompt : detailsMode ? "Add anything else that may help" : sectionTitle}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#6c7b76]">{detailKey ? question?.helper ?? "Optional — share only what feels comfortable." : detailsMode ? "You do not need to answer everything. Add only what feels useful, and you can skip anything." : step === "review" ? "This is a starting picture, not a final judgement. Check each section and change anything that doesn’t feel right." : "Choose what feels true today. You can edit or change direction later."}</p></div>
      <Link href="/profile" className="hidden shrink-0 items-center gap-2 text-sm font-medium text-[#28775f] underline underline-offset-4 lg:inline-flex"><span aria-hidden>▯</span>Save and return later</Link>
    </div>

    {error ? <div className="mt-5"><Callout tone="amber"><p role="alert">{error}</p></Callout></div> : null}
    {notice ? <p className="mt-4 rounded-xl border border-[#cfe6dc] bg-[#f1faf6] px-4 py-3 text-sm text-[#276956]" role="status">{notice}</p> : null}

    {step === "where" && !detailsMode ? <section className="mt-7 space-y-7">
      <div><h2 className="mb-3 text-base font-semibold text-[#1a4438]">Which stage sounds like you?</h2><div className="grid gap-3 sm:grid-cols-2">{([{ value: "class10", label: "I’m currently in Class 10" }, { value: "class12", label: "I’m currently in Class 12" }] as const).map((option) => <button key={option.value} type="button" aria-pressed={stage === option.value} onClick={() => { setStage(option.value); setError(null); }} className={cx("min-h-16 rounded-xl border px-4 py-4 text-left text-sm font-semibold transition", stage === option.value ? "border-[#30846e] bg-[#eff8f4] text-[#173d35]" : "border-[#dfe7e3] bg-white text-[#344941] hover:border-[#8bc1af]")}>{option.label}</button>)}</div></div>
      <div><h2 className="mb-3 text-base font-semibold text-[#1a4438]">What describes you right now?</h2><div className="grid gap-3 sm:grid-cols-2">{STATUS_OPTIONS.map((option) => <button key={option.value} type="button" aria-pressed={stageDetail === option.value} onClick={() => setStageDetail(option.value)} className={cx("min-h-14 rounded-xl border px-4 py-3 text-left text-sm transition", stageDetail === option.value ? "border-[#30846e] bg-[#eff8f4] font-semibold text-[#173d35]" : "border-[#dfe7e3] bg-white text-[#344941] hover:border-[#8bc1af]")}>{option.label}</button>)}</div></div>
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-base font-semibold text-[#1a4438]">{stage === "class10" ? "What are you considering after Class 10?" : "What did you study in Class 11–12?"}</h2><p className="mb-4 text-sm text-[#73817b]">You do not need to have decided. “I’m not sure yet” is completely okay.</p><QuestionPicker question={streamQuestion} answer={draft[streamKey] ?? emptyAnswer()} onChange={(value) => updateAnswer(streamKey, value)} /></div>
    </section> : null}

    {step === "interests" && !detailsMode ? <section className="mt-7 space-y-7">
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-lg font-semibold text-[#183e35]">{questionTitle("subjects_enjoy")}</h2><p className="mb-4 text-sm text-[#718079]">Choose the subjects you enjoy, not only the ones where you get the highest marks.</p><QuestionPicker question={findQuestion("subjects_enjoy")!} answer={draft.subjects_enjoy ?? emptyAnswer()} groups={SUBJECT_GROUPS} onChange={(value) => updateAnswer("subjects_enjoy", value)} /></div>
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-lg font-semibold text-[#183e35]">{questionTitle("interests")}</h2><p className="mb-4 text-sm text-[#718079]">Think about what you read about, watch, make, or lose track of time doing.</p><QuestionPicker question={findQuestion("interests")!} answer={draft.interests ?? emptyAnswer()} groups={INTEREST_GROUPS} onChange={(value) => updateAnswer("interests", value)} /></div>
    </section> : null}

    {step === "strengths" && !detailsMode ? <section className="mt-7 space-y-6">
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-lg font-semibold text-[#183e35]">{questionTitle("strengths")}</h2><p className="mb-4 text-sm text-[#718079]">Strengths are not only academic. Choose up to five.</p><QuestionPicker question={findQuestion("strengths")!} answer={draft.strengths ?? emptyAnswer()} onChange={(value) => updateAnswer("strengths", value)} /></div>
      <details className="rounded-2xl border border-[#dce8e2] bg-white p-4 sm:p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span><span className="block font-semibold text-[#183e35]">Optional: What kind of work suits you?</span><span className="mt-1 block text-sm text-[#718079]">Add a day-to-day working preference if you know it.</span></span><ChevronDown className="h-4 w-4 text-[#668078]" /></summary><div className="mt-4"><QuestionPicker question={findQuestion("work_style")!} answer={draft.work_style ?? emptyAnswer()} onChange={(value) => updateAnswer("work_style", value)} /></div></details>
    </section> : null}

    {step === "priorities" && !detailsMode ? <section className="mt-7 space-y-6">
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-lg font-semibold text-[#183e35]">{questionTitle("goals")}</h2><p className="mb-4 text-sm text-[#718079]">Choose what feels true today. This can change.</p><QuestionPicker question={findQuestion("goals")!} answer={draft.goals ?? emptyAnswer()} onChange={(value) => updateAnswer("goals", value)} /></div>
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-lg font-semibold text-[#183e35]">{questionTitle("values")}</h2><p className="mb-4 text-sm text-[#718079]">Pick up to three things you would prioritise in a career.</p><QuestionPicker question={findQuestion("values")!} answer={draft.values ?? emptyAnswer()} onChange={(value) => updateAnswer("values", value)} /></div>
      <div className="rounded-2xl border border-[#e0e8e5] bg-[#fbfdfc] p-4 sm:p-5"><h2 className="mb-1 text-lg font-semibold text-[#183e35]">{questionTitle("location_pref")}</h2><p className="mb-4 text-sm text-[#718079]">A broad preference is enough. We never need your exact address.</p><QuestionPicker question={findQuestion("location_pref")!} answer={draft.location_pref ?? emptyAnswer()} onChange={(value) => updateAnswer("location_pref", value)} /><details className="mt-4 rounded-xl border border-[#dce8e2] bg-white p-4"><summary className="cursor-pointer text-sm font-semibold text-[#315b4b]">Optional: What should we keep in mind about study costs?</summary><p className="mt-2 mb-3 text-xs text-[#778680]">You do not need to share family income. A broad preference is enough.</p><QuestionPicker question={findQuestion("budget")!} answer={draft.budget ?? emptyAnswer()} onChange={(value) => updateAnswer("budget", value)} /></details></div>
    </section> : null}

    {step === "review" && !detailsMode && !detailKey ? <section className="mt-7 space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ReviewCard title="Where you are now" onEdit={() => editStep("where")} rows={[["Stage", stage === "class10" ? "Class 10" : "Class 12"], ["Current status", statusLabel(stageDetail)], ["Stream / context", currentAnsweredLabels(streamKey).join(", ") || "Not shared yet"]]} />
        <ReviewCard title="What you enjoy and bring" onEdit={() => editStep("interests")} rows={[["Subjects", currentAnsweredLabels("subjects_enjoy").join(", ") || "Not shared yet"], ["Interests", currentAnsweredLabels("interests").join(", ") || "Not shared yet"], ["Strengths", currentAnsweredLabels("strengths").join(", ") || "Not shared yet"], ["Work style", currentAnsweredLabels("work_style").join(", ") || "Not shared yet"]]} />
        <ReviewCard title="What matters to you" onEdit={() => editStep("priorities")} rows={[["Goals", currentAnsweredLabels("goals").join(", ") || "Not shared yet"], ["Career values", currentAnsweredLabels("values").join(", ") || "Not shared yet"], ["Study location", currentAnsweredLabels("location_pref").join(", ") || "Still open"], ["Cost preference", currentAnsweredLabels("budget").join(", ") || "Not shared"]]} />
        <div className="rounded-2xl border border-[#f0dfb3] bg-[#fffaf0] p-5 sm:p-6"><h2 className="text-lg font-semibold text-[#3b493f]">Still open</h2><p className="mt-2 text-sm leading-relaxed text-[#758078]">You have not told us everything, and that is okay. Add more later if it feels useful.</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => { setDetailsMode(true); setDetailKey(null); setNotice(null); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#78ad99] bg-white px-4 text-sm font-semibold text-[#26735e] hover:bg-[#f2faf6]"><Plus className="h-4 w-4" />Add more detail</button><button type="button" onClick={() => void finish()} disabled={pending} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d5dfdc] bg-white px-4 text-sm font-medium text-[#41564e] hover:bg-[#f7faf8]">Continue without adding</button></div></div>
      </div>
      <div className="rounded-xl border border-[#dbe6f0] bg-[#f6faff] px-4 py-3 text-sm leading-relaxed text-[#5b6d78]"><CircleHelp className="mr-2 inline h-4 w-4" />Your answers are a starting point, not a score or a final judgement. You can edit them later.</div>
    </section> : null}

    {step === "review" && detailsMode && !detailKey ? <section className="mt-7 rounded-2xl border border-[#e0e8e5] bg-white p-4 sm:p-6">
      <div className="mb-4 rounded-xl bg-[#f7faf8] p-4"><p className="font-semibold text-[#28473c]">We are not asking the same questions again.</p><p className="mt-1 text-sm text-[#718079]">This page is only for a few additional details that can help us understand you better.</p></div>
      <div className="space-y-2">{DETAIL_QUESTIONS.map(({ key, title, detail, icon: Icon }) => { const saved = hasContent(state.answers[key]); return <div key={key} className="flex items-center gap-3 rounded-xl border border-[#e5ece8] px-3.5 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f0f7f3] text-[#397b66]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="font-semibold text-[#263f35]">{title}{saved ? <span className="ml-2 text-xs font-medium text-[#2f8a70]">Added</span> : null}</p><p className="mt-0.5 text-xs leading-relaxed text-[#78857f]">{detail}</p></div><button type="button" onClick={() => startDetail(key)} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#a8c8b8] px-3 text-sm font-semibold text-[#28775f] hover:bg-[#f2faf6]"><Plus className="h-3.5 w-3.5" />{saved ? "Edit" : "Add"}</button></div>; })}</div>
      <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-[#e7eeea] pt-4"><button type="button" onClick={() => setDetailsMode(false)} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#41564e]"><ArrowLeft className="h-4 w-4" />Back to review</button><button type="button" onClick={() => { setDetailsMode(false); setNotice("Your added details are saved. Review before continuing."); }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#267d69] px-5 text-sm font-semibold text-white hover:bg-[#1e6c5a]">Save and return to review<ArrowRight className="h-4 w-4" /></button></div>
    </section> : null}

    {step === "review" && detailsMode && detailKey && question ? <section className="mt-7 rounded-2xl border border-[#e0e8e5] bg-white p-4 sm:p-6">
      {question.helper ? <p className="mb-4 text-sm leading-relaxed text-[#718079]">{question.helper}</p> : null}
      <QuestionPicker question={question} answer={draft[detailKey] ?? emptyAnswer()} onChange={(value) => updateAnswer(detailKey, value)} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7eeea] pt-4"><button type="button" onClick={() => setDetailKey(null)} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#41564e]"><ArrowLeft className="h-4 w-4" />Back to additional details</button><div className="flex gap-2"><button type="button" onClick={() => void skipDetail()} disabled={pending} className="min-h-10 rounded-xl px-3 text-sm font-medium text-[#32806c] hover:bg-[#f2faf6]">Skip for now</button><button type="button" onClick={() => void saveDetail()} disabled={pending} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#267d69] px-5 text-sm font-semibold text-white hover:bg-[#1e6c5a]">Save and return<ArrowRight className="h-4 w-4" /></button></div></div>
    </section> : null}

    {!detailsMode && !detailKey && step !== "review" ? <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#e3ebe7] pt-5 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={goBack} disabled={step === "where" || pending} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce6e1] bg-white px-4 text-sm font-semibold text-[#445a51] disabled:opacity-40"><ArrowLeft className="h-4 w-4" />Back</button><button type="button" onClick={() => void continueStep()} disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#267d69] px-6 text-sm font-semibold text-white hover:bg-[#1e6c5a] disabled:opacity-60">{pending ? "Saving…" : "Continue"}<ArrowRight className="h-4 w-4" /></button></div> : null}
    {step === "review" && !detailsMode && !detailKey ? <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-[#e3ebe7] pt-4"><button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#41564e]"><ArrowLeft className="h-4 w-4" />Go back and edit</button><button type="button" onClick={() => void finish()} disabled={pending} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#267d69] px-6 text-sm font-semibold text-white hover:bg-[#1e6c5a] disabled:opacity-60">{pending ? "Saving…" : "This starting picture feels right — continue"}<ArrowRight className="h-4 w-4" /></button></div> : null}
  </main>;
}

function ReviewCard({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return <section className="rounded-2xl border border-[#dce8e2] bg-white p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-[#26463a]">{title}</h2><button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#28775f] hover:underline"><Pencil className="h-3.5 w-3.5" />Edit</button></div><dl className="mt-4 space-y-2.5">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 border-t border-[#eef2ef] pt-2.5 text-sm"><dt className="text-[#65746e]">{label}</dt><dd className="break-words text-[#2b4038]">{value}</dd></div>)}</dl></section>;
}
