"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";

type Action = "approve" | "edit_approve" | "keep_current" | "reject" | "keep_pending";
const choices: { value: Action; title: string; detail: string; tone: string }[] = [
  { value: "approve", title: "Approve change", detail: "Publish this value and update the record.", tone: "green" },
  { value: "edit_approve", title: "Edit proposed value", detail: "Modify the value before approving.", tone: "green" },
  { value: "keep_current", title: "Keep current value", detail: "Do not make any changes. Keep the current approved value.", tone: "neutral" },
  { value: "reject", title: "Reject change", detail: "Do not publish this change.", tone: "red" },
  { value: "keep_pending", title: "Keep pending", detail: "Leave this change in the review queue.", tone: "neutral" },
];

export function ChangeProposalDecisionForm({ proposalId, proposedValue, currentStatus }: { proposalId: number; proposedValue: string; currentStatus: string }) {
  const router = useRouter();
  const [action, setAction] = useState<Action>("approve");
  const [editedValue, setEditedValue] = useState(proposedValue);
  const [reviewNote, setReviewNote] = useState("");
  const [confirmEvidence, setConfirmEvidence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = currentStatus === "needs_review";
  const approving = action === "approve" || action === "edit_approve";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/admin/change-proposals/${proposalId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, editedValue, reviewNote, confirmEvidence }) });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save the review decision.");
      router.push("/admin/change-history");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the review decision.");
    } finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5">
    <h2 className="text-lg font-bold tracking-tight text-[#172b35]">Review decision</h2>
    {!pending && <p className="mt-2 rounded-lg border border-[#dce5e0] bg-[#f4f7f5] px-3 py-2 text-sm text-[#53665e]">This proposal is {currentStatus.replaceAll("_", " ")} and can no longer be changed.</p>}
    <fieldset disabled={!pending || busy} className="mt-3 space-y-2"><legend className="sr-only">Choose a review decision</legend>{choices.map((choice) => { const selected = action === choice.value; const isRed = choice.tone === "red"; return <label key={choice.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${selected ? isRed ? "border-[#f0cbd0] bg-[#fff5f5]" : choice.tone === "green" ? "border-[#cce5db] bg-[#f0f8f4]" : "border-[#cbd8d2] bg-[#f7f9f8]" : "border-[#e4eae7] bg-white hover:bg-[#fafcfb]"}`}><input type="radio" name="decision" value={choice.value} checked={selected} onChange={() => setAction(choice.value)} className="sr-only"/><span aria-hidden className={`mt-0.5 ${selected ? isRed ? "text-[#a52c39]" : "text-[#087663]" : "text-[#9aa8a1]"}`}>{selected ? <CheckCircle2 className="h-5 w-5"/> : <Circle className="h-5 w-5"/>}</span><span><span className={`block text-sm font-bold ${isRed ? "text-[#a52c39]" : "text-[#20392f]"}`}>{choice.title}</span><span className="mt-0.5 block text-xs leading-relaxed text-[#687970]">{choice.detail}</span></span></label>; })}</fieldset>
    {action === "edit_approve" && <label className="mt-4 block text-sm font-semibold text-[#344b41]">Revised proposed value<textarea value={editedValue} onChange={(event) => setEditedValue(event.target.value)} maxLength={4000} rows={3} className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-normal outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/><span className="mt-1 block text-right text-xs font-normal text-[#718078]">{editedValue.length}/4,000</span></label>}
    <label className="mt-4 block text-sm font-semibold text-[#344b41]">Review note<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} maxLength={500} rows={3} placeholder="Explain your decision for the audit history" className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-normal outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/><span className="mt-1 block text-right text-xs font-normal text-[#718078]">{reviewNote.length}/500</span></label>
    {approving && <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#344b41]"><input type="checkbox" checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-0.5 accent-[#087663]"/>I checked the proposed value against the linked source evidence.</label>}
    {approving && <p className="mt-4 rounded-lg border border-[#efdfbd] bg-[#fff8e8] px-3 py-2.5 text-xs leading-relaxed text-[#805d13]">Important content changes become student-visible only after approval.</p>}
    {error && <p role="alert" className="mt-3 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-sm font-medium text-[#9e4038]">{error}</p>}
    <button type="submit" disabled={!pending || busy || (approving && !confirmEvidence) || (action !== "keep_pending" && reviewNote.trim().length < 8) || (action === "edit_approve" && !editedValue.trim())} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-not-allowed disabled:opacity-50">{busy && <LoaderCircle aria-hidden className="h-4 w-4 animate-spin"/>}{busy ? "Saving decision…" : action === "approve" || action === "edit_approve" ? "Approve and publish" : action === "keep_current" ? "Keep current value" : action === "reject" ? "Reject change" : "Keep in review queue"}</button>
  </form>;
}
