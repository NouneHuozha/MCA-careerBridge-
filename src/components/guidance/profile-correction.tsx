"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, Check, ChevronDown, GraduationCap, Heart, Info, MapPin, Save, Sprout, Target, Users } from "lucide-react";
import {
  findQuestion,
  INTEREST_GROUPS,
  INTEREST_OPTIONS,
  QUESTIONS,
  STRENGTH_OPTIONS,
  SUBJECT_GROUPS,
  SUBJECT_OPTIONS,
  type QuestionOption,
  type Stage,
} from "@/data/counselling";

type Answer = { values: string[]; text: string | null };
type Answers = Record<string, Answer>;
type EditorState = { stage: Stage; stageDetail: string; answers: Answers };
type Group = { key: string; label: string; values: readonly string[] };

const editKeys = [
  "stream_intent", "stream_current", "subjects_enjoy", "interests", "interest_story",
  "strengths", "work_style", "goals", "values", "location_pref", "budget",
  "scholarship_need", "anything_else",
] as const;
const questionMap = new Map(QUESTIONS.map((question) => [question.key, question]));
const sections = [
  { id: "edit-where", title: "Where you are now", icon: GraduationCap },
  { id: "edit-enjoy", title: "What you enjoy", icon: BookOpen },
  { id: "edit-bring", title: "What you bring", icon: Users },
  { id: "edit-matters", title: "What matters to you", icon: Heart },
  { id: "edit-practical", title: "Practical considerations", icon: MapPin },
  { id: "edit-save", title: "Save your changes", icon: Save },
];
const stageDetailOptions = [
  { value: "studying", label: "Currently studying" },
  { value: "completed", label: "Class completed / results available" },
  { value: "awaiting_results", label: "Waiting for results" },
  { value: "deciding", label: "Taking some time to decide" },
];

function initialState(stage: Stage, stageDetail: string | null, sourceAnswers: Answers): EditorState {
  const answers: Answers = {};
  for (const key of editKeys) {
    const answer = sourceAnswers[key];
    answers[key] = { values: [...(answer?.values ?? [])], text: answer?.text ?? null };
  }
  return { stage, stageDetail: stageDetail ?? "studying", answers };
}

function sameAnswer(left: Answer | undefined, right: Answer | undefined) {
  return JSON.stringify(left?.values ?? []) === JSON.stringify(right?.values ?? []) && (left?.text ?? null) === (right?.text ?? null);
}

function questionOptions(key: string): QuestionOption[] {
  return [...(questionMap.get(key)?.options ?? [])];
}

function valueLabel(key: string, value: string) {
  if (value === "not-sure") return "I’m not sure yet";
  if (value === "other") return "Something else";
  return questionMap.get(key)?.options?.find((option) => option.value === value)?.label ?? value;
}

function SelectedSummary({ answer, questionKey }: { answer: Answer; questionKey: string }) {
  const labels = answer.values.map((value) => valueLabel(questionKey, value));
  return <p className="mt-2 min-h-5 text-xs leading-relaxed text-[#66736b]">
    {labels.length ? `You currently have: ${labels.join(" · ")}` : "Nothing selected yet. You can leave this open or choose “I’m not sure yet.”"}
  </p>;
}

