"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

const types = ["university", "college", "institute", "polytechnic", "iti", "school", "training_centre"];
const ownerships = ["government", "private", "autonomous", "central"];

export function AddInstitutionDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function createInstitution(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not create this institution.");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create this institution.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(""); setOpen(true); }}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#104d38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"
      >
        <Plus aria-hidden className="h-4 w-4" />
        Add institution
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="add-institution-title"
        onClose={() => setOpen(false)}
        className="m-auto max-h-[92dvh] w-[min(34rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-[#d4dfda] bg-white p-0 text-[#20392f] shadow-2xl backdrop:bg-[#12221c]/45"
      >
        <form onSubmit={createInstitution} className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue entry</p>
              <h2 id="add-institution-title" className="mt-1 text-xl font-bold text-[#17362e]">Add institution</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#53665e]">New entries start as needing verification and are not treated as confirmed.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close add institution dialog" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#53665e] hover:bg-[#f0f5f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]"><X aria-hidden className="h-4 w-4" /></button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Institution name
              <input name="name" required minLength={2} maxLength={200} autoFocus className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" placeholder="e.g. Government College, Kohima" />
            </label>
            <label className="text-sm font-semibold text-[#344b41]">Institution code
              <input name="code" required minLength={2} maxLength={64} pattern="[A-Za-z0-9]+([_-][A-Za-z0-9]+)*" title="Use letters, numbers, hyphens, or underscores." className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium uppercase outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" placeholder="e.g. NL-COL-021" />
            </label>
            <label className="text-sm font-semibold text-[#344b41]">Type
              <select name="type" required defaultValue="college" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
                {types.map((type) => <option value={type} key={type}>{type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-[#344b41]">Ownership
              <select name="ownership" required defaultValue="government" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
                {ownerships.map((ownership) => <option value={ownership} key={ownership}>{ownership[0].toUpperCase() + ownership.slice(1)}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-[#344b41]">District
              <input name="district" required minLength={2} maxLength={60} className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" placeholder="e.g. Kohima" />
            </label>
            <label className="text-sm font-semibold text-[#344b41]">State
              <input name="state" required minLength={2} maxLength={60} defaultValue="Nagaland" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" />
            </label>
          </div>
          {error ? <p role="alert" className="mt-4 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-sm font-medium text-[#9e4038]">{error}</p> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#e7ece9] pt-4">
            <button type="button" onClick={() => setOpen(false)} disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41] hover:bg-[#f5f8f6] disabled:opacity-60">Cancel</button>
            <button type="submit" disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-wait disabled:opacity-65">{busy ? "Adding…" : "Add as unverified"}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
