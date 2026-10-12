import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock3,
  FileClock,
  Link2Off,
  ListChecks,
  Upload,
} from "lucide-react";
import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import {
  auditEvents,
  dataImports,
  institutionSources,
} from "@/db/schema";
import {
  getCourses,
  getExams,
  getInstitutions,
  getOpportunities,
  getScholarships,
} from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin review queue" };

type QueueItem = {
  id: string;
  item: string;
  type: string;
  issue: string;
  source: string;
  checkedAt: Date | null;
  href: string;
  tone: "amber" | "red" | "blue";
};

const verifiedStatuses = new Set(["verified", "current", "recently_verified", "published_verified"]);
const unavailableStatuses = new Set(["unavailable", "blocked", "source_unavailable"]);
const needsCorrectionStatuses = new Set(["needs_correction", "correction_required"]);
const daysAgo = (date: Date, days: number) => date.getTime() < Date.now() - days * 24 * 60 * 60 * 1000;

function checkedLabel(date: Date | null) {
  if (!date) return "Not checked";
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "1 month ago";
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function statusIssue(status: string, checkedAt: Date | null) {
  if (unavailableStatuses.has(status)) return { issue: "Source unavailable", tone: "red" as const };
  if (needsCorrectionStatuses.has(status)) return { issue: "Needs correction", tone: "red" as const };
  if (verifiedStatuses.has(status)) {
    return !checkedAt || daysAgo(checkedAt, 90)
      ? { issue: "Review overdue", tone: "amber" as const }
      : null;
  }
  return { issue: "Needs verification", tone: "amber" as const };
}

function safeSource(value?: string | null) {
  if (!value) return "No source recorded";
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Source recorded";
  }
}

