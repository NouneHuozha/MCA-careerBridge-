"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, Check, CircleHelp, Leaf, Monitor, Palette, Pencil, RotateCcw, Sprout, UsersRound, Wrench } from "lucide-react";
import { Button, Callout, cx } from "@/components/ui";
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

  const descriptions: Record<string, string> = { technology: "Coding, software, AI, digital tools and new technologies", helping: "Teaching, healthcare, counselling, community service", engineering: "Engineering, construction, design, repairs, hands-on problem solving", business: "Management, finance, entrepreneurship, marketing, leadership", arts: "Visual arts, music, media, writing, crafts and creative expression", environment: "Biology, wildlife, agriculture, conservation, outdoor work" };
  const iconFor = (value: string) => value === "technology" ? <Monitor className="h-8 w-8" /> : value === "helping" ? <UsersRound className="h-8 w-8" /> : value === "engineering" ? <Wrench className="h-8 w-8" /> : value === "business" ? <BarChart3 className="h-8 w-8" /> : value === "arts" ? <Palette className="h-8 w-8" /> : <Leaf className="h-8 w-8" />;
  const iconTone = (index: number) => ["bg-[#e8e0ff] text-[#5e4aaa]", "bg-[#dff2e9] text-[#28775f]", "bg-[#ffefb5] text-[#87722b]", "bg-[#e8e0ff] text-[#6048b4]", "bg-[#d8f1e6] text-[#28775f]", "bg-[#ffefb5] text-[#87722b]"][index % 6];
  return <div className="mx-auto max-w-[1110px]">
    <header className="mb-6"><p className="text-sm font-bold uppercase tracking-[.17em] text-[#317966]">Personal profile</p><h1 className="mt-3 text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight tracking-[-.04em] text-[#07352b]">{question?.prompt ?? "Your profile is ready to explore."}</h1><p className="mt-3 text-lg text-ink-500">{question ? "Choose what feels true today. You can change this later." : "You have given us a useful starting point."}</p></header>
    {error && <div className="mb-5"><Callout tone="amber"><p role="alert">{error}</p></Callout></div>}
    {question ? <form onSubmit={(event) => { event.preventDefault(); void submit(); }}><fieldset disabled={pending}>
      <div className="mb-5 flex items-center gap-4 rounded-2xl border border-[#d2e9df] bg-[#effaf5] px-6 py-5"><Sprout className="h-9 w-9 shrink-0 text-[#2a8b6d]" /><div><p className="font-semibold text-[#155b4d]">There is no perfect answer here.</p><p className="mt-1 text-sm text-ink-500">Your interests can evolve, and that&apos;s a good thing.</p></div></div>
      {question.helper && <p className="mb-5 text-sm text-ink-500">{question.helper}</p>}
      {question.maxSelections && <p className="mb-4 text-xs font-semibold text-ink-500">Choose up to {question.maxSelections} · {selected.length} selected</p>}
      {question.answerType === "text" ? <div className="rounded-2xl border-2 border-ink-200 bg-white p-4"><label className="sr-only" htmlFor="counselling-text">Your answer</label><textarea id="counselling-text" rows={5} maxLength={600} value={text} onChange={(e) => setText(e.target.value)} placeholder="A few words are enough…" className="w-full resize-none border-0 bg-transparent text-base outline-none" /></div> : <div className="grid gap-4 md:grid-cols-2">{(question.options ?? []).map((option, index) => <button type="button" key={option.value} aria-pressed={selected.includes(option.value)} onClick={() => choose(option.value)} className={cx("group flex min-h-[126px] items-center gap-5 rounded-2xl border-2 bg-white px-5 py-5 text-left transition-all hover:-translate-y-0.5 hover:border-[#9a85ea]", selected.includes(option.value) ? "border-[#8970df] bg-[#f8f5ff] shadow-[0_8px_20px_-14px_#6048b4]" : "border-ink-100")}><span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${iconTone(index)}`}>{iconFor(option.value)}</span><span className="min-w-0"><span className="flex items-center justify-between gap-3 text-base font-semibold text-[#17352f]">{option.label}{selected.includes(option.value) && <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#8065dc] text-white"><Check className="h-4 w-4" /></span>}</span><span className="mt-2 block text-sm leading-relaxed text-ink-500">{descriptions[option.value] ?? option.hint ?? "Explore this direction and notice what feels right."}</span></span></button>)}</div>}
      {question.allowOther && <div className="mt-4"><label htmlFor="counselling-other" className="sr-only">Something else</label><input id="counselling-other" value={other} onChange={(e) => setOther(e.target.value)} maxLength={80} placeholder="Something else? Add it here (optional)" className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#8065dc]" /></div>}
      <div className="mt-8 flex flex-col gap-4 border-t border-ink-100 pt-5 sm:flex-row sm:items-center"><div className="flex-1"><p className="text-sm text-ink-500">{currentNumber} of {total}</p><div className="mt-2 h-2 max-w-[460px] overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-[#8065dc] transition-all" style={{ width: `${Math.max(8, (done / Math.max(total, 1)) * 100)}%` }} /></div></div><button type="button" disabled={pending} onClick={() => void submit("answer", true)} className="text-sm font-semibold text-[#6048b4] underline underline-offset-4">I&apos;m not sure yet</button><Link href={focusKey ? "/profile" : "/profile#my-answers"} className="text-sm font-semibold text-ink-500 underline underline-offset-4">Save and leave</Link><Button type="submit" disabled={pending} size="lg" className="min-w-36">{pending ? "Saving…" : focusKey ? "Save changes" : done >= total - 1 ? "Continue" : "Continue"}<ArrowRight className="h-4 w-4" /></Button></div>
    </fieldset></form> : <div className="rounded-2xl bg-[#effaf5] p-8 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#198b6e] text-white"><Check className="h-7 w-7" /></span><h2 className="mt-5 text-2xl font-semibold">You&apos;ve given us a useful starting point.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">Now you can look through a few possibilities. You are not choosing a career today.</p><Button type="button" onClick={() => { router.push("/profile"); router.refresh(); }} className="mt-6">See my possibilities<ArrowRight className="h-4 w-4" /></Button></div>}
    <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500"><span className="flex items-center gap-1.5"><CircleHelp className="h-3.5 w-3.5 text-[#288b70]" />No marks. No right answer. No pressure.</span><button type="button" disabled={pending} onClick={() => confirmReset.current?.showModal()} className="flex items-center gap-1 font-semibold text-forest-700 underline underline-offset-4"><RotateCcw className="h-3 w-3" />Start again</button></footer>
    <dialog ref={confirmReset} className="cb-dialog" aria-labelledby="restart-title"><h2 id="restart-title" className="text-xl font-semibold">Start the conversation again?</h2><p className="mt-3 text-sm text-ink-500">This clears your answers, not your saved items.</p><div className="mt-6 flex gap-3"><Button type="button" variant="secondary" onClick={() => confirmReset.current?.close()}>Keep my answers</Button><Button type="button" onClick={() => { confirmReset.current?.close(); void submit("reset"); }}>Start again</Button></div></dialog>
  </div>;
}
