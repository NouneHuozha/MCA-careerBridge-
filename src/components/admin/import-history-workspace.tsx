"use client";

import Link from "next/link";
import * as ExcelJS from "exceljs";
import { useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Clock3, Download, FileSpreadsheet, Info, Link2, RotateCcw, Search, ShieldCheck, X } from "lucide-react";

type ImportRecord = {
  id: string; date: string; dataset: string; file: string; rows: number; added: number; updated: number;
  warnings: number; errors: number; status: "Partially approved" | "Approved";
};
const imports: ImportRecord[] = [
  { id: "institutions", date: "13 Oct 2026", dataset: "Institutions", file: "institutions.xlsx", rows: 24, added: 12, updated: 8, warnings: 3, errors: 1, status: "Partially approved" },
  { id: "scholarships", date: "12 Oct 2026", dataset: "Scholarships", file: "scholarships.xlsx", rows: 18, added: 18, updated: 0, warnings: 4, errors: 0, status: "Approved" },
  { id: "courses", date: "10 Oct 2026", dataset: "Courses", file: "courses.xlsx", rows: 32, added: 4, updated: 28, warnings: 0, errors: 0, status: "Approved" },
];
const sampleValues = [
  ["institution_code", ""],
  ["name", "Modern College, Kohima"],
  ["type", "College"],
  ["district", "Kohima"],
  ["official_website", "https://example.edu.in"],
];
const statusClass = (status: ImportRecord["status"]) => status === "Approved" ? "border-[#c8e2d3] bg-[#e9f5ee] text-[#17634b]" : "border-[#efdfbd] bg-[#fff5df] text-[#94610c]";