function GroupedQuestion({ questionKey, title, helper, groups, state, disabled, setAnswer }: {
  questionKey: string; title: string; helper: string; groups: readonly Group[]; state: EditorState; disabled: boolean;
  setAnswer: (key: string, update: (answer: Answer) => Answer) => void;
}) {
  const answer = state.answers[questionKey] ?? { values: [], text: null };
  const [expanded, setExpanded] = useState<string[]>(() => {
    const selected = groups.filter((group) => group.values.some((value) => answer.values.includes(value))).map((group) => group.key);
    return selected.length ? selected : groups.length ? [groups[0].key] : [];
  });
  const selectedCount = answer.values.filter((value) => value !== "other" && value !== "not-sure").length;
  const otherChecked = answer.values.includes("other");
  const notSure = answer.values.includes("not-sure");
  const max = questionMap.get(questionKey)?.maxSelections;

  function toggle(value: string) {
    setAnswer(questionKey, (current) => {
      if (value === "not-sure") return { ...current, values: current.values.includes(value) ? [] : [value] };
      if (current.values.includes(value)) return { ...current, values: current.values.filter((item) => item !== value && item !== "not-sure") };
      const withoutNotSure = current.values.filter((item) => item !== "not-sure");
      if (max && withoutNotSure.length >= max) return current;
      return { ...current, values: [...withoutNotSure, value] };
    });
  }

  return <section aria-labelledby={`${questionKey}-title`} className="min-w-0">
    <h3 id={`${questionKey}-title`} className="font-semibold text-[#24342e]">{title}</h3>
    <p className="mt-1 text-sm leading-relaxed text-[#67736c]">{helper}</p>
    <div className="mt-3 space-y-2" aria-label={`${title} groups`}>
      {groups.map((group) => {
        const open = expanded.includes(group.key);
        const count = group.values.filter((value) => answer.values.includes(value)).length;
        const panelId = `${questionKey}-${group.key}-options`;
        return <div key={group.key} className="overflow-hidden rounded-lg border border-[#e1e6e1] bg-white">
          <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setExpanded((current) => open ? current.filter((key) => key !== group.key) : [...current, group.key])} className={`flex min-h-12 w-full items-center gap-3 px-3.5 text-left transition hover:bg-[#f8fbf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#286b61] sm:px-4 ${count ? "bg-[#f3f8f5]" : ""}`}>
            <span className="min-w-0 flex-1 text-sm font-semibold text-[#2c3832]">{group.label}</span>
            <span className="whitespace-nowrap text-xs text-[#68766d]">{count} selected</span>
            <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 text-[#607068] transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          <div id={panelId} hidden={!open} role="group" aria-label={group.label} className="grid gap-1 border-t border-[#e9ede8] p-2 sm:grid-cols-2">
            {group.values.map((value) => {
              const option = questionMap.get(questionKey)?.options?.find((item) => item.value === value);
              if (!option) return null;
              const checked = answer.values.includes(value);
              return <label key={value} className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md border px-2.5 text-sm transition ${checked ? "border-[#91b9a6] bg-[#edf6f0] font-medium text-[#214d40]" : "border-transparent text-[#46534b] hover:bg-[#f7faf8]"}`}>
                <input type="checkbox" checked={checked} onChange={() => toggle(value)} disabled={disabled || (Boolean(max) && !checked && selectedCount + (otherChecked ? 1 : 0) >= (max ?? 0))} className="h-4 w-4 shrink-0 accent-[#287d6c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]" />
                <span className="min-w-0 flex-1">{option.label}</span>
                {checked && <Check aria-hidden className="h-4 w-4 shrink-0 text-[#287d6c]" />}
              </label>;
            })}
          </div>
        </div>;
      })}
    </div>
    <p className="mt-2 text-xs text-[#6c786f]" role="status" aria-live="polite">{selectedCount} {selectedCount === 1 ? "choice" : "choices"} selected{max ? ` · up to ${max}` : ""}</p>
    <label className={`mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3.5 text-sm transition ${otherChecked ? "border-[#91b9a6] bg-[#edf6f0]" : "border-[#e1e6e1] bg-white hover:bg-[#f8fbf9]"}`}>
      <input type="checkbox" checked={otherChecked && !notSure} onChange={() => toggle("other")} disabled={disabled || (Boolean(max) && !otherChecked && selectedCount + 1 >= (max ?? 0))} className="h-4 w-4 accent-[#287d6c]" />
      <span className="font-medium text-[#34453c]">Something else</span>
      {otherChecked && <Check aria-hidden className="ml-auto h-4 w-4 text-[#287d6c]" />}
    </label>
    {otherChecked && !notSure && <div className="mt-2 rounded-lg border border-[#dce8df] bg-[#f8fbf8] p-3">
      <label htmlFor={`${questionKey}-custom-text`} className="block text-sm font-medium text-[#3d4c43]">Add a little detail, if you’d like <span className="font-normal text-[#748078]">(optional)</span></label>
      <textarea id={`${questionKey}-custom-text`} value={answer.text ?? ""} maxLength={600} rows={2} disabled={disabled} onChange={(event) => setAnswer(questionKey, (current) => ({ ...current, text: event.target.value }))} className="mt-2 min-h-20 w-full resize-y rounded-lg border border-[#cfd9d1] bg-white px-3 py-2.5 text-base text-[#28362f] outline-none focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20 disabled:opacity-70" placeholder="Your own words are welcome." />
      <p className="mt-1.5 text-xs text-[#748078]">This is optional and stays separate from your selected answers.</p>
    </div>}
    <label className={`mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3.5 text-sm transition ${notSure ? "border-[#91b9a6] bg-[#edf6f0]" : "border-[#e1e6e1] bg-white hover:bg-[#f8fbf9]"}`}>
      <input type="checkbox" checked={notSure} onChange={() => toggle("not-sure")} disabled={disabled} className="h-4 w-4 accent-[#287d6c]" />
      <span className="font-medium text-[#34453c]">I’m not sure yet</span>
      {notSure && <Check aria-hidden className="ml-auto h-4 w-4 text-[#287d6c]" />}
    </label>
    {notSure && <p role="status" className="mt-1.5 text-sm text-[#397e70]">That’s okay. You can explore possibilities before deciding.</p>}
  </section>;
}

function ChoiceQuestion({ questionKey, title, helper, state, setAnswer, disabled, columns = 2, includeNotSure = true }: {
  questionKey: string; title: string; helper?: string; state: EditorState; disabled: boolean; columns?: 1 | 2 | 3; includeNotSure?: boolean;
  setAnswer: (key: string, update: (answer: Answer) => Answer) => void;
}) {
  const answer = state.answers[questionKey] ?? { values: [], text: null };
  const question = questionMap.get(questionKey);
  if (!question) return null;
  const options = questionOptions(questionKey);
  if (question.allowOther && !options.some((option) => option.value === "other")) options.push({ value: "other", label: "Something else" });
  const single = question.answerType === "single";
  const values = [...options];
  const hasNotSureOption = values.some((option) => option.value === "not-sure" || option.value === "unsure");
  if (includeNotSure && !single && !hasNotSureOption) values.push({ value: "not-sure", label: "I’m not sure yet" });
  const custom = answer.values.includes("other");
  const max = question.maxSelections;
  const gridClass = columns === 1 ? "grid-cols-1" : columns === 3 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2";

  function select(value: string) {
    setAnswer(questionKey, (current) => {
      if (single) return { ...current, values: [value] };
      if (current.values.includes(value)) return { ...current, values: current.values.filter((item) => item !== value && item !== "not-sure") };
      if (value === "not-sure") return { ...current, values: [value] };
      const withoutNotSure = current.values.filter((item) => item !== "not-sure");
      if (max && withoutNotSure.length >= max) return current;
      return { ...current, values: [...withoutNotSure, value] };
    });
  }

  return <fieldset className="min-w-0">
    <legend className="font-semibold text-[#24342e]">{title}</legend>
    {helper && <p className="mt-1 text-sm leading-relaxed text-[#67736c]">{helper}</p>}
    <div className={`mt-3 grid gap-2 ${gridClass}`}>
      {values.map((option) => {
        const checked = answer.values.includes(option.value);
        const isRadio = single;
        const inputId = `${questionKey}-${option.value}`;
        return <label key={option.value} htmlFor={inputId} className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm transition focus-within:ring-2 focus-within:ring-[#397e70]/30 ${checked ? "border-[#87b29f] bg-[#edf6f0] text-[#244b3f]" : "border-[#e1e6e1] bg-white text-[#46534b] hover:bg-[#f8fbf9]"}`}>
          <input id={inputId} type={isRadio ? "radio" : "checkbox"} name={isRadio ? questionKey : undefined} checked={checked} disabled={disabled || (!isRadio && Boolean(max) && !checked && answer.values.filter((value) => value !== "not-sure").length >= (max ?? 0))} onChange={() => select(option.value)} className="h-4 w-4 shrink-0 accent-[#287d6c]" />
          <span className="min-w-0 flex-1">{option.label}</span>
          {checked && <Check aria-hidden className="h-4 w-4 shrink-0 text-[#287d6c]" />}
        </label>;
      })}
      {includeNotSure && (single || hasNotSureOption) && !hasNotSureOption && <label htmlFor={`${questionKey}-not-sure`} className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm transition focus-within:ring-2 focus-within:ring-[#397e70]/30 ${answer.values.includes("not-sure") ? "border-[#87b29f] bg-[#edf6f0] text-[#244b3f]" : "border-[#e1e6e1] bg-white text-[#46534b] hover:bg-[#f8fbf9]"}`}>
        <input id={`${questionKey}-not-sure`} type={single ? "radio" : "checkbox"} name={single ? questionKey : undefined} checked={answer.values.includes("not-sure")} disabled={disabled} onChange={() => select("not-sure")} className="h-4 w-4 accent-[#287d6c]" />
        <span className="min-w-0 flex-1">I’m not sure yet</span>
        {answer.values.includes("not-sure") && <Check aria-hidden className="h-4 w-4 text-[#287d6c]" />}
      </label>}
    </div>
    {max && <p className="mt-2 text-xs text-[#6c786f]">{answer.values.filter((value) => value !== "not-sure").length} selected · choose up to {max}.</p>}
    {custom && <div className="mt-2 rounded-lg border border-[#dce8df] bg-[#f8fbf8] p-3">
      <label htmlFor={`${questionKey}-other-text`} className="block text-sm font-medium text-[#3d4c43]">Tell us more, if you’d like. <span className="font-normal text-[#748078]">(optional)</span></label>
      <textarea id={`${questionKey}-other-text`} value={answer.text ?? ""} maxLength={600} rows={2} disabled={disabled} onChange={(event) => setAnswer(questionKey, (current) => ({ ...current, text: event.target.value }))} className="mt-2 min-h-20 w-full resize-y rounded-lg border border-[#cfd9d1] bg-white px-3 py-2.5 text-base text-[#28362f] outline-none focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20 disabled:opacity-70" placeholder="Your own words are welcome." />
    </div>}
    {answer.values.includes("not-sure") && <p role="status" className="mt-2 text-sm text-[#397e70]">That’s okay. You can explore possibilities before deciding.</p>}
    <SelectedSummary answer={answer} questionKey={questionKey} />
  </fieldset>;
}

function TextAnswer({ questionKey, title, helper, state, disabled, setAnswer, rows = 3 }: {
  questionKey: string; title: string; helper?: string; state: EditorState; disabled: boolean; rows?: number;
  setAnswer: (key: string, update: (answer: Answer) => Answer) => void;
}) {
  const answer = state.answers[questionKey] ?? { values: [], text: null };
  const id = `${questionKey}-text`;
  return <div>
    <label htmlFor={id} className="block font-semibold text-[#24342e]">{title} <span className="font-normal text-[#728078]">(optional)</span></label>
    {helper && <p className="mt-1 text-sm leading-relaxed text-[#67736c]">{helper}</p>}
    <textarea id={id} value={answer.text ?? ""} maxLength={600} rows={rows} disabled={disabled} onChange={(event) => setAnswer(questionKey, (current) => ({ ...current, text: event.target.value }))} className="mt-3 min-h-24 w-full resize-y rounded-lg border border-[#cfd9d1] bg-white px-3.5 py-3 text-base text-[#28362f] outline-none focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20 disabled:opacity-70" placeholder="Share anything you’d like us to keep in mind. You can leave this blank." />
    <p className="mt-1 text-right text-xs text-[#748078]">{(answer.text ?? "").length}/600</p>
  </div>;
}

function SectionCard({ id, title, description, icon: Icon, children }: { id: string; title: string; description: string; icon: typeof GraduationCap; children: React.ReactNode }) {
  return <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 rounded-2xl border border-[#e1e6e1] bg-[#fffefa] px-4 py-5 shadow-[0_6px_22px_-20px_rgba(28,66,50,.4)] sm:px-6 sm:py-6">
    <header className="mb-5 flex items-start gap-3.5 border-b border-[#e8ebe6] pb-4">
      <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e8f1ec] text-[#286b61]"><Icon className="h-5 w-5" strokeWidth={1.8} /></span>
      <div><h2 id={`${id}-title`} className="font-serif text-[1.35rem] leading-tight text-[#25342d] sm:text-[1.55rem]">{title}</h2><p className="mt-1 text-sm leading-relaxed text-[#69766e]">{description}</p></div>
    </header>
    <div className="space-y-6">{children}</div>
  </section>;
}

export function ProfileCorrection({ stage, stageDetail, answers }: { stage: Stage; stageDetail: string | null; answers: Answers }) {
  const router = useRouter();
  const initial = useMemo(() => initialState(stage, stageDetail, answers), [stage, stageDetail, answers]);
  const [draft, setDraft] = useState<EditorState>(initial);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const dirty = draft.stage !== initial.stage || draft.stageDetail !== initial.stageDetail || editKeys.some((key) => !sameAnswer(initial.answers[key], draft.answers[key]));
  const streamKey = draft.stage === "class10" ? "stream_intent" : "stream_current";
  const streamQuestion = questionMap.get(streamKey)!;

  function setAnswer(key: string, update: (answer: Answer) => Answer) {
    setDraft((current) => ({ ...current, answers: { ...current.answers, [key]: update(current.answers[key] ?? { values: [], text: null }) } }));
    setError(null);
  }

  async function saveChanges(destination: "review" | "later") {
    if (pending) return;
    if (!navigator.onLine) {
      setError("You’re offline. Your earlier answers are safe on this device. Reconnect to save these changes.");
      return;
    }
    if (!dirty) {
      router.push(destination === "later" ? "/start?counsellingSaved=1" : "/guidance/review");
      return;
    }
    setPending(true);
    setError(null);
    const changedAnswers: Record<string, Answer> = {};
    for (const key of editKeys) {
      if (!sameAnswer(initial.answers[key], draft.answers[key])) changedAnswers[key] = draft.answers[key];
    }
    try {
      const response = await fetch("/api/profile/correction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stage: draft.stage, stageDetail: draft.stageDetail, answers: changedAnswers }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "We couldn’t save those changes. Your earlier answers are safe—please try again.");
      router.push(destination === "later" ? "/start?counsellingSaved=1" : "/guidance/review");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t save those changes. Your earlier answers are safe—please try again.");
      setPending(false);
    }
  }

  function cancelChanges() {
    if (!pending) router.push("/guidance/review");
  }

  const subjectGroups = SUBJECT_GROUPS as readonly Group[];
  const interestGroups = INTEREST_GROUPS as readonly Group[];

  return <main className="min-h-[calc(100dvh-77px)] bg-[#fbfaf7] px-4 pb-28 pt-6 text-[#26342e] sm:px-6 sm:pt-8 lg:px-8">
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-5 flex justify-end">
        <button type="button" onClick={() => void saveChanges("later")} disabled={pending} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#35675b] transition hover:bg-[#edf4ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] disabled:opacity-60">
          <Save aria-hidden className="h-4 w-4" />{pending ? "Saving…" : "Save and return later"}
        </button>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Edit sections" className="hidden self-start lg:sticky lg:top-24 lg:block">
          <nav className="rounded-xl border border-[#e1e6e1] bg-white p-5 sm:p-6">
            <h2 className="text-base font-semibold text-[#24342e]">Your counselling journey</h2>
            <ol className="mt-5 space-y-1.5">
              {sections.map(({ id, title, icon: Icon }, index) => <li key={id}>
                <a href={`#${id}`} aria-current={activeSection === id ? "step" : undefined} onClick={() => setActiveSection(id)} className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-[.95rem] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] ${activeSection === id ? "bg-[#eaf4ee] font-semibold text-[#245b4c]" : "text-[#506259] hover:bg-[#f6f9f6]"}`}>
                  <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${index < sections.length - 1 ? "bg-[#e6f1eb] text-[#397e70]" : "border border-[#d8dfd8] bg-white text-[#64736a]"}`}><Icon className="h-4 w-4" /></span>{title}
                </a>
              </li>)}
            </ol>
            <div className="mt-4 flex gap-2 border-t border-[#e6ebe6] pt-4 text-xs leading-relaxed text-[#69766e]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#397e70]" /><p>This is your conversation, not a test. You can leave any answer open.</p></div>
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 lg:hidden">
            <details className="rounded-xl border border-[#e1e6e1] bg-white">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between px-4 text-sm font-semibold text-[#34453c]">Jump to a section <span className="text-xs font-normal text-[#65736b]">Your counselling journey</span></summary>
              <nav aria-label="Edit sections" className="border-t border-[#e6ebe6] p-2"><ol className="grid gap-1 sm:grid-cols-2">{sections.map(({ id, title }) => <li key={id}><a href={`#${id}`} onClick={() => setActiveSection(id)} className="flex min-h-10 items-center rounded-md px-3 text-sm text-[#35675b] hover:bg-[#f2f7f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">{title}</a></li>)}</ol></nav>
            </details>
          </div>

          <header className="mb-5">
            <p className="inline-flex rounded-full bg-[#e8f1ec] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#367366]">Your profile · Editing</p>
            <h1 className="mt-3 font-serif text-[clamp(2.1rem,4.3vw,3.35rem)] leading-[1.04] tracking-[-.045em] text-[#172b25]">Change what we understood</h1>
            <p className="mt-2 max-w-[760px] text-base leading-relaxed text-[#66736b]">Update any part of your starting picture. Your saved explorations will stay safe.</p>
          </header>

          <div role="note" className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#e8e3c9] bg-[#fffdf2] px-4 py-3 text-sm leading-relaxed text-[#5d6257]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#397e70]" /><p>Changes here update your starting picture, not your saved explorations. You’ll be able to review the updated picture before continuing.</p></div>

          <div className="space-y-3.5">
            <SectionCard id="edit-where" title="Where you are now" description="A little context helps us keep the possibilities relevant." icon={GraduationCap}>
              <div className="grid gap-5 md:grid-cols-2">
                <fieldset><legend className="font-semibold text-[#24342e]">Current class</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["class10", "class12"] as const).map((value) => <label key={value} className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 text-sm ${draft.stage === value ? "border-[#87b29f] bg-[#edf6f0] font-medium text-[#244b3f]" : "border-[#e1e6e1] bg-white text-[#46534b]"}`}><input type="radio" name="study-stage" value={value} checked={draft.stage === value} disabled={pending} onChange={() => setDraft((current) => ({ ...current, stage: value }))} className="h-4 w-4 accent-[#287d6c]" />Class {value === "class10" ? "10" : "12"}</label>)}
                </div></fieldset>
                <fieldset><legend className="font-semibold text-[#24342e]">Current situation</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {stageDetailOptions.map((option) => <label key={option.value} className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 text-sm ${draft.stageDetail === option.value ? "border-[#87b29f] bg-[#edf6f0] font-medium text-[#244b3f]" : "border-[#e1e6e1] bg-white text-[#46534b]"}`}><input type="radio" name="study-status" value={option.value} checked={draft.stageDetail === option.value} disabled={pending} onChange={() => setDraft((current) => ({ ...current, stageDetail: option.value }))} className="h-4 w-4 accent-[#287d6c]" />{option.label}</label>)}
                </div></fieldset>
              </div>
              <ChoiceQuestion questionKey={streamKey} title={streamQuestion.prompt} helper={streamQuestion.helper} state={draft} setAnswer={setAnswer} disabled={pending} includeNotSure columns={2} />
            </SectionCard>

            <SectionCard id="edit-enjoy" title="What you enjoy" description="Keep the subjects and interests that feel like you; you can change them any time." icon={BookOpen}>
              <GroupedQuestion questionKey="subjects_enjoy" title="Which subjects do you enjoy?" helper="Choose the subjects you genuinely enjoy, not only the ones you get good marks in." groups={subjectGroups} state={draft} disabled={pending} setAnswer={setAnswer} />
              <div className="border-t border-[#e8ebe6] pt-5">
                <GroupedQuestion questionKey="interests" title="What kinds of things genuinely interest you?" helper="Think about what you read about, watch, or enjoy doing. Choose what feels true today." groups={interestGroups} state={draft} disabled={pending} setAnswer={setAnswer} />
              </div>
              <div className="border-t border-[#e8ebe6] pt-5">
                <TextAnswer questionKey="interest_story" title="Something you enjoyed doing recently" helper="A few words are enough. This is optional." state={draft} disabled={pending} setAnswer={setAnswer} rows={2} />
              </div>
            </SectionCard>

            <SectionCard id="edit-bring" title="What you bring" description="Strengths and day-to-day preferences are clues, not labels." icon={Users}>
              <ChoiceQuestion questionKey="strengths" title="What are you good at?" helper="Strengths aren’t only academic. Choose up to five." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} />
              <div className="border-t border-[#e8ebe6] pt-5"><ChoiceQuestion questionKey="work_style" title="What kind of work would feel comfortable day to day?" helper="This is only a starting clue, not a personality test." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} /></div>
            </SectionCard>

            <SectionCard id="edit-matters" title="What matters to you" description="Your priorities can change as you learn more." icon={Target}>
              <ChoiceQuestion questionKey="goals" title="What kind of future interests you?" helper="Choose whatever feels true today." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} />
              <div className="border-t border-[#e8ebe6] pt-5"><ChoiceQuestion questionKey="values" title="Which of these matter most to you in a career?" helper="Pick up to three. There is no right combination." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} /></div>
            </SectionCard>

            <SectionCard id="edit-practical" title="Practical considerations" description="Only broad preferences; no exact address or family-income details." icon={MapPin}>
              <ChoiceQuestion questionKey="location_pref" title="Where would you prefer to study?" helper="Choose a broad location preference, or leave this open for now." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} />
              <div className="border-t border-[#e8ebe6] pt-5"><ChoiceQuestion questionKey="budget" title="What should we keep in mind about study costs?" helper="You do not need to share family income. “Prefer not to answer” is available." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} includeNotSure={false} /></div>
              <div className="border-t border-[#e8ebe6] pt-5"><ChoiceQuestion questionKey="scholarship_need" title="Would scholarship information be useful to you?" helper="This is optional context and can be left open." state={draft} setAnswer={setAnswer} disabled={pending} columns={2} /></div>
              <div className="border-t border-[#e8ebe6] pt-5"><TextAnswer questionKey="anything_else" title="Anything else you’d like us to keep in mind?" helper="Optional. Share only what feels useful to your counselling." state={draft} disabled={pending} setAnswer={setAnswer} rows={3} /></div>
            </SectionCard>
          </div>

          {error && <p role="alert" className="mt-4 rounded-lg border border-[#e8c8bc] bg-[#fff5f0] px-4 py-3 text-sm leading-relaxed text-[#8a3926]">{error}</p>}
          <div id="edit-save" className="mt-5 flex scroll-mt-24 flex-col gap-2 rounded-xl border border-[#e1e6e1] bg-white p-3 shadow-[0_8px_28px_-22px_rgba(25,66,49,.5)] lg:sticky lg:bottom-2 lg:z-30 lg:bg-white/95 lg:backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <p className="text-sm leading-relaxed text-[#66736b]">{dirty ? "You can review your updated starting picture before continuing." : "No changes yet. You can still review or return."}</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button type="button" onClick={cancelChanges} disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d3ddd4] bg-white px-4 text-sm font-medium text-[#35675b] transition hover:bg-[#f5f8f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] disabled:opacity-60">Cancel</button>
              <button type="button" onClick={() => void saveChanges("review")} disabled={pending} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#286b61] px-5 text-sm font-semibold text-white transition hover:bg-[#1f5b53] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] disabled:cursor-wait disabled:opacity-70">{pending ? "Saving changes…" : "Save changes"}<Check aria-hidden className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">{pending ? "Saving your updated starting picture." : dirty ? "You have unsaved edits." : "All edits match your saved answers."}</p>
        </div>
      </div>
    </div>
  </main>;
}
