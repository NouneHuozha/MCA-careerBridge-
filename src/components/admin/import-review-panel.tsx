"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, Clock3, FileSpreadsheet, Info, Plus, Search, ShieldCheck, X } from "lucide-react";

type Field = { key: string; label: string };
type Filter = "all" | "new" | "updated" | "warnings" | "errors";
type Props = {
  datasetLabel: string;
  datasetId: string;
  fileName: string;
  rows: Record<string, unknown>[];
  fields: Field[];
  requiredFields: string[];
  knownCodes: string[];
  onBack: () => void;
  onSaveDraft: () => void;
};
type ReviewRow = {
  index: number;
  rowNumber: number;
  record: Record<string, unknown>;
  isNew: boolean;
  warning: boolean;
  error: boolean;
  reason: string;
  source: string;
  name: string;
};
const text = (value: unknown) => String(value ?? "").trim();

export function ImportReviewPanel({ datasetLabel, datasetId, fileName, rows, fields, requiredFields, knownCodes, onBack, onSaveDraft }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [inspected, setInspected] = useState<ReviewRow | null>(null);
  const [decision, setDecision] = useState("");
  const pageSize = 4;
  const known = useMemo(() => new Set(knownCodes.map((code) => code.toLocaleLowerCase())), [knownCodes]);
  const reviewRows: ReviewRow[] = useMemo(() => rows.map((record, index) => {
    const code = text(record.code ?? record.institution_code ?? record.slug ?? record.course_slug);
    const isKnown = datasetId === "institutions" && code ? known.has(code.toLocaleLowerCase()) : false;
    const missing = requiredFields.filter((key) => !text(record[key]));
    const error = missing.length > 0;
    const verification = text(record.verification_status).toLowerCase().replaceAll(" ", "_");
    const source = text(record.source_url ?? record.official_website);
    const weakVerification = Boolean(verification && !["verified", "current", "published_verified", "recently_verified"].includes(verification));
    const warning = !error && (!source || weakVerification);
    const reason = error ? `Required value missing: ${missing.join(", ")}` : !source ? "No source URL is mapped for this record." : weakVerification ? "Verification status needs review." : "Ready for review.";
    const name = text(record.name ?? record.institution_name ?? record.course_name ?? record.slug) || `Row ${index + 2} — missing name`;
    return { index, rowNumber: index + 2, record, isNew: !isKnown, warning, error, reason, source, name };
  }), [datasetId, known, requiredFields, rows]);
  const counts = {
    all: reviewRows.length,
    new: reviewRows.filter((row) => row.isNew).length,
    updated: reviewRows.filter((row) => !row.isNew).length,
    warnings: reviewRows.filter((row) => row.warning).length,
    errors: reviewRows.filter((row) => row.error).length,
  };
  const matchingRows = reviewRows.filter((row) => {
    const tabMatch = filter === "all" || (filter === "new" && row.isNew) || (filter === "updated" && !row.isNew) || (filter === "warnings" && row.warning) || (filter === "errors" && row.error);
    return tabMatch && (!query || `${row.name} ${row.source} ${row.reason} ${Object.values(row.record).join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  });
  const pageCount = Math.max(1, Math.ceil(matchingRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const shown = matchingRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const validCount = reviewRows.filter((row) => !row.error).length;
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${counts.all})` },
    { id: "new", label: `New (${counts.new})` },
    { id: "updated", label: `Updated (${counts.updated})` },
    { id: "warnings", label: `Warnings (${counts.warnings})` },
    { id: "errors", label: `Errors (${counts.errors})` },
  ];
  const countCards = [
    { value: counts.all, label: "total rows", icon: FileSpreadsheet, style: "bg-[#f1f6fb] text-[#2770b8]" },
    { value: counts.new, label: "new records", icon: Plus, style: "bg-[#eef7f2] text-[#147354]" },
    { value: counts.updated, label: "updated records", icon: Building2, style: "bg-[#eef5fd] text-[#2770b8]" },
    { value: counts.warnings, label: "warnings", icon: AlertTriangle, style: "bg-[#fff8e7] text-[#a56a00]" },
    { value: counts.errors, label: "errors", icon: X, style: "bg-[#fff1f0] text-[#bb3b39]" },
  ];

  return <div className="space-y-5">
    <header>
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Imports <span className="px-1 text-[#899790]">/</span> {datasetLabel} <span className="px-1 text-[#899790]">/</span> {fileName}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Review before it enters the catalogue.</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#596a63]">Check warnings, approve valid rows, and keep the original workbook for audit.</p>
    </header>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-5" aria-label="Import summary">
      {countCards.map(({ value, label, icon: Icon, style }) => <div key={label} className="flex min-h-20 items-center gap-3 rounded-lg border border-[#e0e7e3] bg-white p-3 shadow-sm sm:p-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${style}`}><Icon className="h-5 w-5" /></span><span><strong className="block text-2xl font-bold leading-none text-[#172b35]">{value}</strong><span className="mt-1 block text-xs text-[#596a63]">{label}</span></span></div>)}
    </section>

    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#e2e8e5] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-full overflow-x-auto rounded-lg border border-[#d4dfda]" role="tablist" aria-label="Filter import rows">{filters.map((item) => <button key={item.id} role="tab" aria-selected={filter === item.id} onClick={() => { setFilter(item.id); setPage(1); }} className={`min-h-10 shrink-0 px-3 text-xs font-semibold sm:text-sm ${filter === item.id ? "bg-[#0e6a53] text-white" : "bg-white text-[#52665d] hover:bg-[#f4f7f5]"}`}>{item.label}</button>)}</div>
          <label className="relative block sm:w-64"><span className="sr-only">Search {datasetLabel.toLowerCase()}</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#728078]" /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${datasetLabel.toLowerCase()}…`} className="min-h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#f4f7f5] text-xs font-bold text-[#596a63]"><tr><th className="px-3 py-3">Row</th><th className="px-3 py-3">{datasetLabel.replace(/s$/, "")}</th><th className="px-3 py-3">Change</th><th className="px-3 py-3">Source</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Action</th></tr></thead>
            <tbody className="divide-y divide-[#e6ebe8]">{shown.map((row) => <tr key={row.index} className="hover:bg-[#fbfcfb]"><td className="px-3 py-3 text-[#52665d]">{row.rowNumber}</td><td className="max-w-[280px] px-3 py-3 font-medium text-[#263b33]">{row.name}</td><td className="px-3 py-3"><span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${row.isNew ? "bg-[#e7f5ed] text-[#17634b]" : "bg-[#eaf3ff] text-[#2770b8]"}`}>{row.isNew ? "New" : "Updated"}</span></td><td className="max-w-[160px] truncate px-3 py-3 text-[#596a63]" title={row.source}>{row.source || "—"}</td><td className="px-3 py-3"><span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${row.error ? "bg-[#fff0ef] text-[#aa3933]" : row.warning ? "bg-[#fff7e5] text-[#875e12]" : "bg-[#e9f6ef] text-[#17634b]"}`}>{row.error ? <X className="h-3.5 w-3.5" /> : row.warning ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{row.error ? "Cannot import" : row.warning ? "Needs verification" : "Ready to import"}</span></td><td className="px-3 py-3 text-right"><button onClick={() => setInspected(row)} className="min-h-9 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f4f7f5]">Inspect</button></td></tr>)}
              {shown.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-[#687970]">No rows match this filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6ebe8] px-4 py-3 text-sm text-[#687970]"><span>Showing {matchingRows.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, matchingRows.length)} of {matchingRows.length} rows</span><div className="flex items-center gap-3"><button aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#d4dfda] disabled:opacity-40"><ArrowLeft className="h-4 w-4" /></button><span>{currentPage} of {pageCount}</span><button aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-[#d4dfda] disabled:opacity-40"><ArrowRight className="h-4 w-4" /></button></div></div>
      </section>

      <aside className="rounded-xl border border-[#d4dfda] bg-white p-4 shadow-sm sm:p-5"><h2 className="text-lg font-bold text-[#172b35]">Import safety</h2><ul className="mt-4 space-y-4 text-sm"><li className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0 text-[#16805e]" /><span><strong className="block text-[#263b33]">Workbook stays in this browser draft</strong><span className="mt-0.5 block text-xs leading-relaxed text-[#687970]">This screen has not uploaded or retained the original file on the server.</span></span></li><li className="flex gap-3"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#16805e]" /><span><strong className="block text-[#263b33]">No records published yet</strong><span className="mt-0.5 block text-xs leading-relaxed text-[#687970]">This review preview does not write to the live catalogue.</span></span></li><li className="flex gap-3"><Info className="h-5 w-5 shrink-0 text-[#344e47]" /><span><strong className="block text-[#263b33]">Rows with errors are excluded</strong><span className="mt-0.5 block text-xs leading-relaxed text-[#687970]">Rows missing required fields are not eligible for the preview approval.</span></span></li><li className="flex gap-3"><Clock3 className="h-5 w-5 shrink-0 text-[#344e47]" /><span><strong className="block text-[#263b33]">Unverified facts stay labelled</strong><span className="mt-0.5 block text-xs leading-relaxed text-[#687970]">Warnings remain visible so unsupported claims are not treated as verified.</span></span></li></ul>
        <div className="mt-5 rounded-lg border border-[#d8e8df] bg-[#f0f7f3] p-3"><div className="flex items-start gap-3"><FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-[#17634b]" /><div className="min-w-0"><strong className="block truncate text-sm text-[#263b33]">File: {fileName}</strong><span className="mt-1 block text-xs text-[#596a63]">{rows.length} rows detected · browser draft only</span></div></div></div>
      </aside>
    </div>

    {decision && <div role="status" className="rounded-lg border border-[#c8ded3] bg-[#eef7f2] px-4 py-3 text-sm text-[#245844]">{decision}</div>}
    <footer className="flex flex-col gap-3 border-t border-[#d7e1dc] pt-4 sm:flex-row sm:items-center sm:justify-between"><button onClick={onBack} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#344e47]"><ArrowLeft className="h-4 w-4" />Back to mapping</button><div className="flex flex-wrap items-center justify-end gap-2"><p className="mr-2 flex items-center gap-2 text-xs text-[#596a63]"><Info className="h-4 w-4" />Prototype only—decisions aren’t saved server-side.</p><button onClick={onSaveDraft} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b7cec2] px-3 text-sm font-bold text-[#17634b]">Save draft</button><button disabled={!validCount} onClick={() => setDecision(`${validCount} valid row(s) marked approved in this preview only. No records or audit events were written.`)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" />Approve valid rows</button><button onClick={() => setDecision("Import marked rejected in this preview only. No server-side records were changed.")} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#e4b9b5] px-4 text-sm font-bold text-[#a23e38]"><X className="h-4 w-4" />Reject import</button></div></footer>

    {inspected && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-[#10251d]/45 p-4" onClick={() => setInspected(null)}><section role="dialog" aria-modal="true" aria-labelledby="inspect-title" className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#687970]">Workbook row {inspected.rowNumber}</p><h2 id="inspect-title" className="mt-1 text-xl font-bold text-[#172b35]">{inspected.name}</h2></div><button onClick={() => setInspected(null)} aria-label="Close row details" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d4dfda]"><X className="h-4 w-4" /></button></div><div className="mt-5 rounded-lg border border-[#ead8a9] bg-[#fff8e7] p-3 text-sm text-[#62430b]"><strong>{inspected.error ? "Cannot import" : inspected.warning ? "Needs verification" : "Ready to import"}</strong><p className="mt-1">{inspected.reason}</p></div><dl className="mt-4 divide-y divide-[#e7ece9]">{fields.map((field) => <div key={field.key} className="grid gap-1 py-3 sm:grid-cols-[190px_1fr]"><dt className="text-xs font-semibold text-[#687970]">{field.label}</dt><dd className="break-words text-sm text-[#263b33]">{text(inspected.record[field.key]) || "—"}</dd></div>)}</dl><div className="mt-5 flex justify-end"><button onClick={() => setInspected(null)} className="min-h-10 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white">Done</button></div></section></div>}
  </div>;
}
