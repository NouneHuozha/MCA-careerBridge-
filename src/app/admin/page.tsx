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
    amber: "border-[#f0dfb8] bg-[#fff9ec] text-[#805913]",
    red: "border-[#f2d4d4] bg-[#fff4f4] text-[#963d3d]",
    blue: "border-[#d8e5f4] bg-[#f3f8ff] text-[#355f92]",
  };
  const className = `group flex min-h-[106px] items-center justify-between gap-3 rounded-xl border p-4 ${tones[tone]} ${href ? "transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#287f68]" : "opacity-80"}`;
  const content = <>
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/80">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-2xl font-semibold leading-none">{value}</span>
          <span className="mt-1 block text-sm font-semibold leading-snug">{label}</span>
          <span className="mt-1 block text-xs opacity-75">{detail}</span>
        </span>
      </span>
      <ArrowRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
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
  const errorCount = "—"; // Validation results are not represented by the current import schema.
  const sortPriority: Record<QueueItem["tone"], number> = { red: 0, amber: 1, blue: 2 };
  queue.sort((a, b) => sortPriority[a.tone] - sortPriority[b.tone] || (a.checkedAt?.getTime() ?? 0) - (b.checkedAt?.getTime() ?? 0));
  const visibleQueue = queue.slice(0, 8);
  const recentImports = imports.slice(0, 3);

  return (
    <AdminPortalShell active="queue" breadcrumb="Review queue">
            <section className="flex flex-wrap items-start justify-between gap-5" aria-labelledby="page-title">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#27755c]">Catalogue trust workspace</p><h1 id="page-title" className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#123d31] sm:text-4xl">Keep the catalogue trustworthy.</h1><p className="mt-2 max-w-2xl text-base leading-relaxed text-[#667772]">Review changes, verify sources, and keep student-facing information current.</p></div>
              <div className="flex flex-wrap gap-2">
                <Link href={visibleQueue[0]?.href ?? "/admin/catalogue/institutions"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">Review next item<ArrowRight aria-hidden className="h-4 w-4" /></Link>
                <Link href="/admin/catalogue/institutions" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cad8d3] bg-white px-4 py-2.5 text-sm font-semibold text-[#254d41] transition hover:bg-[#f4f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]"><Building2 aria-hidden className="h-4 w-4" />Browse catalogue</Link>
              </div>
            </section>

            <section className="mt-7" aria-labelledby="attention-title">
              <h2 id="attention-title" className="mb-3 text-lg font-semibold tracking-[-0.02em] text-[#17362e]">Needs your attention</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <AttentionCard value={verificationCount} label="records need verification" detail="Catalogue records awaiting a check" href="/admin/catalogue/institutions?filter=needs_verification" tone="amber" icon={AlertTriangle} />
                <AttentionCard value={unavailableSources} label="sources are unavailable" detail="Failed or blocked source records" href="/admin/catalogue/institutions?filter=source_unavailable" tone="red" icon={Link2Off} />
                <AttentionCard value={errorCount} label="import rows have errors" detail="Validation results are not recorded" tone="red" icon={AlertTriangle} />
                <AttentionCard value={staleCount} label="records not checked in 90 days" detail="Based on recorded verification dates" href="/admin/catalogue/institutions?filter=stale" tone="amber" icon={Clock3} />
              </div>
            </section>

            <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe7e4] bg-white shadow-[0_2px_10px_-8px_rgba(20,55,43,.28)]" aria-labelledby="queue-title">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7eeeb] px-5 py-4">
                <div><h2 id="queue-title" className="text-lg font-semibold text-[#17362e]">Review queue</h2><p className="mt-0.5 text-sm text-[#71817c]">Items are ordered by issue severity and age of last verification.</p></div>
                <span className="text-sm font-medium text-[#26755b]">{queue.length} {queue.length === 1 ? "item" : "items"}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="bg-[#f5f8f7] text-xs text-[#60716c]"><tr><th scope="col" className="px-5 py-3 font-semibold">Item</th><th scope="col" className="px-4 py-3 font-semibold">Type</th><th scope="col" className="px-4 py-3 font-semibold">Issue</th><th scope="col" className="px-4 py-3 font-semibold">Source</th><th scope="col" className="px-4 py-3 font-semibold">Last checked</th><th scope="col" className="px-5 py-3 text-right font-semibold">Action</th></tr></thead>
                  <tbody>
                    {visibleQueue.map((item) => (
                      <tr key={item.id} className="border-t border-[#edf1ef] transition hover:bg-[#fbfdfc]">
                        <td className="max-w-[300px] px-5 py-3.5 font-medium text-[#213f35]"><span className="block truncate" title={item.item}>{item.item}</span></td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#5b6e68]">{item.type}</td>
                        <td className="px-4 py-3.5">{issuePill(item.tone, item.issue)}</td>
                        <td className="max-w-[190px] px-4 py-3.5 text-[#596b66]"><span className="block truncate" title={item.source}>{item.source}</span></td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-[#596b66]">{checkedLabel(item.checkedAt)}</td>
                        <td className="px-5 py-3.5 text-right"><Link href={item.href} className="inline-flex min-h-9 items-center justify-center rounded-md bg-[#12664f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]">Review</Link></td>
                      </tr>
                    ))}
                    {!visibleQueue.length && <tr><td colSpan={6} className="px-5 py-12 text-center"><CheckCircle2 aria-hidden className="mx-auto h-8 w-8 text-[#287b60]" /><p className="mt-2 font-semibold text-[#24483b]">Nothing in the review queue</p><p className="mt-1 text-sm text-[#71817c]">Institutions with pending or overdue verification will appear here.</p></td></tr>}
                  </tbody>
                </table>
              </div>
              {queue.length > visibleQueue.length && <div className="flex justify-end border-t border-[#edf1ef] px-5 py-3"><Link href="/admin/catalogue/institutions" className="inline-flex items-center gap-1 text-sm font-semibold text-[#216b53] hover:underline">View all institutions<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}
            </section>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <section className="rounded-xl border border-[#dfe7e4] bg-white p-5" aria-labelledby="catalogue-title">
                <div className="flex items-center justify-between gap-3"><div><h2 id="catalogue-title" className="text-lg font-semibold text-[#17362e]">Catalogue at a glance</h2><p className="mt-1 text-sm text-[#71817c]">Current catalogue coverage</p></div><Link href="/admin/catalogue/institutions" className="inline-flex items-center gap-1 text-sm font-medium text-[#26755b] hover:underline">View catalogue<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[{ label: "Institutions", value: institutions.length, icon: Building2 }, { label: "Courses", value: courses.length, icon: BookOpen }, { label: "Entrance exams", value: exams.length, icon: ListChecks }, { label: "Scholarships", value: scholarships.length, icon: FileClock }].map(({ label, value, icon: Icon }, index) => <div key={label} className={`flex items-center gap-3 rounded-lg p-3 ${index % 2 ? "bg-[#eff5fb]" : "bg-[#eef7f2]"}`}><Icon aria-hidden className="h-5 w-5 shrink-0 text-[#245b49]" /><div><p className="text-xs text-[#63756f]">{label}</p><p className="text-xl font-semibold leading-tight text-[#193c31]">{value}</p></div></div>)}
                </div>
              </section>

              <section className="rounded-xl border border-[#dfe7e4] bg-white p-5" aria-labelledby="activity-title">
                <div className="flex items-center justify-between gap-3"><div><h2 id="activity-title" className="text-lg font-semibold text-[#17362e]">Recent activity</h2><p className="mt-1 text-sm text-[#71817c]">Recorded administrative events and imports</p></div><Link href="/admin/catalogue/institutions" className="inline-flex items-center gap-1 text-sm font-medium text-[#26755b] hover:underline">Review catalogue<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
                <ul className="mt-3 divide-y divide-[#edf1ef]">
                  {activity.map((event) => <li key={`event-${event.id}`} className="flex items-start justify-between gap-3 py-3"><span className="flex min-w-0 items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f5ef] text-[#247456]"><CheckCircle2 aria-hidden className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#29483d]">{event.action.replaceAll("_", " ")}</span><span className="block truncate text-xs text-[#7a8984]">{[event.entityType, event.entityRef, event.actor].filter(Boolean).join(" · ") || "Administrative event"}</span></span></span><time className="shrink-0 text-xs text-[#7a8984]">{checkedLabel(event.createdAt)}</time></li>)}
                  {!activity.length && recentImports.map((entry) => <li key={`import-activity-${entry.id}`} className="flex items-start justify-between gap-3 py-3"><span className="flex min-w-0 items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f5ef] text-[#247456]"><Upload aria-hidden className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#29483d]">Catalogue import recorded</span><span className="block truncate text-xs text-[#7a8984]">{entry.fileName ?? entry.datasetLabel} · {entry.recordCount} records</span></span></span><time className="shrink-0 text-xs text-[#7a8984]">{checkedLabel(entry.createdAt)}</time></li>)}
                  {!activity.length && !recentImports.length && <li className="py-8 text-center text-sm text-[#71817c]">No administrative activity has been recorded yet.</li>}
                </ul>
              </section>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-[#71817c]">Actionable review-queue items are limited to institution records. Course links and admission records are shown read-only until their own change-approval workflows exist; import validation errors and source refreshes are not stored by the current system.</p>
    </AdminPortalShell>
  );
}
