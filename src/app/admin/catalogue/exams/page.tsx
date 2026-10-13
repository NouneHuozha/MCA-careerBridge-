import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowDownUp, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, FileUp, Search, XCircle } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AddExamDialog } from "@/components/admin/add-exam-dialog";
import { getExams } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrance exams · Admin catalogue" };
const PAGE_SIZE = 4;
const verificationLabel: Record<string, string> = {
  verified: "Verified",
  needs_verification: "Needs verification",
  unavailable: "Source unavailable",
  recently_imported: "Recently imported",
  changed: "Changed since approval",
};
const dateLabel = (date: Date | string | null) => date ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date)) : "Not checked";
const statusClass = (status: string) => status === "verified" ? "border-[#c9e8dc] bg-[#e3f4ed] text-[#176c53]" : status === "unavailable" ? "border-[#f1cccc] bg-[#fff0f0] text-[#a52c2c]" : "border-[#f2dfb9] bg-[#fff5df] text-[#99620c]";
const statusIcon = (status: string) => status === "verified" ? CheckCircle2 : status === "unavailable" ? XCircle : AlertTriangle;
function hrefFor(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value); });
  const value = query.toString();
  return `/admin/catalogue/exams${value ? `?${value}` : ""}`;
}

export default async function AdminEntranceExamsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/catalogue/exams")}`);
  if (user.role !== "admin") redirect("/");
  const params = await searchParams;
  const get = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const q = get("q").trim();
  const stage = get("stage");
  const body = get("body");
  const status = get("status");
  const checked = get("checked");
  const sort = get("sort") || "last_checked_desc";
  const exams = await getExams();
  const bodies = [...new Set(exams.map((exam) => exam.conductingBody).filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
  const filtered = exams.filter((exam) => {
    const text = [exam.name, exam.shortName, exam.conductingBody, ...(exam.appliesTo ?? [])].filter(Boolean).join(" ").toLowerCase();
    return (!q || text.includes(q.toLowerCase())) && (!stage || exam.levelStage === stage) && (!body || exam.conductingBody === body) && (!status || exam.verificationStatus === status) && (!checked || (checked === "not_checked" ? !exam.lastVerifiedAt : Boolean(exam.lastVerifiedAt)));
  }).sort((a, b) => {
    if (sort === "name_asc") return a.name.localeCompare(b.name);
    if (sort === "name_desc") return b.name.localeCompare(a.name);
    const at = a.lastVerifiedAt ? new Date(a.lastVerifiedAt).getTime() : 0;
    const bt = b.lastVerifiedAt ? new Date(b.lastVerifiedAt).getTime() : 0;
    return sort === "last_checked_asc" ? at - bt || a.name.localeCompare(b.name) : bt - at || a.name.localeCompare(b.name);
  });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(get("page") || "1", 10) || 1));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const retained = { q: q || undefined, stage: stage || undefined, body: body || undefined, status: status || undefined, checked: checked || undefined, sort: sort === "last_checked_desc" ? undefined : sort };
  const start = filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const end = Math.min(page * PAGE_SIZE, filtered.length);

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Entrance exams">
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Catalogue sections">
      <Link href="/admin/catalogue/institutions" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">Institutions</Link>
      <Link href="/admin/catalogue/courses" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">Courses</Link>
      <Link href="/admin/catalogue/exams" aria-current="page" className="rounded-lg border border-[#b8d8c8] bg-[#e3f1e9] px-3 py-2 text-sm font-bold text-[#145c42]">Entrance exams</Link>
      <Link href="/admin/catalogue/scholarships" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">Scholarships</Link>
    </div>
    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue / Entrance exams</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Entrance exams</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#53665e]">Maintain eligibility, application periods, dates, and official exam sources.</p></div>
      <div className="flex flex-wrap gap-2"><AddExamDialog /><Link href="/admin/imports?dataset=entrance_exams" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#145c42] hover:bg-[#f2f7f4]"><FileUp aria-hidden className="h-4 w-4" />Import workbook</Link></div>
    </div>

    <form method="get" action="/admin/catalogue/exams" className="mt-7 grid gap-2 rounded-xl border border-[#d7e1dc] bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(190px,1.4fr)_repeat(4,minmax(130px,1fr))_auto] lg:p-4">
      <label className="relative block"><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#697970]"/><input type="search" name="q" defaultValue={q} placeholder="Search exams…" aria-label="Search exams" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/></label>
      <select name="stage" defaultValue={stage} aria-label="Education stage" className="h-10 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#344b41]"><option value="">Education stage</option><option value="after_class10">After Class 10</option><option value="after_class12">After Class 12</option></select>
      <select name="body" defaultValue={body} aria-label="Conducting body" className="h-10 min-w-0 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#344b41]"><option value="">Conducting body</option>{bodies.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select name="cycle" disabled aria-label="Cycle" className="h-10 rounded-lg border border-[#cbd8d2] bg-[#f7f9f8] px-3 text-sm text-[#687970]" title="Cycle labels are not yet stored for exam catalogue records"><option>Cycle (not recorded)</option></select>
      <select name="status" defaultValue={status} aria-label="Verification status" className="h-10 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#344b41]"><option value="">Verification status</option><option value="needs_verification">Needs verification</option><option value="verified">Verified</option><option value="unavailable">Source unavailable</option><option value="recently_imported">Recently imported</option></select>
      <div className="flex gap-2"><select name="checked" defaultValue={checked} aria-label="Last checked" className="h-10 min-w-0 flex-1 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#344b41]"><option value="">Last checked</option><option value="not_checked">Never checked</option><option value="checked">Has a check date</option></select><button type="submit" className="h-10 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38]">Apply</button></div>
      <input type="hidden" name="sort" value={sort}/>
    </form>

    <div role="note" className="mt-4 flex items-start gap-3 rounded-lg border border-[#f1dfb6] bg-[#fff8e8] px-4 py-3 text-sm leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#b07813]"/><p>Dates are cycle-specific. Verify active application windows against the official source before publishing.</p></div>
    <section className="mt-5 overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="exam-count">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9e5] px-4 py-4 sm:px-5"><div><h2 id="exam-count" className="text-lg font-bold text-[#172b35] sm:text-xl">{filtered.length} entrance {filtered.length === 1 ? "exam" : "exams"}</h2><p className="mt-0.5 text-sm text-[#53665e]">Official facts and cycle-specific dates are tracked separately.</p></div><form method="get" action="/admin/catalogue/exams" className="flex items-center gap-2 text-sm text-[#53665e]">{Object.entries(retained).map(([key, value]) => value ? <input key={key} type="hidden" name={key} value={value}/> : null)}<label htmlFor="exam-sort" className="whitespace-nowrap">Sort by:</label><select id="exam-sort" name="sort" defaultValue={sort} className="h-9 rounded-lg border border-[#cbd8d2] bg-white px-2 font-semibold text-[#17634b]"><option value="last_checked_desc">Last checked</option><option value="last_checked_asc">Oldest checked</option><option value="name_asc">Exam name A–Z</option><option value="name_desc">Exam name Z–A</option></select><button type="submit" aria-label="Apply sort order" className="grid h-9 w-9 place-items-center rounded-lg border border-[#cbd8d2] text-[#17634b] hover:bg-[#f0f5f2]"><ArrowDownUp aria-hidden className="h-4 w-4"/></button></form></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1020px] border-collapse text-left text-sm"><thead className="bg-[#f4f7f5] text-xs font-bold uppercase tracking-wide text-[#53665e]"><tr><th className="px-4 py-3 sm:px-5">Exam</th><th className="px-3 py-3">Conducting body</th><th className="px-3 py-3">Applies to</th><th className="px-3 py-3">Application period</th><th className="px-3 py-3">Exam date</th><th className="px-3 py-3">Cycle</th><th className="px-3 py-3">Verification</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Source</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">
        {visible.map((exam) => { const Icon = statusIcon(exam.verificationStatus); const label = verificationLabel[exam.verificationStatus] ?? "Needs verification"; const source = exam.officialWebsite || exam.sourceUrl; return <tr key={exam.slug} className="align-middle hover:bg-[#fbfcfb]"><td className="px-4 py-4 font-bold text-[#243d32] sm:px-5"><span className="block">{exam.shortName || exam.name}</span><span className="mt-0.5 block max-w-[220px] truncate text-xs font-medium text-[#718078]">{exam.name}</span></td><td className="max-w-[190px] px-3 py-4 text-[#455b51]">{exam.conductingBody || "Not recorded"}</td><td className="max-w-[200px] px-3 py-4 text-[#455b51]">{exam.appliesTo?.[0] || "Not recorded"}</td><td className="px-3 py-4 text-[#455b51]">{exam.applicationPeriod || "As published"}</td><td className="px-3 py-4 text-[#455b51]">{exam.examDate || "As published"}</td><td className="px-3 py-4 text-[#455b51]">Not recorded</td><td className="px-3 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(exam.verificationStatus)}`}><Icon aria-hidden className="h-3.5 w-3.5"/>{label}</span><span className="mt-1 block text-xs text-[#718078]">{dateLabel(exam.lastVerifiedAt)}</span></td><td className="px-3 py-4"><Link href={source || `/exams#${encodeURIComponent(exam.slug)}`} target={source ? "_blank" : undefined} rel={source ? "noopener noreferrer" : undefined} className={`inline-flex min-h-9 min-w-[88px] items-center justify-center rounded-lg px-3 text-sm font-bold ${exam.verificationStatus === "verified" ? "border border-[#cbd8d2] bg-white text-[#344b41] hover:bg-[#f0f5f2]" : "bg-[#145c42] text-white hover:bg-[#104d38]"}`}>{exam.verificationStatus === "verified" ? "View" : "Review"}</Link></td><td className="px-3 py-4">{source ? <a href={source} target="_blank" rel="noopener noreferrer" aria-label={`Open official source for ${exam.shortName || exam.name}`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#17634b] underline">Official source<ExternalLink aria-hidden className="h-3 w-3"/></a> : <span className="text-xs text-[#718078]">Not recorded</span>}</td></tr>; })}
        {!visible.length && <tr><td colSpan={9} className="px-5 py-16 text-center"><BookOpen aria-hidden className="mx-auto h-9 w-9 text-[#74857c]"/><p className="mt-3 font-bold text-[#263d32]">No matching entrance exams</p><p className="mt-1 text-sm text-[#53665e]">Change or clear the filters to see other catalogue records.</p><Link href="/admin/catalogue/exams" className="mt-3 inline-flex text-sm font-bold text-[#145c42] underline">Clear filters</Link></td></tr>}
      </tbody></table></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e9e5] px-4 py-3 sm:px-5"><p className="text-xs font-medium text-[#687970]">Showing {start}–{end} of {filtered.length} entrance exams</p><nav aria-label="Entrance exam catalogue pages" className="flex items-center gap-1"><Link href={hrefFor({ ...retained, page: page > 2 ? String(page - 1) : undefined })} aria-disabled={page <= 1} aria-label="Previous page" tabIndex={page <= 1 ? -1 : undefined} className={`grid h-9 w-9 place-items-center rounded-lg border ${page <= 1 ? "pointer-events-none border-[#e3e9e6] text-[#a0aaa5]" : "border-[#cbd8d2] text-[#344b41] hover:bg-[#eef5f1]"}`}><ChevronLeft aria-hidden className="h-4 w-4"/></Link>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <Link key={number} href={hrefFor({ ...retained, page: number === 1 ? undefined : String(number) })} aria-current={page === number ? "page" : undefined} className={`grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold ${page === number ? "border border-[#145c42] bg-[#e7f2ec] text-[#145c42]" : "text-[#53665e] hover:bg-[#f0f5f2]"}`}>{number}</Link>)}<Link href={hrefFor({ ...retained, page: page < pages ? String(page + 1) : undefined })} aria-disabled={page >= pages} aria-label="Next page" tabIndex={page >= pages ? -1 : undefined} className={`grid h-9 w-9 place-items-center rounded-lg border ${page >= pages ? "pointer-events-none border-[#e3e9e6] text-[#a0aaa5]" : "border-[#cbd8d2] text-[#344b41] hover:bg-[#eef5f1]"}`}><ChevronRight aria-hidden className="h-4 w-4"/></Link></nav></div>
    </section>
  </AdminPortalShell>;
}
