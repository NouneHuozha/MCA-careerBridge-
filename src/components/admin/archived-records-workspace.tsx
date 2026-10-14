"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArchiveRestore, Clock3, Info, Search, ShieldAlert } from "lucide-react";

type ArchivedRecord = {
  id: string;
  name: string;
  type: string;
  date: string;
  dateKey: string;
  reason: string;
  lastValue: string;
  archivedBy: string;
};

const sampleRecords: ArchivedRecord[] = [
  { id: "sample-institution", name: "Government College · sample", type: "Institution", date: "10 Oct 2026", dateKey: "2026-10-10", reason: "Duplicate record", lastValue: "Name and district retained", archivedBy: "A. Das" },
  { id: "sample-pathway", name: "Computing and applications · sample", type: "Pathway", date: "08 Oct 2026", dateKey: "2026-10-08", reason: "Taxonomy review", lastValue: "Previous description retained", archivedBy: "A. Das" },
  { id: "sample-scholarship", name: "State Merit Scholarship · sample", type: "Scholarship", date: "01 Oct 2026", dateKey: "2026-10-01", reason: "Cycle ended", lastValue: "2025–26 cycle archived", archivedBy: "System" },
  { id: "sample-source", name: "National Scholarship Portal · sample", type: "Source", date: "28 Sep 2026", dateKey: "2026-09-28", reason: "URL review", lastValue: "Last approved snapshot retained", archivedBy: "A. Das" },
];
const sampleReferenceTime = Date.parse("2026-10-14T00:00:00+05:30");

