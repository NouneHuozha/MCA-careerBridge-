"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, Check, CircleHelp, Leaf, Monitor, Palette, RotateCcw, UsersRound, Wrench } from "lucide-react";
import { Button, Callout, cx } from "@/components/ui";
import { questionsForStage, type CounsellingQuestion } from "@/data/counselling";
import type { StudentSnapshot } from "@/services/profile";
import { useCounsellingJourney, type CounsellingStageKey } from "@/components/counselling-journey";

type Answer = { values: string[]; text: string | null };
type State = { started: boolean; stage: "class10" | "class12"; stageDetail?: string | null; snapshot: StudentSnapshot; question: CounsellingQuestion | null; answers?: Record<string, Answer>; acknowledgement?: string; progress: { answered: number; total: number }; sections: { key: string; label: string }[]; completed: boolean };

function questionIntro(question: CounsellingQuestion) {
  if (question.key === "subjects_enjoy") return "Let’s begin with something familiar.";
  if (question.key === "interests") return "There is no perfect answer here—just notice what pulls your attention.";
  if (question.key === "strengths") return "Strengths are not only about marks.";
  if (question.key === "goals") return "Your direction can change. This is only about what matters today.";
  if (question.key === "location_pref" || question.key === "budget") return "A broad answer is enough. You can skip anything you do not want to answer.";
  return "Take a moment. Choose what feels closest to you.";
}

const sectionLabels: Record<CounsellingQuestion["section"], string> = {
  academics: "About you",
  interests: "What interests you",
  strengths: "What you bring",
  goals: "What matters to you",
  practical: "Practical realities",
};

