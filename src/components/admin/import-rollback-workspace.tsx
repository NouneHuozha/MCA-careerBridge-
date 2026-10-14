"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Check, RotateCcw } from "lucide-react";

const affectedRecords = [
  { name: "Kohima Arts College", effect: "Added by this import", result: "Would be removed" },
  { name: "Modern College, Kohima", effect: "Updated by this import", result: "Previous values restored" },
  { name: "North Hills Institute", effect: "Excluded during validation", result: "Would remain unchanged" },
];

export function ImportRollbackWorkspace() {
  const [confirmOpen, setConfirmOpen] = useState(true);
  const [showAffected, setShowAffected] = useState(false);
  const [notice, setNotice] = useState("");

  function confirmPreview() {
    setConfirmOpen(false);
    setNotice("Preview only: no catalogue data was rolled back and no live audit event was created.");
  }

  return <div className="space-y-4">
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#687970]"><Link href="/admin/imports" className="hover:text-[#145c42]">Imports</Link><span aria-hidden>/</span><Link href="/admin/imports/history" className="hover:text-[#145c42]">Import history</Link><span aria-hidden>/</span><span>institutions.xlsx</span><span aria-hidden>/</span><span className="font-semibold text-[#263d32]">Rollback</span></nav>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce5e0] pb-4">
      <div><h1 className="text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Rollback import</h1><p className="mt-1.5 max-w-3xl text-sm text-[#53665e]">Inspect the impact and confirm only after reviewing affected records.</p></div>
      <Link href="/admin/imports/history" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f3f7f5]">Cancel</Link>
    </header>

    <div className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2 text-xs leading-relaxed text-[#426652]"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Sample import · preview only.</strong> The counts and records below are illustrative. This route cannot change the live catalogue or write an audit event.</p></div>
    {notice && <p role="status" className="rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-4 py-3 text-sm text-[#426652]">{notice}</p>}

    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,.8fr)]">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="import-details-heading">
          <div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="import-details-heading" className="text-base font-bold text-[#263d32]">Import details</h2><p className="mt-0.5 text-xs text-[#687970]">Review the approved import before rollback.</p></div>
          <dl className="grid gap-x-6 px-4 sm:grid-cols-3">{[
            ["Import file", "institutions.xlsx"], ["Dataset", "Institutions"], ["Uploaded date", "13 October 2026"],
            ["Approved date", "13 October 2026"], ["Records added", "12"], ["Records updated", "8"],
            ["Records excluded", "4"], ["Current publication status", "Approved catalogue data"],
          ].map(([label, value]) => <div key={label} className="border-b border-[#edf1ef] py-3"><dt className="text-xs text-[#687970]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[#344b41]">{value}</dd></div>)}</dl>
        </section>

        <section className="rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="impact-heading">
          <div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="impact-heading" className="text-base font-bold text-[#263d32]">Impact preview</h2><p className="mt-0.5 text-xs text-[#687970]">Rollback affects approved catalogue data.</p></div>
          <ul className="divide-y divide-[#edf1ef] px-4">{[
            "12 records would be removed",
            "8 records would return to their previous values",
            "4 records would remain unchanged",
          ].map((item) => <li key={item} className="flex items-center gap-3 py-3 text-sm text-[#344b41]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#fff5df] text-[#94610c]"><AlertTriangle className="h-3.5 w-3.5" aria-hidden /></span>{item}</li>)}</ul>
        </section>

        <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="affected-heading">
          <h2 id="affected-heading" className="text-base font-bold text-[#263d32]">Affected records</h2>
          <p className="mt-2 rounded-lg border border-[#efdfbd] bg-[#fff8e8] px-3 py-2.5 text-xs leading-relaxed text-[#71551d]">Review the exact affected records before continuing. The original workbook and full history remain available.</p>
          <button type="button" onClick={() => setShowAffected((value) => !value)} aria-expanded={showAffected} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><RotateCcw className="h-4 w-4" aria-hidden />{showAffected ? "Hide affected records" : "Review affected records"}</button>
          {showAffected && <div className="mt-3 overflow-x-auto rounded-lg border border-[#e1e9e5]"><table className="w-full min-w-[540px] text-left text-xs"><thead className="bg-[#f4f7f5] text-[#53665e]"><tr><th className="px-3 py-2.5 font-bold">Record</th><th className="px-3 py-2.5 font-bold">Import effect</th><th className="px-3 py-2.5 font-bold">Rollback result</th></tr></thead><tbody className="divide-y divide-[#e7ece9]">{affectedRecords.map((record) => <tr key={record.name}><td className="px-3 py-2.5 font-medium text-[#344b41]">{record.name}</td><td className="px-3 py-2.5 text-[#53665e]">{record.effect}</td><td className="px-3 py-2.5 text-[#53665e]">{record.result}</td></tr>)}</tbody></table><p className="border-t border-[#e7ece9] px-3 py-2 text-[11px] text-[#687970]">Illustrative sample rows; not live catalogue records.</p></div>}
        </section>
      </div>

      <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="rollback-controls-heading">
        <div className="border-b border-[#e2e9e5] pb-3"><h2 id="rollback-controls-heading" className="text-base font-bold text-[#263d32]">Rollback controls</h2><p className="mt-0.5 text-xs text-[#687970]">A protected, reversible workflow—not a one-click action.</p></div>
        <p className="mt-3 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-xs leading-relaxed text-[#963f39]"><strong>Important:</strong> This action changes approved catalogue data. Previous values are restored where available.</p>
        <dl className="mt-3 divide-y divide-[#edf1ef] text-xs"><div className="flex items-center justify-between gap-3 py-3"><dt className="text-[#53665e]">Confirmation state</dt><dd className="rounded-full bg-[#fff5df] px-2.5 py-1 font-semibold text-[#94610c]">Review required</dd></div><div className="flex items-center justify-between gap-3 py-3"><dt className="text-[#53665e]">Audit event</dt><dd className="rounded-full bg-[#edf4fb] px-2.5 py-1 font-semibold text-[#3973a8]">Created on confirmation</dd></div></dl>
        <div className="mt-2 flex flex-wrap justify-end gap-2"><Link href="/admin/imports/history" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Cancel</Link><button type="button" onClick={() => setConfirmOpen(true)} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742]">Continue to rollback</button></div>
      </section>
    </div>

    {confirmOpen && <div role="presentation" className="fixed inset-0 z-[70] grid place-items-center bg-[#10251d]/25 p-4" onClick={() => setConfirmOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="confirm-rollback-title" className="w-full max-w-md rounded-xl border border-[#e6d2a7] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><h2 id="confirm-rollback-title" className="text-xl font-bold text-[#263d32]">Rollback this import?</h2><p className="mt-2 text-sm leading-relaxed text-[#53665e]">This creates an audit event and restores the previous approved values where available. Twelve records will be removed and eight will return to their prior values.</p><p className="mt-4 rounded-lg border border-[#efdfbd] bg-[#fff8e8] px-3 py-2.5 text-xs leading-relaxed text-[#71551d]">The action affects approved catalogue data. Review the affected records before confirming.</p><p className="mt-3 text-xs leading-relaxed text-[#687970]">Preview only: confirming here will not change catalogue data or create a real audit event.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmOpen(false)} className="min-h-10 rounded-lg border border-[#cbd8d2] px-4 text-sm font-semibold text-[#344e47]">Cancel</button><button type="button" onClick={confirmPreview} className="min-h-10 rounded-lg bg-[#aa3838] px-4 text-sm font-bold text-white hover:bg-[#8f2e2e]">Confirm rollback</button></div></section></div>}
  </div>;
}
