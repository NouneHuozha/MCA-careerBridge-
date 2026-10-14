"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, CloudOff, RotateCcw, ShieldCheck, WifiOff } from "lucide-react";

export function OfflineInstitutionPreview() {
  const [connectionMessage, setConnectionMessage] = useState("");

  function checkConnection() {
    setConnectionMessage(navigator.onLine
      ? "Your browser reports a network connection. This preview does not contact a sync service or change catalogue data."
      : "Your browser still reports that it is offline. The example remains read-only and unchanged.");
  }

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dce5e0] pb-4">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue <span aria-hidden="true">/</span> Institutions <span aria-hidden="true">/</span> preview</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Institution detail</h1></div>
      <div className="flex gap-2"><button type="button" disabled className="min-h-10 cursor-not-allowed rounded-lg border border-[#d9dfdc] bg-[#f4f6f5] px-4 text-sm font-semibold text-[#929d97]" title="Save is unavailable in this offline preview">Save draft</button><button type="button" disabled className="min-h-10 cursor-not-allowed rounded-lg border border-[#d9dfdc] bg-[#f4f6f5] px-4 text-sm font-semibold text-[#929d97]" title="Publishing is unavailable in this offline preview">Mark verified</button></div>
    </header>

    <section role="status" className="flex items-start gap-3 rounded-lg border border-[#e9d7a9] bg-[#fff8e8] px-4 py-3 text-[#71551d]"><CloudOff aria-hidden className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="text-sm font-bold">Offline state preview</p><p className="mt-0.5 text-sm leading-relaxed">Some information may be out of date. Changes cannot be saved in this preview.</p></div><span className="ml-auto shrink-0 rounded-full border border-[#e4d5ad] bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">Sample</span></section>

    <div className="grid gap-4 lg:grid-cols-2">
      <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="cached-info-title"><div className="border-b border-[#e2e9e5] px-4 py-3.5"><div className="flex items-center gap-2"><Building2 aria-hidden className="h-4 w-4 text-[#176b5d]"/><h2 id="cached-info-title" className="font-bold text-[#263d32]">Catalogue details</h2></div><p className="mt-1 text-xs text-[#687970]">Illustrative example · read-only</p></div><dl className="grid gap-x-5 gap-y-4 p-4 text-sm sm:grid-cols-[minmax(120px,.85fr)_minmax(0,1.15fr)]"><dt className="text-[#687970]">Institution</dt><dd className="font-semibold text-[#263d32]">Government College, Kohima <span className="ml-1 text-[10px] font-bold uppercase text-[#94610c]">sample</span></dd><dt className="text-[#687970]">Last approved value</dt><dd className="font-semibold text-[#263d32]">Illustrative record only</dd></dl><p className="mx-4 mb-4 rounded-md border border-[#dce5e0] bg-[#f7f9f8] px-3 py-2.5 text-xs leading-relaxed text-[#53665e]">This preview does not read a device cache. Confirm a successful sync before relying on any value.</p></section>

      <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="connection-state-title"><div className="border-b border-[#e2e9e5] px-4 py-3.5"><div className="flex items-center gap-2"><WifiOff aria-hidden className="h-4 w-4 text-[#94610c]"/><h2 id="connection-state-title" className="font-bold text-[#263d32]">Connection state</h2></div><p className="mt-1 text-xs text-[#687970]">Browser status check · no sync service connected</p></div><div className="space-y-4 p-4"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="inline-flex items-center gap-1.5 rounded-full border border-[#e9d7a9] bg-[#fff6dd] px-2.5 py-1 font-bold text-[#805d13]"><span className="h-1.5 w-1.5 rounded-full bg-[#c58a16]"/>Offline · sample state</span><span className="text-[#687970]">Example last sync: 12 Oct 2026</span></div><div className="flex flex-wrap gap-2"><button type="button" onClick={checkConnection} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#12664f] px-3.5 text-sm font-bold text-white hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2"><RotateCcw aria-hidden className="h-4 w-4"/>Retry connection</button><Link href="/admin" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3.5 text-sm font-bold text-[#344b41] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">Return to review queue<ArrowLeft aria-hidden className="h-4 w-4"/></Link></div>{connectionMessage && <p role="status" aria-live="polite" className="rounded-md border border-[#dce5e0] bg-[#f7f9f8] px-3 py-2.5 text-xs leading-relaxed text-[#53665e]">{connectionMessage}</p>}<p className="flex items-start gap-2 rounded-md border border-[#efdfbd] bg-[#fff8e8] px-3 py-2.5 text-xs leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>Save draft and publish actions are disabled in this offline preview. No cache, sync, or server write is performed.</p></div></section>
    </div>

    <p className="flex items-start gap-2 text-xs leading-relaxed text-[#687970]"><ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>This is a labeled UI preview. Offline persistence, synchronization, and server-side retry are not implemented by this screen.</p>
  </div>;
}
