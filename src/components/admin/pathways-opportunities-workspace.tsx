"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive, ChevronLeft, ChevronRight, ExternalLink, FileUp, Info, Plus, Search, ShieldAlert, X } from "lucide-react";
import type { Course, Exam, Field, InstitutionCourse, Opportunity, Pathway } from "@/services/catalog";

type Tab = "pathways" | "opportunities";
type ReviewState = "Verified" | "Needs verification" | "Source unavailable";
const PAGE_SIZE = 8;
const pretty = (value: string | null | undefined) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Not recorded";
const dateLabel = (value: Date | null | undefined) => value ? new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(value) : "Not checked";
const accepted = new Set(["verified", "current", "recently_verified", "published_verified", "approved"]);
function opportunityState(item: Opportunity): ReviewState {
  if (!item.url && !item.sourceUrl) return "Source unavailable";
  if (accepted.has(item.verificationStatus)) return "Verified";
  return "Needs verification";
}
function badgeClass(state: ReviewState) {
  if (state === "Verified") return "border-[#c8e2d3] bg-[#e9f5ee] text-[#17634b]";
  if (state === "Source unavailable") return "border-[#efc9c4] bg-[#fff0ef] text-[#a33e3e]";
  return "border-[#efdfbd] bg-[#fff5df] text-[#94610c]";
}
function StageLabel({ stage }: { stage: string }) { return <>{stage === "class10" ? "After Class 10" : stage === "class12" ? "After Class 12" : pretty(stage)}</>; }

