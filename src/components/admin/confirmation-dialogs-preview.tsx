"use client";

import { useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type Pattern = { id: string; title: string; consequence: string; action: string; tone: "green" | "red"; field?: string; placeholder?: string; context?: string };
const patterns: Pattern[] = [
  { id: "approve", title: "Approve change?", consequence: "The proposed deadline will become the current student-facing value.", action: "Approve change", tone: "green", field: "Review note", placeholder: "Required review note" },
  { id: "reject", title: "Reject change?", consequence: "The proposed value will not be published. The current approved value stays in place.", action: "Reject change", tone: "red", field: "Review note", placeholder: "Required review note" },
  { id: "rollback", title: "Rollback import?", consequence: "Previous approved values will be restored where available. This action creates an audit event.", action: "Confirm rollback", tone: "red", field: "Review note", placeholder: "Review affected records first" },
  { id: "pause-refresh", title: "Pause automatic refresh?", consequence: "Scheduled source checks will pause. The last approved catalogue value remains available.", action: "Pause refresh", tone: "red", context: "Source: National Scholarship Portal · sample" },
  { id: "archive", title: "Archive record?", consequence: "This record will leave the active catalogue. It can be restored from Archived records.", action: "Archive record", tone: "red", context: "Record: Sample pathway · preview only" },
];

export function ConfirmationDialogsPreview() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<Record<string, string>>({});
  function confirm(pattern: Pattern, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pattern.field && !notes[pattern.id]?.trim()) {
      setNotice((current) => ({ ...current, [pattern.id]: "A review note is required for this confirmation." }));
      return;
    }
    setNotice((current) => ({ ...current, [pattern.id]: `Preview only: “${pattern.action}” was not executed. No records or refresh settings changed.` }));
  }
  function cancel(pattern: Pattern) {
    setNotes((current) => ({ ...current, [pattern.id]: "" }));
    setNotice((current) => ({ ...current, [pattern.id]: "Cancelled. No action was taken." }));
  }
  return <div className="space-y-5">
    <header className="border-b border-[#dce5e0] pb-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Review queue <span aria-hidden="true">/</span> Reusable interaction patterns</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Confirmation dialogs</h1><p className="mt-2 text-sm text-[#53665e]">Each confirmation explains the consequence and provides a safe way to cancel.</p></header>
    <p className="flex items-start gap-2 rounded-lg border border-[#d8e3e8] bg-[#f1f6f8] px-4 py-3 text-xs leading-relaxed text-[#445c67]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>Reusable confirmation patterns · clearly labeled sample actions. Final buttons below only demonstrate the interaction; they do not change live data.</p>
    <div className="grid gap-4 xl:grid-cols-2">{patterns.map((pattern) => <section key={pattern.id} className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5" aria-labelledby={`${pattern.id}-title`}><h2 id={`${pattern.id}-title`} className="font-bold text-[#263d32]">{pattern.title}</h2><p className="mt-1 text-xs leading-relaxed text-[#687970]">{pattern.consequence}</p><form onSubmit={(event) => confirm(pattern, event)} className="mt-3 space-y-3">{pattern.field ? <label className="block"><span className="sr-only">{pattern.field} for {pattern.title}</span><input value={notes[pattern.id] ?? ""} onChange={(event) => { setNotes((current) => ({ ...current, [pattern.id]: event.target.value })); setNotice((current) => ({ ...current, [pattern.id]: "" })); }} required aria-required="true" placeholder={pattern.placeholder} className="h-10 w-full rounded-lg border border-[#d7e1dc] bg-white px-3 text-sm text-[#344b41] placeholder:text-[#829087] focus:border-[#28765c] focus:outline-none focus:ring-2 focus:ring-[#28765c]/15"/> </label> : <div className="flex min-h-10 items-center rounded-lg border border-[#d7e1dc] bg-[#f9fbfa] px-3 text-xs text-[#53665e]">{pattern.context}</div>}<div className="flex justify-end gap-2"><button type="button" onClick={() => cancel(pattern)} className="min-h-9 rounded-lg border border-[#d7e1dc] bg-white px-3 text-xs font-semibold text-[#344b41] hover:bg-[#f3f6f4]">Cancel</button><button type="submit" className={`min-h-9 rounded-lg px-3 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${pattern.tone === "green" ? "bg-[#12664f] hover:bg-[#0d5742] focus-visible:ring-[#12664f]" : "bg-[#b33d40] hover:bg-[#982f33] focus-visible:ring-[#b33d40]"}`}>{pattern.action}</button></div></form>{notice[pattern.id] && <p role="status" aria-live="polite" className="mt-3 flex items-start gap-2 rounded-md border border-[#d8e5dc] bg-[#f1f7f3] px-3 py-2 text-xs leading-relaxed text-[#426652]"><CheckCircle2 aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0"/>{notice[pattern.id]}</p>}</section>)}</div>
    <div className="flex items-start gap-2 rounded-lg border border-[#e9d7a9] bg-[#fff8e8] px-4 py-3 text-xs leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>High-impact actions require deliberate review. Cancel remains available; destructive patterns are visually distinct.</div>
  </div>;
}
