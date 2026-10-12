"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button, Callout, cx } from "@/components/ui";
import { findQuestion, INTEREST_GROUPS, SUBJECT_GROUPS, questionsForStage, type CounsellingQuestion } from "@/data/counselling";
import type { StudentSnapshot } from "@/services/profile";
import { useCounsellingJourney, type CounsellingStageKey } from "@/components/counselling-journey";

type Answer = { values: string[]; text: string | null };
type State = { stage: "class10" | "class12"; stageDetail?: string | null; snapshot: StudentSnapshot; question: CounsellingQuestion | null; answers?: Record<string, Answer>; progress: { answered: number; total: number }; completed: boolean };
type Draft = { values: string[]; other: string; cost?: string };
const DRAFT_PREFIX = "careerbridge:counselling-draft:";

function restoredAnswer(answer: Answer | undefined, target: CounsellingQuestion) {
  const optionValues = new Set((target.options ?? []).map((option) => option.value));
  const values = answer?.values ?? [];
  const legacyOther = values.filter((value) => !optionValues.has(value) && value !== "not-sure" && !(target.allowOther && value === "other"));
  const selected = values.filter((value) => optionValues.has(value) || value === "not-sure" || (target.allowOther && value === "other"));
  if (target.allowOther && (legacyOther.length > 0 || (values.includes("other") && Boolean(answer?.text)))) {
    if (!selected.includes("other")) selected.push("other");
  }
  const customText = legacyOther.join(", ") || (target.allowOther && selected.includes("other") ? answer?.text ?? "" : "");
  return { selected, other: customText };
}

