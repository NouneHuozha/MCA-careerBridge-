import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { MobileCatalogueFilters } from "@/components/admin/mobile-catalogue-filters";
import { getAdminSourceRegistry } from "@/services/admin-sources";
import { getInstitutions, searchEverything } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalogue search · CareerBridge" };

type Props = { searchParams: Promise<{ q?: string; type?: string; district?: string; status?: string }> };
const recordTypes = [
  ["all", "All record types"], ["institution", "Institution records"], ["course", "Course"],
  ["scholarship", "Scholarship"], ["exam", "Entrance exam"], ["opportunity", "Opportunity"],
  ["pathway", "Pathway"], ["career", "Career"], ["field", "Career field"], ["source", "Source"],
] as const;
const districts = ["all", "Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto", "Phek", "Tuensang", "Mon", "Longleng", "Kiphire", "Peren", "Noklak", "Tseminyu", "Chumoukedima", "Niuland", "Shamator"];
const statuses = [["any", "Any"], ["verified", "Verified"], ["needs_verification", "Needs verification"], ["not_available", "Not available"]] as const;
const recordTypeLabel = (value: string) => recordTypes.find(([key]) => key === value)?.[1] ?? "All record types";
const statusLabel = (value: string) => statuses.find(([key]) => key === value)?.[1] ?? "Any";

