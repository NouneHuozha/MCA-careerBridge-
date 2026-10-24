"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, X } from "lucide-react";

export function LogoutDialog({ compact = false }: { compact?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <>
    <button
      type="button"
      onClick={() => { setSubmitting(false); setOpen(true); }}
      className={compact
        ? "cb-guidance-profile-item w-full"
        : "inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce7df] bg-white px-4 text-sm font-semibold text-[#29483c] transition hover:bg-[#f5f8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35675b]"}
    >
      Log out <LogOut aria-hidden className="h-4 w-4" />
    </button>
    <dialog
      ref={dialogRef}
      aria-labelledby="logout-dialog-title"
      onClose={() => { setOpen(false); setSubmitting(false); }}
      className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-2xl border border-[#dce7df] bg-white p-0 text-[#26312c] shadow-2xl backdrop:bg-[#17231d]/50"
    >
      <div className="p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="logout-dialog-title" className="text-xl font-semibold text-[#173344]">Log out of CareerBridge?</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#68756d]">You’ll be signed out on this device. Your saved account progress will still be available when you sign back in.</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={submitting}
            aria-label="Close logout confirmation"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#52665b] hover:bg-[#f0f5f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#35675b] disabled:opacity-50"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>
        <form
          action="/api/auth/sign-out"
          method="post"
          onSubmit={() => setSubmitting(true)}
          className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#e4eae4] pt-4"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#dce7df] px-4 text-sm font-semibold text-[#29483c] hover:bg-[#f5f8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35675b] disabled:opacity-50"
          >
            Stay signed in
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-11 min-w-28 items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-semibold text-white transition hover:bg-[#104d38] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#145c42] disabled:cursor-wait disabled:opacity-70"
          >
            {submitting ? <><span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Logging out…</> : "Log out"}
          </button>
          {submitting ? <span role="status" className="sr-only">Logging out</span> : null}
        </form>
      </div>
    </dialog>
  </>;
}
