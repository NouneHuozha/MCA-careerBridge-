import Link from "next/link";
import { Building2, ChevronRight, Search } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { institutionSources } from "@/db/schema";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Institution catalogue · Admin" };
const verifiedStatuses = new Set(["verified", "current", "recently_verified", "published_verified"]);
const unavailableStatuses = new Set(["unavailable", "blocked", "source_unavailable"]);
const isOlderThan90Days = (date: Date | null) => !date || date.getTime() < Date.now() - 90 * 24 * 60 * 60 * 1000;

export default async function AdminInstitutionsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/catalogue/institutions")}`);
  if (user.role !== "admin") notFound();
  const [allInstitutions, filter] = await Promise.all([getInstitutions({}), searchParams.then((params) => params.filter ?? "all")]);
  let sourceRows: (typeof institutionSources.$inferSelect)[] = [];
  try { sourceRows = await db.select().from(institutionSources); } catch { /* Display available catalogue records when optional source metadata is unavailable. */ }
  const unavailableCodes = new Set(sourceRows.filter((source) => unavailableStatuses.has(source.status)).map((source) => source.institutionCode));
  const institutions = allInstitutions.filter((institution) => {
    if (filter === "needs_verification") return !verifiedStatuses.has(institution.verificationStatus) && !unavailableStatuses.has(institution.verificationStatus);
    if (filter === "source_unavailable") return unavailableCodes.has(institution.code);
    if (filter === "stale") return isOlderThan90Days(institution.lastVerifiedAt);
    return true;
  });
  const filterLabel = filter === "needs_verification" ? "Needs verification" : filter === "source_unavailable" ? "Sources unavailable" : filter === "stale" ? "Not checked in 90 days" : "All institutions";
  const filters = [
    { id: "all", label: "All institutions", href: "/admin/catalogue/institutions" },
    { id: "needs_verification", label: "Needs verification", href: "/admin/catalogue/institutions?filter=needs_verification" },
    { id: "source_unavailable", label: "Source unavailable", href: "/admin/catalogue/institutions?filter=source_unavailable" },
    { id: "stale", label: "Overdue", href: "/admin/catalogue/institutions?filter=stale" },
  ];
  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Institutions">
    <header className="rounded-2xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue management</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-[#142e27]">Institutions</h1><p className="mt-2 text-sm leading-relaxed text-[#455b51]">Inspect institution identity, course links, admission records, and source evidence.</p></div><span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#cbd8d2] bg-[#f1f5f3] px-4 text-sm font-bold text-[#344b41]"><Search aria-hidden className="h-4 w-4" />{institutions.length} shown</span></div>
      <nav className="mt-5 flex gap-2 overflow-x-auto border-t border-[#e2e9e5] pt-4" aria-label="Filter institutions">{filters.map((item) => <Link key={item.id} href={item.href} aria-current={filter === item.id ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] ${filter === item.id ? "border-[#145c42] bg-[#145c42] text-white" : "border-[#cbd8d2] bg-white text-[#344b41] hover:bg-[#eef5f1]"}`}>{item.label}</Link>)}</nav>
    </header>
    <section className="mt-5 overflow-hidden rounded-2xl border border-[#d4dfda] bg-white shadow-sm" aria-label={`${filterLabel} institution records`}>
      <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(130px,.55fr)_minmax(140px,.65fr)_150px_28px] gap-3 bg-[#eaf0ed] px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-[#344b41] md:grid"><span>Institution</span><span>Type</span><span>District</span><span>Verification</span><span /></div>
      {institutions.map((institution) => { const verified = verifiedStatuses.has(institution.verificationStatus); const fresh = verified && !isOlderThan90Days(institution.lastVerifiedAt); const label = fresh ? "Verified" : verified ? "Review due" : "Needs review"; return <Link key={`desktop-${institution.code}`} href={`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`} className="hidden grid-cols-[minmax(0,1.4fr)_minmax(130px,.55fr)_minmax(140px,.65fr)_150px_28px] items-center gap-3 border-t border-[#e2e9e5] px-5 py-4 transition hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12664f] md:grid"><span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e3f0e9] text-[#145c42]"><Building2 aria-hidden className="h-5 w-5" /></span><span className="min-w-0"><span className="block truncate text-[15px] font-bold text-[#20392f]">{institution.name}</span><span className="mt-0.5 block truncate text-xs font-semibold text-[#53665e]">{institution.code}</span></span></span><span className="truncate text-sm font-medium capitalize text-[#344b41]">{institution.type.replaceAll("_", " ")}</span><span className="truncate text-sm font-medium text-[#344b41]">{institution.district}</span><span className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold ${fresh ? "bg-[#e2f2e8] text-[#145c42]" : "bg-[#fff3d7] text-[#704f0d]"}`}>{label}</span><ChevronRight aria-hidden className="h-5 w-5 text-[#455b51]" /></Link>; })}
      {institutions.map((institution) => { const verified = verifiedStatuses.has(institution.verificationStatus); const fresh = verified && !isOlderThan90Days(institution.lastVerifiedAt); const label = fresh ? "Verified" : verified ? "Review due" : "Needs review"; return <Link key={`mobile-${institution.code}`} href={`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`} className="block border-t border-[#e2e9e5] p-4 transition hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12664f] md:hidden"><span className="flex items-start justify-between gap-3"><span className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e3f0e9] text-[#145c42]"><Building2 aria-hidden className="h-5 w-5" /></span><span className="min-w-0"><span className="block break-words text-base font-bold leading-snug text-[#20392f]">{institution.name}</span><span className="mt-1 block text-xs font-semibold text-[#53665e]">{institution.code}</span></span></span><ChevronRight aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[#455b51]" /></span><span className="mt-4 flex flex-wrap items-center gap-2"><span className="rounded-md bg-[#f0f4f2] px-2.5 py-1 text-xs font-semibold capitalize text-[#344b41]">{institution.type.replaceAll("_", " ")}</span><span className="rounded-md bg-[#f0f4f2] px-2.5 py-1 text-xs font-semibold text-[#344b41]">{institution.district}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${fresh ? "bg-[#e2f2e8] text-[#145c42]" : "bg-[#fff3d7] text-[#704f0d]"}`}>{label}</span></span></Link>; })}
      {!institutions.length && <div className="px-5 py-14 text-center"><Building2 aria-hidden className="mx-auto h-9 w-9 text-[#53665e]" /><p className="mt-3 text-base font-bold text-[#263d32]">No matching institutions</p><p className="mt-1 text-sm text-[#53665e]">Try a different filter or return to all records.</p></div>}
    </section>
  </AdminPortalShell>;
}
