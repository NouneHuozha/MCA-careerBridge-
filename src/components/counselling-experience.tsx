"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CircleHelp, Pencil, RotateCcw, Sparkles } from "lucide-react";
import { Button, Callout, ProgressDots, cx } from "@/components/ui";
import { questionsForStage, type CounsellingQuestion } from "@/data/counselling";
import type { StudentSnapshot } from "@/services/profile";

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

export function CounsellingExperience({ initial, focusKey }: { initial: State; focusKey?: string }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const question = state.question;
  const initialAnswer = initial.question ? initial.answers?.[initial.question.key] : undefined;
  const initialOptions = initial.question?.options?.map((o) => o.value) ?? [];
  const [selected, setSelected] = useState<string[]>(initialAnswer?.values.filter((v) => initialOptions.includes(v) || v === "not-sure") ?? []);
  const [other, setOther] = useState(initialAnswer?.values.filter((v) => !initialOptions.includes(v) && v !== "not-sure").join(", ") ?? "");
  const [text, setText] = useState(initialAnswer?.text ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmReset = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);

  async function submit(action: "answer" | "skip" | "reset" = "answer", unsure = false) {
    if (busy.current || (!question && action !== "reset")) return;
    const chosen = unsure ? ["not-sure"] : [...selected, ...(other.trim() ? [other.trim()] : [])];
    if (action === "answer" && !chosen.length && !text.trim()) { setError("Choose an option, write a short answer, or choose ‘Not sure yet’."); return; }
    busy.current = true; setPending(true); setError(null);
    try {
      const response = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, questionKey: question?.key, values: chosen, text: question?.answerType === "text" ? (unsure ? "Not sure yet" : text.trim()) : null, stage: state.stage }) });
      const next = await response.json() as State & { error?: string };
      if (!response.ok || next.error) { setError(next.error ?? "Couldn’t save. Please try again."); return; }
      if (focusKey && action !== "reset") { router.push("/profile"); router.refresh(); return; }
      if (action === "reset") {
        setState(next); setSelected([]); setOther(""); setText("");
        return;
      }
      if (!next.question) {
        const finished = await fetch("/api/counselling", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "complete" }) });
        if (!finished.ok) setError("Your answers are saved. You can open My possibilities below.");
        else { router.push("/profile"); router.refresh(); }
      } else {
        setState(next); setSelected([]); setOther(""); setText("");
      }
    } catch { setError("The connection was interrupted. Your earlier answers are safe—please try again."); }
    finally { busy.current = false; setPending(false); }
  }

  const total = state.progress.total;
  const done = state.progress.answered;
  const currentNumber = Math.min(done + (question ? 1 : 0), total);

  function choose(value: string) {
    setSelected((prev) => question?.answerType === "single"
      ? (prev.includes(value) ? [] : [value])
      : prev.includes(value)
        ? prev.filter((v) => v !== value)
        : question?.maxSelections && prev.length >= question.maxSelections
          ? prev
          : [...prev.filter((v) => v !== "not-sure"), value]);
  }

  return <div className="mx-auto max-w-3xl">
    <section className="rounded-[1.5rem] border border-forest-200 bg-white shadow-[0_18px_60px_-42px_#19382f80]" aria-label="Guided conversation">
      <header className="border-b border-forest-100 bg-mint/45 px-5 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold text-forest-800"><Sparkles aria-hidden className="h-4 w-4" />A friendly conversation about you</p><p className="mt-1 text-xs text-ink-500">Your answers help us show possibilities—not make a decision for you.</p></div><span className="shrink-0 rounded-full border border-forest-200 bg-white px-3 py-1.5 text-xs font-bold text-forest-800">{done} of {total}</span></div>
        <div className="mt-5 flex items-center gap-3"><ProgressDots total={total} current={done} label="Questions answered" /><span className="text-xs text-ink-500">{question ? `Question ${currentNumber} of ${total}` : "Ready"}</span></div>
      </header>

      <div className="p-5 sm:p-8">
        {error && <div className="mb-5"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}
        {question ? <form onSubmit={(event) => { event.preventDefault(); void submit(); }}><fieldset disabled={pending}>
          <p className="mb-3 text-sm font-semibold text-forest-700">{questionIntro(question)}</p>
          <legend className="max-w-2xl text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-tight text-ink-900">{question.prompt}</legend>
          {question.helper && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">{question.helper}</p>}
          {question.maxSelections && <p className="mt-4 text-xs font-semibold text-ink-500">Choose up to {question.maxSelections} · {selected.length} selected</p>}
          {question.answerType === "text" ? <div className="mt-6"><label className="sr-only" htmlFor="counselling-text">Your answer</label><textarea id="counselling-text" rows={4} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="A few words are enough…" className="w-full rounded-2xl border-2 border-ink-200 bg-canvas p-4 text-base outline-none transition focus:border-forest-500" /></div> : <div key={question.key} className="mt-6 grid gap-2.5 sm:grid-cols-2">{(question.options ?? []).map((option) => <button type="button" key={option.value} aria-pressed={selected.includes(option.value)} onClick={() => choose(option.value)} className={cx("group flex min-h-[58px] items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:border-forest-300 hover:bg-forest-50", selected.includes(option.value) ? "border-forest-600 bg-forest-700 text-white shadow-[0_8px_18px_-12px_#10382a]" : "border-ink-200 bg-white text-ink-800")}><span aria-hidden className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border", selected.includes(option.value) ? "border-white bg-white text-forest-700" : "border-ink-300 bg-ink-50 text-transparent")}>{selected.includes(option.value) && <Check className="h-3.5 w-3.5" />}</span><span>{option.label}</span></button>)}</div>}
          {question.allowOther && <div className="mt-3"><label htmlFor="counselling-other" className="sr-only">Something else</label><input id="counselling-other" value={other} onChange={(e) => setOther(e.target.value)} maxLength={80} placeholder="Something else? Add it here (optional)" className="w-full rounded-xl border border-ink-200 bg-canvas px-4 py-3 text-sm outline-none transition focus:border-forest-500" /></div>}
          <div className="mt-7 flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row sm:items-center"><Button type="submit" disabled={pending} size="lg" className="order-1 sm:order-2 sm:min-w-40">{pending ? "Saving…" : focusKey ? "Save changes" : done >= total - 1 ? "See my possibilities" : "Continue"}<ArrowRight aria-hidden className="h-4 w-4" /></Button><button type="button" disabled={pending} onClick={() => void submit("answer", true)} className="cb-button order-2 justify-center px-3 py-2.5 text-sm text-forest-700 underline underline-offset-4 sm:order-1 sm:justify-start"><CircleHelp aria-hidden className="h-4 w-4" />I’m not sure yet</button>{question.allowSkip && <button type="button" disabled={pending} onClick={() => void submit("skip")} className="order-3 text-sm font-semibold text-ink-500 underline underline-offset-4">Skip for now</button>}</div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500"><Link href={focusKey ? "/profile" : "/profile#my-answers"} className="flex items-center gap-1 font-semibold text-forest-700 underline underline-offset-4"><Pencil aria-hidden className="h-3.5 w-3.5" />Review answers</Link><span>You can change anything later.</span><Link href="/profile" className="font-semibold text-forest-700 underline underline-offset-4">Save and leave</Link></div>
        </fieldset></form> : <div className="rounded-2xl bg-mint/65 p-6 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-700 text-white"><Check className="h-7 w-7" /></span><h2 className="mt-5 text-2xl font-semibold">You’ve given us a useful starting point.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">Now you can look through a few possibilities. You are not choosing a career today.</p><Button type="button" onClick={() => { router.push("/profile"); router.refresh(); }} className="mt-6">See my possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Button></div>}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/60 px-5 py-4 text-xs text-ink-500 sm:px-8"><span className="flex items-center gap-1.5"><CircleHelp aria-hidden className="h-3.5 w-3.5 text-forest-600" />No marks. No right answer. No pressure.</span><div className="flex items-center gap-4"><button type="button" disabled={pending} onClick={() => confirmReset.current?.showModal()} className="flex items-center gap-1 font-semibold text-forest-700 underline underline-offset-4"><RotateCcw aria-hidden className="h-3 w-3" />Start again</button>{focusKey && <Link href="/profile" className="flex items-center gap-1 font-semibold text-forest-700 underline underline-offset-4"><ArrowLeft aria-hidden className="h-3 w-3" />Back to possibilities</Link>}</div></footer>
    </section>
    <dialog ref={confirmReset} className="cb-dialog" aria-labelledby="restart-title"><h2 id="restart-title" className="text-xl font-semibold">Start the conversation again?</h2><p className="mt-3 text-sm text-ink-500">This clears your answers, not your saved items.</p><div className="mt-6 flex gap-3"><Button type="button" variant="secondary" onClick={() => confirmReset.current?.close()}>Keep my answers</Button><Button type="button" onClick={() => { confirmReset.current?.close(); void submit("reset"); }}>Start again</Button></div></dialog>
  </div>;
}