export function CounsellingExperience({ initial, focusKey }: { initial: State; focusKey?: string }) {
  const router = useRouter();
  const { setJourney } = useCounsellingJourney();
  const [state, setState] = useState(initial);
  const question = state.question;
  const initialAnswer = initial.question ? initial.answers?.[initial.question.key] : undefined;
  const initialOptions = initial.question?.options?.map((o) => o.value) ?? [];
  const [selected, setSelected] = useState<string[]>(initialAnswer?.values.filter((v) => initialOptions.includes(v) || v === "not-sure") ?? []);
  const [other, setOther] = useState(initialAnswer?.values.filter((v) => !initialOptions.includes(v) && v !== "not-sure").join(", ") ?? "");
  const [text, setText] = useState(initialAnswer?.text ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyKey, setHistoryKey] = useState<string | null>(null);
  const confirmReset = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);

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

  async function submit(action: "answer" | "skip" | "reset" = "answer", unsure = false) {
    if (busy.current || (!question && action !== "reset")) return;
    const chosen = unsure ? ["not-sure"] : [...selected, ...(other.trim() ? [other.trim()] : [])];
    if (action === "answer" && !chosen.length && !text.trim()) { setError("Choose an option, write a short answer, or choose ‘Not sure yet’."); return; }
    busy.current = true; setPending(true); setError(null);
    try {
      const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, questionKey: question?.key, values: chosen, text: question?.answerType === "text" ? (unsure ? "Not sure yet" : text.trim()) : null, stage: state.stage }) });
      const next = await response.json() as State & { error?: string };
      if (!response.ok || next.error) { setError(next.error ?? "Couldn’t save. Please try again."); return; }
      if (focusKey && action !== "reset") { router.push("/reflection"); router.refresh(); return; }
      if (action === "reset") {
        setState(next); syncJourney(next); setSelected([]); setOther(""); setText("");
        return;
      }
      if (!next.question) {
        const finished = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete" }) });
        if (!finished.ok) setError("Your answers are saved. You can open My possibilities below.");
        else {
          const completed = await finished.json() as State;
          setState(completed); syncJourney(completed); setSelected([]); setOther(""); setText("");
        }
      } else if (historyKey) {
        const current = await fetch("/api/counselling").then((response) => response.json() as Promise<State>);
        setState(current); syncJourney(current); setHistoryKey(null); setSelected([]); setOther(""); setText("");
      } else {
        setState(next); syncJourney(next); setSelected([]); setOther(""); setText("");
      }
    } catch { setError("The connection was interrupted. Your earlier answers are safe—please try again."); }
    finally { busy.current = false; setPending(false); }
  }

  const total = state.progress.total;
  const done = state.progress.answered;
  const coreQuestions = questionsForStage(state.stage);
  const currentIndex = question ? coreQuestions.findIndex((item) => item.key === question.key) : total;
  const currentNumber = historyKey ? currentIndex + 1 : Math.min(done + (question ? 1 : 0), total);
  const previousQuestion = question && currentIndex > 0 ? [...coreQuestions.slice(0, currentIndex)].reverse().find((item) => state.snapshot.answeredKeys.includes(item.key)) : null;

  async function goBack() {
    if (!previousQuestion || pending) return;
    setPending(true); setError(null);
    try {
      const response = await fetch(`/api/counselling?question=${encodeURIComponent(previousQuestion.key)}`);
      if (!response.ok) throw new Error();
      const next = await response.json() as State;
      const answer = next.answers?.[previousQuestion.key];
      setState(next); syncJourney(next); setHistoryKey(previousQuestion.key); setSelected(answer?.values ?? []); setOther(""); setText(answer?.text ?? "");
    } catch { setError("We couldn't go back just now. Please try again."); }
    finally { setPending(false); }
  }

  function choose(value: string) {
    setSelected((prev) => question?.answerType === "single"
      ? (prev.includes(value) ? [] : [value])
      : prev.includes(value)
        ? prev.filter((v) => v !== value)
        : question?.maxSelections && prev.length >= question.maxSelections
          ? prev
          : [...prev.filter((v) => v !== "not-sure"), value]);
  }

  const descriptions: Record<string, string> = { technology: "Coding, software, AI, digital tools and new technologies", helping: "Teaching, healthcare, counselling, community service", engineering: "Engineering, construction, design, repairs, hands-on problem solving", business: "Management, finance, entrepreneurship, marketing, leadership", arts: "Visual arts, music, media, writing, crafts and creative expression", environment: "Biology, wildlife, agriculture, conservation, outdoor work" };
  const iconFor = (value: string) => value === "technology" ? <Monitor className="h-8 w-8" /> : value === "helping" ? <UsersRound className="h-8 w-8" /> : value === "engineering" ? <Wrench className="h-8 w-8" /> : value === "business" ? <BarChart3 className="h-8 w-8" /> : value === "arts" ? <Palette className="h-8 w-8" /> : <Leaf className="h-8 w-8" />;
  const iconTone = (index: number) => ["bg-[#e8e0ff] text-[#5e4aaa]", "bg-[#dff2e9] text-[#28775f]", "bg-[#ffefb5] text-[#87722b]", "bg-[#e8e0ff] text-[#6048b4]", "bg-[#d8f1e6] text-[#28775f]", "bg-[#ffefb5] text-[#87722b]"][index % 6];
  const sectionLabel = question ? sectionLabels[question.section] : "Your reflection";
  return <div className="mx-auto max-w-[1110px]">
    <header className="cb-counselling-question-header mb-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.17em] text-[#317966]">{question ? historyKey ? `Reviewing question ${currentNumber} of ${total}` : `Question ${currentNumber} of ${total}` : "Your reflection is ready"}</p>{question && <span className="rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-700">{total} questions · About 5 minutes</span>}</div>
      {question && <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-label="Counselling progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(currentNumber, total)}><div className="h-full rounded-full bg-[#7256df] transition-all duration-500" style={{ width: `${Math.max(8, (currentNumber / Math.max(total, 1)) * 100)}%` }} /></div>}
      <p className="mt-7 text-sm font-bold uppercase tracking-[.16em] text-[#5e4aaa]">{sectionLabel}</p>
      {question && <p className="mt-2 text-base font-medium text-ink-500">{questionIntro(question)}</p>}
      <h1 className="mt-3 max-w-[28ch] text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight tracking-[-.04em] text-[#07352b]">{question?.prompt ?? "Your profile is ready to explore."}</h1>
      <p className="mt-3 text-base text-ink-500">{question ? "Choose what feels true today. You can change this later." : "You have given us a useful starting point."}</p>
    </header>
    {state.acknowledgement && question && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#d2e9df] bg-[#effaf5] px-5 py-4 text-sm text-[#155b4d]" role="status"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#2a8b6d]" /><p>{state.acknowledgement}</p></div>}
    {error && <div className="mb-5"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}
    {question ? <form className="cb-counselling-form" onSubmit={(event) => { event.preventDefault(); void submit(); }}><fieldset disabled={pending}>
      {question.helper && <p className="mb-5 text-sm text-ink-500">{question.helper}</p>}
      {question.maxSelections && <p className="mb-4 text-xs font-semibold text-ink-500">Choose up to {question.maxSelections} · {selected.length} selected</p>}
      {question.answerType === "text" ? <div className="rounded-2xl border-2 border-ink-200 bg-white p-4"><label className="sr-only" htmlFor="counselling-text">Your answer</label><textarea id="counselling-text" rows={5} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="A few words are enough…" className="w-full resize-none border-0 bg-transparent text-base outline-none" /></div> : <div className="grid gap-3 md:grid-cols-2">{(question.options ?? []).map((option, index) => <button type="button" key={option.value} aria-pressed={selected.includes(option.value)} onClick={() => choose(option.value)} className={cx("group flex min-h-[96px] items-center gap-3 rounded-2xl border bg-white px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#9a85ea] hover:shadow-[0_8px_22px_-18px_#6048b4]", selected.includes(option.value) ? "border-[#8970df] bg-[#f8f5ff] shadow-[0_8px_20px_-14px_#6048b4]" : "border-ink-100")}><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${iconTone(index)}`}>{iconFor(option.value)}</span><span className="min-w-0"><span className="flex items-center justify-between gap-3 text-[15px] font-semibold text-[#17352f]">{option.label}{selected.includes(option.value) && <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#8065dc] text-white"><Check className="h-3.5 w-3.5" /></span>}</span><span className="mt-1 block text-[13px] leading-snug text-ink-500">{descriptions[option.value] ?? option.hint ?? "A direction you might enjoy exploring."}</span></span></button>)}</div>}
      {question.allowOther && <div className="mt-4"><label htmlFor="counselling-other" className="sr-only">Something else</label><input id="counselling-other" value={other} onChange={(e) => setOther(e.target.value)} maxLength={80} placeholder="Something else? Add it here (optional)" className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8065dc]" /></div>}
      <div className="cb-counselling-actions mt-8 border-t border-ink-100 pt-5"><div className="flex flex-col gap-4"><button type="button" disabled={pending} onClick={() => void submit("answer", true)} className="flex min-h-14 w-full items-center justify-between rounded-2xl border-2 border-[#b9a9ed] bg-[#f7f4ff] px-4 text-left text-sm font-semibold text-[#5d46b8] transition hover:border-[#8065dc] hover:bg-[#f0ebff]"><span><span className="block">Not sure yet</span><span className="mt-0.5 block text-xs font-normal text-[#7668a4]">That&apos;s a valid answer. You can revisit it later.</span></span><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full border border-[#b9a9ed] text-base">?</span></button><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="flex items-center gap-2"><button type="button" disabled={pending || !previousQuestion} onClick={() => void goBack()} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" />Back</button><Link href="/profile" className="inline-flex min-h-11 items-center rounded-xl border border-ink-200 bg-white px-3.5 text-sm font-semibold text-ink-700 transition hover:border-ink-300 hover:bg-ink-50">Save and return later</Link></div><Button type="submit" disabled={pending} size="lg" className="min-w-36 sm:ml-auto">{pending ? "Saving…" : focusKey ? "Save changes" : historyKey ? "Save answer" : "Continue"}<ArrowRight className="h-4 w-4" /></Button></div></div></div>
    </fieldset></form> : <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#cfe8dc] bg-[#eaf8f1] px-6 py-8 shadow-[0_20px_60px_-42px_rgba(13,78,57,.5)] sm:px-10 sm:py-12"><div className="absolute inset-y-0 right-0 -z-10 hidden w-[48%] sm:block"><Image src="/images/hero-student.png" alt="A student looking toward a brighter future" fill sizes="520px" className="object-cover object-left" /></div><div className="absolute inset-y-0 right-0 -z-10 w-full bg-gradient-to-r from-[#eaf8f1] via-[#eaf8f1]/95 to-[#eaf8f1]/20 sm:w-[72%]" /><div className="relative max-w-[570px]"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#25866c]">Your reflection is ready</p><h2 className="mt-4 text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-[1.04] tracking-[-.05em] text-[#07352b]">A thoughtful starting point is waiting for you.</h2><p className="mt-4 max-w-lg text-base leading-relaxed text-ink-600">You are not choosing a career today. You are opening a few possibilities that connect with what you shared.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><Button type="button" onClick={() => { router.push("/reflection"); router.refresh(); }} size="lg">See my possibilities<ArrowRight className="h-4 w-4" /></Button><span className="text-xs text-ink-500">You can keep exploring and change direction later.</span></div></div></div>}
    <footer className="mt-6 flex flex-col gap-4 border-t border-ink-100 pt-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between"><span className="flex items-start gap-1.5"><CircleHelp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#288b70]" /><span>No marks. No right answer. No pressure.<br /><span className="text-ink-400">Your answers are saved on this device. Sign in later to keep them across devices.</span></span></span><button type="button" disabled={pending} onClick={() => confirmReset.current?.showModal()} className="inline-flex min-h-10 items-center gap-1.5 self-start rounded-xl border border-ink-200 bg-white px-3.5 font-semibold text-ink-600 transition hover:border-ink-300 hover:bg-ink-50 sm:self-auto"><RotateCcw className="h-3.5 w-3.5" />Start again</button></footer>
    <dialog ref={confirmReset} className="cb-dialog" aria-labelledby="restart-title"><h2 id="restart-title" className="text-xl font-semibold">Start the conversation again?</h2><p className="mt-3 text-sm text-ink-500">This clears your answers, not your saved items.</p><div className="mt-6 flex gap-3"><Button type="button" variant="secondary" onClick={() => confirmReset.current?.close()}>Keep my answers</Button><Button type="button" onClick={() => { confirmReset.current?.close(); void submit("reset"); }}>Start again</Button></div></dialog>
  </div>;
}
