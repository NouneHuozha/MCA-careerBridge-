import Link from "next/link";
import {
  ArrowDownUp,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Upload,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AddInstitutionDialog } from "@/components/admin/add-institution-dialog";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import { institutionSources } from "@/db/schema";
import { getInstitutionLinks, getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Institutions · Admin catalogue" };

const PAGE_SIZE = 8;
const REVIEW_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const verifiedStatuses = new Set(["verified", "current", "recently_verified", "published_verified"]);
const unavailableStatuses = new Set(["unavailable", "blocked", "source_unavailable"]);
const verificationFilters = new Set(["all", "verified", "needs_verification", "source_unavailable", "overdue"]);
const checkedFilters = new Set(["all", "not_checked", "within_30", "31_90", "over_90"]);
const sortOptions = new Set(["last_checked_asc", "last_checked_desc", "name_asc", "name_desc"]);

type SearchParams = Promise<{
  q?: string;
  district?: string;
  type?: string;
  ownership?: string;
  verification?: string;
  lastChecked?: string;
  sort?: string;
  page?: string;
  /** Backwards-compatible filters used by the review-queue cards. */
  filter?: string;
}>;

type ReviewState = "verified" | "needs_verification" | "source_unavailable" | "overdue";

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function olderThanReviewWindow(date: Date | null) {
  return !date || Date.now() - date.getTime() > REVIEW_AGE_MS;
}

function reviewState(institution: Awaited<ReturnType<typeof getInstitutions>>[number], hasUnavailableSource: boolean): ReviewState {
  if (hasUnavailableSource || unavailableStatuses.has(institution.verificationStatus)) return "source_unavailable";
  if (!verifiedStatuses.has(institution.verificationStatus)) return "needs_verification";
  return olderThanReviewWindow(institution.lastVerifiedAt) ? "overdue" : "verified";
}

function statusLabel(state: ReviewState) {
  if (state === "verified") return "Verified";
  if (state === "source_unavailable") return "Source unavailable";
  if (state === "overdue") return "Review due";
  return "Needs verification";
}

function statusTone(state: ReviewState) {
  if (state === "verified") return "border-[#c6e4d3] bg-[#e7f5ed] text-[#17634b]";
  if (state === "source_unavailable") return "border-[#f1c6c3] bg-[#fff0ee] text-[#a23e38]";
  if (state === "overdue") return "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";
  return "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";
}

function checkedLabel(date: Date | null) {
  if (!date) return "Never checked";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function queryHref(
  params: Record<string, string | undefined>,
  changes: Record<string, string | undefined>,
) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...changes })) {
    if (value) next.set(key, value);
  }
  const query = next.toString();
  return query ? `/admin/catalogue/institutions?${query}` : "/admin/catalogue/institutions";
}

function matchesLastChecked(date: Date | null, filter: string) {
  if (filter === "not_checked") return !date;
  if (filter === "all" || !date) return filter === "all";
  const age = Date.now() - date.getTime();
  if (filter === "within_30") return age <= 30 * 24 * 60 * 60 * 1000;
  if (filter === "31_90") return age > 30 * 24 * 60 * 60 * 1000 && age <= REVIEW_AGE_MS;
  if (filter === "over_90") return age > REVIEW_AGE_MS;
  return true;
}

