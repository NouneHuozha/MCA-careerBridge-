"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
function slugify(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64); }
const stages = [{ value: "class10", label: "School stage" }, { value: "class12", label: "Class 11–12" }, { value: "undergraduate", label: "Undergraduate" }, { value: "postgraduate", label: "Postgraduate" }, { value: "certificate", label: "Certificate" }];
export function AddScholarshipDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  useEffect(() => { const dialog = dialogRef.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close(); }, [open]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const form = new FormData(event.currentTarget);
      const appliesToStage = form.getAll("appliesToStage").map(String);
      const response = await fetch("/api/admin/scholarships", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, scholarship: { name: form.get("name"), provider: form.get("provider"), category: form.get("category"), eligibility: form.get("eligibility"), amountNote: form.get("amountNote"), deadlineNote: form.get("deadlineNote"), cycleLabel: form.get("cycleLabel"), documents: form.get("documents"), officialUrl: form.get("officialUrl"), sourceUrl: form.get("sourceUrl"), appliesToStage } }) });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not add this scholarship.");
      setOpen(false); setName(""); setSlug(""); setSlugTouched(false); router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not add this scholarship."); }
    finally { setBusy(false); }
  }
  return <>
    <button type="button" onClick={() => { setError(""); setOpen(true); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#104d38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"><Plus aria-hidden className="h-4 w-4"/>Add scholarship</button>
    <dialog ref={dialogRef} aria-labelledby="add-scholarship-title" onClose={() => setOpen(false)} className="m-auto max-h-[92dvh] w-[min(46rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-[#d4dfda] bg-white p-0 text-[#20392f] shadow-2xl backdrop:bg-[#12221c]/45">
      <form onSubmit={create} className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue entry</p><h2 id="add-scholarship-title" className="mt-1 text-xl font-bold text-[#17362e]">Add scholarship</h2><p className="mt-1 text-sm leading-relaxed text-[#53665e]">New entries start unverified. Add deadlines only with a cycle label and evidence.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close add scholarship dialog" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#53665e] hover:bg-[#f0f5f2]"><X aria-hidden className="h-4 w-4"/></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Scholarship name<input name="name" required minLength={2} maxLength={180} value={name} onChange={(event) => { setName(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} placeholder="e.g. State Merit Scholarship" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41]">Stable slug<input required name="slug" minLength={2} maxLength={64} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} placeholder="state-merit-scholarship" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41]">Provider<input name="provider" maxLength={160} placeholder="Government department or provider" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41]">Category<input name="category" maxLength={80} placeholder="Merit, need-based, scheme category…" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41]">Amount / support note<input name="amountNote" maxLength={2000} placeholder="Not currently verified" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41]">Deadline note<input name="deadlineNote" maxLength={160} placeholder="As published / date only after checking" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41]">Cycle label<input name="cycleLabel" maxLength={80} placeholder="e.g. 2026–27" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/><span className="mt-1 block text-xs font-normal text-[#687970]">Required before verifying a deadline.</span></label>
          <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold text-[#344b41]">Applicable education stages</legend><div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{stages.map((stage) => <label key={stage.value} className="flex items-center gap-2 text-sm text-[#455b51]"><input type="checkbox" name="appliesToStage" value={stage.value} className="accent-[#145c42]"/>{stage.label}</label>)}</div></fieldset>
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Eligibility<textarea name="eligibility" maxLength={5000} rows={3} placeholder="Eligibility differs by scheme; use verified criteria or leave blank." className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Required documents<textarea name="documents" maxLength={5000} rows={2} placeholder="One document per line" className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Official URL<input name="officialUrl" type="url" maxLength={2048} placeholder="https://official.example/scholarship" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Evidence/source URL<input name="sourceUrl" type="url" maxLength={2048} placeholder="https://official.example/notice" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"/></label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-sm font-medium text-[#9e4038]">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#e7ece9] pt-4"><button type="button" onClick={() => setOpen(false)} disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41] hover:bg-[#f5f8f6] disabled:opacity-60">Cancel</button><button type="submit" disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-wait disabled:opacity-65">{busy ? "Adding…" : "Add as unverified"}</button></div>
      </form>
    </dialog>
  </>;
}
