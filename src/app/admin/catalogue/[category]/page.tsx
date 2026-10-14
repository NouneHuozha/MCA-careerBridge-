import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Search } from "lucide-react";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import { admissionInformation } from "@/db/schema";
import { getCourses, getInstitutions, getOpportunities, getPathways, getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
const accepted = new Set(["verified", "current", "recently_verified", "published_verified", "approved"]);
type Entry = { id: string; title: string; subtitle: string; status: string | null; checked: Date | null; source: string | null; publicHref: string | null };
const dateLabel = (date: Date | null) => date ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date) : "Not checked";
const pretty = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function AdminCatalogCategoryPage({ params, searchParams }: { params: Promise<{ category: string }>; searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue"));
  if (user.role !== "admin") redirect("/");
  const [{ category }, query] = await Promise.all([params, searchParams]);
  if (category === "opportunities") redirect("/admin/catalogue/pathways?tab=opportunities");
  if (!["scholarships", "pathways", "opportunities", "admission-information"].includes(category)) notFound();
  const q = query.q?.trim().slice(0, 120).toLowerCase() ?? "";
  const titles: Record<string, string> = { scholarships: "Scholarships", pathways: "Pathways", opportunities: "Opportunities", "admission-information": "Admission information" };
  let entries: Entry[] = [];
  if (category === "scholarships") {
    entries = (await getScholarships()).map((item) => ({ id: item.slug, title: item.name, subtitle: [item.provider, item.category, item.deadlineNote].filter(Boolean).join(" · ") || "Provider and deadline not recorded", status: item.verificationStatus, checked: item.lastVerifiedAt, source: item.officialUrl || item.sourceUrl, publicHref: `/scholarships/${encodeURIComponent(item.slug)}` }));
  } else if (category === "pathways") {
    entries = (await getPathways()).map((item) => ({ id: item.slug, title: item.title, subtitle: `${pretty(item.entryStage)} · ${pretty(item.routeType)}${item.typicalDuration ? ` · ${item.typicalDuration}` : ""}`, status: null, checked: null, source: null, publicHref: `/pathways/${encodeURIComponent(item.slug)}` }));
  } else if (category === "opportunities") {
    entries = (await getOpportunities()).map((item) => ({ id: item.slug, title: item.title, subtitle: [pretty(item.type), item.provider, item.costNote].filter(Boolean).join(" · "), status: item.verificationStatus, checked: item.lastVerifiedAt, source: item.url || item.sourceUrl, publicHref: `/opportunities/${encodeURIComponent(item.slug)}` }));
  } else {
    const [admissions, institutions, courses] = await Promise.all([db.select().from(admissionInformation).catch(() => []), getInstitutions(), getCourses()]);
    const institutionNames = new Map(institutions.map((item) => [item.code, item.name]));
    const courseNames = new Map(courses.map((item) => [item.slug, item.name]));
    entries = admissions.map((item) => ({ id: String(item.id), title: [item.institutionCode ? institutionNames.get(item.institutionCode) ?? item.institutionCode : "Institution not assigned", item.courseSlug ? courseNames.get(item.courseSlug) ?? item.courseSlug : "General admission"].join(" — "), subtitle: [item.cycleLabel, item.applicationWindow, item.feesNote].filter(Boolean).join(" · ") || "Application details not recorded", status: item.verificationStatus, checked: item.retrievedAt, source: item.sourceUrl, publicHref: item.institutionCode ? `/institutions/${encodeURIComponent(item.institutionCode)}` : null }));
  }
  entries = entries.filter((item) => !q || `${item.title} ${item.subtitle} ${item.status ?? ""}`.toLowerCase().includes(q));
  const needsReview = entries.filter((item) => item.status !== null && !accepted.has(item.status)).length;

  return <AdminPortalShell active="catalogue" breadcrumb={`Catalogue / ${titles[category]}`}>
    <Link href="/admin/catalogue" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#145c42] hover:bg-[#e9f3ee]"><ArrowLeft aria-hidden className="h-4 w-4"/>All catalogues</Link>
    <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">{titles[category]}</h1><p className="mt-2 text-sm text-[#53665e]">{entries.length} {entries.length === 1 ? "record" : "records"}{needsReview ? ` · ${needsReview} need review` : ""}</p></div><form action={`/admin/catalogue/${category}`} method="get" className="relative w-full sm:max-w-sm"><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]"/><input type="search" name="q" defaultValue={query.q ?? ""} aria-label={`Search ${titles[category]}`} placeholder={`Search ${titles[category].toLowerCase()}…`} className="h-11 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/></form></div>
    <section className="mt-6 overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-[#e2e9e5] px-4 py-4 sm:px-5"><div><h2 className="text-lg font-bold text-[#172b35]">{entries.length} {titles[category].toLowerCase()} {q ? "matching search" : "in catalogue"}</h2><p className="mt-1 text-sm text-[#53665e]">Review status and source evidence are shown when the record model provides them.</p></div><Link href="/admin/imports" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#145c42] hover:bg-[#f2f7f4]"><FileText aria-hidden className="h-4 w-4"/>Import data</Link></div>
      {entries.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f4f7f5] text-xs font-bold uppercase tracking-wide text-[#53665e]"><tr><th className="px-5 py-3">Record</th><th className="px-3 py-3">Details</th><th className="px-3 py-3">Verification</th><th className="px-3 py-3">Last checked</th><th className="px-3 py-3">Source</th><th className="px-4 py-3">Preview</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">{entries.map((item) => <tr key={item.id} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4 font-semibold text-[#263d32]">{item.title}</td><td className="max-w-[320px] px-3 py-4 text-[#53665e]">{item.subtitle}</td><td className="px-3 py-4">{item.status ? <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${accepted.has(item.status) ? "border-[#c9e8dc] bg-[#e3f4ed] text-[#176c53]" : "border-[#efdfbd] bg-[#fff5df] text-[#94610c]"}`}>{pretty(item.status)}</span> : <span className="text-xs font-medium text-[#53665e]">CareerBridge-curated</span>}</td><td className="whitespace-nowrap px-3 py-4 text-[#53665e]">{dateLabel(item.checked)}</td><td className="px-3 py-4">{item.source && /^https?:\/\//i.test(item.source) ? <a href={item.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#17634b] underline">Official source<ExternalLink aria-hidden className="h-3 w-3"/></a> : <span className="text-xs text-[#718078]">Not recorded</span>}</td><td className="px-4 py-4">{item.publicHref ? <Link href={item.publicHref} target="_blank" className="text-xs font-semibold text-[#17634b] underline">Student preview</Link> : <span className="text-xs text-[#718078]">—</span>}</td></tr>)}</tbody></table></div> : <div className="px-5 py-14 text-center"><p className="font-semibold text-[#263d32]">{q ? "No matching records" : "No records are available yet"}</p><p className="mt-1 text-sm text-[#687970]">{q ? "Try a different search or clear the filter." : "Records will appear here when they are added or imported."}</p>{q && <Link href={`/admin/catalogue/${category}`} className="mt-3 inline-flex text-sm font-bold text-[#145c42] underline">Clear search</Link>}</div>}
    </section>
  </AdminPortalShell>;
}
