"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, AlertTriangle, ArrowDownUp, BarChart3, CheckCircle2, Clock3, ExternalLink, FileText, Info, Link2, LoaderCircle, Plus, Search, ShieldCheck, X } from "lucide-react";

export type SourceItem = {
  id: string;
  sourceKey: string;
  title: string;
  sourceType: string;
  organisations: string[];
  url: string;
  status: "healthy" | "needs_review" | "unavailable";
  lastCheckedAt: string | null;
  lastCheckType: "Fetched" | "Verified" | null;
  refreshEnabled: boolean;
  refreshFrequency: string | null;
  recordNames: string[];
  institutionCodes: string[];
};
type InstitutionOption = { code: string; name: string };
type Props = { sources: SourceItem[]; institutions: InstitutionOption[]; now: string };
type SourceType = "official_api" | "official_site" | "govt_portal" | "official_pdf" | "secondary";
const sourceTypes: { value: SourceType; label: string }[] = [
  { value: "official_site", label: "Official site" },
  { value: "govt_portal", label: "Government portal" },
  { value: "official_api", label: "Official API" },
  { value: "official_pdf", label: "Official PDF / prospectus" },
  { value: "secondary", label: "Secondary reference" },
];
const typeLabel = (value: string) => sourceTypes.find((type) => type.value === value)?.label ?? (value === "official_authority" ? "Official authority" : value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()));
const statusLabel = (value: SourceItem["status"]) => value === "healthy" ? "Healthy" : value === "unavailable" ? "Unavailable" : "Needs review";
const statusStyles = (value: SourceItem["status"]) => value === "healthy" ? "border-[#c6e4d3] bg-[#e8f5ee] text-[#17634b]" : value === "unavailable" ? "border-[#f0c9c5] bg-[#fff0ee] text-[#a23e38]" : "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";
function formatDate(value: string | null, kind: string | null = null, now = 0) {
  if (!value) return "No check recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No check recorded";
  const days = Math.floor((now - date.getTime()) / 86_400_000);
  const when = days <= 0 ? `Today, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : days === 1 ? "Yesterday" : days < 7 ? `${days} days ago` : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return kind ? `${when} · ${kind.toLowerCase()}` : when;
}
function safeUrl(value: string) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.toString() : null; }
  catch { return null; }
}

export function SourcesWorkspace({ sources, institutions, now }: Props) {
  const router = useRouter();
  const nowTime = new Date(now).getTime();
  const [selectedId, setSelectedId] = useState(sources[0]?.id ?? "");
  const [sourceType, setSourceType] = useState("all");
  const [organisation, setOrganisation] = useState("all");
  const [status, setStatus] = useState("all");
  const [lastFetched, setLastFetched] = useState("any");
  const [frequency, setFrequency] = useState("all");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState("");
  const [institutionCode, setInstitutionCode] = useState(institutions[0]?.code ?? "");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<SourceType>("official_site");
  const [draftUrl, setDraftUrl] = useState("");

  const organisations = useMemo(() => [...new Set(sources.flatMap((source) => source.organisations))].sort((a, b) => a.localeCompare(b)), [sources]);
  const counts = useMemo(() => ({
    active: sources.filter((source) => source.status === "healthy").length,
    review: sources.filter((source) => source.status === "needs_review").length,
    unavailable: sources.filter((source) => source.status === "unavailable").length,
    week: sources.filter((source) => source.lastCheckedAt && nowTime - new Date(source.lastCheckedAt).getTime() <= 7 * 86_400_000).length,
  }), [sources, nowTime]);
  const filtered = useMemo(() => sources.filter((source) => {
    if (sourceType !== "all" && source.sourceType !== sourceType) return false;
    if (organisation !== "all" && !source.organisations.includes(organisation)) return false;
    if (status !== "all" && source.status !== status) return false;
    if (frequency === "configured" && (!source.refreshEnabled || !source.refreshFrequency)) return false;
    if (frequency === "not_configured" && source.refreshEnabled && source.refreshFrequency) return false;
    if (lastFetched === "none" && source.lastCheckedAt) return false;
    if (lastFetched === "7d" && (!source.lastCheckedAt || nowTime - new Date(source.lastCheckedAt).getTime() > 7 * 86_400_000)) return false;
    if (lastFetched === "30d" && (!source.lastCheckedAt || nowTime - new Date(source.lastCheckedAt).getTime() > 30 * 86_400_000)) return false;
    const query = search.trim().toLowerCase();
    if (query && !`${source.title} ${source.sourceType} ${source.organisations.join(" ")} ${source.recordNames.join(" ")} ${source.url}`.toLowerCase().includes(query)) return false;
    return true;
  }), [sources, sourceType, organisation, status, frequency, lastFetched, search, nowTime]);
  const selected = filtered.find((source) => source.id === selectedId) ?? filtered[0] ?? null;

  function openCheck(source: SourceItem) {
    const href = safeUrl(source.url);
    if (href) window.open(href, "_blank", "noopener,noreferrer");
    setNotice("Opened the source in a new tab. This workspace does not run an automated fetch, so the recorded status and timestamp have not changed.");
  }

  async function addSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError("");
    const url = safeUrl(draftUrl.trim());
    if (!institutionCode || draftTitle.trim().length < 2 || !url) { setAddError("Choose an institution, provide a source name, and enter a valid HTTP or HTTPS URL."); return; }
    setAddBusy(true);
    try {
      const response = await fetch(`/api/admin/institutions/${encodeURIComponent(institutionCode)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_source", title: draftTitle.trim(), sourceType: draftType, url }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not save the source.");
      setShowAdd(false); setDraftTitle(""); setDraftUrl("");
      setNotice("Source added as unverified and an audit event was recorded. No fetch was performed.");
      router.refresh();
    } catch (error) { setAddError(error instanceof Error ? error.message : "Could not save the source."); }
    finally { setAddBusy(false); }
  }

  const statCards = [
    { label: "healthy sources", value: counts.active, icon: Link2, tint: "bg-[#e8f5ee] text-[#17634b]" },
    { label: "need review", value: counts.review, icon: AlertTriangle, tint: "bg-[#fff6df] text-[#9a6b13]" },
    { label: "unavailable", value: counts.unavailable, icon: X, tint: "bg-[#fff0ee] text-[#a23e38]" },
    { label: "checked this week", value: counts.week, icon: BarChart3, tint: "bg-[#f0f4f8] text-[#526a7b]" },
  ];

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Admin / Sources</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Keep evidence connected.</h1><p className="mt-2 text-sm leading-relaxed text-[#596a63]">Manage official sources, freshness, and the records that rely on them.</p></div>
      <div className="flex flex-wrap items-center gap-2"><label className="relative hidden md:block"><span className="sr-only">Search sources and records</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78877f]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sources or records…" className="h-11 w-64 rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label><button onClick={() => { setAddError(""); setShowAdd(true); }} disabled={!institutions.length} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#095640] disabled:opacity-50"><Plus className="h-4 w-4" />Add source</button></div>
    </header>

    {notice && <div role="status" className="flex items-start gap-2 rounded-lg border border-[#c8ded3] bg-[#eef7f2] px-4 py-3 text-sm text-[#245844]"><Info className="mt-0.5 h-4 w-4 shrink-0" />{notice}<button onClick={() => setNotice("")} className="ml-auto" aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Source health summary">{statCards.map(({ label, value, icon: Icon, tint }) => <article key={label} className="flex items-center gap-3 rounded-xl border border-[#dce5e0] bg-white p-4 shadow-sm"><span className={`grid h-11 w-11 place-items-center rounded-full ${tint}`}><Icon className="h-5 w-5" /></span><div><strong className="block text-2xl font-bold leading-none text-[#172b35]">{value}</strong><span className="mt-1 block text-sm text-[#596a63]">{label}</span></div></article>)}</section>

    <section className="rounded-xl border border-[#d4dfda] bg-white p-4 shadow-sm sm:p-5" aria-label="Filter sources"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <label className="text-xs font-semibold text-[#596a63]">Source type<select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c]"><option value="all">All types</option>{[...new Set(sources.map((source) => source.sourceType))].sort().map((value) => <option value={value} key={value}>{typeLabel(value)}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#596a63]">Organisation<select value={organisation} onChange={(event) => setOrganisation(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c]"><option value="all">All organisations</option>{organisations.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#596a63]">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c]"><option value="all">All statuses</option><option value="healthy">Healthy</option><option value="needs_review">Needs review</option><option value="unavailable">Unavailable</option></select></label>
      <label className="text-xs font-semibold text-[#596a63]">Last fetched / checked<select value={lastFetched} onChange={(event) => setLastFetched(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c]"><option value="any">Any time</option><option value="7d">Past 7 days</option><option value="30d">Past 30 days</option><option value="none">No check recorded</option></select></label>
      <label className="text-xs font-semibold text-[#596a63]">Refresh frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c]"><option value="all">All frequencies</option><option value="configured">Configured</option><option value="not_configured">Not configured</option></select></label>
    </div><div className="mt-3 flex items-center justify-between text-xs text-[#687970]"><span>{filtered.length} source{filtered.length === 1 ? "" : "s"} shown</span>{(sourceType !== "all" || organisation !== "all" || status !== "all" || lastFetched !== "any" || frequency !== "all" || search) && <button onClick={() => { setSourceType("all"); setOrganisation("all"); setStatus("all"); setLastFetched("any"); setFrequency("all"); setSearch(""); }} className="font-semibold text-[#17634b] underline">Clear filters</button>}</div></section>

    <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Sources list"><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-[#f3f6f5] text-xs font-bold text-[#596a63]"><tr><th className="px-4 py-3"><span className="inline-flex items-center gap-1">Source <ArrowDownUp className="h-3 w-3" /></span></th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Records using it</th><th className="px-4 py-3">Last fetched / checked</th><th className="px-4 py-3">Refresh</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">
      {filtered.map((source) => <tr key={source.id} onClick={() => setSelectedId(source.id)} className={`cursor-pointer transition hover:bg-[#f8fbf9] ${selected?.id === source.id ? "bg-[#f0f7f3]" : ""}`}><td className="max-w-[280px] px-4 py-3"><div className="flex items-center gap-3"><FileText className="h-4 w-4 shrink-0 text-[#6a7a72]" /><div className="min-w-0"><p className="truncate font-semibold text-[#263b33]">{source.title}</p><p className="truncate text-xs text-[#718078]">{source.organisations[0] ?? "Organisation not recorded"}</p></div></div></td><td className="px-4 py-3 text-[#596a63]">{typeLabel(source.sourceType)}</td><td className="px-4 py-3"><button onClick={(event) => { event.stopPropagation(); setSelectedId(source.id); }} className="font-semibold text-[#286d54] underline decoration-[#b3d3c2]">{source.recordNames.length} {source.recordNames.length === 1 ? "record" : "records"}</button></td><td className="px-4 py-3 text-[#596a63]">{formatDate(source.lastCheckedAt, source.lastCheckType, nowTime)}</td><td className="px-4 py-3 text-[#687970]">{source.refreshFrequency ?? "Not scheduled"}</td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles(source.status)}`}>{source.status === "healthy" ? <CheckCircle2 className="h-3.5 w-3.5" /> : source.status === "unavailable" ? <X className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}{statusLabel(source.status)}</span></td><td className="px-4 py-3 text-right"><button onClick={(event) => { event.stopPropagation(); setSelectedId(source.id); openCheck(source); }} className="min-h-9 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-white">Open source</button></td></tr>)}
      {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-14 text-center"><Search className="mx-auto h-7 w-7 text-[#9aa8a1]" /><p className="mt-3 font-semibold text-[#344e47]">No sources match these filters</p><p className="mt-1 text-sm text-[#718078]">Try clearing filters or add a source to the catalogue.</p></td></tr>}
    </tbody></table></div></section>

    {selected && <div className="flex justify-end"><Link href={`/admin/sources/settings?sourceKey=${encodeURIComponent(selected.sourceKey)}`} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><Clock3 className="h-4 w-4" />Manage refresh settings</Link></div>}
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)]">
      <section className="rounded-xl border border-[#d4dfda] bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-[#172b35]">{selected?.title ?? "Select a source"}</h2>{selected && <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles(selected.status)}`}>{statusLabel(selected.status)}</span>}</div>{selected && <p className="mt-1 text-sm text-[#596a63]">{typeLabel(selected.sourceType)}</p>}</div>{selected && <div className="flex items-center gap-2"><button onClick={() => openCheck(selected)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344e47]"><ExternalLink className="h-4 w-4" />Open source</button><button onClick={() => setShowAdd(true)} aria-label="Add another source" className="grid h-10 w-10 place-items-center rounded-lg border border-[#cbd8d2]"><Plus className="h-4 w-4" /></button></div>}</div>
        {selected ? <><dl className="mt-4 grid gap-x-5 gap-y-3 border-t border-[#edf1ef] pt-4 text-sm sm:grid-cols-[140px_1fr]"><dt className="text-[#687970]">Organisation</dt><dd className="text-[#263b33]">{selected.organisations.join(", ") || "Not recorded"}</dd><dt className="text-[#687970]">Source URL</dt><dd><a href={safeUrl(selected.url) ?? undefined} target="_blank" rel="noopener noreferrer" className="inline-flex break-all text-[#286d54] underline">{selected.url}<ExternalLink className="ml-1 mt-0.5 h-3.5 w-3.5 shrink-0" /></a></dd><dt className="text-[#687970]">Records using it</dt><dd className="text-[#263b33]">{selected.recordNames.join(" · ")}</dd><dt className="text-[#687970]">Refresh frequency</dt><dd className="text-[#263b33]">{selected.refreshFrequency ?? "Not configured in the current source model"}</dd><dt className="text-[#687970]">Last fetched / checked</dt><dd className="text-[#263b33]">{formatDate(selected.lastCheckedAt, selected.lastCheckType, nowTime)}</dd><dt className="text-[#687970]">Health status</dt><dd className="text-[#263b33]">{statusLabel(selected.status)}</dd></dl><p className="mt-4 rounded-lg bg-[#f5f8f6] p-3 text-xs leading-relaxed text-[#596a63]">Opening a source lets an administrator inspect it manually. The app does not currently fetch or crawl websites, so this action will not update source status or freshness.</p></> : <p className="mt-3 text-sm text-[#687970]">Choose a source in the table to see its details.</p>}
      </section>
      <aside className="rounded-xl border border-[#d4e3da] bg-[#f3f8f5] p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#17634b]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-bold text-[#172b35]">Source policy</h2><p className="mt-1 text-sm leading-relaxed text-[#596a63]">Fetched data is evidence. Material changes should reach the review queue before publication.</p></div></div><div className="mt-4 border-t border-[#d8e5dd] pt-4"><h3 className="text-sm font-bold text-[#344e47]">What this means</h3><ul className="mt-2 space-y-2 text-sm text-[#596a63]"><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16805e]" />Source entries are linked to the catalogue record they support.</li><li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16805e]" />Newly added sources are saved as unverified, with an audit event.</li><li className="flex gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-[#53665d]" />Refresh preferences can be saved, but automated checks are not running yet.</li></ul></div></aside>
    </div>

    {showAdd && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-[#10251d]/45 p-4" onClick={() => !addBusy && setShowAdd(false)}><section role="dialog" aria-modal="true" aria-labelledby="add-source-title" className="w-full max-w-xl rounded-xl bg-white p-5 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#687970]">Source registry</p><h2 id="add-source-title" className="mt-1 text-xl font-bold text-[#172b35]">Add a source</h2><p className="mt-1 text-sm text-[#596a63]">Attach evidence to an institution. It will be saved as unverified; no fetch is performed.</p></div><button onClick={() => setShowAdd(false)} disabled={addBusy} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d4dfda]"><X className="h-4 w-4" /></button></div><form onSubmit={addSource} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-[#344e47]">Institution<select required value={institutionCode} onChange={(event) => setInstitutionCode(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="" disabled>Select an institution</option>{institutions.map((institution) => <option key={institution.code} value={institution.code}>{institution.name}</option>)}</select></label><label className="block text-sm font-semibold text-[#344e47]">Source name<input required minLength={2} maxLength={200} value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder="e.g. Official admissions page" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-normal" /></label><label className="block text-sm font-semibold text-[#344e47]">Source type<select value={draftType} onChange={(event) => setDraftType(event.target.value as SourceType)} className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal">{sourceTypes.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label className="block text-sm font-semibold text-[#344e47]">Source URL<input required type="url" value={draftUrl} onChange={(event) => setDraftUrl(event.target.value)} placeholder="https://example.edu/admissions" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-normal" /></label>{addError && <p role="alert" className="rounded-lg bg-[#fff0ee] px-3 py-2 text-sm text-[#a23e38]">{addError}</p>}<div className="flex justify-end gap-2 border-t border-[#edf1ef] pt-4"><button type="button" disabled={addBusy} onClick={() => setShowAdd(false)} className="min-h-10 rounded-lg border border-[#cbd8d2] px-4 text-sm font-semibold text-[#344e47]">Cancel</button><button type="submit" disabled={addBusy || !institutions.length} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white disabled:opacity-60">{addBusy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Add source</button></div></form></section></div>}
  </div>;
}