export function CounsellingExperience({ initial, focusKey, returnTo }: { initial: State; focusKey?: string; returnTo?: string }) {
  const router = useRouter();
  const { setJourney } = useCounsellingJourney();
  const [state, setState] = useState(initial);
  const question = state.question;
  const initialIsPractical = initial.question?.key === "location_pref" || initial.question?.key === "budget";
  const initialAnswer = initial.question ? initial.answers?.[initialIsPractical ? "location_pref" : initial.question.key] : undefined;
  const initialRestored = useMemo(
    () => initial.question ? restoredAnswer(initialAnswer, initialIsPractical ? findQuestion("location_pref")! : initial.question) : null,
    [initial.question, initialAnswer, initialIsPractical],
  );
  const [selected, setSelected] = useState<string[]>(initialRestored?.selected ?? []);
  const [other, setOther] = useState(initialRestored?.other ?? "");
  const savedCostValue = initial.answers?.budget?.values[0] ?? "";
  const [costSelected, setCostSelected] = useState(savedCostValue === "not-sure" ? "unsure" : savedCostValue);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() => {
    const groups = [...SUBJECT_GROUPS, ...INTEREST_GROUPS].filter((group) => group.values.some((value) => initialRestored?.selected.includes(value))).map((group) => group.key);
    if (groups.length) return groups;
    if (initialRestored?.selected.includes("not-sure")) return [];
    return initial.question?.key === "interests" ? [INTEREST_GROUPS[0].key] : [];
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState<string | null>(null);
  const busy = useRef(false);
  const [reviewRetry, setReviewRetry] = useState(0);

  const completeAndOpenReview = useCallback(async () => {
    const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete" }) });
    const result = await response.json() as { error?: string };
    if (!response.ok || result.error) throw new Error(result.error ?? "Your answers are saved, but we couldn’t open the review. Please try again.");
    router.replace("/guidance/review");
  }, [router]);
  const isSubjectsQuestion = question?.key === "subjects_enjoy";
  const isInterestsQuestion = question?.key === "interests";
  const isStrengthsQuestion = question?.key === "strengths";
  const isWorkStyleQuestion = question?.key === "work_style";
  const isGoalsQuestion = question?.key === "goals";
  const isValuesQuestion = question?.key === "values";
  const isPracticalQuestion = question?.key === "location_pref" || question?.key === "budget";
  const isGroupedQuestion = isSubjectsQuestion || isInterestsQuestion;
  const choiceGroups = isInterestsQuestion ? INTEREST_GROUPS : SUBJECT_GROUPS;

  function persistDraft(values: string[], custom = other, cost = costSelected) {
    if (!question) return;
    try {
      sessionStorage.setItem(`${DRAFT_PREFIX}${question.key}`, JSON.stringify({ values, other: custom, ...(isPracticalQuestion ? { cost } : {}) } satisfies Draft));
    } catch {
      // Draft storage is a convenience; the server remains the source of saved answers.
    }
  }

  function clearDraft(questionKey?: string) {
    if (!questionKey) return;
    try { sessionStorage.removeItem(`${DRAFT_PREFIX}${questionKey}`); } catch { /* Ignore unavailable browser storage. */ }
  }

  useEffect(() => {
    if (!question) return;
    try {
      const raw = sessionStorage.getItem(`${DRAFT_PREFIX}${question.key}`);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<Draft>;
      if (!Array.isArray(draft.values) || !draft.values.every((value) => typeof value === "string")) return;
      const draftQuestion = isPracticalQuestion ? findQuestion("location_pref")! : question;
      const allowed = new Set([...(draftQuestion.options ?? []).map((option) => option.value), "not-sure", ...(draftQuestion.allowOther ? ["other"] : [])]);
      const budgetOptions = findQuestion("budget")?.options ?? [];
      const isLegacyBudgetDraft = isPracticalQuestion && question.key === "budget" && draft.cost === undefined;
      const restoredValues = isLegacyBudgetDraft ? initialRestored?.selected ?? [] : draft.values.filter((value) => allowed.has(value));
      const oldBudgetDraft = isLegacyBudgetDraft ? draft.values.find((value) => value === "not-sure" || budgetOptions.some((option) => option.value === value)) : undefined;
      // This effect intentionally hydrates a session-local draft from browser storage when a question is mounted.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(restoredValues);
      setOther(typeof draft.other === "string" ? draft.other : "");
      const draftCost = typeof draft.cost === "string" && budgetOptions.some((option) => option.value === draft.cost) ? draft.cost : oldBudgetDraft;
      if (isPracticalQuestion && draftCost) {
        setCostSelected(draftCost === "not-sure" ? "unsure" : draftCost);
      }
      if (question.key === "subjects_enjoy" || question.key === "interests") {
        const groups = question.key === "interests" ? INTEREST_GROUPS : SUBJECT_GROUPS;
        setExpandedGroups(groups.filter((group) => group.values.some((value) => restoredValues.includes(value))).map((group) => group.key));
      }
    } catch {
      // Ignore malformed or unavailable draft storage and keep the server answer.
    }
  }, [question, isPracticalQuestion, initialRestored?.selected]);

  function syncJourney(next: State) {
    const sectionByQuestion: Record<CounsellingQuestion["section"], CounsellingStageKey> = { academics: "about", interests: "interests", strengths: "strengths", goals: "goals", practical: "practical" };
    const nextSection = next.question ? sectionByQuestion[next.question.section] : "reflection";
    const coreQuestions = questionsForStage(next.stage);
    const completedSections = (["about", "interests", "strengths", "goals", "practical"] as CounsellingStageKey[]).filter((section) => coreQuestions.filter((item) => sectionByQuestion[item.section] === section).every((item) => next.snapshot.answeredKeys.includes(item.key)));
    setJourney({ currentSection: nextSection, completedSections, progress: { current: next.question ? Math.min(next.progress.answered + 1, next.progress.total) : next.progress.total, total: next.progress.total } });
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [question?.key]);

  useEffect(() => {
    syncJourney(state);
    // The question state is the source of truth; the journey context mirrors it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.question?.key, state.progress.answered, state.completed]);

  useEffect(() => {
    if (question || !state.completed) return;
    let active = true;
    void completeAndOpenReview().catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Your answers are saved, but we couldn’t open the review. Please try again.");
    });
    return () => { active = false; };
  }, [question, state.completed, reviewRetry, completeAndOpenReview]);

  async function submitPractical() {
    if (busy.current || !question) return;
    if (!selected.length) { setError("Choose a location preference, or choose ‘I’m not sure yet’."); return; }
    busy.current = true; setPending(true); setError(null);
    try {
      const save = async (questionKey: string, action: "answer" | "skip", values: string[]) => {
        const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, questionKey, values, text: null, stage: state.stage }) });
        const result = await response.json() as State & { error?: string };
        if (!response.ok || result.error) throw new Error(result.error ?? "We couldn’t save that answer. Please try again.");
        return result;
      };
      await save("location_pref", "answer", selected);
      const next = await save("budget", costSelected ? "answer" : "skip", costSelected ? [costSelected] : []);
      clearDraft("location_pref"); clearDraft("budget");
      if (focusKey) { router.push(returnTo || "/guidance/review"); router.refresh(); return; }
      if (!next.question) {
        await completeAndOpenReview();
      } else {
        setState(next); syncJourney(next); setSelected([]); setCostSelected("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The connection was interrupted. Your earlier answers are safe—please try again.");
    } finally { busy.current = false; setPending(false); }
  }

  async function submit(action: "answer" | "skip" = "answer") {
    if (busy.current || !question) return;
    const questionKey = question.key;
    const chosen = [...selected];
    const answerText = selected.includes("other") ? other.trim() || null : null;
    if (action === "answer" && !chosen.length) { setError("Choose an option or choose ‘Not sure yet’."); return; }
    busy.current = true; setPending(true); setError(null);
    try {
      const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, questionKey, values: chosen, text: answerText, stage: state.stage }) });
      const next = await response.json() as State & { error?: string };
      if (!response.ok || next.error) { setError(next.error ?? "Couldn’t save. Please try again."); return; }
      clearDraft(questionKey);
      if (focusKey) { router.push(returnTo || "/guidance/review"); router.refresh(); return; }
      if (!next.question) {
        await completeAndOpenReview();
      } else if (historyKey) {
        const current = await fetch("/api/counselling").then((result) => result.json() as Promise<State>);
        setState(current); syncJourney(current); setHistoryKey(null); setSelected([]); setOther("");
      } else {
        setState(next); syncJourney(next); setSelected([]); setOther("");
      }
    } catch { setError("The connection was interrupted. Your earlier answers are safe—please try again."); }
    finally { busy.current = false; setPending(false); }
  }

  const coreQuestions = questionsForStage(state.stage);
  const currentIndex = question ? coreQuestions.findIndex((item) => item.key === question.key) : coreQuestions.length;
  const previousQuestion = isWorkStyleQuestion
    ? findQuestion("strengths") ?? null
    : isGoalsQuestion && state.snapshot.answeredKeys.includes("work_style")
      ? findQuestion("work_style") ?? null
    : question && currentIndex > 0
      ? [...coreQuestions.slice(0, currentIndex)].reverse().find((item) => state.snapshot.answeredKeys.includes(item.key)) ?? null
      : null;

  if (!question) {
    return <div className="mx-auto max-w-[1034px] py-8">
      {error ? <Callout tone="amber"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p role="alert" className="m-0">{error}</p><Button type="button" onClick={() => { setError(null); setReviewRetry((attempt) => attempt + 1); }}>Try again</Button></div></Callout> : <p role="status" aria-live="polite" className="text-sm text-[#68758a]">Opening your answer review…</p>}
    </div>;
  }

  async function goBack() {
    if (pending) return;
    if (!previousQuestion) {
      if (focusKey) { router.push(returnTo || "/guidance/review"); router.refresh(); }
      return;
    }
    if (question) persistDraft(selected, other);
    if (state.stage === "class10" && previousQuestion.key === "stream_intent") {
      router.push("/counselling?edit=stream_intent");
      router.refresh();
      return;
    }
    if (state.stage === "class12" && previousQuestion.key === "stream_current") {
      router.push("/counselling?edit=stream_current");
      router.refresh();
      return;
    }
    if (previousQuestion.key === "subjects_enjoy") {
      router.push("/counselling?edit=subjects_enjoy&returnTo=/counselling");
      router.refresh();
      return;
    }
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/counselling?question=${encodeURIComponent(previousQuestion.key)}`);
      if (!response.ok) throw new Error();
      const next = await response.json() as State;
      const answer = next.answers?.[previousQuestion.key];
      const restored = restoredAnswer(answer, previousQuestion);
      setState(next); syncJourney(next); setHistoryKey(previousQuestion.key); setSelected(restored.selected); setOther(restored.other);
    } catch { setError("We couldn't go back just now. Please try again."); }
    finally { setPending(false); }
  }

  function choose(value: string) {
    if (!question) return;
    setSelected((previous) => {
      const next = question.answerType === "single"
        ? (previous.includes(value) ? [] : [value])
        : previous.includes(value)
          ? previous.filter((item) => item !== value)
          : question.maxSelections && previous.filter((item) => item !== "not-sure").length >= question.maxSelections
            ? previous
            : [...previous.filter((item) => item !== "not-sure"), value];
      persistDraft(next, other);
      return next;
    });
  }

  function chooseNotSure() {
    const next = ["not-sure"];
    setSelected(next);
    if (isGroupedQuestion) setExpandedGroups([]);
    persistDraft(next, other);
  }

  const locationOptions = findQuestion("location_pref")?.options ?? [];
  const budgetOptions = findQuestion("budget")?.options ?? [];
  const selectedChoiceCount = selected.filter((value) => value !== "not-sure" && value !== "other").length;

  return <div className="mx-auto max-w-[1034px]">
    <header className="mb-6 sm:mb-7">
      <span className="inline-flex rounded-full bg-[#eaf3ed] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#39796c]">Step {isPracticalQuestion || isValuesQuestion || isGoalsQuestion ? 4 : isStrengthsQuestion || isWorkStyleQuestion ? 3 : 2} of 5</span>
      {isWorkStyleQuestion && <p className="mt-4 text-sm font-medium text-[#707575]">Optional</p>}
      <h1 className={cx("text-[clamp(2rem,3.2vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-[#20272b]", isWorkStyleQuestion ? "mt-2" : "mt-5")}>{isPracticalQuestion ? "Where would you prefer to study?" : isStrengthsQuestion || isWorkStyleQuestion || isGoalsQuestion || isValuesQuestion ? question.prompt : isInterestsQuestion ? "What kinds of things genuinely interest you?" : "Which subjects do you enjoy the most?"}</h1>
      <p className="mt-3 max-w-[78ch] text-base leading-relaxed text-[#707575] sm:text-lg">{isPracticalQuestion ? "A broad preference is enough. We never need your exact address." : isStrengthsQuestion ? "Strengths are not only academic. Choose up to five." : isWorkStyleQuestion ? question.helper : isGoalsQuestion || isValuesQuestion ? question.helper : isInterestsQuestion ? "Think about what you read about, watch, make, or lose track of time doing." : "Choose the subjects you enjoy, not only the ones where you get the highest marks."}</p>
    </header>
    {error && <div className="mb-5"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}
    <form id="counselling-form" className="cb-counselling-form" onSubmit={(event) => { event.preventDefault(); void (isPracticalQuestion ? submitPractical() : submit(isWorkStyleQuestion && !selected.length ? "skip" : "answer")); }}><fieldset disabled={pending}>
      {question.maxSelections && <p role={isStrengthsQuestion || isValuesQuestion ? "status" : undefined} aria-live={isStrengthsQuestion || isValuesQuestion ? "polite" : undefined} className="mb-4 text-xs font-semibold text-ink-500">{isStrengthsQuestion || isValuesQuestion ? `${selected.filter((value) => value !== "not-sure").length} of ${question.maxSelections} selected` : `Choose up to ${question.maxSelections} · ${selected.filter((value) => value !== "not-sure").length} selected`}</p>}
      {isPracticalQuestion ? <div className="space-y-5">
        <div role="radiogroup" aria-label="Study location preference" className="grid gap-2 md:grid-cols-2">
          {locationOptions.map((option) => <label key={option.value} className={cx("flex min-h-[60px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:px-5 sm:text-base", selected.includes(option.value) ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
            <input type="radio" name="location-preference" checked={selected.includes(option.value)} onChange={() => choose(option.value)} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">{option.label}</span>
          </label>)}
          <label className={cx("flex min-h-[60px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:px-5 sm:text-base", selected.includes("not-sure") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
            <input type="radio" name="location-preference" checked={selected.includes("not-sure")} onChange={() => choose("not-sure")} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">I’m not sure yet</span>
          </label>
        </div>
        <section aria-labelledby="study-costs-title" className="rounded-[10px] border border-[#e4e7e2] bg-[#f8faf8] p-4 sm:p-5">
          <span className="inline-flex rounded-full bg-[#e8f5ef] px-3 py-1 text-xs font-semibold text-[#287d6c]">Optional</span>
          <h2 id="study-costs-title" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[#20272b] sm:text-2xl">What should we keep in mind about study costs?</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#707575] sm:text-base">You do not need to share family income. A broad preference is enough.</p>
          <div role="radiogroup" aria-labelledby="study-costs-title" className="mt-3 space-y-1.5">
            {budgetOptions.map((option) => <label key={option.value} className={cx("flex min-h-[39px] cursor-pointer items-center gap-4 rounded-md border px-3 text-sm transition sm:text-base", costSelected === option.value ? "border-[#8bb7a8] bg-[#eef7f2]" : "border-[#e0e5e2] bg-white hover:bg-[#f4f8f5]")}>
              <input type="radio" name="study-cost-context" checked={costSelected === option.value} onChange={() => { setCostSelected(option.value); persistDraft(selected, other, option.value); }} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
              <span className="font-medium text-[#303638]">{option.label}</span>
            </label>)}
          </div>
        </section>
      </div> : isGroupedQuestion ? <div className="space-y-2" aria-label={isInterestsQuestion ? "Things that interest you" : "Subjects you enjoy"}>
        {choiceGroups.map((group) => {
          const groupSelected = group.values.filter((value) => selected.includes(value)).length;
          const expanded = expandedGroups.includes(group.key);
          const panelId = `choice-group-${group.key}`;
          return <section key={group.key} className="overflow-hidden rounded-[9px] border border-[#e4e3df] bg-white">
            <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpandedGroups((current) => expanded ? current.filter((key) => key !== group.key) : [...current, group.key])} className="flex min-h-[60px] w-full items-center gap-4 px-4 text-left text-[#20272b] transition hover:bg-[#fafbf9] focus-visible:outline-offset-[-3px] sm:px-5">
              <span className="min-w-0 flex-1 text-sm font-semibold sm:text-base">{group.label}</span>
              <span className="whitespace-nowrap text-xs text-[#6c7172] sm:text-sm">{groupSelected} selected</span>
              <ChevronRight aria-hidden className={cx("h-5 w-5 shrink-0 text-[#4c5556] transition-transform", expanded && "rotate-90")} />
            </button>
            {expanded && <div id={panelId} role="group" aria-label={group.label} className="space-y-1 border-t border-[#ecebe7] px-4 py-2 sm:px-5">
              {group.values.map((value) => {
                const option = question.options?.find((item) => item.value === value);
                if (!option) return null;
                const label = value === "science" && isSubjectsQuestion ? "Science generally" : option.label;
                const checked = selected.includes(value);
                return <label key={value} className={cx("flex min-h-[40px] cursor-pointer items-center gap-3 rounded-md border px-2 text-sm text-[#303638] transition sm:text-[15px]", checked ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-transparent hover:bg-[#f7faf8]")}>
                  <input type="checkbox" checked={checked} onChange={() => choose(value)} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
                  <span>{label}</span>
                  {checked && <Check aria-hidden className="ml-auto h-4 w-4 shrink-0 text-[#287d6c]" strokeWidth={2.5} />}
                </label>;
              })}
            </div>}
          </section>;
        })}
        <div className={cx("rounded-[9px] border bg-white", isInterestsQuestion && selected.includes("other") ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e4e3df]")}>
          <label className="flex min-h-[60px] cursor-pointer items-center gap-4 rounded-t-[8px] px-4 text-sm text-[#303638] transition hover:bg-[#fafbf9] focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-3px] focus-within:outline-[#397e70] sm:px-5 sm:text-base">
            <input type="checkbox" checked={selected.includes("other")} onChange={() => choose("other")} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium">Something else</span>
          </label>
          {selected.includes("other") && <div className="border-t border-[#ecebe7] px-4 py-3 sm:px-5">
            {isInterestsQuestion ? <>
              <label htmlFor="grouped-other" className="mb-2 block text-base font-medium text-[#454c4d]">Tell us more, if you’d like. <span className="font-normal text-[#777d7d]">Optional.</span></label>
              <textarea id="grouped-other" aria-describedby="interest-other-help" value={other} onChange={(event) => { const value = event.target.value; setOther(value); persistDraft(selected, value); }} maxLength={600} rows={4} placeholder="Share an interest in your own words (optional)" className="min-h-24 w-full resize-y rounded-lg border border-[#bfc3c5] bg-white px-3.5 py-2.5 text-base text-[#20272b] outline-none transition placeholder:text-[#858a89] focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20" />
              <p id="interest-other-help" className="mt-2 text-sm text-[#777d7d]">Your own words can help us understand what the list cannot capture.</p>
            </> : <>
              <label htmlFor="grouped-other" className="mb-1.5 block text-sm font-medium text-[#454c4d]">Tell us what else you enjoy <span className="font-normal text-[#777d7d]">(optional)</span></label>
              <input id="grouped-other" value={other} onChange={(event) => { const value = event.target.value; setOther(value); persistDraft(selected, value); }} maxLength={600} placeholder="Add a subject (optional)" className="min-h-11 w-full rounded-lg border border-[#d9d9d5] bg-white px-3.5 text-sm text-[#20272b] outline-none transition placeholder:text-[#858a89] focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20" />
            </>}
          </div>}
        </div>
        <label className={cx("flex min-h-[60px] cursor-pointer items-center gap-4 rounded-[9px] border px-4 text-sm transition sm:px-5 sm:text-base", selected.includes("not-sure") ? "border-[#579786] bg-[#f0f7f3]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
          <input type="radio" name="grouped-answer" checked={selected.includes("not-sure")} onChange={chooseNotSure} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
          <span className="font-medium text-[#303638]">I’m not sure yet</span>
        </label>
        {selected.includes("not-sure") && <p role="status" className="mt-3 rounded-[9px] bg-[#eaf5f0] px-5 py-4 text-sm leading-relaxed text-[#35675b]">That’s okay. You can explore possibilities before deciding.</p>}
        {selectedChoiceCount > 0 && <p role="status" className="mt-2 text-sm text-[#6c7172]">{selectedChoiceCount} {selectedChoiceCount === 1 ? (isInterestsQuestion ? "interest" : "subject") : (isInterestsQuestion ? "interests" : "subjects")} selected</p>}
      </div> : isStrengthsQuestion ? <div className="grid gap-2 md:grid-cols-2" aria-label="Strengths you recognize in yourself">
        {(question.options ?? []).map((option) => {
          const checked = selected.includes(option.value);
          const isOtherOption = option.value === "other";
          const limitReached = Boolean(question.maxSelections && selected.filter((value) => value !== "not-sure").length >= question.maxSelections);
          const blockedByLimit = !checked && limitReached;
          return <div key={option.value}>
            <label className={cx("flex min-h-[49px] cursor-pointer items-center gap-4 rounded-[8px] border px-4 text-sm transition sm:text-base", checked ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]", blockedByLimit && "cursor-not-allowed opacity-50")}>
              <input type="checkbox" checked={checked} disabled={blockedByLimit} onChange={() => choose(option.value)} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
              <span className="font-medium text-[#303638]">{option.label}</span>
            </label>
            {isOtherOption && checked && <div className="mt-1 rounded-lg border border-[#e4e3df] bg-white px-3 py-2">
              <label htmlFor="strength-other" className="mb-1 block text-xs font-medium text-[#454c4d]">Tell us what else you’re good at <span className="font-normal text-[#777d7d]">(optional)</span></label>
              <input id="strength-other" value={other} onChange={(event) => { const value = event.target.value; setOther(value); persistDraft(selected, value); }} maxLength={600} placeholder="Add a strength in your own words" className="min-h-10 w-full rounded-md border border-[#d9d9d5] px-3 text-sm outline-none focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20" />
            </div>}
          </div>;
        })}
        <label className={cx("flex min-h-[49px] cursor-pointer items-center gap-4 rounded-[8px] border px-4 text-sm transition sm:text-base", selected.includes("not-sure") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
          <input type="checkbox" checked={selected.includes("not-sure")} onChange={(event) => { if (event.target.checked) chooseNotSure(); else { const next = selected.filter((value) => value !== "not-sure"); setSelected(next); persistDraft(next); } }} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
          <span className="font-medium text-[#303638]">I’m not sure yet</span>
        </label>
      </div> : isWorkStyleQuestion ? <div className="grid gap-5 md:grid-cols-2" aria-label="Work style preferences">
        {(question.options ?? []).map((option) => {
          const checked = selected.includes(option.value);
          return <label key={option.value} className={cx("flex min-h-[102px] cursor-pointer items-center gap-5 rounded-[9px] border px-5 text-sm transition sm:text-base", checked ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
            <input type="radio" name="work-style-answer" checked={checked} onChange={() => choose(option.value)} className="h-9 w-9 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">{option.label}</span>
          </label>;
        })}
        <label className={cx("flex min-h-[102px] cursor-pointer items-center gap-5 rounded-[9px] border px-5 text-sm transition sm:text-base", selected.includes("not-sure") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
          <input type="radio" name="work-style-answer" checked={selected.includes("not-sure")} onChange={() => choose("not-sure")} className="h-9 w-9 shrink-0 accent-[#287d6c]" />
          <span className="font-medium text-[#303638]">I’m not sure yet</span>
        </label>
      </div> : isValuesQuestion ? <div className="grid gap-2 md:grid-cols-2" aria-label="Career values">
        {(question.options ?? []).filter((option) => option.value !== "location" || selected.includes("location")).map((option) => {
          const checked = selected.includes(option.value);
          const limitReached = selected.filter((value) => value !== "not-sure").length >= (question.maxSelections ?? 3);
          return <label key={option.value} className={cx("flex min-h-[67px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:text-base", checked ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]", !checked && limitReached && "cursor-not-allowed opacity-55")}>
            <input type="checkbox" checked={checked} disabled={!checked && limitReached} onChange={() => choose(option.value)} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">{option.label}</span>
            {checked && <Check aria-hidden className="ml-auto h-4 w-4 shrink-0 text-[#287d6c]" strokeWidth={2.5} />}
          </label>;
        })}
        <div>
          <label className={cx("flex min-h-[67px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:text-base", selected.includes("other") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]", !selected.includes("other") && selected.filter((value) => value !== "not-sure").length >= (question.maxSelections ?? 3) && "cursor-not-allowed opacity-55")}>
            <input type="checkbox" checked={selected.includes("other")} disabled={!selected.includes("other") && selected.filter((value) => value !== "not-sure").length >= (question.maxSelections ?? 3)} onChange={() => choose("other")} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">Something else</span>
            {selected.includes("other") && <Check aria-hidden className="ml-auto h-4 w-4 shrink-0 text-[#287d6c]" strokeWidth={2.5} />}
          </label>
          {selected.includes("other") && <div className="mt-1 rounded-lg border border-[#e4e3df] bg-white px-3 py-2">
            <label htmlFor="values-other" className="mb-1 block text-xs font-medium text-[#454c4d]">Tell us what else matters to you <span className="font-normal text-[#777d7d]">(optional)</span></label>
            <input id="values-other" value={other} onChange={(event) => { const value = event.target.value; setOther(value); persistDraft(selected, value); }} maxLength={600} placeholder="Add another career value (optional)" className="min-h-10 w-full rounded-md border border-[#d9d9d5] px-3 text-sm outline-none focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20" />
          </div>}
        </div>
        <label className={cx("flex min-h-[67px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:text-base", selected.includes("not-sure") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
          <input type="checkbox" checked={selected.includes("not-sure")} onChange={(event) => { if (event.target.checked) chooseNotSure(); else { const next = selected.filter((value) => value !== "not-sure"); setSelected(next); persistDraft(next); } }} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
          <span className="font-medium text-[#303638]">I’m not sure yet</span>
          {selected.includes("not-sure") && <span className="ml-auto text-xs text-[#557068]">That’s okay. You can explore possibilities before deciding.</span>}
        </label>
      </div> : isGoalsQuestion ? <div className="grid gap-2 md:grid-cols-2" aria-label="Future goals">
        {(question.options ?? []).map((option) => {
          const checked = selected.includes(option.value);
          return <label key={option.value} className={cx("flex min-h-[67px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:text-base", checked ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
            <input type="checkbox" checked={checked} onChange={() => choose(option.value)} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">{option.label}</span>
          </label>;
        })}
        <div>
          <label className={cx("flex min-h-[67px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:text-base", selected.includes("other") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
            <input type="checkbox" checked={selected.includes("other")} onChange={() => choose("other")} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
            <span className="font-medium text-[#303638]">Something else I hope for</span>
          </label>
          {selected.includes("other") && <div className="mt-1 rounded-lg border border-[#e4e3df] bg-white px-3 py-2">
            <label htmlFor="goals-other" className="mb-1 block text-xs font-medium text-[#454c4d]">Tell us what else you hope for <span className="font-normal text-[#777d7d]">(optional)</span></label>
            <input id="goals-other" value={other} onChange={(event) => { const value = event.target.value; setOther(value); persistDraft(selected, value); }} maxLength={600} placeholder="Add a future goal in your own words" className="min-h-10 w-full rounded-md border border-[#d9d9d5] px-3 text-sm outline-none focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20" />
          </div>}
        </div>
        <label className={cx("flex min-h-[67px] cursor-pointer items-center gap-5 rounded-[8px] border px-4 text-sm transition sm:text-base", selected.includes("not-sure") ? "border-[#69a18e] bg-[#f1f8f4]" : "border-[#e4e3df] bg-white hover:bg-[#fafbf9]")}>
          <input type="checkbox" checked={selected.includes("not-sure")} onChange={(event) => { if (event.target.checked) chooseNotSure(); else { const next = selected.filter((value) => value !== "not-sure"); setSelected(next); persistDraft(next); } }} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
          <span className="font-medium text-[#303638]">I’m not sure yet</span>
        </label>
        <p role="status" aria-live="polite" className="text-sm text-[#6c7172]">{selected.filter((value) => value !== "not-sure").length} selected</p>
      </div> : null}

      <div className="cb-counselling-actions mt-6 border-t border-[#e6e4df] bg-white pt-4 !static !bottom-auto !z-auto !backdrop-blur-none">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" disabled={pending || (!previousQuestion && !focusKey)} onClick={() => void goBack()} className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-1 text-sm font-medium text-[#243238] transition hover:text-[#286b61] disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft aria-hidden className="h-5 w-5" />Back</button>
          <Button type="submit" disabled={pending} size="lg" className="min-w-[205px] rounded-lg bg-[#287d6c] hover:bg-[#226d5e]">{pending ? "Saving…" : focusKey ? "Save changes" : "Continue"}<ArrowRight aria-hidden className="h-5 w-5" /></Button>
        </div>
      </div>
    </fieldset></form>
  </div>;
}