function AttentionCard({
  value,
  label,
  detail,
  href,
  tone,
  icon: Icon,
}: {
  value: number | string;
  label: string;
  detail: string;
  href?: string;
  tone: "amber" | "red" | "blue";
  icon: typeof AlertTriangle;
}) {
  const tones = {
    amber: "border-[#e7d19b] bg-[#fff8e7] text-[#62430b]",
    red: "border-[#eac8c3] bg-[#fff3f1] text-[#87382e]",
    blue: "border-[#d2ded9] bg-[#f0f5f2] text-[#384e46]",
  };
  const className = `group flex min-h-[126px] items-center justify-between gap-3 rounded-xl border-l-4 p-4 shadow-sm ${tones[tone]} ${href ? "transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]" : ""}`;
  const content = <>
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-current/10 bg-white">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-[26px] font-bold leading-none tracking-tight">{value}</span>
          <span className="mt-2 block text-sm font-bold leading-snug">{label}</span>
          <span className="mt-1 block text-xs font-medium leading-relaxed opacity-90">{detail}</span>
        </span>
      </span>
      {href && <ArrowRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </>;
  return href
    ? <Link href={href} className={className}>{content}</Link>
    : <div className={className} aria-disabled="true" title="Import validation results are not stored yet">{content}</div>;
}

function issuePill(tone: QueueItem["tone"], issue: string) {
  const tones = {
    amber: "bg-[#fff2d8] text-[#875c12]",
    red: "bg-[#fde8e8] text-[#a13e3e]",
    blue: "bg-[#e8f1ff] text-[#3569a5]",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{issue}</span>;
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin")}`);
  if (user.role !== "admin") redirect("/");

  const [institutions, courses, exams, scholarships, opportunities] = await Promise.all([
    getInstitutions({}),
    getCourses({}),
    getExams(),
    getScholarships({}),
    getOpportunities({}),
  ]);

  let sourceRows: (typeof institutionSources.$inferSelect)[] = [];
  let imports: (typeof dataImports.$inferSelect)[] = [];
  let activity: (typeof auditEvents.$inferSelect)[] = [];
  try {
    [sourceRows, imports, activity] = await Promise.all([
      db.select().from(institutionSources),
      db.select().from(dataImports).orderBy(desc(dataImports.createdAt)).limit(8),
      db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt)).limit(5),
    ]);
  } catch (error) {
    console.error("[careerbridge] admin review queue query failed", error);
  }

  const queue: QueueItem[] = [];
  for (const record of institutions) {
    const issue = statusIssue(record.verificationStatus, record.lastVerifiedAt);
    if (!issue) continue;
    queue.push({
      id: `institution-${record.code}`,
      item: record.name,
      type: "Institution",
      ...issue,
      source: safeSource(record.sourceUrl ?? record.officialWebsite),
      checkedAt: record.lastVerifiedAt,
      href: `/admin/catalogue/institutions/${encodeURIComponent(record.code)}`,
    });
  }
  const unavailableSources = sourceRows.filter((source) => unavailableStatuses.has(source.status)).length;
  const verificationCount = queue.filter((item) => item.issue === "Needs verification" || item.issue === "Needs correction").length;
  const staleCount = queue.filter((item) => !item.checkedAt || daysAgo(item.checkedAt, 90)).length;
  const sortPriority: Record<QueueItem["tone"], number> = { red: 0, amber: 1, blue: 2 };
  queue.sort((a, b) => sortPriority[a.tone] - sortPriority[b.tone] || (a.checkedAt?.getTime() ?? 0) - (b.checkedAt?.getTime() ?? 0));
  const visibleQueue = queue.slice(0, 8);
  const recentImports = imports.slice(0, 3);

  return (
    <AdminPortalShell active="queue" breadcrumb="Review queue">
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#103e33] via-[#145b47] to-[#1c7254] px-6 py-7 text-white shadow-lg sm:px-8 sm:py-9" aria-labelledby="page-title">
              <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[28px] border-white/5" aria-hidden />
              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-3xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[.12em] text-[#e0f2e8]"><ListChecks aria-hidden className="h-4 w-4" />Admin review workspace</span><h1 id="page-title" className="mt-4 text-3xl font-bold leading-tight tracking-[-.04em] sm:text-4xl">Keep the catalogue trustworthy.</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-[#e2eee9]">Start with overdue and blocked records. Confirm facts against evidence before changing their status.</p></div>
                <div className="flex flex-wrap gap-3">
                  <Link href={visibleQueue[0]?.href ?? "/admin/catalogue/institutions"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#104d3a] shadow-sm transition hover:bg-[#eaf5ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#145b47]">Review next item<ArrowRight aria-hidden className="h-4 w-4" /></Link>
                  <Link href="/admin/catalogue/institutions" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><Building2 aria-hidden className="h-4 w-4" />Browse catalogue</Link>
                </div>
              </div>
            </section>

            <section className="mt-8" aria-labelledby="attention-title">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53685e]">Priority overview</p><h2 id="attention-title" className="mt-1 text-xl font-bold tracking-[-.02em] text-[#142e27]">What needs attention</h2></div><p className="text-sm font-medium text-[#52665d]">Red = blocked · Amber = review due · Grey = not tracked</p></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AttentionCard value={unavailableSources} label="Sources unavailable" detail="Blocked evidence sources" href="/admin/catalogue/institutions?filter=source_unavailable" tone="red" icon={Link2Off} />
                <AttentionCard value={verificationCount} label="Need verification" detail="Unverified institution records" href="/admin/catalogue/institutions?filter=needs_verification" tone="amber" icon={AlertTriangle} />
                <AttentionCard value={staleCount} label="Overdue for review" detail="Never checked or older than 90 days" href="/admin/catalogue/institutions?filter=stale" tone="amber" icon={Clock3} />
                <AttentionCard value="—" label="Import validation" detail="Error tracking is not available yet" tone="blue" icon={Upload} />
              </div>
            </section>

            <section className="mt-7 overflow-hidden rounded-2xl border border-[#d4dfda] bg-white shadow-sm" aria-labelledby="queue-title">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e0] px-5 py-5 sm:px-6">
                <div><p className="text-xs font-bold uppercase tracking-[.11em] text-[#53685e]">Action list</p><h2 id="queue-title" className="mt-1 text-xl font-bold text-[#17362e]">Review queue</h2><p className="mt-1 text-sm text-[#53665e]">Highest-priority records appear first.</p></div>
                <span className="inline-flex items-center rounded-full border border-[#bfd8cb] bg-[#eaf5ef] px-3 py-1.5 text-sm font-bold text-[#145c42]">{queue.length} {queue.length === 1 ? "item" : "items"}</span>
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-[#f0f4f2] text-xs font-bold uppercase tracking-wide text-[#344b41]"><tr><th scope="col" className="px-5 py-3.5">Item</th><th scope="col" className="px-4 py-3.5">Type</th><th scope="col" className="px-4 py-3.5">Issue</th><th scope="col" className="px-4 py-3.5">Source</th><th scope="col" className="px-4 py-3.5">Last checked</th><th scope="col" className="px-5 py-3.5 text-right">Action</th></tr></thead>
                  <tbody>
                    {visibleQueue.map((item) => (
                      <tr key={item.id} className="border-t border-[#e2e9e5] transition hover:bg-[#f7faf8]">
                        <td className="max-w-[300px] px-5 py-4 font-semibold text-[#20392f]"><span className="block truncate" title={item.item}>{item.item}</span></td>
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-[#455b51]">{item.type}</td>
                        <td className="px-4 py-4">{issuePill(item.tone, item.issue)}</td>
                        <td className="max-w-[190px] px-4 py-4 text-[#455b51]"><span className="block truncate" title={item.source}>{item.source}</span></td>
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-[#455b51]">{checkedLabel(item.checkedAt)}</td>
                        <td className="px-5 py-4 text-right"><Link href={item.href} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#12664f] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]">Review</Link></td>
                      </tr>
                    ))}
                    {!visibleQueue.length && <tr><td colSpan={6} className="px-5 py-14 text-center"><CheckCircle2 aria-hidden className="mx-auto h-9 w-9 text-[#287b60]" /><p className="mt-3 font-bold text-[#24483b]">Nothing in the review queue</p><p className="mt-1 text-sm text-[#53665e]">Institutions with pending or overdue verification will appear here.</p></td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="space-y-3 p-3 md:hidden">
                {visibleQueue.map((item) => <article key={`mobile-${item.id}`} className="rounded-xl border border-[#dce5e0] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-base font-bold leading-snug text-[#20392f]">{item.item}</h3><p className="mt-1 text-sm font-medium text-[#52665d]">{item.type}</p></div>{issuePill(item.tone, item.issue)}</div><dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e2e9e5] pt-3 text-sm"><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#53665e]">Source</dt><dd className="mt-1 break-words font-medium text-[#344b41]">{item.source}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#53665e]">Last checked</dt><dd className="mt-1 font-medium text-[#344b41]">{checkedLabel(item.checkedAt)}</dd></div></dl><Link href={item.href} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">Review record<ArrowRight aria-hidden className="h-4 w-4" /></Link></article>)}
                {!visibleQueue.length && <div className="rounded-xl border border-[#dce5e0] bg-[#f7faf8] px-5 py-10 text-center"><CheckCircle2 aria-hidden className="mx-auto h-9 w-9 text-[#287b60]" /><p className="mt-3 font-bold text-[#24483b]">Queue clear</p><p className="mt-1 text-sm text-[#53665e]">Nothing needs review right now.</p></div>}
              </div>
              {queue.length > visibleQueue.length && <div className="flex justify-end border-t border-[#e2e9e5] px-5 py-3"><Link href="/admin/catalogue/institutions" className="inline-flex min-h-10 items-center gap-1 text-sm font-bold text-[#145c42] hover:underline">View all institutions<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <section className="rounded-2xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="catalogue-title">
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[#53665d]">Reference data</p><h2 id="catalogue-title" className="mt-1 text-xl font-bold text-[#17362e]">Catalogue at a glance</h2><p className="mt-1 text-sm text-[#53665e]">Current catalogue coverage</p></div><Link href="/admin/catalogue/institutions" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#145c42] hover:bg-[#eef5f1] hover:underline">View catalogue<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[{ label: "Institutions", value: institutions.length, icon: Building2 }, { label: "Courses", value: courses.length, icon: BookOpen }, { label: "Entrance exams", value: exams.length, icon: ListChecks }, { label: "Scholarships", value: scholarships.length, icon: FileClock }].map(({ label, value, icon: Icon }, index) => <div key={label} className={`flex items-center gap-3 rounded-xl border border-[#dce5e0] p-4 ${index % 2 ? "bg-[#f0f4f2]" : "bg-[#eef6f1]"}`}><Icon aria-hidden className="h-5 w-5 shrink-0 text-[#245b49]" /><div><p className="text-sm font-semibold text-[#455b51]">{label}</p><p className="mt-0.5 text-2xl font-bold leading-tight text-[#193c31]">{value}</p></div></div>)}
                </div>
              </section>

              <section className="rounded-2xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="activity-title">
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[#53665d]">Audit trail</p><h2 id="activity-title" className="mt-1 text-xl font-bold text-[#17362e]">Recent activity</h2><p className="mt-1 text-sm text-[#53665e]">Recorded admin events and imports</p></div><Link href="/admin/catalogue/institutions" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-bold text-[#145c42] hover:bg-[#eef5f1] hover:underline">View catalogue<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
                <ul className="mt-3 divide-y divide-[#edf1ef]">
                  {activity.map((event) => <li key={`event-${event.id}`} className="flex items-start justify-between gap-3 py-3"><span className="flex min-w-0 items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f5ef] text-[#247456]"><CheckCircle2 aria-hidden className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#29483d]">{event.action.replaceAll("_", " ")}</span><span className="block truncate text-xs text-[#53665e]">{[event.entityType, event.entityRef, event.actor].filter(Boolean).join(" · ") || "Administrative event"}</span></span></span><time className="shrink-0 text-xs text-[#53665e]">{checkedLabel(event.createdAt)}</time></li>)}
                  {!activity.length && recentImports.map((entry) => <li key={`import-activity-${entry.id}`} className="flex items-start justify-between gap-3 py-3"><span className="flex min-w-0 items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f5ef] text-[#247456]"><Upload aria-hidden className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#29483d]">Catalogue import recorded</span><span className="block truncate text-xs text-[#53665e]">{entry.fileName ?? entry.datasetLabel} · {entry.recordCount} records</span></span></span><time className="shrink-0 text-xs text-[#53665e]">{checkedLabel(entry.createdAt)}</time></li>)}
                  {!activity.length && !recentImports.length && <li className="py-8 text-center text-sm text-[#53665e]">No administrative activity has been recorded yet.</li>}
                </ul>
              </section>
            </div>

            <p className="mt-5 rounded-xl border border-[#d8e1dc] bg-[#edf2ef] p-4 text-sm leading-relaxed text-[#455b51]">Workflow scope: the queue changes verification status for institutions only. Course and admission details remain read-only. Source refresh preferences can be recorded, but automated fetching and refresh-run monitoring are not connected yet.</p>
    </AdminPortalShell>
  );
}
