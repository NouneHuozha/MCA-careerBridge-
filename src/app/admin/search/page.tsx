import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { getAdminSourceRegistry } from "@/services/admin-sources";
import { searchEverything } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin search · CareerBridge" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function AdminSearchPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/search")}`);
  if (user.role !== "admin") redirect("/");

  const params = await searchParams;
  const query = (params.q ?? "").trim().slice(0, 120);
  let catalogueResults: Awaited<ReturnType<typeof searchEverything>> = [];
  let sources: Awaited<ReturnType<typeof getAdminSourceRegistry>>["sources"] = [];
  let searchUnavailable = false;
  if (query) {
    try {
      const [catalogue, registry] = await Promise.all([searchEverything(query, 40), getAdminSourceRegistry()]);
      catalogueResults = catalogue;
      sources = registry.sources.filter((source) => `${source.title} ${source.organisations.join(" ")} ${source.recordNames.join(" ")} ${source.url}`.toLowerCase().includes(query.toLowerCase()));
    } catch (error) {
      console.error("[careerbridge] admin search failed", error);
      searchUnavailable = true;
    }
  }

  const results = catalogueResults.map((result) => {
    if (result.type === "institution") {
      const code = result.href.split("/").filter(Boolean).at(-1) ?? "";
      return { key: `${result.type}:${result.href}`, type: "Institution", title: result.title, subtitle: result.subtitle, href: `/admin/catalogue/institutions/${encodeURIComponent(code)}`, adminAction: true };
    }
    if (result.type === "course") {
      const slug = result.href.split("/").filter(Boolean).at(-1) ?? "";
      return { key: `${result.type}:${result.href}`, type: "Course", title: result.title, subtitle: result.subtitle, href: `/admin/catalogue/courses/${encodeURIComponent(slug)}`, adminAction: true };
    }
    return { key: `${result.type}:${result.href}`, type: result.type.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()), title: result.title, subtitle: result.subtitle, href: result.href, adminAction: false };
  });
  const sourceResults = sources.map((source) => ({ key: `source:${source.sourceKey}`, type: "Source", title: source.title, subtitle: `${source.organisations.join(", ") || "Organisation not recorded"} · ${source.recordNames.length} linked records`, href: `/admin/sources/settings?sourceKey=${encodeURIComponent(source.sourceKey)}`, adminAction: true }));
  const allResults = [...sourceResults, ...results];

  return <AdminPortalShell active="sources" breadcrumb="Search">
    <div className="space-y-5">
      <header><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Admin workspace</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Search catalogue records.</h1><p className="mt-2 text-sm leading-relaxed text-[#596a63]">Find institutions, courses, and source records. Institution and source results open their admin workspaces; other catalogue entries are read-only references.</p></header>
      <form action="/admin/search" className="relative max-w-2xl"><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]" /><label className="sr-only" htmlFor="admin-search-query">Search institutions, courses, or sources</label><input id="admin-search-query" type="search" name="q" defaultValue={query} placeholder="Search institutions, courses or sources…" className="h-12 w-full rounded-lg border border-[#cbd8d2] bg-white pl-10 pr-4 text-base text-[#263b33] outline-none placeholder:text-[#687970] focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></form>
      {!query ? <section className="rounded-xl border border-dashed border-[#cbd8d2] bg-white px-6 py-12 text-center"><Search aria-hidden className="mx-auto h-8 w-8 text-[#718078]" /><h2 className="mt-3 font-bold text-[#263b33]">Search the admin catalogue</h2><p className="mt-1 text-sm text-[#596a63]">Use the field above to find an institution, course, or source.</p></section> : searchUnavailable ? <section role="alert" className="rounded-xl border border-[#f0c9c5] bg-[#fff0ee] p-5 text-sm text-[#87382e]">Search is unavailable right now. Please try again.</section> : <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Search results"><div className="border-b border-[#dce5e0] px-5 py-4"><h2 className="text-lg font-bold text-[#172b35]">{allResults.length} {allResults.length === 1 ? "result" : "results"} for “{query}”</h2></div>{allResults.length ? <ul className="divide-y divide-[#e5ebe8]">{allResults.map((result) => <li key={result.key}><Link href={result.href} className="flex min-h-20 flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-[#f7faf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12664f]"><span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-semibold text-[#20392f]">{result.title}</span><span className="rounded-full bg-[#eef3f0] px-2 py-0.5 text-xs font-semibold text-[#53665d]">{result.type}</span></span><span className="mt-1 block break-words text-sm text-[#596a63]">{result.subtitle}</span></span><span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#17634b]">{result.adminAction ? "Open admin record" : "Read-only reference"}<ArrowUpRight aria-hidden className="h-4 w-4" /></span></Link></li>)}</ul> : <div className="px-5 py-12 text-center"><p className="font-semibold text-[#263b33]">No matching records</p><p className="mt-1 text-sm text-[#596a63]">Try a different institution, course, or source name.</p></div>}</section>}
    </div>
  </AdminPortalShell>;
}
