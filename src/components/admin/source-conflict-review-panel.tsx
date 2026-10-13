"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import { AVAILABILITY_OPTIONS } from "@/lib/source-conflicts";

type DecisionAction = "approve_selected" | "edit_value" | "keep_current" | "keep_pending" | "reject_detected";
const inputClass = "h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]";

export function SourceConflictReviewPanel({ caseKey, currentStatus, currentApprovedValue, isSample, storageAvailable }: { caseKey: string; currentStatus: string; currentApprovedValue: string; isSample: boolean; storageAvailable: boolean }) {
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState("");
  const [editedValue, setEditedValue] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [confirmEvidence, setConfirmEvidence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const editable = storageAvailable && currentStatus === "needs_decision";
  const noteValid = reviewNote.trim().length >= 8 && reviewNote.trim().length <= 500;

  async function submit(action: DecisionAction) {
    setError("");
    setMessage("");
    if (!noteValid) { setError("Add a review note of at least 8 characters."); return; }
    if (action !== "keep_pending" && !confirmEvidence) { setError("Confirm that you compared source authority, dates, and evidence before deciding."); return; }
    if (action === "approve_selected" && !selectedValue) { setError("Choose a value to approve."); return; }
    if (action === "edit_value" && !editedValue) { setError("Choose the reviewed value to save."); return; }
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/change-history/conflicts/${encodeURIComponent(caseKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, selectedValue, editedValue, reviewNote, confirmEvidence }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Could not record the conflict decision.");
      setMessage(action === "keep_pending" ? "Conflict remains pending; the review note was added to change history." : "Decision recorded. Source evidence and the previous approved value remain available in change history.");
      setReviewNote("");
      setConfirmEvidence(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not record the conflict decision.");
    } finally {
      setBusy(false);
    }
  }

  return <section id="decision-panel" className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="decision-title">
    <div className="flex items-start gap-3"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e7f1eb] text-[#17634b]"><ShieldCheck className="h-5 w-5" /></span><div><h2 id="decision-title" className="text-lg font-bold text-[#172b35]">Review decision</h2><p className="mt-1 text-sm leading-relaxed text-[#596a63]">Choose deliberately after comparing authority and evidence. A newer timestamp alone does not make a source more authoritative.</p></div></div>
    {isSample && <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] p-3 text-xs leading-relaxed text-[#426652]"><LockKeyhole aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Synthetic design example only. Decisions update this sample case and audit history; they never write to a real institution or course.</p>}
    {!storageAvailable && <p className="mt-4 rounded-lg border border-[#efdfbd] bg-[#fff8e8] p-3 text-sm leading-relaxed text-[#71551d]">Decision storage is unavailable. Apply <code>src/db/migrations/0007_source_conflict_resolution.sql</code> to enable conflict records.</p>}
    {storageAvailable && currentStatus !== "needs_decision" && <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] p-3 text-sm leading-relaxed text-[#426652"><CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />This case has a recorded decision. Its original evidence and prior approved value remain unchanged.</p>}
    {editable && <div className="mt-4 space-y-4">
      <fieldset><legend className="text-sm font-bold text-[#344b41]">Recommended values</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{AVAILABILITY_OPTIONS.map((option) => <label key={option.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selectedValue === option.value ? "border-[#27735c] bg-[#f0f7f3] text-[#145c42]" : "border-[#d7e1dc] bg-white text-[#344b41] hover:bg-[#f8fbf9]"}`}><input type="radio" name="selected-value" value={option.value} checked={selectedValue === option.value} onChange={() => setSelectedValue(option.value)} className="accent-[#145c42]" />{option.label}</label>)}</div><p className="mt-2 rounded-md bg-[#fff8e8] px-3 py-2 text-xs leading-relaxed text-[#71551d]">“Not currently confirmed” is safer than “Not offered” when the current official source is silent. “Not listed” is evidence of absence from that page—not proof of non-availability.</p></fieldset>
      <label className="block text-sm font-semibold text-[#344b41]">Edited value<select value={editedValue} onChange={(event) => setEditedValue(event.target.value)} className={`${inputClass} mt-1.5`}><option value="">Choose a reviewed value</option>{AVAILABILITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><span className="mt-1 block text-xs font-normal text-[#687970]">Used only with “Edit value”; this field does not select a value by default.</span></label>
      <label className="block text-sm font-semibold text-[#344b41]">Review note<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={4} maxLength={500} placeholder="Explain which source was authoritative and why." className="mt-1.5 min-h-24 w-full resize-y rounded-lg border border-[#cbd8d2] bg-white px-3 py-2.5 text-sm text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
      <label className="flex items-start gap-2 text-sm leading-relaxed text-[#344b41]"><input type="checkbox" checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-1 accent-[#145c42]" />I compared the source authority, checked dates, and evidence excerpts before recording this decision.</label>
      {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#efc9c4] bg-[#fff2f0] p-3 text-sm text-[#9e4038]"><AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}
      {message && <p role="status" className="flex items-start gap-2 rounded-lg border border-[#c8e2d3] bg-[#e9f5ee] p-3 text-sm text-[#17634b]"><CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
      <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => void submit("approve_selected")} disabled={busy || !selectedValue || !noteValid || !confirmEvidence} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2 aria-hidden className="h-4 w-4" />Approve selected value</button><button type="button" onClick={() => void submit("edit_value")} disabled={busy || !editedValue || !noteValid || !confirmEvidence} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41] hover:bg-[#f5f8f6] disabled:cursor-not-allowed disabled:opacity-50">Edit value</button><button type="button" onClick={() => void submit("keep_current")} disabled={busy || !noteValid || !confirmEvidence} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41] hover:bg-[#f5f8f6] disabled:cursor-not-allowed disabled:opacity-50">Keep current approved value</button><button type="button" onClick={() => void submit("keep_pending")} disabled={busy || !noteValid} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#e2d3aa] bg-[#fffaf0] px-4 text-sm font-bold text-[#805d13] hover:bg-[#fff4dc] disabled:cursor-not-allowed disabled:opacity-50"><Clock3 aria-hidden className="h-4 w-4" />Keep pending</button><button type="button" onClick={() => void submit("reject_detected")} disabled={busy || !noteValid || !confirmEvidence} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#efc9c4] px-4 text-sm font-bold text-[#9e4038] hover:bg-[#fff2f0] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">Reject detected change</button></div>
      {busy && <p role="status" className="text-xs text-[#687970]">Recording review…</p>}
    </div>}
    {!editable && !storageAvailable && <p className="mt-3 text-xs text-[#687970]">The example remains viewable, but decisions are disabled until the migration is installed.</p>}
    <p className="mt-4 border-t border-[#e5ebe8] pt-3 text-xs leading-relaxed text-[#687970]">Unresolved conflicts are not published. No source row is deleted, and the original approved value is retained for audit.</p>
  </section>;
}
