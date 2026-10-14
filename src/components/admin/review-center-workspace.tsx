"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, FileWarning, Filter, Info, Link2Off, Search } from "lucide-react";

export type ReviewCenterItem = {
  id: string;
  kind: "change" | "source" | "import" | "report";
  createdAt: string;
  category: string;
  entity: string;
  detail: string;
  priority: "High priority" | "Needs attention" | "Blocking" | "Normal priority";
  status: string;
  href: string;
  assignedTo: string | null;
};

type Tab = "all" | "needs_review" | "assigned" | "source_problems" | "import_issues" | "resolved";
const tabs: { key: Tab; label: string }[] = [
  { key: "all", label: "All" }, { key: "needs_review", label: "Needs review" }, { key: "assigned", label: "Assigned to me" }, { key: "source_problems", label: "Source problems" }, { key: "import_issues", label: "Import issues" }, { key: "resolved", label: "Resolved" },
];
const kindLabels: Record<ReviewCenterItem["kind"], string> = { change: "Content change", source: "Source problem", import: "Import issue", report: "Student report" };
const priorityStyles: Record<ReviewCenterItem["priority"], string> = {
  "High priority": "text-[#8a5c0d]", "Needs attention": "text-[#8a5c0d]", Blocking: "text-[#a13e3e]", "Normal priority": "text-[#53665e]",
};
const statusStyles: Record<string, string> = {
  "Needs review": "border-[#ead8a9] bg-[#fff6df] text-[#805d13]", "Source unavailable": "border-[#efc9c4] bg-[#fff0ee] text-[#a23e38]", "Cannot import": "border-[#efc9c4] bg-[#fff0ee] text-[#a23e38]", "Open": "border-[#ead8a9] bg-[#fff6df] text-[#805d13]", "In review": "border-[#ead8a9] bg-[#fff6df] text-[#805d13]", "Resolved": "border-[#cfe4d8] bg-[#edf8f1] text-[#1d6846]", "Dismissed": "border-[#dce2df] bg-[#f0f3f2] text-[#687970]", "Approved": "border-[#cfe4d8] bg-[#edf8f1] text-[#1d6846]", "Rejected": "border-[#dce2df] bg-[#f0f3f2] text-[#687970]",
};

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true }).format(date);
}