export default async function AdminSearchPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/search"));
  if (user.role !== "admin") redirect("/");

  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 120);
  const recordType = recordTypes.some(([key]) => key === params.type) ? params.type! : "all";
  const district = districts.includes(params.district ?? "") ? params.district! : "all";
  const status = statuses.some(([key]) => key === params.status) ? params.status! : "any";
  let catalogueResults: Awaited<ReturnType<typeof searchEverything>> = [];
  let sources: Awaited<ReturnType<typeof getAdminSourceRegistry>>["sources"] = [];
  let institutions: Awaited<ReturnType<typeof getInstitutions>> = [];
  let searchUnavailable = false;
  if (query) {
    try {
      const [catalogue, registry, institutionRows] = await Promise.all([searchEverything(query, 80), getAdminSourceRegistry(), getInstitutions()]);
      catalogueResults = catalogue;
      institutions = institutionRows;
      sources = registry.sources.filter((source) => `${source.title} ${source.organisations.join(" ")} ${source.recordNames.join(" ")} ${source.url}`.toLowerCase().includes(query.toLowerCase()));
    } catch (error) {
      console.error("[careerbridge] admin search failed", error);
      searchUnavailable = true;
    }
  }

  const institutionByCode = new Map(institutions.map((institution) => [institution.code, institution]));
  const results = catalogueResults.map((result) => {
    const routeKey = result.href.split("/").filter(Boolean).at(-1) ?? "";
    const institution = result.type === "institution" ? institutionByCode.get(routeKey) : undefined;
    if (result.type === "institution") return { key: `${result.type}:${result.href}`, type: result.type, label: "Institution", title: result.title, subtitle: result.subtitle, href: `/admin/catalogue/institutions/${encodeURIComponent(routeKey)}`, adminAction: true, district: institution?.district ?? "", status: institution?.verificationStatus ?? "" };
    if (result.type === "course") return { key: `${result.type}:${result.href}`, type: result.type, label: "Course", title: result.title, subtitle: result.subtitle, href: `/admin/catalogue/courses/${encodeURIComponent(routeKey)}`, adminAction: true, district: "", status: "" };
    return { key: `${result.type}:${result.href}`, type: result.type, label: result.type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), title: result.title, subtitle: result.subtitle, href: result.href, adminAction: false, district: "", status: "" };
  });
  const sourceResults = sources.map((source) => ({ key: `source:${source.sourceKey}`, type: "source", label: "Source", title: source.title, subtitle: `${source.organisations.join(", ") || "Organisation not recorded"} · ${source.recordNames.length} linked records`, href: `/admin/sources/settings?sourceKey=${encodeURIComponent(source.sourceKey)}`, adminAction: true, district: "", status: "" }));
  const allResults = [...sourceResults, ...results].filter((result) => {
    if (recordType !== "all" && result.type !== recordType) return false;
    if (district !== "all" && (result.type !== "institution" || result.district.toLowerCase() !== district.toLowerCase())) return false;
    if (status !== "any" && (result.type !== "institution" || result.status !== status)) return false;
    return true;
  });
  const hasFilters = recordType !== "all" || district !== "all" || status !== "any";
  const clearHref = query ? `/admin/search?q=${encodeURIComponent(query)}` : "/admin/search";

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Search results">
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dce5e0] pb-4"><div><p className="text-xs text-[#687970]">Catalogue <span aria-hidden="true">/</span> Search results</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Catalogue</h1><p className="mt-1.5 text-sm text-[#53665e]">Search context is kept visible so filters can be adjusted.</p></div></header>
      <MobileCatalogueFilters query={query} recordType={recordType} district={district} status={status} recordTypes={recordTypes.map(([value, label]) => ({ value, label }))} districts={districts.map((value) => ({ value, label: value === "all" ? "All districts" : value }))} statuses={statuses.map(([value, label]) => ({ value, label: value === "any" ? "Any status" : label }))}/>
      <form action="/admin/search" className="hidden rounded-xl border border-[#dce5e0] bg-white p-3 shadow-sm sm:p-4 lg:block">
        <div className="grid gap-2 lg:grid-cols-[minmax(240px,1.4fr)_minmax(150px,.6fr)_minmax(140px,.5fr)_minmax(140px,.5fr)_auto]">
          <label className="relative"><span className="sr-only">Search catalogue</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" /><input type="search" name="q" defaultValue={query} placeholder="Search institutions, courses or sources…" className="h-11 w-full rounded-lg border border-[#d2dcd7] pl-9 pr-3 text-sm text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label>
          <label className="sr-only" htmlFor="search-record-type">Record type</label><select id="search-record-type" name="type" defaultValue={recordType} aria-label="Record type" className="h-11 rounded-lg border border-[#d2dcd7] bg-white px-3 text-sm text-[#344b41] outline-none focus:border-[#27735c]"><option value="all">All record types</option>{recordTypes.filter(([key]) => key !== "all").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          <label className="sr-only" htmlFor="search-district">District</label><select id="search-district" name="district" defaultValue={district} aria-label="District" className="h-11 rounded-lg border border-[#d2dcd7] bg-white px-3 text-sm text-[#344b41] outline-none focus:border-[#27735c]"><option value="all">All districts</option>{districts.filter((value) => value !== "all").map((value) => <option key={value} value={value}>{value}</option>)}</select>
          <label className="sr-only" htmlFor="search-status">Status</label><select id="search-status" name="status" defaultValue={status} aria-label="Status" className="h-11 rounded-lg border border-[#d2dcd7] bg-white px-3 text-sm text-[#344b41] outline-none focus:border-[#27735c]">{statuses.map(([key, label]) => <option key={key} value={key}>Status: {label}</option>)}</select>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#12664f] px-5 text-sm font-bold text-white hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">Search</button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Active search filters">
          {recordType !== "all" && <span className="rounded-md bg-[#e9f4ee] px-2.5 py-1 text-xs font-semibold text-[#17634b]">{recordTypeLabel(recordType)}</span>}
          {district !== "all" && <span className="rounded-md bg-[#eef3f0] px-2.5 py-1 text-xs font-semibold text-[#53665d]">District: {district}</span>}
          <span className="rounded-md bg-[#eef3f0] px-2.5 py-1 text-xs font-semibold text-[#53665d]">Status: {statusLabel(status)}</span>
        </div>
      </form>
      {!query ? <section className="rounded-xl border border-dashed border-[#cbd8d2] bg-white px-6 py-12 text-center"><Search aria-hidden className="mx-auto h-8 w-8 text-[#718078]" /><h2 className="mt-3 font-bold text-[#263b33]">Search the catalogue</h2><p className="mt-1 text-sm text-[#596a63]">Enter a term above, then narrow results by record type, district, or status.</p></section> : searchUnavailable ? <section role="alert" className="rounded-xl border border-[#f0c9c5] bg-[#fff0ee] p-5 text-sm text-[#87382e]">Search is unavailable right now. Please try again.</section> : allResults.length ? <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Search results"><div className="border-b border-[#dce5e0] px-5 py-4"><h2 className="text-lg font-bold text-[#172b35]">{allResults.length} {allResults.length === 1 ? "result" : "results"} for “{query}”</h2></div><ul className="divide-y divide-[#e5ebe8]">{allResults.map((result) => <li key={result.key}><Link href={result.href} className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#f7faf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12664f]"><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-semibold text-[#20392f]">{result.title}</span><span className="rounded-full bg-[#eef3f0] px-2 py-0.5 text-xs font-semibold text-[#53665d]">{result.label}</span></span><span className="mt-1 block break-words text-sm text-[#596a63]">{result.subtitle}</span></span><span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#17634b]">{result.adminAction ? "Open admin record" : "Read-only reference"}<ArrowUpRight aria-hidden className="h-4 w-4" /></span></Link></li>)}</ul></section> : <section className="flex min-h-[300px] items-center justify-center py-8" aria-label="No search results"><div className="w-full max-w-[455px] rounded-xl border border-[#e1e8e4] bg-white px-6 py-8 text-center shadow-sm"><span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f1f5f3] text-[#53665d]"><Search className="h-5 w-5" /></span><h2 className="mt-4 text-lg font-bold text-[#263d32]">No results found</h2><p className="mt-1 text-sm text-[#687970]">Try a different search term or remove a filter.</p><Link href={clearHref} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">{hasFilters ? "Clear filters" : "Clear search"}</Link></div></section>}
    </div>
  </AdminPortalShell>;
}
