import Link from "next/link";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, GitCompareArrows } from "lucide-react";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import { catalogueSourceConflicts } from "@/db/schema";
import { availabilityLabel, sampleSourceConflict } from "@/lib/source-conflicts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Source conflicts · Change history" };
const dateLabel = (value: Date) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(value);
const statusLabel = (value: string) => value === "needs_decision" ? "Needs decision" : value === "kept_current" ? "Kept current" : value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function SourceConflictsQueuePage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/change-history/conflicts"));
  if (user.role !== "admin") redirect("/");
  let conflicts: (typeof catalogueSourceConflicts.$inferSelect)[] = [];
  let storeAvailable = true;
  try { conflicts = await db.select().from(catalogueSourceConflicts).orderBy(desc(catalogueSourceConflicts.detectedAt)).limit(200); }
  catch (error) { console.warn("[careerbridge] source conflict queue unavailable; apply migration 0007_source_conflict_resolution.sql", error); storeAvailable = false; conflicts = [sampleSourceConflict]; }
  const pendingCount = conflicts.filter((item) => item.status === "needs_decision").length;

  return <AdminPortalShell active="history" breadcrumb="Change history / Conflicts">
    <Link href="/admin/change-history" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#145c42] hover:bg-[#e9f3ee]"><ArrowLeft aria-hidden className="h-4 w-4" />Change history</Link>
    <header className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Change history</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Conflicting source values</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#53665e]">Compare authority and evidence. Conflicts remain unpublished until a reviewer records an explicit decision.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-[#ead8a9] bg-[#fff6df] px-3 py-1.5 text-xs font-bold text-[#805d13]"><GitCompareArrows aria-hidden className="h-4 w-4" />{pendingCount} needs decision</span></header>
    {!storeAvailable && <section className="mt-5 flex items-start gap-3 rounded-xl border border-[#efdfbd] bg-[#fff8e8] p-4 text-sm leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0" /><p>Showing a read-only sample because conflict storage is not installed. Apply <code className="rounded bg-[#fff0cf] px-1">src/db/migrations/0007_source_conflict_resolution.sql</code> to enable decisions.</p></section>}
    <section className="mt-5 overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9e5] px-4 py-4 sm:px-5"><div><h2 className="text-lg font-bold text-[#172b35]">Conflict queue</h2><p className="mt-1 text-sm text-[#53665e]">{conflicts.length} {conflicts.length === 1 ? "case" : "cases"} · {pendingCount} awaiting reviewer action</p></div></div>
      {conflicts.length ? <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-[#f4f7f5] text-xs font-bold uppercase tracking-wide text-[#53665e]"><tr><th className="px-5 py-3">Entity</th><th className="px-3 py-3">Field</th><th className="px-3 py-3">Current approved value</th><th className="px-3 py-3">Detected</th><th className="px-3 py-3">Sources</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">{conflicts.map((item) => <tr key={item.caseKey} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4"><Link href={`/admin/change-history/conflicts/${encodeURIComponent(item.caseKey)}`} className="font-semibold text-[#145c42] underline decoration-[#a9c8b9] underline-offset-2">{item.entityName}</Link>{item.isSample && <span className="ml-2 rounded-full border border-[#d6e6dc] bg-[#f2f8f4] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#426652]">Sample only</span>}</td><td className="px-3 py-4 text-[#455b51]">{item.fieldName}</td><td className="px-3 py-4 font-medium text-[#263d32]">{availabilityLabel(item.currentApprovedValue)}</td><td className="whitespace-nowrap px-3 py-4 text-xs text-[#53665e]">{dateLabel(item.detectedAt)}</td><td className="px-3 py-4 text-[#53665e]">{item.sources.length} evidence rows</td><td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${item.status === "needs_decision" ? "border-[#efdfbd] bg-[#fff5df] text-[#94610c]" : "border-[#d8e4dd] bg-[#edf5f0] text-[#426652]"}`}>{statusLabel(item.status)}</span></td></tr>)}</tbody></table></div> : <div className="px-5 py-14 text-center"><p className="font-semibold text-[#263d32]">No source conflicts are waiting for review</p><p className="mt-1 text-sm text-[#687970]">A source fetcher or authorized import can add conflicts here; this screen does not create them by guessing.</p></div>}
    </section>
    <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#d8e1dc] bg-[#edf2ef] p-3 text-xs leading-relaxed text-[#53665e]"><ArrowRight aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Newest is not automatically most authoritative. Open a case to compare source hierarchy and record a reasoned decision.</p>
  </AdminPortalShell>;
}