export function ReviewCenterWorkspace({ items, currentUserEmail }: { items: ReviewCenterItem[]; currentUserEmail: string }) {
  const [tab, setTab] = useState<Tab>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [priority, setPriority] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => items.filter((item) => {
    const isResolved = ["Resolved", "Dismissed", "Approved", "Rejected"].includes(item.status);
    if (tab === "needs_review" && isResolved) return false;
    if (tab === "assigned" && (!item.assignedTo || item.assignedTo.toLowerCase() !== currentUserEmail.toLowerCase() || isResolved)) return false;
    if (tab === "source_problems" && item.kind !== "source") return false;
    if (tab === "import_issues" && item.kind !== "import") return false;
    if (tab === "resolved" && !isResolved) return false;
    if (priority !== "all" && item.priority !== priority) return false;
    const query = search.trim().toLowerCase();
    return !query || `${item.category} ${item.entity} ${item.detail} ${item.status} ${item.assignedTo ?? ""}`.toLowerCase().includes(query);
  }), [items, tab, priority, search, currentUserEmail]);

  const unresolvedCount = items.filter((item) => !["Resolved", "Dismissed", "Approved", "Rejected"].includes(item.status)).length;

  return <div className="space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-medium text-[#687970]"><Link href="/admin" className="hover:text-[#145c42]">Review queue</Link><span aria-hidden>/</span><span>Review center</span></p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Review center</h1><p className="mt-1.5 text-sm text-[#53665e]">See important changes, source problems, and assigned review tasks in one place.</p></div>
      <button type="button" onClick={() => setShowFilters((value) => !value)} aria-expanded={showFilters} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><Filter aria-hidden className="h-4 w-4" />Filter</button>
    </header>

    <div className="flex gap-2 overflow-x-auto border-b border-[#dce5e0]" role="tablist" aria-label="Review center categories">{tabs.map(({ key, label }) => <button key={key} type="button" role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className={`min-h-10 shrink-0 rounded-t-lg border-b-2 px-3 text-xs font-semibold ${tab === key ? "border-[#17634b] bg-[#eaf5ef] text-[#17634b]" : "border-transparent text-[#53665e] hover:bg-white"}`}>{label}{key === "all" && <span className="ml-1.5 text-[10px] opacity-70">{items.length}</span>}{key === "needs_review" && <span className="ml-1.5 text-[10px] opacity-70">{unresolvedCount}</span>}</button>)}</div>

    {showFilters && <section className="grid gap-3 rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_minmax(200px,260px)]" aria-label="Filter actionable items"><label className="relative text-xs font-semibold text-[#596a63]"><span className="sr-only">Search review items</span><Search aria-hidden className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#78877f]" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search entity or issue…" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm font-normal outline-none focus:border-[#27735c]" /></label><label className="text-xs font-semibold text-[#596a63]">Priority<select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="all">All priorities</option><option>High priority</option><option>Needs attention</option><option>Blocking</option><option>Normal priority</option></select></label></section>}

    <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="actionable-items-heading">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e2e9e5] px-4 py-3 sm:px-5"><div><h2 id="actionable-items-heading" className="text-base font-bold text-[#263d32]">Actionable items</h2><p className="mt-0.5 text-xs text-[#687970]">Prioritized changes and issues only · low-value notifications are omitted.</p></div><span className="text-xs text-[#687970]">{filtered.length} item{filtered.length === 1 ? "" : "s"}</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-xs"><thead className="bg-[#f4f7f5] text-[10px] font-bold uppercase tracking-wide text-[#53665e]"><tr><th className="px-4 py-3">Time</th><th className="px-3 py-3">Category</th><th className="px-3 py-3">Entity and reason</th><th className="px-3 py-3">Priority</th><th className="px-3 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#e7ece9]">{filtered.map((item) => <tr key={item.id} className="transition hover:bg-[#f8fbf9]"><td className="whitespace-nowrap px-4 py-3 text-[#53665e]">{timeLabel(item.createdAt)}</td><td className="whitespace-nowrap px-3 py-3 text-[#53665e]">{kindLabels[item.kind]}</td><td className="max-w-[420px] px-3 py-3"><p className="font-semibold text-[#344b41]">{item.entity}</p><p className="mt-0.5 truncate text-[11px] text-[#687970]" title={item.detail}>{item.detail}</p>{item.assignedTo && <p className="mt-1 text-[10px] text-[#687970]">Assigned to {item.assignedTo}</p>}</td><td className={`whitespace-nowrap px-3 py-3 font-semibold ${priorityStyles[item.priority]}`}>{item.priority}</td><td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${statusStyles[item.status] ?? "border-[#dce2df] bg-[#f0f3f2] text-[#687970]"}`}>{item.status === "Source unavailable" ? <Link2Off aria-hidden className="h-3 w-3" /> : item.status === "Cannot import" ? <FileWarning aria-hidden className="h-3 w-3" /> : ["Resolved", "Approved"].includes(item.status) ? <CheckCircle2 aria-hidden className="h-3 w-3" /> : <Clock3 aria-hidden className="h-3 w-3" />}{item.status}</span></td><td className="px-4 py-3 text-right"><Link href={item.href} className="inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-md border border-[#cbd8d2] px-2.5 text-[11px] font-semibold text-[#344e47] hover:bg-[#f5f8f6]">{item.kind === "source" ? "Retry or inspect" : item.kind === "import" ? "Correct row" : item.kind === "report" ? "Open feedback" : item.status === "Resolved" || item.status === "Approved" || item.status === "Rejected" ? "View" : "Open review"}<ArrowUpRight aria-hidden className="h-3 w-3" /></Link></td></tr>)}</tbody></table></div>
      {!filtered.length && <div className="px-5 py-12 text-center"><CheckCircle2 aria-hidden className="mx-auto h-8 w-8 text-[#287b60]" /><p className="mt-3 font-semibold text-[#344e47]">{tab === "import_issues" ? "Import issue tracking is not available yet" : "No items in this view"}</p><p className="mx-auto mt-1 max-w-xl text-sm leading-relaxed text-[#718078]">{tab === "import_issues" ? "Row-level import validation errors are not currently persisted. Visit Imports to review completed batches; no sample issue is shown as a live record." : "This view will show matching actionable records as they are submitted or recorded."}</p>{tab === "import_issues" && <Link href="/admin/imports" className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47]">Open imports<ArrowUpRight aria-hidden className="h-3.5 w-3.5" /></Link>}</div>}
    </section>

    <p className="flex items-start gap-2 rounded-lg border border-[#dce8e1] bg-[#f7faf8] px-4 py-3 text-xs leading-relaxed text-[#53665e]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Student reports create review tasks; they do not directly modify catalogue data. Resolving a report records the review outcome but does not change the catalogue.</p>
  </div>;
}
