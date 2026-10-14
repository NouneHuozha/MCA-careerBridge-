"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Info, ShieldCheck } from "lucide-react";

type SafeGroup = {
  id: string;
  count: number;
  title: string;
  description: string;
  details: string[];
};

const groups: SafeGroup[] = [
  { id: "health", count: 12, title: "Source health updates", description: "Recent status checks changed only source-health metadata.", details: ["National Scholarship Portal · responding · sample status check", "Modern College admissions page · response recovered · sample", "Directorate of Technical Education · source reachable · sample"] },
  { id: "timestamps", count: 8, title: "Last-checked timestamps", description: "Successful automatic refreshes updated retrieval timestamps only.", details: ["Modern College admissions page · checked 14 Oct 2026, 10:19 · sample", "National Scholarship Portal · checked 14 Oct 2026, 09:42 · sample", "State examination authority · checked 14 Oct 2026, 09:10 · sample"] },
  { id: "stale", count: 4, title: "Stale-review flags", description: "Review reminders were refreshed without changing catalogue facts.", details: ["Kohima College · review reminder refreshed · sample", "State Merit Scholarship · stale evidence flag refreshed · sample", "BCA course record · review reminder refreshed · sample"] },
  { id: "links", count: 3, title: "Link checks recovered", description: "Previously unavailable links responded again; content was not edited.", details: ["College admissions page · HTTP 200 · sample", "Scholarship application portal · HTTP 200 · sample", "Exam authority notice · HTTP 200 · sample"] },
];

export function SafeChangesWorkspace() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  function toggleExpanded(id: string) {
    setExpanded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function showPreview(group?: SafeGroup) {
    const count = group ? `${group.count} ${group.title.toLowerCase()}` : "all safe-change groups";
    setNotice(`Preview only: ${count} would update operational metadata, but no changes were applied. Safe-update batches are not persisted in this release.`);
  }

  return <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce5e0] pb-4"><div><p className="flex items-center gap-2 text-xs font-medium text-[#687970]">Review queue <span aria-hidden>/</span><span>Safe changes</span></p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Safe changes ready to apply</h1><p className="mt-1.5 text-sm text-[#53665e]">Review operational updates that don’t change the underlying catalogue facts.</p></div><button type="button" onClick={() => { setExpanded(groups.map((group) => group.id)); setNotice("All groups are expanded for review. The rows shown are illustrative examples only."); }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Review all groups<ArrowUpRight aria-hidden className="h-3.5 w-3.5" /></button></header>

    <div role="note" className="flex items-start gap-2 rounded-lg border border-[#d2e2ec] bg-[#f0f6fa] px-4 py-3 text-xs leading-relaxed text-[#42637b]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Safe-change boundary.</strong> These groups cover operational metadata only. This screen is a reference preview with synthetic counts and rows; the current release does not persist or apply safe-update batches.</p></div>
    {notice && <p role="status" className="rounded-lg border border-[#d2e2ec] bg-[#f0f6fa] px-4 py-3 text-xs leading-relaxed text-[#42637b]">{notice}</p>}

    <div className="grid gap-4 lg:grid-cols-2">{groups.map((group) => {
      const isExpanded = expanded.includes(group.id);
      return <section key={group.id} className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5" aria-labelledby={`${group.id}-heading`}>
        <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf4fb] text-[#3973a8]"><ShieldCheck aria-hidden className="h-4 w-4" /></span><div><h2 id={`${group.id}-heading`} className="text-base font-bold text-[#263d32]"><span className="mr-2">{group.count}</span>{group.title}</h2><p className="mt-1 text-xs leading-relaxed text-[#687970]">{group.description}</p></div></div><span className="shrink-0 rounded-full border border-[#d2e2ec] bg-[#edf4fb] px-2.5 py-1 text-[10px] font-bold text-[#3973a8]">Safe metadata · sample</span></div>
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" aria-expanded={isExpanded} onClick={() => toggleExpanded(group.id)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">{isExpanded ? "Hide details" : "View details"}<ArrowUpRight aria-hidden className="h-3 w-3" /></button><button type="button" onClick={() => showPreview(group)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Preview apply<CheckCircle2 aria-hidden className="h-3 w-3" /></button></div>
        {isExpanded && <div className="mt-4 rounded-lg border border-[#e2e9e5] bg-[#f8faf9] p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#687970]">Example records · illustrative only</p><ul className="mt-2 divide-y divide-[#e5ebe8]">{group.details.map((detail) => <li key={detail} className="py-2 text-xs leading-relaxed text-[#344b41]">{detail}</li>)}</ul><p className="mt-2 text-[10px] text-[#687970]">{group.count} sample items in this group; examples shown here are not live records.</p></div>}
      </section>;
    })}</div>

    <p className="flex items-start gap-2 rounded-lg border border-[#ead8a9] bg-[#fff8e7] px-4 py-3 text-xs leading-relaxed text-[#71551d]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>Excluded from bulk safe updates:</strong> deadlines, fees, eligibility, and course availability. High-impact content changes still require individual review against evidence.</span></p>
    <p className="flex items-start gap-2 rounded-lg border border-[#dce8e1] bg-[#f7faf8] px-4 py-3 text-xs leading-relaxed text-[#53665e]"><ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />A link becoming reachable or a source status changing does not verify or approve the information on that page.</p>
  </div>;
}
