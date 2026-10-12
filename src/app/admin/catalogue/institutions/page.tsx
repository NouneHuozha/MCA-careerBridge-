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
  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Institutions">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#27755c]">Catalogue</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#142e27]">Institutions</h1><p className="mt-2 text-sm text-[#6d7e78]">{filterLabel} · Review institution identity, location, course links, and source evidence.</p></div><div className="flex items-center gap-3"><Link href="/admin/catalogue/institutions" className={`text-xs ${filter === "all" ? "font-semibold text-[#26755b]" : "text-[#71817c] hover:underline"}`}>All</Link><span className="inline-flex items-center gap-2 rounded-lg border border-[#dfe7e4] bg-white px-3 py-2 text-sm text-[#536b60]"><Search aria-hidden className="h-4 w-4" />{institutions.length} records</span></div></header>
    <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe7e4] bg-white"><div className="grid grid-cols-[minmax(0,1.4fr)_minmax(110px,.5fr)_minmax(110px,.6fr)_120px] gap-3 bg-[#f4f7f6] px-4 py-3 text-xs font-semibold text-[#657670] sm:px-5"><span>Institution</span><span>Type</span><span>District</span><span>Verification</span></div>
      {institutions.map((institution) => { const verified = verifiedStatuses.has(institution.verificationStatus); const fresh = verified && !isOlderThan90Days(institution.lastVerifiedAt); const label = fresh ? "Verified" : verified ? "Review due" : "Needs review"; return <Link key={institution.code} href={`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`} className="grid grid-cols-[minmax(0,1.4fr)_minmax(110px,.5fr)_minmax(110px,.6fr)_120px] items-center gap-3 border-t border-[#edf1ef] px-4 py-4 transition hover:bg-[#f9fcfa] sm:px-5"><span className="flex min-w-0 items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#edf6f1] text-[#28785d]"><Building2 aria-hidden className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#29483d]">{institution.name}</span><span className="block truncate text-xs text-[#82908b]">{institution.code}</span></span></span><span className="truncate text-sm capitalize text-[#64766f]">{institution.type.replaceAll("_", " ")}</span><span className="truncate text-sm text-[#64766f]">{institution.district}</span><span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${fresh ? "bg-[#e8f5ef] text-[#1b7254]" : "bg-[#fff5df] text-[#8a641a]"}`}>{label}</span><ChevronRight aria-hidden className="hidden h-4 w-4 text-[#84948d]" /></Link>; })}
      {!institutions.length && <p className="px-5 py-12 text-center text-sm text-[#71817c]">No institutions match this filter.</p>}
    </section>
  </AdminPortalShell>;
}
