import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownUp, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Ellipsis, FileUp, GraduationCap, Info, Search, Upload } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AddCourseDialog } from "@/components/admin/add-course-dialog";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { getAllInstitutionCourseLinks, getCourses, getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses · Admin catalogue" };
const PAGE_SIZE = 4;
const VERIFIED = new Set(["verified", "current", "recently_verified", "published_verified"]);
const UNAVAILABLE = new Set(["unavailable", "source_unavailable", "blocked"]);
const IMPORTED = new Set(["recently_imported", "imported", "new"]);
const LEVEL_NAMES: Record<string, string> = { higher_secondary: "Higher secondary", diploma: "Diploma", undergraduate: "Undergraduate", postgraduate: "Postgraduate", certificate: "Certificate" };
const STAGE_NAMES: Record<string, string> = { after_class_10: "After Class 10", after_class_12: "After Class 12", after_graduation: "After graduation", not_specified: "Not specified" };
const VERIFICATION_NAMES: Record<string, string> = { verified: "Verified", needs_verification: "Needs verification", recently_imported: "Recently imported", source_unavailable: "Source unavailable", overdue: "Review due" };
const STAGES = ["after_class_10", "after_class_12", "after_graduation", "not_specified"];
type Params = Promise<{ q?: string; level?: string; field?: string; stage?: string; verification?: string; lastChecked?: string; sort?: string; page?: string }>;
type State = "verified" | "needs_verification" | "recently_imported" | "source_unavailable" | "overdue";

function courseStage(course: { level: string; eligibility: string }) {
  const text = course.eligibility.toLowerCase();
  if (course.level === "higher_secondary" || /\b(class|grade|standard)\s*10\b|passed\s+class\s+10/.test(text)) return "after_class_10";
  if (course.level === "postgraduate" || /\b(bachelor'?s?|undergraduate degree|graduate degree)\b/.test(text)) return "after_graduation";
  if (course.level === "undergraduate" || /\b(class|grade|standard)\s*12\b|class\s+12/.test(text)) return "after_class_12";
  return "not_specified";
}
function courseState(course: { verificationStatus: string; lastVerifiedAt: Date | null }): State {
  const status = course.verificationStatus.toLowerCase().replaceAll(" ", "_");
  if (UNAVAILABLE.has(status)) return "source_unavailable";
  if (IMPORTED.has(status)) return "recently_imported";
  if (VERIFIED.has(status)) return course.lastVerifiedAt && Date.now() - course.lastVerifiedAt.getTime() <= 90 * 86_400_000 ? "verified" : "overdue";
  return "needs_verification";
}
function stateStyle(state: State) {
  if (state === "verified") return "border-[#c6e4d3] bg-[#e8f5ee] text-[#17634b]";
  if (state === "recently_imported") return "border-[#c8dafa] bg-[#eef4ff] text-[#2d5ea3]";
  if (state === "source_unavailable") return "border-[#f0c9c5] bg-[#fff0ee] text-[#a23e38]";
  return "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";
}
function checkedLabel(value: Date | null) {
  if (!value) return "Not checked";
  const days = Math.floor((Date.now() - value.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "1 month ago";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return value.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
}
function matchesLastChecked(value: Date | null, filter: string) {
  if (filter === "not_checked") return !value;
  if (!value) return filter === "all";
  const age = Date.now() - value.getTime();
  if (filter === "within_30") return age <= 30 * 86_400_000;
  if (filter === "31_90") return age > 30 * 86_400_000 && age <= 90 * 86_400_000;
  if (filter === "over_90") return age > 90 * 86_400_000;
  return true;
}
function queryHref(values: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) query.set(key, value);
  return query.size ? `/admin/catalogue/courses?${query.toString()}` : "/admin/catalogue/courses";
}
function titleCase(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default async function AdminCoursesPage({ searchParams }: { searchParams: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/catalogue/courses")}`);
  if (user.role !== "admin") redirect("/");
  const params = await searchParams;
  const [allCourses, fields, institutionCourseLinks] = await Promise.all([getCourses(), getFields(), getAllInstitutionCourseLinks()]);
  const fieldNames = new Map(fields.map((field) => [field.slug, field.name]));
  const linkCounts = new Map<string, number>();
  for (const link of institutionCourseLinks) linkCounts.set(link.courseSlug, (linkCounts.get(link.courseSlug) ?? 0) + 1);

  const query = params.q?.trim().slice(0, 120) ?? "";
  const level = allCourses.some((course) => course.level === params.level) ? params.level! : "all";
  const field = fields.some((item) => item.slug === params.field) ? params.field! : "all";
  const stage = STAGES.includes(params.stage ?? "") ? params.stage! : "all";
  const verification = ["all", "verified", "needs_verification", "recently_imported", "source_unavailable", "overdue"].includes(params.verification ?? "") ? params.verification ?? "all" : "all";
  const lastChecked = ["all", "not_checked", "within_30", "31_90", "over_90"].includes(params.lastChecked ?? "") ? params.lastChecked ?? "all" : "all";
  const sort = ["last_checked_desc", "last_checked_asc", "name_asc", "name_desc"].includes(params.sort ?? "") ? params.sort ?? "last_checked_desc" : "last_checked_desc";

  const filtered = allCourses.filter((course) => {
    const state = courseState(course);
    if (level !== "all" && course.level !== level) return false;
    if (field !== "all" && course.fieldSlug !== field) return false;
    if (stage !== "all" && courseStage(course) !== stage) return false;
    if (verification !== "all" && state !== verification) return false;
    if (!matchesLastChecked(course.lastVerifiedAt, lastChecked)) return false;
    if (query && !`${course.name} ${course.slug} ${course.level} ${course.fieldSlug ?? ""} ${course.eligibility}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())) return false;
    return true;
  });
  filtered.sort((a, b) => {
    if (sort === "name_asc") return a.name.localeCompare(b.name);
    if (sort === "name_desc") return b.name.localeCompare(a.name);
    const aDate = a.lastVerifiedAt?.getTime() ?? 0;
    const bDate = b.lastVerifiedAt?.getTime() ?? 0;
    return sort === "last_checked_asc" ? aDate - bDate || a.name.localeCompare(b.name) : bDate - aDate || a.name.localeCompare(b.name);
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const visibleCourses = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const start = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const filters = { q: query || undefined, level: level === "all" ? undefined : level, field: field === "all" ? undefined : field, stage: stage === "all" ? undefined : stage, verification: verification === "all" ? undefined : verification, lastChecked: lastChecked === "all" ? undefined : lastChecked, sort };
  const levels = [...new Set(allCourses.map((course) => course.level))].sort((a, b) => (LEVEL_NAMES[a] ?? a).localeCompare(LEVEL_NAMES[b] ?? b));

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Courses">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue management</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Courses</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#455b51]">Keep course descriptions, eligibility, routes, and sources up to date.</p></div>
      <div className="flex flex-wrap items-center gap-2"><AddCourseDialog fields={fields.map((item) => ({ slug: item.slug, name: item.name }))} /><Link href="/admin/imports?dataset=courses" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b7cec2] bg-white px-4 text-sm font-bold text-[#17634b] transition hover:bg-[#f0f7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"><Upload aria-hidden className="h-4 w-4" />Import workbook</Link></div>
    </header>

    <form method="get" action="/admin/catalogue/courses" className="mt-6 rounded-xl border border-[#d4dfda] bg-white p-3 shadow-sm sm:p-4">
      <input type="hidden" name="sort" value={sort} />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        <label className="relative sm:col-span-2 xl:col-span-1"><span className="sr-only">Search courses</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c73]" /><input type="search" name="q" defaultValue={query} placeholder="Search courses…" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm text-[#233a31] outline-none placeholder:text-[#829087] focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" /></label>
        <label><span className="sr-only">Level</span><select name="level" defaultValue={level} aria-label="Level" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41]"><option value="all">Level</option>{levels.map((item) => <option key={item} value={item}>{LEVEL_NAMES[item] ?? titleCase(item)}</option>)}</select></label>
        <label><span className="sr-only">Field</span><select name="field" defaultValue={field} aria-label="Field" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41]"><option value="all">Field</option>{fields.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label><span className="sr-only">Education stage</span><select name="stage" defaultValue={stage} aria-label="Education stage" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41]"><option value="all">Education stage</option>{STAGES.map((item) => <option key={item} value={item}>{STAGE_NAMES[item]}</option>)}</select></label>
        <label><span className="sr-only">Verification status</span><select name="verification" defaultValue={verification} aria-label="Verification status" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41]"><option value="all">Verification status</option>{Object.entries(VERIFICATION_NAMES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">Last checked</span><select name="lastChecked" defaultValue={lastChecked} aria-label="Last checked" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#344b41]"><option value="all">Last checked</option><option value="not_checked">Not checked</option><option value="within_30">Within 30 days</option><option value="31_90">31–90 days ago</option><option value="over_90">Over 90 days</option></select></label>
      </div>
      <div className="mt-3 flex justify-end gap-2"><Link href="/admin/catalogue/courses" className="inline-flex min-h-9 items-center px-3 text-sm font-semibold text-[#17634b] hover:underline">Clear filters</Link><button type="submit" className="inline-flex min-h-9 items-center rounded-lg bg-[#145c42] px-3 text-sm font-bold text-white hover:bg-[#104d38]">Apply filters</button></div>
    </form>

    <section className="mt-5 overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Course records">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e0] px-4 py-4 sm:px-5"><div><h2 className="text-lg font-bold text-[#17362e] sm:text-xl">{filtered.length} {filtered.length === 1 ? "course" : "courses"}</h2><p className="mt-0.5 text-sm text-[#53665e]">Review the course catalogue, not institution-specific availability.</p></div><form method="get" action="/admin/catalogue/courses" className="flex items-center gap-2 text-sm text-[#53665e]">{Object.entries({ ...filters, sort: undefined }).map(([key, value]) => value ? <input key={key} type="hidden" name={key} value={value} /> : null)}<label htmlFor="course-sort" className="whitespace-nowrap">Sort by:</label><select id="course-sort" name="sort" defaultValue={sort} className="h-9 rounded-lg border border-[#cbd8d2] bg-white px-2 font-semibold text-[#17634b]"><option value="last_checked_desc">Last checked</option><option value="last_checked_asc">Oldest checked</option><option value="name_asc">Course name A–Z</option><option value="name_desc">Course name Z–A</option></select><button type="submit" aria-label="Apply sort order" className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd8d2] text-[#17634b] hover:bg-[#f0f5f2]"><ArrowDownUp aria-hidden className="h-4 w-4" /></button></form></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left text-sm"><thead className="bg-[#f0f4f2] text-xs font-bold text-[#344b41]"><tr><th scope="col" className="px-4 py-3.5 sm:px-5">Course</th><th scope="col" className="px-3 py-3.5">Level</th><th scope="col" className="px-3 py-3.5">Field</th><th scope="col" className="px-3 py-3.5">Duration</th><th scope="col" className="px-3 py-3.5">Institutions</th><th scope="col" className="px-3 py-3.5">Verification</th><th scope="col" className="px-3 py-3.5">Last checked</th><th scope="col" className="px-4 py-3.5 text-right sm:px-5">Action</th></tr></thead><tbody>
        {visibleCourses.map((course) => {
          const state = courseState(course);
          const href = `/admin/catalogue/courses/${encodeURIComponent(course.slug)}`;
          return <tr key={course.slug} className="border-t border-[#e2e9e5] transition hover:bg-[#f7faf8]"><td className="px-4 py-3.5 sm:px-5"><Link href={href} className="block max-w-[270px] font-bold leading-snug text-[#20392f] hover:text-[#12664f] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]">{course.name}</Link><span className="mt-0.5 block text-xs font-semibold text-[#687970]">{course.slug}</span></td><td className="px-3 py-3.5 font-medium text-[#455b51]">{LEVEL_NAMES[course.level] ?? titleCase(course.level)}</td><td className="px-3 py-3.5 font-medium text-[#455b51]">{course.fieldSlug ? fieldNames.get(course.fieldSlug) ?? titleCase(course.fieldSlug) : "Not assigned"}</td><td className="px-3 py-3.5 font-medium text-[#455b51]">{course.durationLabel || "Not recorded"}</td><td className="px-3 py-3.5 font-medium text-[#455b51]">{linkCounts.get(course.slug) ?? 0} {(linkCounts.get(course.slug) ?? 0) === 1 ? "institution" : "institutions"}</td><td className="px-3 py-3.5"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${stateStyle(state)}`}>{state === "verified" ? <CheckCircle2 className="h-3.5 w-3.5" /> : state === "recently_imported" ? <FileUp className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{VERIFICATION_NAMES[state]}</span></td><td className="whitespace-nowrap px-3 py-3.5 font-medium text-[#455b51]">{checkedLabel(course.lastVerifiedAt)}</td><td className="px-4 py-3.5 text-right sm:px-5"><div className="inline-flex items-center gap-2"><Link href={href} className={`inline-flex min-h-9 min-w-[92px] items-center justify-center rounded-lg px-3 text-sm font-bold transition ${state === "verified" ? "border border-[#cbd8d2] bg-white text-[#344b41] hover:bg-[#f0f5f2]" : "bg-[#145c42] text-white hover:bg-[#104d38]"}`}>{state === "verified" ? "View" : "Review"}</Link><details className="relative"><summary aria-label={`More actions for ${course.name}`} className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg border border-[#cbd8d2] bg-white text-[#344b41] hover:bg-[#f5f8f6]"><Ellipsis className="h-5 w-5" /></summary><div className="absolute right-0 z-10 mt-1 w-48 rounded-lg border border-[#d4dfda] bg-white p-1 text-left shadow-lg"><Link href={href} className="block rounded-md px-3 py-2 text-sm font-medium text-[#344b41] hover:bg-[#f3f7f5]">Review course record</Link><Link href={`/courses/${encodeURIComponent(course.slug)}`} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm font-medium text-[#344b41] hover:bg-[#f3f7f5]">Open student preview</Link></div></details></div></td></tr>;
        })}
        {!visibleCourses.length && <tr><td colSpan={8} className="px-5 py-16 text-center"><GraduationCap aria-hidden className="mx-auto h-9 w-9 text-[#74857c]" /><p className="mt-3 font-bold text-[#263d32]">No matching courses</p><p className="mt-1 text-sm text-[#53665e]">Change or clear the filters to see other catalogue records.</p></td></tr>}
      </tbody></table></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e9e5] px-4 py-3 sm:px-5"><p className="text-xs font-medium text-[#687970]">Showing {start}–{end} of {filtered.length} courses</p><nav aria-label="Course catalogue pages" className="flex items-center gap-1"><Link href={queryHref({ ...filters, page: currentPage > 2 ? String(currentPage - 1) : undefined })} aria-disabled={currentPage <= 1} aria-label="Previous page" tabIndex={currentPage <= 1 ? -1 : undefined} className={`grid h-9 w-9 place-items-center rounded-lg border ${currentPage <= 1 ? "pointer-events-none border-[#e3e9e6] text-[#a0aaa5]" : "border-[#cbd8d2] text-[#344b41] hover:bg-[#eef5f1]"}`}><ChevronLeft aria-hidden className="h-4 w-4" /></Link>{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <Link key={page} href={queryHref({ ...filters, page: page === 1 ? undefined : String(page) })} aria-current={page === currentPage ? "page" : undefined} className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold ${page === currentPage ? "border border-[#145c42] bg-[#e7f2ec] text-[#145c42]" : "text-[#53665e] hover:bg-[#f0f5f2]"}`}>{page}</Link>)}<Link href={queryHref({ ...filters, page: currentPage < pageCount ? String(currentPage + 1) : undefined })} aria-disabled={currentPage >= pageCount} aria-label="Next page" tabIndex={currentPage >= pageCount ? -1 : undefined} className={`grid h-9 w-9 place-items-center rounded-lg border ${currentPage >= pageCount ? "pointer-events-none border-[#e3e9e6] text-[#a0aaa5]" : "border-[#cbd8d2] text-[#344b41] hover:bg-[#eef5f1]"}`}><ChevronRight aria-hidden className="h-4 w-4" /></Link></nav></div>
    </section>
    <p className="mt-4 flex items-start gap-2 rounded-xl border border-[#d8e1dc] bg-[#edf2ef] p-4 text-sm leading-relaxed text-[#455b51]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Course availability is verified separately for each institution. Education-stage filters are derived from explicit eligibility wording; ambiguous entry requirements remain “Not specified.”</p>
  </AdminPortalShell>;
}
