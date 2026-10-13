"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";

const permissions = [
  { label: "Edit catalogue records", allowed: true },
  { label: "Submit catalogue changes", allowed: true },
  { label: "Approve changes for publication", allowed: false },
  { label: "Manage roles and permissions", allowed: false },
];

export function AdminInvitationPreview() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("The passwords do not match. Check both fields and try again.");
      return;
    }
    setSubmitted(true);
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce5e0] pb-5">
      <div>
        <p className="text-sm font-medium text-[#687970]">Admin <span className="mx-1 text-[#a0aaa5]">/</span> Invitation</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.035em] text-[#17362e] sm:text-4xl">Set up your CareerBridge Admin account</h1>
        <p className="mt-2 text-base text-[#53665e]">Create an account using the role assigned in your invitation.</p>
      </div>
      <Link href="/admin/settings" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Cancel</Link>
    </div>

    <div className="grid items-stretch gap-5 xl:grid-cols-2">
      <section className="rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="invitation-form-title">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e6ece9] pb-4">
          <div><h2 id="invitation-form-title" className="text-lg font-bold text-[#263d32]">Set up your CareerBridge Admin account</h2><p className="mt-1 text-sm text-[#687970]">Sample invitation · Content editor</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8dff1] bg-[#eff7fc] px-3 py-1.5 text-xs font-semibold text-[#3e6680]">Content editor</span>
        </div>

        {submitted && <p role="status" className="mt-4 rounded-lg border border-[#efdfbd] bg-[#fff8e8] px-4 py-3 text-sm leading-relaxed text-[#71551d]">This invitation screen is a reference preview. Invitation acceptance is not connected, so no account was created.</p>}
        {error && <p role="alert" className="mt-4 rounded-lg border border-[#efc7bf] bg-[#fff3f0] px-4 py-3 text-sm text-[#9d382d]">{error}</p>}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-[#344b41]">Name<input name="name" autoComplete="name" required maxLength={120} placeholder="Name" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
          <label className="block text-sm font-semibold text-[#344b41]">Email address<input name="email" type="email" autoComplete="email" required maxLength={191} placeholder="Email address" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
          <label className="block text-sm font-semibold text-[#344b41]">Create password<input name="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create password (8 characters minimum)" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
          <label className="block text-sm font-semibold text-[#344b41]">Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
          <div><p className="mb-1.5 text-sm font-semibold text-[#344b41]">Assigned role</p><div className="flex min-h-11 items-center justify-between rounded-lg border border-[#cbd8d2] bg-[#f8faf9] px-3 text-sm text-[#344b41]"><span>Content editor</span><span className="rounded-md bg-[#e8f1ff] px-2.5 py-1 text-xs font-semibold text-[#3569a5]">Invitation role</span></div></div>
          <div className="flex flex-wrap gap-2 border-t border-[#e6ece9] pt-4"><button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#12664f] px-5 text-sm font-bold text-white hover:bg-[#0d5742]">Accept invitation</button><Link href="/admin/settings" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Cancel</Link></div>
        </form>
      </section>

      <aside className="rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="permission-title">
        <div className="flex items-start justify-between gap-4 border-b border-[#e6ece9] pb-4"><div><h2 id="permission-title" className="text-lg font-bold text-[#263d32]">Role permissions</h2><p className="mt-1 text-sm text-[#687970]">Access is limited to the assigned role.</p></div><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e9f5ee] text-[#17634b]"><ShieldCheck className="h-5 w-5" aria-hidden /></span></div>
        <ul className="mt-2 divide-y divide-[#edf1ef]">{permissions.map(({ label, allowed }) => <li key={label} className="flex items-center justify-between gap-4 py-4"><span className="flex items-center gap-3 text-sm font-medium text-[#344b41]"><span className={`grid h-6 w-6 place-items-center rounded-full ${allowed ? "bg-[#e9f5ee] text-[#17634b]" : "bg-[#f1f3f2] text-[#89948e]"}`}>{allowed ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Minus className="h-3.5 w-3.5" aria-hidden />}</span>{label}</span><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${allowed ? "bg-[#e9f5ee] text-[#17634b]" : "bg-[#f1f3f2] text-[#748079]"}`}>{allowed ? "Allowed" : "Not included"}</span></li>)}</ul>
        <p className="mt-4 rounded-lg border border-[#d7e8dc] bg-[#f2f8f4] p-4 text-sm leading-relaxed text-[#426652]">You can edit and submit catalogue changes. A verifier or administrator must approve submissions before publication.</p>
        <p className="mt-3 rounded-lg border border-[#efdfbd] bg-[#fff8e8] p-4 text-sm leading-relaxed text-[#71551d]">This invitation does not grant verifier or administrator access.</p>
        <p className="mt-4 text-xs leading-relaxed text-[#687970]">Preview only: invitation links, email delivery, and account activation are not connected in this release.</p>
      </aside>
    </div>
  </div>;
}
