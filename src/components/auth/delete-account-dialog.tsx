"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, X } from "lucide-react";

export function DeleteAccountDialog({ error }: { error: string | undefined }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasError = error === "confirmation" || error === "failed";
  const [open, setOpen] = useState(hasError);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <>
    <button type="button" onClick={() => { setSubmitting(false); setConfirmation(""); setOpen(true); }} title="Permanently remove your CareerBridge account and personal data" aria-haspopup="dialog" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#a02d2d] px-4 text-sm font-semibold text-[#a02d2d] transition hover:bg-[#fff2f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a02d2d]"><AlertTriangle aria-hidden className="h-4 w-4" />Delete account</button>
    <dialog ref={dialogRef} aria-labelledby="delete-account-heading" aria-describedby="delete-account-description" onClose={() => { setOpen(false); setSubmitting(false); setConfirmation(""); }} onCancel={(event) => { if (submitting) event.preventDefault(); }} className="m-auto max-h-[92dvh] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-[#e6b8b4] bg-white p-0 text-[#26312c] shadow-2xl backdrop:bg-[#17231d]/50">
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="delete-account-heading" className="text-xl font-semibold text-[#8b2929]">Delete your account?</h2>
            <p id="delete-account-description" className="mt-3 text-sm leading-relaxed text-[#6d4b48]">This permanently deletes your account, counselling progress, profile, saved items, and associated conversations. This cannot be undone.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} disabled={submitting} aria-label="Close delete account confirmation" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#6d4b48] hover:bg-[#fff2f0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a02d2d] disabled:opacity-50"><X aria-hidden className="h-4 w-4" /></button>
        </div>
        {error === "confirmation" ? <p role="alert" className="mt-4 text-sm font-semibold text-[#a02d2d]">Type DELETE exactly to confirm account removal.</p> : null}
        {error === "failed" ? <p role="alert" className="mt-4 text-sm font-semibold text-[#a02d2d]">We couldn’t delete the account right now. Your account and data have not been changed. Please try again.</p> : null}
        <form action="/api/auth/delete-account" method="post" aria-busy={submitting} onSubmit={(event: FormEvent<HTMLFormElement>) => {
          const input = event.currentTarget.elements.namedItem("confirmation");
          if (!(input instanceof HTMLInputElement) || input.value !== "DELETE") {
            event.preventDefault();
            input instanceof HTMLInputElement && input.reportValidity();
            return;
          }
          setSubmitting(true);
        }} className="mt-5">
          <label htmlFor="delete-confirmation" className="mb-2 block text-sm font-medium text-[#503936]">Type DELETE to confirm</label>
          <input id="delete-confirmation" name="confirmation" required pattern="DELETE" title="Enter DELETE in uppercase to confirm." autoComplete="off" autoFocus disabled={submitting} value={confirmation} aria-invalid={(error === "confirmation" || (confirmation.length > 0 && confirmation !== "DELETE")) || undefined} aria-describedby={error === "confirmation" ? "delete-confirmation-error" : "delete-confirmation-hint"} onChange={(event) => { setConfirmation(event.currentTarget.value); event.currentTarget.setCustomValidity(""); }} className="h-11 w-full rounded-lg border border-[#d8b3af] bg-white px-3 text-sm text-[#26312c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a02d2d] disabled:bg-[#f5f5f3]" />
          {error === "confirmation" ? <p id="delete-confirmation-error" role="alert" className="mt-2 text-sm font-semibold text-[#a02d2d]">Type DELETE exactly to confirm account removal.</p> : <p id="delete-confirmation-hint" className="mt-2 text-xs text-[#68756d]">Use uppercase letters. Your account is not deleted until you confirm below.</p>}
          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#f0dfdd] pt-4">
            <button type="button" onClick={() => setOpen(false)} disabled={submitting} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d8b3af] px-4 text-sm font-semibold text-[#503936] hover:bg-[#fff8f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a02d2d] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex min-h-11 min-w-40 items-center justify-center gap-2 rounded-lg bg-[#a02d2d] px-4 text-sm font-semibold text-white transition hover:bg-[#872222] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a02d2d] disabled:cursor-wait disabled:opacity-70">
              {submitting ? <><span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Deleting…</> : "Permanently delete account"}
            </button>
            {submitting ? <span role="status" className="sr-only">Deleting account and personal data</span> : null}
          </div>
        </form>
      </div>
    </dialog>
  </>;
}