export function ArchivedRecordsWorkspace() {
  const [recordType, setRecordType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [archivedBy, setArchivedBy] = useState("all");
  const [reason, setReason] = useState("all");
  const [search, setSearch] = useState("");
  const [restoreTarget, setRestoreTarget] = useState<ArchivedRecord | null>(null);
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => sampleRecords.filter((record) => {
    if (recordType !== "all" && record.type !== recordType) return false;
    if (archivedBy !== "all" && record.archivedBy !== archivedBy) return false;
    if (reason !== "all" && record.reason !== reason) return false;
    if (dateRange !== "all") {
      const age = Math.floor((sampleReferenceTime - new Date(`${record.dateKey}T12:00:00+05:30`).getTime()) / 86_400_000);
      if (dateRange === "7d" && age > 7) return false;
      if (dateRange === "30d" && age > 30) return false;
      if (dateRange === "older" && age <= 30) return false;
    }
    const query = search.trim().toLowerCase();
    return !query || `${record.name} ${record.type} ${record.reason} ${record.lastValue} ${record.archivedBy}`.toLowerCase().includes(query);
  }), [recordType, dateRange, archivedBy, reason, search]);

  function restorePreview() {
    if (!restoreTarget) return;
    setNotice(`Preview only: “${restoreTarget.name.replace(" · sample", "")}” would be restored for review. No catalogue record was changed because archive/restore is not connected in this release.`);
    setRestoreTarget(null);
  }

  return <div className="space-y-5">
    <header className="border-b border-[#dce5e0] pb-4"><p className="flex items-center gap-2 text-xs font-medium text-[#687970]"><Link href="/admin/catalogue" className="hover:text-[#145c42]">Catalogue</Link><span aria-hidden>/</span><span>Archived records</span></p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Archived records</h1><p className="mt-1.5 text-sm text-[#53665e]">Find and restore archived institutions, courses, pathways, scholarships, opportunities, or sources.</p></header>

    <div role="note" className="flex items-start gap-2 rounded-lg border border-[#d2e2ec] bg-[#f0f6fa] px-4 py-3 text-xs leading-relaxed text-[#42637b]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Reference preview.</strong> The archive ledger and restore workflow are not connected to this release. The sample rows below are illustrative and do not represent live archived records.</p></div>
    {notice && <p role="status" className="rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-4 py-3 text-xs leading-relaxed text-[#426652]">{notice}</p>}

    <section className="grid gap-3 rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_minmax(190px,1.4fr)]" aria-label="Filter archived records">
      <label className="text-xs font-semibold text-[#596a63]">Record type<select value={recordType} onChange={(event) => setRecordType(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="all">All record types</option>{[...new Set(sampleRecords.map((item) => item.type))].map((type) => <option key={type}>{type}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#596a63]">Archived date<select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="all">Any date</option><option value="7d">Past 7 days</option><option value="30d">Past 30 days</option><option value="older">Older than 30 days</option></select></label>
      <label className="text-xs font-semibold text-[#596a63]">Archived by<select value={archivedBy} onChange={(event) => setArchivedBy(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="all">Anyone</option>{[...new Set(sampleRecords.map((item) => item.archivedBy))].map((person) => <option key={person}>{person}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#596a63]">Reason<select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="all">All reasons</option>{[...new Set(sampleRecords.map((item) => item.reason))].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label className="relative text-xs font-semibold text-[#596a63]"><span className="sr-only">Search archived records</span><Search aria-hidden className="pointer-events-none absolute left-3 top-[2.1rem] h-4 w-4 text-[#78877f]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search archived records…" className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm font-normal outline-none focus:border-[#27735c]" /></label>
    </section>

    <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="archived-table-heading"><div className="border-b border-[#e2e9e5] px-4 py-3 sm:px-5"><h2 id="archived-table-heading" className="text-base font-bold text-[#263d32]">Archived records</h2><p className="mt-0.5 text-xs text-[#687970]">Search and restore archived items; original history remains available.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="bg-[#f4f7f5] text-[10px] font-bold uppercase tracking-wide text-[#53665e]"><tr><th className="px-4 py-3">Record</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Archived date</th><th className="px-3 py-3">Reason</th><th className="px-3 py-3">Last approved value</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-[#e7ece9]">{filtered.map((record) => <tr key={record.id} className="hover:bg-[#fbfcfb]"><td className="px-4 py-3 font-semibold text-[#344b41]">{record.name}</td><td className="px-3 py-3 text-[#53665e]">{record.type}</td><td className="whitespace-nowrap px-3 py-3 text-[#53665e]">{record.date}</td><td className="px-3 py-3 text-[#53665e]">{record.reason}</td><td className="px-3 py-3 text-[#53665e]">{record.lastValue}</td><td className="px-4 py-3"><div className="flex gap-2"><Link href="/admin/change-history" className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2.5 text-[11px] font-semibold text-[#344e47] hover:bg-[#f5f8f6]">View history<Clock3 aria-hidden className="h-3 w-3" /></Link><button type="button" onClick={() => { setNotice(""); setRestoreTarget(record); }} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2.5 text-[11px] font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Restore record<ArchiveRestore aria-hidden className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="px-5 py-12 text-center"><ArchiveRestore aria-hidden className="mx-auto h-8 w-8 text-[#9aa8a1]" /><p className="mt-3 font-semibold text-[#344e47]">No archived records match these filters</p><p className="mt-1 text-sm text-[#718078]">Adjust the filters or search term to find a sample row.</p></div>}
    </section>

    <section className="overflow-hidden rounded-xl border border-[#e7c5c1] bg-white shadow-sm" aria-labelledby="permanent-deletion-heading"><div className="border-b border-[#f0ddda] px-4 py-3"><h2 id="permanent-deletion-heading" className="text-sm font-bold text-[#87382e]">Permanent deletion</h2></div><div className="p-4"><p className="flex items-start gap-2 rounded-lg border border-[#f0c9c5] bg-[#fff0ee] px-3 py-2.5 text-xs leading-relaxed text-[#87382e]"><AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>Permanent deletion should be rare and protected.</strong> Deletion is separate from archiving, requires an additional confirmation workflow, and is not available in this release.</span></p><button type="button" disabled className="mt-3 min-h-9 cursor-not-allowed rounded-lg border border-[#e2b8b3] px-3 text-xs font-semibold text-[#a23e38] opacity-60">Delete permanently · unavailable</button></div></section>

    {restoreTarget && <div role="presentation" className="fixed inset-0 z-50 grid place-items-center bg-[#10251d]/45 p-4" onClick={() => setRestoreTarget(null)}><section role="dialog" aria-modal="true" aria-labelledby="restore-title" className="w-full max-w-md rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><h2 id="restore-title" className="text-lg font-bold text-[#263d32]">Restore this record?</h2><p className="mt-2 text-sm leading-relaxed text-[#53665e]">Restore “{restoreTarget.name.replace(" · sample", "")}” from the archive? A real restore would return it to review; it would not automatically verify or publish the record.</p><p className="mt-3 rounded-lg border border-[#d2e2ec] bg-[#f0f6fa] px-3 py-2.5 text-xs leading-relaxed text-[#42637b]">Preview only: no record status or catalogue data will change.</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setRestoreTarget(null)} className="min-h-9 rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Cancel</button><button type="button" onClick={restorePreview} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#12664f] px-3 text-sm font-bold text-white"><ArchiveRestore aria-hidden className="h-4 w-4" />Confirm preview</button></div></section></div>}
  </div>;
}