export function PathwaysOpportunitiesWorkspace({ pathways, opportunities, courses, institutionLinks, fields, exams, initialTab = "pathways" }: {
  pathways: Pathway[];
  opportunities: Opportunity[];
  courses: Course[];
  institutionLinks: InstitutionCourse[];
  fields: Field[];
  exams: Exam[];
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [field, setField] = useState("");
  const [verification, setVerification] = useState("");
  const [checked, setChecked] = useState("");
  const [page, setPage] = useState(0);
  const [selectedPathSlug, setSelectedPathSlug] = useState(() => pathways.find((item) => item.fieldSlug === "technology")?.slug ?? pathways[0]?.slug ?? "");
  const [selectedOpportunitySlug, setSelectedOpportunitySlug] = useState(opportunities[0]?.slug ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const courseBySlug = useMemo(() => new Map(courses.map((item) => [item.slug, item])), [courses]);
  const examBySlug = useMemo(() => new Map(exams.map((item) => [item.slug, item])), [exams]);
  const fieldBySlug = useMemo(() => new Map(fields.map((item) => [item.slug, item.name])), [fields]);
  const filteredPathways = useMemo(() => pathways.filter((item) => {
    const matchesQuery = !query || `${item.title} ${item.description} ${item.fieldSlug ?? ""} ${item.routeType}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!stage || item.entryStage === stage) && (!field || item.fieldSlug === field) && (!verification || verification === "Needs verification") && (!checked || checked === "not-checked");
  }), [pathways, query, stage, field, verification, checked]);
  const filteredOpportunities = useMemo(() => opportunities.filter((item) => {
    const state = opportunityState(item);
    const matchesQuery = !query || `${item.title} ${item.type} ${item.provider ?? ""} ${item.fieldSlugs?.join(" ") ?? ""} ${item.costNote ?? ""}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!field || (item.fieldSlugs ?? []).includes(field)) && (!verification || state === verification) && (!checked || (checked === "checked" ? Boolean(item.lastVerifiedAt) : !item.lastVerifiedAt));
  }), [opportunities, query, field, verification, checked]);

  const currentRows = tab === "pathways" ? filteredPathways : filteredOpportunities;
  const pageCount = Math.max(1, Math.ceil(currentRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visiblePathways = filteredPathways.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const visibleOpportunities = filteredOpportunities.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const selectedPath = pathways.find((item) => item.slug === selectedPathSlug) ?? pathways[0] ?? null;
  const selectedOpportunity = opportunities.find((item) => item.slug === selectedOpportunitySlug) ?? opportunities[0] ?? null;
  const selectedOpportunitySource = selectedOpportunity?.sourceUrl || selectedOpportunity?.url;
  const fieldOptions = fields.filter((item) => tab === "pathways" ? pathways.some((row) => row.fieldSlug === item.slug) : opportunities.some((row) => row.fieldSlugs?.includes(item.slug)));
  const pathwayCourseSlugs = selectedPath?.courseSlugs ?? [];
  const pathwayCourses = pathwayCourseSlugs.map((slug) => courseBySlug.get(slug)).filter((item): item is Course => Boolean(item));
  const relatedInstitutionCount = selectedPath ? new Set(institutionLinks.filter((item) => pathwayCourseSlugs.includes(item.courseSlug)).map((item) => item.institutionCode)).size : 0;

  function showDemoAction(action: string) {
    setPreviewOpen(false);
    setNotice(`${action} is not connected to catalogue persistence yet. No record was changed.`);
  }
  function changeTab(nextTab: Tab) {
    setTab(nextTab); setQuery(""); setStage(""); setField(""); setVerification(""); setChecked(""); setPage(0); setPreviewOpen(false);
  }
  function updateFilter(update: () => void) { update(); setPage(0); }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#687970]"><Link href="/admin/catalogue" className="hover:text-[#145c42]">Catalogue</Link><span aria-hidden>/</span><span className="font-semibold text-[#263d32]">Pathways and opportunities</span></div>
    <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[#dce5e0] pb-5">
      <div><h1 className="text-4xl font-bold tracking-[-.04em] text-[#142e27]">Pathways and opportunities</h1><p className="mt-2 max-w-3xl text-base leading-relaxed text-[#53665e]">Maintain the routes, learning options, projects, and early experiences students can explore.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/imports?dataset=pathways" title="Start a browser-local workbook preview for pathways" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742]"><Plus className="h-4 w-4" />Add pathway</Link><Link href="/admin/imports?dataset=opportunities" title="Start a browser-local workbook preview for opportunities" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><Plus className="h-4 w-4" />Add opportunity</Link><Link href="/admin/imports" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><FileUp className="h-4 w-4" />Import workbook</Link></div>
    </header>

    {notice && <div role="status" className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-4 py-3 text-sm text-[#426652]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />{notice}<button onClick={() => setNotice("")} className="ml-auto text-[#426652]" aria-label="Dismiss message">×</button></div>}

    <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-label="Catalogue tabs and search">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Catalogue type" className="flex gap-1 rounded-lg bg-[#f1f5f3] p-1">
          <button role="tab" aria-selected={tab === "pathways"} onClick={() => changeTab("pathways")} className={`min-h-10 rounded-md px-4 text-sm font-bold ${tab === "pathways" ? "bg-[#dff0e7] text-[#145c42]" : "text-[#53665e] hover:bg-white"}`}>Pathways <span className="ml-1 text-xs font-medium">{pathways.length}</span></button>
          <button role="tab" aria-selected={tab === "opportunities"} onClick={() => changeTab("opportunities")} className={`min-h-10 rounded-md px-4 text-sm font-bold ${tab === "opportunities" ? "bg-[#dff0e7] text-[#145c42]" : "text-[#53665e] hover:bg-white"}`}>Opportunities <span className="ml-1 text-xs font-medium">{opportunities.length}</span></button>
        </div>
        <label className="relative ml-auto min-w-[240px] flex-1 sm:max-w-md"><span className="sr-only">Search {tab}</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]" /><input value={query} onChange={(event) => updateFilter(() => setQuery(event.target.value))} placeholder={`Search ${tab}…`} className="min-h-11 w-full rounded-lg border border-[#d7e1dc] pl-10 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
      </div>
    </section>

    <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-label={`${tab} catalogue`}>
      <div className="border-b border-[#e2e9e5] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#263d32]">{tab === "pathways" ? "Pathways" : "Opportunities"}</h2><p className="mt-1 text-sm text-[#687970]">{tab === "pathways" ? "CareerBridge-organized content · not an official classification" : "Review source and freshness before publication."}</p></div><p className="text-sm font-medium text-[#53665e]">{currentRows.length} {tab === "pathways" ? "pathways" : "opportunities"}</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tab === "pathways" && <label className="text-sm font-semibold text-[#53665e]">Entry stage<select aria-label="Filter by entry stage" value={stage} onChange={(event) => updateFilter(() => setStage(event.target.value))} className="mt-1.5 min-h-10 w-full rounded-lg border border-[#d7e1dc] bg-white px-3 text-sm text-[#344b41]"><option value="">All entry stages</option><option value="class10">After Class 10</option><option value="class12">After Class 12</option></select></label>}
          <label className="text-sm font-semibold text-[#53665e]">Field<select aria-label="Filter by field" value={field} onChange={(event) => updateFilter(() => setField(event.target.value))} className="mt-1.5 min-h-10 w-full rounded-lg border border-[#d7e1dc] bg-white px-3 text-sm text-[#344b41]"><option value="">All fields</option>{fieldOptions.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-[#53665e]">Status<select aria-label="Filter by verification" value={verification} onChange={(event) => updateFilter(() => setVerification(event.target.value))} className="mt-1.5 min-h-10 w-full rounded-lg border border-[#d7e1dc] bg-white px-3 text-sm text-[#344b41]"><option value="">All statuses</option><option>Needs verification</option><option>Source unavailable</option><option>Verified</option></select></label>
          <label className="text-sm font-semibold text-[#53665e]">Last checked<select aria-label="Filter by last checked" value={checked} onChange={(event) => updateFilter(() => setChecked(event.target.value))} className="mt-1.5 min-h-10 w-full rounded-lg border border-[#d7e1dc] bg-white px-3 text-sm text-[#344b41]"><option value="">Any check date</option><option value="checked">Checked</option><option value="not-checked">Not checked</option></select></label>
        </div>
      </div>

      {tab === "pathways" ? <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="sticky top-0 bg-[#f4f7f5] text-xs font-bold text-[#53665e]"><tr>{["Pathway", "Entry stage", "Related courses", "Institutions", "Source status", "Last checked", "Verification", "Action"].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#e6ece8]">{visiblePathways.map((item) => { const linkedInstitutions = new Set(institutionLinks.filter((link) => (item.courseSlugs ?? []).includes(link.courseSlug)).map((link) => link.institutionCode)).size; return <tr key={item.slug} className="hover:bg-[#fbfcfb]"><td className="min-w-[310px] px-4 py-4"><p className="font-semibold leading-snug text-[#344b41]">{item.title}</p><p className="mt-1 text-xs text-[#687970]">{fieldBySlug.get(item.fieldSlug ?? "") ?? pretty(item.fieldSlug)}</p></td><td className="whitespace-nowrap px-4 py-4 text-[#53665e]"><StageLabel stage={item.entryStage} /></td><td className="whitespace-nowrap px-4 py-4 text-[#53665e]">{item.courseSlugs?.length ?? 0} courses</td><td className="whitespace-nowrap px-4 py-4 text-[#53665e]">{linkedInstitutions} institutions</td><td className="max-w-[230px] px-4 py-4 leading-relaxed text-[#53665e]">CareerBridge-organized content</td><td className="whitespace-nowrap px-4 py-4 text-[#687970]">Not checked</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-bold ${badgeClass("Needs verification")}`}>Needs verification</span></td><td className="px-4 py-4"><button type="button" onClick={() => { setSelectedPathSlug(item.slug); setPreviewOpen(true); }} className="min-h-9 rounded-md border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f1f6f3]">Preview</button></td></tr>; })}{visiblePathways.length === 0 && <tr><td colSpan={8} className="px-4 py-14 text-center text-sm text-[#687970]">No pathways match these filters.</td></tr>}</tbody></table></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#f4f7f5] text-xs font-bold text-[#53665e]"><tr>{["Opportunity", "Type", "Provider", "Related fields", "Cost note", "Source", "Last checked", "Verification", "Action"].map((label) => <th key={label} className="whitespace-nowrap px-4 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#e6ece8]">{visibleOpportunities.map((item) => { const state = opportunityState(item); const source = item.sourceUrl || item.url; return <tr key={item.slug} className="hover:bg-[#fbfcfb]"><td className="min-w-[250px] px-4 py-4"><p className="font-semibold leading-snug text-[#344b41]">{item.title}</p><p className="mt-1 text-xs text-[#687970]">{pretty(item.type)}</p></td><td className="whitespace-nowrap px-4 py-4 text-[#53665e]">{pretty(item.type)}</td><td className="max-w-[190px] px-4 py-4 text-[#53665e]">{item.provider ?? "Provider not confirmed"}</td><td className="max-w-[210px] px-4 py-4 text-[#53665e]">{(item.fieldSlugs ?? []).map((slug) => fieldBySlug.get(slug) ?? pretty(slug)).join(", ") || "Not recorded"}</td><td className="max-w-[180px] px-4 py-4 text-[#53665e]">{item.costNote ?? "Not confirmed"}</td><td className="px-4 py-4">{source && /^https?:\/\//i.test(source) ? <a href={source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[#17634b] underline">Open source<ExternalLink className="h-4 w-4" /></a> : <span className="text-[#a33e3e]">Source unavailable</span>}</td><td className="whitespace-nowrap px-4 py-4 text-[#687970]">{dateLabel(item.lastVerifiedAt)}</td><td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-bold ${badgeClass(state)}`}>{state}</span></td><td className="px-4 py-4"><button type="button" onClick={() => { setSelectedOpportunitySlug(item.slug); setPreviewOpen(true); }} className="min-h-9 rounded-md border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f1f6f3]">Preview</button></td></tr>; })}{visibleOpportunities.length === 0 && <tr><td colSpan={9} className="px-4 py-14 text-center text-sm text-[#687970]">No opportunities match these filters.</td></tr>}</tbody></table></div>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e9e5] px-4 py-3"><p className="text-sm text-[#53665e]">Showing {currentRows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, currentRows.length)} of {currentRows.length}</p><div className="flex items-center gap-2"><button type="button" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button><span className="px-1 text-xs font-medium text-[#53665e]">Page {currentPage + 1} of {pageCount}</span><button type="button" onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))} disabled={currentPage >= pageCount - 1} className="inline-flex min-h-9 items-center gap-1 rounded-md border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button></div></div>
    </section>

    <p className="flex items-start gap-2 rounded-lg border border-[#efdfbd] bg-[#fff8e8] px-4 py-3 text-sm leading-relaxed text-[#71551d]"><ShieldAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Pathways organize exploration. They do not guarantee a career outcome or rank students. Catalogue edit and archive actions are preview controls only; imports currently create a browser-local preview, not a live catalogue update.</p>

    {previewOpen && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-[#10251d]/45 p-4" onClick={() => setPreviewOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="record-preview-title" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-2xl sm:p-7" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4 border-b border-[#e2e9e5] pb-4"><div><p className="text-xs font-bold uppercase tracking-wide text-[#687970]">{tab === "pathways" ? "Pathway preview" : "Opportunity preview"}</p><h2 id="record-preview-title" className="mt-1 text-2xl font-bold text-[#263d32]">{tab === "pathways" ? selectedPath?.title : selectedOpportunity?.title}</h2></div><button type="button" onClick={() => setPreviewOpen(false)} aria-label="Close preview" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#cbd8d2] text-[#344e47]"><X className="h-5 w-5" /></button></div>
      {tab === "pathways" && selectedPath ? <div className="mt-5 space-y-5"><div><p className="text-xs font-bold uppercase tracking-wide text-[#687970]">CareerBridge-organized content · not an official classification</p><p className="mt-2 text-sm leading-relaxed text-[#53665e]">{selectedPath.description}</p></div><div className="grid gap-4 rounded-lg bg-[#f5f8f6] p-4 sm:grid-cols-2"><div><p className="text-xs text-[#687970]">Entry stage</p><p className="mt-1 font-semibold text-[#344b41]"><StageLabel stage={selectedPath.entryStage} /></p></div><div><p className="text-xs text-[#687970]">Related courses / institutions</p><p className="mt-1 font-semibold text-[#344b41]">{pathwayCourses.length} courses · {relatedInstitutionCount} institutions</p></div><div><p className="text-xs text-[#687970]">Related entrance exams</p><p className="mt-1 font-semibold text-[#344b41]">{(selectedPath.examSlugs ?? []).map((slug) => examBySlug.get(slug)?.shortName ?? examBySlug.get(slug)?.name ?? pretty(slug)).join(", ") || "Links need review"}</p></div><div><p className="text-xs text-[#687970]">Sources</p><p className="mt-1 font-semibold text-[#344b41]">CareerBridge-organized content</p></div></div><div><h3 className="font-bold text-[#344b41]">Route steps</h3><ol className="mt-3 space-y-3">{(selectedPath.steps ?? []).map((step, index) => <li key={`${step.label}-${index}`} className="flex gap-3 text-sm"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e9f5ee] text-xs font-bold text-[#17634b]">{index + 1}</span><span><strong className="text-[#344b41]">{step.label}</strong><span className="mt-0.5 block leading-relaxed text-[#687970]">{step.detail}</span></span></li>)}</ol></div><p className="text-xs text-[#85928b]">Last reviewed: Not recorded</p><div className="flex flex-wrap gap-2 border-t border-[#edf1ef] pt-4"><button type="button" onClick={() => showDemoAction("Edit pathway")} className="min-h-10 rounded-md border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Edit pathway</button><button type="button" onClick={() => showDemoAction("Add course link")} className="min-h-10 rounded-md border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Add course link</button><button type="button" onClick={() => showDemoAction("Add source")} className="min-h-10 rounded-md border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Add source</button><button type="button" onClick={() => showDemoAction("Archive pathway")} className="inline-flex min-h-10 items-center rounded-md border border-[#e4b9b5] px-3 text-sm font-semibold text-[#a33e3e]"><Archive className="mr-1.5 h-4 w-4" />Archive pathway</button></div></div> : tab === "opportunities" && selectedOpportunity ? <div className="mt-5 space-y-4"><p className="text-sm leading-relaxed text-[#53665e]">{selectedOpportunity.description ?? "Description not recorded."}</p><dl className="divide-y divide-[#edf1ef] border-y border-[#edf1ef] text-sm">{[["Type", pretty(selectedOpportunity.type)], ["Provider", selectedOpportunity.provider ?? "Provider not confirmed"], ["Related fields", (selectedOpportunity.fieldSlugs ?? []).map((slug) => fieldBySlug.get(slug) ?? pretty(slug)).join(", ") || "Not recorded"], ["Cost note", selectedOpportunity.costNote ?? "Not currently confirmed"], ["Last checked", dateLabel(selectedOpportunity.lastVerifiedAt)], ["Verification", opportunityState(selectedOpportunity)]].map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] gap-3 py-3"><dt className="text-[#687970]">{label}</dt><dd className="font-medium text-[#344b41]">{value}</dd></div>)}</dl><div><p className="text-xs font-semibold text-[#687970]">Source</p>{selectedOpportunitySource && /^https?:\/\//i.test(selectedOpportunitySource) ? <a href={selectedOpportunitySource} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-semibold text-[#17634b] underline">Open source<ExternalLink className="h-4 w-4" /></a> : <p className="mt-1 text-sm text-[#a33e3e]">Source unavailable</p>}</div><div className="flex flex-wrap gap-2 border-t border-[#edf1ef] pt-4"><button type="button" onClick={() => showDemoAction("Edit opportunity")} className="min-h-10 rounded-md border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Edit opportunity</button><button type="button" onClick={() => showDemoAction("Add source")} className="min-h-10 rounded-md border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]">Add source</button></div></div> : null}
    </section></div>}
  </div>;
}