export function ImportHistoryWorkspace() {
  const [selectedId, setSelectedId] = useState(imports[0].id);
  const [rowDisposition, setRowDisposition] = useState<"open" | "excluded" | "correction">("open");
  const [notice, setNotice] = useState("");
  const [showChanges, setShowChanges] = useState(false);
  const selected = imports.find((item) => item.id === selectedId) ?? imports[0];
  const sampleSelected = selected.id === "institutions";

  async function downloadSampleWorkbook() {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Institutions");
      sheet.addRow(sampleValues.map(([field]) => field));
      sheet.addRow(sampleValues.map(([, value]) => value));
      const bytes = await workbook.xlsx.writeBuffer();
      const blob = new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "sample-institutions.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("Downloaded a generated sample workbook. It is not the original file from a real import.");
    } catch {
      setNotice("The sample workbook could not be generated in this browser.");
    }
  }

  function recordSampleAction(action: string) {
    setNotice(`${action} noted for the synthetic sample only. No catalogue record or live audit history was changed.`);
  }

  return <div className="space-y-4">
    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs font-medium text-[#687970]"><Link href="/admin/imports" className="hover:text-[#145c42]">Imports</Link><span aria-hidden>/</span><span className="font-semibold text-[#263d32]">Import history</span></div>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce5e0] pb-4">
      <div><h1 className="text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Import history</h1><p className="mt-1.5 max-w-3xl text-sm text-[#53665e]">See what was uploaded, what changed, and which rows entered the approved catalogue.</p></div>
      <Link href="/admin/imports" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742]"><FileSpreadsheet className="h-4 w-4" />New import</Link>
    </header>

    <div className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2 text-xs leading-relaxed text-[#426652]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Design example only.</strong> The rows and decisions below are synthetic reference data; no uploaded workbook or live import is attached.</p></div>
    {notice && <p role="status" className="rounded-lg border border-[#c8e2d3] bg-[#e9f5ee] px-3 py-2 text-sm text-[#17634b]">{notice}</p>}

    <section className="grid grid-cols-2 gap-2 lg:grid-cols-4" aria-label="Selected import totals">
      {[{ value: selected.rows, label: "total rows", icon: FileSpreadsheet, color: "bg-[#eaf3ee] text-[#17634b]" }, { value: selected.added, label: "new records", icon: CheckCircle2, color: "bg-[#eaf3ee] text-[#17634b]" }, { value: selected.updated, label: "updated records", icon: Link2, color: "bg-[#edf4fb] text-[#3973a8]" }, { value: `${selected.warnings} + ${selected.errors}`, label: "warnings · errors", icon: AlertTriangle, color: "bg-[#fff5df] text-[#94610c]" }].map(({ value, label, icon: Icon, color }) => <div key={label} className="flex min-h-14 items-center gap-2 rounded-lg border border-[#e0e7e3] bg-white px-3 py-2 shadow-sm"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${color}`}><Icon aria-hidden className="h-4 w-4" /></span><span><strong className="block text-lg leading-none text-[#263d32]">{value}</strong><span className="mt-1 block text-[10px] text-[#687970]">{label}</span></span></div>)}
    </section>

    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.42fr)_minmax(400px,.95fr)]">
      <div className="space-y-3">
        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="history-heading">
          <div className="border-b border-[#e2e9e5] px-3 py-2.5"><h2 id="history-heading" className="text-base font-bold text-[#263d32]">Import history</h2><p className="mt-0.5 text-[11px] text-[#687970]">Select an import to inspect its recorded summary.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[710px] text-left text-[11px]"><thead className="bg-[#f4f7f5] font-bold text-[#53665e]"><tr>{["Date", "Dataset", "File", "Rows", "New", "Updated", "Warnings", "Errors", "Status", "Action"].map((label) => <th key={label} className="whitespace-nowrap px-2 py-2">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#e6ece8]">{imports.map((item) => <tr key={item.id} className={item.id === selectedId ? "bg-[#f6faf7]" : "hover:bg-[#fbfcfb]"}><td className="whitespace-nowrap px-2 py-2.5 text-[#53665e]">{item.date}</td><td className="px-2 py-2.5 font-medium text-[#344b41]">{item.dataset}</td><td className="px-2 py-2.5 text-[#53665e]">{item.file}</td><td className="px-2 py-2.5">{item.rows}</td><td className="px-2 py-2.5">{item.added}</td><td className="px-2 py-2.5">{item.updated}</td><td className="px-2 py-2.5">{item.warnings}</td><td className="px-2 py-2.5">{item.errors}</td><td className="px-2 py-2.5"><span className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></td><td className="px-2 py-2.5"><button type="button" onClick={() => { setSelectedId(item.id); setRowDisposition("open"); setNotice(""); }} className="min-h-7 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]">{item.id === "institutions" ? "Inspect" : "View"}</button></td></tr>)}</tbody></table></div>
        </section>

        <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="safety-heading"><h2 id="safety-heading" className="text-sm font-bold text-[#263d32]">Import safety</h2><ul className="mt-2 divide-y divide-[#e7ece9] text-[11px]"><li className="flex items-center justify-between gap-3 py-2"><span>Original workbook retained</span><span className="rounded-full bg-[#e9f5ee] px-2 py-1 font-bold text-[#17634b]">Sample only</span></li><li className="flex items-center justify-between gap-3 py-2"><span>Rows with errors enter catalogue</span><span className="rounded-full bg-[#e9f5ee] px-2 py-1 font-bold text-[#17634b]">No</span></li><li className="flex items-center justify-between gap-3 py-2"><span>Approved values silently replaced</span><span className="rounded-full bg-[#e9f5ee] px-2 py-1 font-bold text-[#17634b]">No</span></li></ul><p className="mt-2 rounded-md border border-[#efdfbd] bg-[#fff8e8] px-3 py-2 text-[10px] leading-relaxed text-[#71551d]">Warning rows may import only with <code>needs_verification</code> status. In this sample, the source URL could not be reached during validation.</p><p className="mt-2 text-[10px] leading-relaxed text-[#53665e]">Rows with errors do not enter the catalogue. Approved values are never silently replaced. A real rollback must show a warning and write an audit event.</p></section>
      </div>

      <div className="space-y-3">
        <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="selected-import-heading">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 id="selected-import-heading" className="text-base font-bold text-[#263d32]">Selected import</h2><p className="mt-0.5 text-[10px] text-[#687970]">{selected.date} · {selected.dataset} · sample import record</p></div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${statusClass(selected.status)}`}>{selected.status}</span></div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 text-[10px]">
            {[["File name", selected.file, "Original workbook not attached to this demo"], ["Dataset label", selected.dataset, selected.date], ["Uploaded by", "Admin · sample record", "13 Oct 2026, 10:24 AM"], ["Mapping version", "v2.1", "Sample mapping metadata"], ["Total / valid rows", `${selected.rows} total · ${selected.rows - selected.errors} valid`, `${selected.warnings} warnings · ${selected.errors} error${selected.errors === 1 ? "" : "s"}`], ["Approval decision", selected.status, "Approved by Admin · sample"]].map(([label, value, hint]) => <div key={label} className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">{label}</dt><dd className="mt-0.5 font-bold text-[#344b41]">{value}</dd><dd className="mt-0.5 text-[9px] text-[#85928b]">{hint}</dd></div>)}
          </dl>
          <div className="mt-2"><p className="text-[10px] text-[#687970]">Audit event</p><p className="mt-0.5 text-[11px] font-semibold text-[#344b41]">{selected.status === "Approved" ? "Import approved · sample event" : "Import approved with row-level exclusions · sample event"}</p></div>
          <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => void downloadSampleWorkbook()} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47]"><Download className="h-3 w-3" />Download sample workbook</button><button type="button" onClick={() => setShowChanges((value) => !value)} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47]">{showChanges ? "Hide changes" : "View changes"}</button><Link href="/admin/imports/history/rollback" className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#e4b9b5] px-2 text-[10px] font-semibold text-[#a23e38]"><RotateCcw className="h-3 w-3" />Rollback import</Link></div>
          {showChanges && <div className="mt-2 rounded-md border border-[#dce8e1] bg-[#f7faf8] p-2 text-[10px] leading-relaxed text-[#53665e]"><strong>Sample change summary:</strong> {selected.added} new records, {selected.updated} updated records. The {selected.errors} invalid row was excluded; approved values were not silently replaced.</div>}
          {sampleSelected && <p className="mt-2 rounded-md border border-[#efdfbd] bg-[#fff8e8] px-2.5 py-2 text-[10px] text-[#71551d]">Rollback needs an explicit warning and a separate audit record. Demo controls below never alter live data.</p>}
        </section>

        <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="row-inspection-heading">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h2 id="row-inspection-heading" className="text-base font-bold text-[#263d32]">Row inspection</h2><p className="mt-0.5 text-[10px] text-[#687970]">Original workbook values remain available for correction and audit.</p></div></div>
          {sampleSelected ? <>
            <div className="mt-2 flex items-center justify-between gap-2 border-b border-[#e7ece9] pb-2"><div><h3 className="text-sm font-bold text-[#344b41]">Row 17</h3><p className="text-[10px] text-[#687970]">Entity: Institution</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${rowDisposition === "excluded" ? "bg-[#f0f3f4] text-[#5d6b66]" : rowDisposition === "correction" ? "bg-[#fff5df] text-[#94610c]" : "bg-[#fff0ef] text-[#a33e3e]"}`}>{rowDisposition === "excluded" ? "Excluded · sample" : rowDisposition === "correction" ? "Marked for correction" : "Cannot import"}</span></div>
            <div className="mt-2 grid grid-cols-[minmax(110px,.75fr)_minmax(0,1.5fr)] bg-[#f4f7f5] px-2 py-1 text-[10px] font-bold text-[#53665e]"><span>Workbook field</span><span>Original value</span></div>
            <dl className="divide-y divide-[#edf1ef]">{sampleValues.map(([field, value]) => <div key={field} className="grid grid-cols-[minmax(110px,.75fr)_minmax(0,1.5fr)] gap-2 px-2 py-1.5 text-[10px]"><dt className="font-medium text-[#53665e]">{field}</dt><dd className="break-all text-[#344b41]">{value || <span className="italic text-[#7f8d86]">[empty]</span>}</dd></div>)}</dl>
            {rowDisposition === "open" && <div className="mt-2 rounded-md border border-[#efc9c4] bg-[#fff2f0] p-2"><p className="text-[10px] font-bold text-[#9e4038]">Validation error</p><p className="mt-0.5 text-[10px] leading-relaxed text-[#9e4038]">Institution code is required and must be unique.</p></div>}
            <div className="mt-2 flex flex-wrap gap-1.5"><button type="button" onClick={() => { setRowDisposition("excluded"); recordSampleAction("Exclude row"); }} disabled={rowDisposition === "excluded"} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] disabled:opacity-50"><X className="h-3 w-3" />Exclude row</button><button type="button" onClick={() => { setRowDisposition("correction"); recordSampleAction("Mark for correction"); }} disabled={rowDisposition === "correction"} className="min-h-8 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] disabled:opacity-50">Mark for correction</button><Link href="/admin/catalogue/institutions" className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47]">Open institution catalogue<ArrowUpRight className="h-3 w-3" /></Link></div>
            <p className="mt-2 flex items-start gap-1.5 rounded-md bg-[#f2f8f4] px-2.5 py-2 text-[10px] leading-relaxed text-[#426652]"><ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />Rows with errors do not enter the catalogue; original values stay available for audit.</p>
          </> : <div className="mt-3 rounded-md border border-dashed border-[#cbd8d2] bg-[#f7faf8] p-4 text-xs text-[#687970]">This sample does not include row-level examples for {selected.dataset}. The synthetic institution example is available by selecting the first import.</div>}
        </section>
      </div>
    </div>

  </div>;
}
