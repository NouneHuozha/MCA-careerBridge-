"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, Download, FileSpreadsheet, ShieldCheck, X } from "lucide-react";

const errors = [
  { label: "Required column missing: institution_code", affected: "All affected rows" },
  { label: "2 duplicate records found", affected: "2 rows" },
  { label: "1 invalid URL", affected: "1 row" },
];

export function ImportValidationErrorPreview() {
  const [notice, setNotice] = useState("");
  function downloadReport() {
    const csv = ["severity,error,affected_rows", ...errors.map((item) => `blocking,\"${item.label}\",\"${item.affected}\"`)].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "sample-import-error-report.csv"; anchor.click(); URL.revokeObjectURL(url);
    setNotice("Downloaded the sample error report. It does not contain data from an uploaded workbook.");
  }

  return <div className="space-y-5">
    <header className="border-b border-[#dce5e0] pb-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Imports <span aria-hidden="true">/</span> institutions.xlsx · sample</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Import validation</h1></header>
    <section role="alert" className="flex items-start gap-3 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-4 py-3 text-[#8e4038]"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="text-sm font-bold">This workbook cannot be imported yet</p><p className="mt-0.5 text-xs leading-relaxed">Blocking validation errors must be corrected before import review. This is a synthetic example; no workbook was uploaded.</p></div><span className="ml-auto rounded-full border border-[#efc9c4] bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">Sample</span></section>

    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.8fr)]">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="validation-errors-title"><div className="border-b border-[#e2e9e5] px-4 py-3.5"><h2 id="validation-errors-title" className="font-bold text-[#263d32]">Validation errors</h2><p className="mt-1 text-xs text-[#687970]">institutions.xlsx · sample validation result</p></div><ul className="divide-y divide-[#e7ece9] px-4">{errors.map((item) => <li key={item.label} className="flex flex-wrap items-center justify-between gap-3 py-3"><span className="flex items-start gap-2 text-sm text-[#34443c]"><X aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#b43f3a]"/>{item.label}</span><span className="inline-flex items-center gap-1 rounded-full bg-[#fde8e8] px-2.5 py-1 text-[10px] font-bold text-[#a13e3e]"><span className="h-1.5 w-1.5 rounded-full bg-[#bd4842]"/>Blocking error</span></li>)}</ul></section>
        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="affected-rows-title"><div className="border-b border-[#e2e9e5] px-4 py-3.5"><h2 id="affected-rows-title" className="font-bold text-[#263d32]">Affected rows</h2><p className="mt-1 text-xs text-[#687970]">Counts are illustrative; original row values are not present in this preview.</p></div><ul className="divide-y divide-[#e7ece9] px-4 text-sm"><li className="flex justify-between gap-4 py-2.5"><span className="text-[#53665e]">Rows with missing institution_code</span><strong className="text-[#34443c]">All affected rows</strong></li><li className="flex justify-between gap-4 py-2.5"><span className="text-[#53665e]">Duplicate records</span><strong className="text-[#34443c]">2 rows</strong></li><li className="flex justify-between gap-4 py-2.5"><span className="text-[#53665e]">Invalid URL</span><strong className="text-[#34443c]">1 row</strong></li></ul><p className="mx-4 mb-4 flex items-start gap-2 rounded-md border border-[#e9d7a9] bg-[#fff8e8] px-3 py-2.5 text-xs leading-relaxed text-[#71551d]"><FileSpreadsheet aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>The sample workbook is unchanged. No records entered the catalogue.</p></section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="next-steps-title"><h2 id="next-steps-title" className="font-bold text-[#263d32]">Next steps</h2><p className="mt-1 text-xs text-[#687970]">Correct the workbook and validate again in the browser.</p><div className="mt-3 space-y-2"><button type="button" onClick={downloadReport} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f4f7f5]"><Download aria-hidden className="h-4 w-4"/>Download sample error report</button><Link href="/admin/imports" className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#12664f] px-3 text-sm font-bold text-white hover:bg-[#0d5742]">Choose corrected workbook<ArrowLeft aria-hidden className="h-4 w-4 rotate-180"/></Link><Link href="/admin/imports" className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f4f7f5]">Back to imports</Link></div>{notice && <p role="status" aria-live="polite" className="mt-3 rounded-md border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2 text-xs leading-relaxed text-[#426652]">{notice}</p>}</section>
        <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="import-safety-title"><h2 id="import-safety-title" className="font-bold text-[#263d32]">Import safety</h2><p className="mt-3 rounded-md border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-xs leading-relaxed text-[#8e4038]">Approval and publishing are unavailable while blocking errors remain.</p><div className="mt-3 flex items-center justify-between text-sm"><span className="text-[#53665e]">Catalogue changed</span><span className="rounded-full bg-[#e8f4ed] px-2.5 py-1 text-xs font-bold text-[#17634b]">No · preview</span></div><p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#53665e]"><ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#17634b]"/>The application currently reads and validates files in this browser; it does not upload, stage, or import catalogue records to a server.</p></section>
      </aside>
    </div>
  </div>;
}