export default async function AdminInstitutionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/catalogue/institutions")}`);
  if (user.role !== "admin") redirect("/");

  const params = await searchParams;
  const allInstitutions = await getInstitutions({});
  let sourceRows: (typeof institutionSources.$inferSelect)[] = [];
  try {
    sourceRows = await db.select().from(institutionSources);
  } catch (error) {
    console.warn("[careerbridge] institution source filters unavailable", error);
  }
  const unavailableCodes = new Set(
    sourceRows.filter((source) => unavailableStatuses.has(source.status)).map((source) => source.institutionCode),
  );

  const query = params.q?.trim().slice(0, 120) ?? "";
  const district = params.district ?? "";
  const type = params.type ?? "";
  const ownership = params.ownership ?? "";
  const legacyFilter = params.filter ?? "";
  const legacyVerification = legacyFilter === "needs_verification" || legacyFilter === "source_unavailable";
  const selectedVerification = verificationFilters.has(params.verification ?? "")
    ? (params.verification ?? "all")
    : legacyVerification
      ? legacyFilter
      : "all";
  const selectedLastChecked = checkedFilters.has(params.lastChecked ?? "")
    ? (params.lastChecked ?? "all")
    : legacyFilter === "stale"
      ? "over_90"
      : "all";
  const sort = sortOptions.has(params.sort ?? "") ? (params.sort ?? "last_checked_asc") : "last_checked_asc";

  const filtered = allInstitutions.filter((institution) => {
    if (district && institution.district !== district) return false;
    if (type && institution.type !== type) return false;
    if (ownership && institution.ownership !== ownership) return false;
    if (query) {
      const haystack = [
        institution.code,
        institution.name,
        institution.district,
        institution.city,
        institution.state,
        institution.type,
        institution.ownership,
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      if (!haystack.includes(query.toLocaleLowerCase())) return false;
    }
    const state = reviewState(institution, unavailableCodes.has(institution.code));
    if (selectedVerification !== "all" && state !== selectedVerification) return false;
    if (!matchesLastChecked(institution.lastVerifiedAt, selectedLastChecked)) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === "name_asc") return a.name.localeCompare(b.name);
    if (sort === "name_desc") return b.name.localeCompare(a.name);
    const aDate = a.lastVerifiedAt?.getTime() ?? 0;
    const bDate = b.lastVerifiedAt?.getTime() ?? 0;
    return sort === "last_checked_desc" ? bDate - aDate || a.name.localeCompare(b.name) : aDate - bDate || a.name.localeCompare(b.name);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const pageInstitutions = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const courseCountEntries = await Promise.all(
    pageInstitutions.map(async (institution) => [institution.code, (await getInstitutionLinks(institution.code)).length] as const),
  );
  const courseCounts = new Map(courseCountEntries);
  const districts = [...new Set(allInstitutions.map((institution) => institution.district).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const types = [...new Set(allInstitutions.map((institution) => institution.type).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const ownerships = [...new Set(allInstitutions.map((institution) => institution.ownership).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const start = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const paginationParams = {
    q: query || undefined,
    district: district || undefined,
    type: type || undefined,
    ownership: ownership || undefined,
    verification: selectedVerification === "all" ? undefined : selectedVerification,
    lastChecked: selectedLastChecked === "all" ? undefined : selectedLastChecked,
    sort,
  };

  return (
    <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Institutions">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue management <span className="mx-1 text-[#8b9992]">·</span><Link href="/admin/catalogue/courses" className="text-[#17634b] underline underline-offset-2">Courses</Link><span className="mx-1 text-[#8b9992]">·</span><Link href="/admin/catalogue/institution-courses" className="text-[#17634b] underline underline-offset-2">Institution-course links</Link><span className="mx-1 text-[#8b9992]">·</span><Link href="/admin/catalogue/scholarships" className="text-[#17634b] underline underline-offset-2">Scholarships</Link></p>
          <h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Institutions</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#455b51]">Review institution identity, location, course links, and source freshness.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddInstitutionDialog />
          <Link href="/admin/imports" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b7cec2] bg-white px-4 text-sm font-bold text-[#17634b] transition hover:bg-[#f0f7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2">
            <Upload aria-hidden className="h-4 w-4" />
            Import workbook
          </Link>
        </div>
      </header>

      <form method="get" action="/admin/catalogue/institutions" className="mt-6 rounded-xl border border-[#d4dfda] bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <label className="text-xs font-bold text-[#455b51]">
            Search institutions
            <span className="relative mt-1.5 block">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c73]" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Name, code, district…"
                className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm font-medium text-[#233a31] outline-none transition placeholder:font-normal placeholder:text-[#829087] focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"
              />
            </span>
          </label>
          <label className="text-xs font-bold text-[#455b51]">
            District
            <select name="district" defaultValue={district} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
              <option value="">All districts</option>
              {districts.map((item) => <option value={item} key={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#455b51]">
            Institution type
            <select name="type" defaultValue={type} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
              <option value="">All types</option>
              {types.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#455b51]">
            Ownership
            <select name="ownership" defaultValue={ownership} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
              <option value="">All ownerships</option>
              {ownerships.map((item) => <option value={item} key={item}>{titleCase(item)}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold text-[#455b51]">
            Verification status
            <select name="verification" defaultValue={selectedVerification} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
              <option value="all">All statuses</option>
              <option value="verified">Verified</option>
              <option value="needs_verification">Needs verification</option>
              <option value="source_unavailable">Source unavailable</option>
              <option value="overdue">Review due</option>
            </select>
          </label>
          <label className="text-xs font-bold text-[#455b51]">
            Last checked
            <select name="lastChecked" defaultValue={selectedLastChecked} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
              <option value="all">Any time</option>
              <option value="not_checked">Never checked</option>
              <option value="within_30">Within 30 days</option>
              <option value="31_90">31–90 days ago</option>
              <option value="over_90">Over 90 days</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#e7ece9] pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-bold text-[#455b51]">
              Sort by
              <span className="relative mt-1.5 block">
                <ArrowDownUp aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c73]" />
                <select name="sort" defaultValue={sort} className="h-10 min-w-48 rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-8 text-sm font-medium text-[#344b41] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">
                  <option value="last_checked_asc">Last checked · oldest first</option>
                  <option value="last_checked_desc">Last checked · newest first</option>
                  <option value="name_asc">Institution name · A–Z</option>
                  <option value="name_desc">Institution name · Z–A</option>
                </select>
              </span>
            </label>
            <button type="submit" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white transition hover:bg-[#104d38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2">Apply filters</button>
            <Link href="/admin/catalogue/institutions" className="inline-flex min-h-10 items-center justify-center rounded-lg px-3 text-sm font-bold text-[#145c42] hover:bg-[#eef5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42]">Clear all</Link>
          </div>
          <p className="text-xs font-medium text-[#687970]">Unverified records are not presented to students as confirmed.</p>
        </div>
      </form>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Institution records">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e0] px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-lg font-bold text-[#17362e] sm:text-xl">{filtered.length} {filtered.length === 1 ? "institution" : "institutions"}</h2>
            <p className="mt-0.5 text-sm text-[#53665e]">Review identity, course links, ownership, and verification state.</p>
          </div>
          <span className="text-sm font-medium text-[#53665e]">{start}–{end} of {filtered.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-[#f0f4f2] text-xs font-bold text-[#344b41]">
              <tr>
                <th scope="col" className="px-4 py-3.5 sm:px-5">Institution</th>
                <th scope="col" className="px-3 py-3.5">Type</th>
                <th scope="col" className="px-3 py-3.5">District</th>
                <th scope="col" className="px-3 py-3.5">Ownership</th>
                <th scope="col" className="px-3 py-3.5">Courses</th>
                <th scope="col" className="px-3 py-3.5">Verification</th>
                <th scope="col" className="px-3 py-3.5">Last checked</th>
                <th scope="col" className="px-4 py-3.5 text-right sm:px-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageInstitutions.map((institution) => {
                const state = reviewState(institution, unavailableCodes.has(institution.code));
                const href = `/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`;
                return (
                  <tr key={institution.code} className="border-t border-[#e2e9e5] transition hover:bg-[#f7faf8]">
                    <td className="px-4 py-3.5 sm:px-5">
                      <Link href={href} className="block max-w-[250px] truncate font-bold text-[#20392f] hover:text-[#12664f] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]" title={institution.name}>{institution.name}</Link>
                      <span className="mt-0.5 block text-xs font-semibold text-[#687970]">{institution.code}</span>
                    </td>
                    <td className="px-3 py-3.5 font-medium capitalize text-[#455b51]">{titleCase(institution.type)}</td>
                    <td className="px-3 py-3.5 font-medium text-[#455b51]">{institution.district}</td>
                    <td className="px-3 py-3.5 font-medium capitalize text-[#455b51]">{titleCase(institution.ownership)}</td>
                    <td className="px-3 py-3.5 font-medium text-[#455b51]">{courseCounts.get(institution.code) ?? 0} courses</td>
                    <td className="px-3 py-3.5"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone(state)}`}>{statusLabel(state)}</span></td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-medium text-[#455b51]">{checkedLabel(institution.lastVerifiedAt)}</td>
                    <td className="px-4 py-3.5 text-right sm:px-5">
                      <Link href={href} className={`inline-flex min-h-9 min-w-[88px] items-center justify-center rounded-lg px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2 ${state === "verified" ? "border border-[#cbd8d2] bg-white text-[#344b41] hover:bg-[#f0f5f2]" : "bg-[#145c42] text-white hover:bg-[#104d38]"}`}>
                        {state === "verified" ? "View" : "Review"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {!pageInstitutions.length && (
                <tr><td colSpan={8} className="px-5 py-16 text-center">
                  <Building2 aria-hidden className="mx-auto h-9 w-9 text-[#74857c]" />
                  <p className="mt-3 font-bold text-[#263d32]">No matching institutions</p>
                  <p className="mt-1 text-sm text-[#53665e]">Change or clear your filters to see other catalogue records.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e9e5] px-4 py-3 sm:px-5">
          <p className="text-xs font-medium text-[#687970]">Showing {start}–{end} of {filtered.length} institutions</p>
          <nav aria-label="Institution catalogue pages" className="flex items-center gap-1">
            <Link
              href={queryHref(paginationParams, { page: currentPage > 2 ? String(currentPage - 1) : undefined })}
              aria-disabled={currentPage <= 1}
              aria-label="Previous page"
              tabIndex={currentPage <= 1 ? -1 : undefined}
              className={`grid h-9 w-9 place-items-center rounded-lg border ${currentPage <= 1 ? "pointer-events-none border-[#e3e9e6] text-[#a0aaa5]" : "border-[#cbd8d2] text-[#344b41] hover:bg-[#eef5f1]"}`}
            ><ChevronLeft aria-hidden className="h-4 w-4" /></Link>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
              <Link
                key={page}
                href={queryHref(paginationParams, { page: page === 1 ? undefined : String(page) })}
                aria-current={page === currentPage ? "page" : undefined}
                className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold ${page === currentPage ? "border border-[#145c42] bg-[#e7f2ec] text-[#145c42]" : "text-[#53665e] hover:bg-[#f0f5f2]"}`}
              >{page}</Link>
            ))}
            <Link
              href={queryHref(paginationParams, { page: currentPage < pageCount ? String(currentPage + 1) : undefined })}
              aria-disabled={currentPage >= pageCount}
              aria-label="Next page"
              tabIndex={currentPage >= pageCount ? -1 : undefined}
              className={`grid h-9 w-9 place-items-center rounded-lg border ${currentPage >= pageCount ? "pointer-events-none border-[#e3e9e6] text-[#a0aaa5]" : "border-[#cbd8d2] text-[#344b41] hover:bg-[#eef5f1]"}`}
            ><ChevronRight aria-hidden className="h-4 w-4" /></Link>
          </nav>
        </div>
      </section>
      <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#d8e1dc] bg-[#edf2ef] p-4 text-sm leading-relaxed text-[#455b51]">
        <span aria-hidden className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#5d806e]" />
        Student pages show approved catalogue records and clearly label information that still needs checking.
      </p>
    </AdminPortalShell>
  );
}
