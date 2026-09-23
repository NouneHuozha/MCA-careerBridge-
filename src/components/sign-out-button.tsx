"use client";

import { useId, useRef, useState } from "react";
import { LogOut, X } from "lucide-react";
import { Button, cx } from "@/components/ui";

export function SignOutButton({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={cx("cb-button border border-peach-ink/25 bg-peach/60 px-3.5 py-2 text-sm text-peach-ink hover:bg-peach", className)}>
        <LogOut aria-hidden className="h-4 w-4" /> Sign out
      </button>
      <dialog ref={dialog} className="cb-dialog" aria-labelledby={headingId} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className="flex items-center justify-between">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-peach text-peach-ink"><LogOut aria-hidden className="h-5 w-5" /></span>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="Close sign-out confirmation" className="grid h-10 w-10 place-items-center rounded-full bg-ink-50 hover:bg-ink-100"><X className="h-4 w-4" /></button>
        </div>
        <h2 id={headingId} className="mt-5 text-2xl font-semibold">Sign out for now?</h2>
        <p className="mt-3 text-sm text-ink-500">Your saved items and account progress will be here when you return.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button variant="secondary" type="button" onClick={() => dialog.current?.close()}>Stay here</Button>
          <form action="/api/auth/sign-out" method="post" onSubmit={() => setBusy(true)}>
            <Button type="submit" disabled={busy}>{busy ? "Signing out…" : "Yes, sign out"}</Button>
          </form>
        </div>
      </dialog>
    </>
  );
}
