import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, ExternalLink, Search } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import { catalogueChangeProposals } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Proposed changes · Change history" };
const dateLabel = (date: Date) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
const statusNames: Record<string, string> = { needs_review: "Needs review", approved: "Approved", kept_current: "Kept current", rejected: "Rejected" };

export default async function ProposedChangesQueuePage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent("/admin/change-history/proposed")}`);
  if (user.role !== "admin") redirect("/");
  const params = await searchParams;
  const selectedStatus = ["needs_review", "approved", "kept_current", "rejected", "all"].includes(params.status ?? "") ? params.status ?? "needs_review" : "needs_review";
  const query = params.q?.trim().slice(0, 120).toLowerCase() ?? "";
  let proposals: (typeof catalogueChangeProposals.$inferSelect)[] = [];
  let storeAvailable = true;
  try {
    proposals = await db.select().from(catalogueChangeProposals).where(selectedStatus === "all" ? undefined : eq(catalogueChangeProposals.status, selectedStatus)).orderBy(desc(catalogueChangeProposals.fetchedAt)).limit(200);
  } catch (error) {
    storeAvailable = false;
    console.warn("[careerbridge] proposal queue unavailable; apply migration 0002_catalogue_change_proposals.sql", error);
  }
  const filtered = proposals.filter((item) => !query || `${item.entityName} ${item.entityRef} ${item.fieldName} ${item.currentValue ?? ""} ${item.proposedValue}`.toLowerCase().includes(query));
  const counts = {
    needs_review: proposals.filter((item) => item.status === "needs_review").length,
    approved: proposals.filter((item) => item.status === "approved").length,
    kept_current: proposals.filter((item) => item.status === "kept_current").length,
    rejected: proposals.filter((item) => item.status === "rejected").length,
  };
  const tabHref = (status: string) => `/admin/change-history/proposed?status=${status}`;

  return <AdminPortalShell active="proposals" breadcrumb="Change history / Proposed changes">
    <Link href="/admin/change-history" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#145c42] hover:bg-[#e9f3ee]"><ArrowLeft aria-hidden className="h-4 w-4"/>Change history</Link>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Change history</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Proposed changes</h1><p className="mt-2 text-sm text-[#53665e]">Review source evidence and decide whether changes should reach the student catalogue.</p></div><form method="get" action="/admin/change-history/proposed" className="relative w-full sm:max-w-sm"><input type="hidden" name="status" value={selectedStatus}/><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]"/><input type="search" name="q" defaultValue={params.q ?? ""} aria-label="Search proposed changes" placeholder="Search proposals…" className="h-11 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/></form></div>
    <nav aria-label="Proposal status" className="mt-5 flex gap-2 overflow-x-auto border-b border-[#d7e1dc]">{[["needs_review", `Needs review (${counts.needs_review})`], ["approved", `Approved (${counts.approved})`], ["kept_current", `Kept current (${counts.kept_current})`], ["rejected", `Rejected (${counts.rejected})`], ["all", "All"]].map(([status, label]) => <Link key={status} href={tabHref(status)} aria-current={selectedStatus === status ? "page" : undefined} className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${selectedStatus === status ? "border-[#145c42] text-[#145c42]" : "border-transparent text-[#687970] hover:text-[#344b41]"}`}>{label}</Link>)}</nav>
    {!storeAvailable ? <section className="mt-5 flex items-start gap-3 rounded-xl border border-[#efdfbd] bg-[#fff8e8] p-5 text-sm leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0"/><div><h2 className="font-bold">Proposal storage is not set up in this database</h2><p className="mt-1">Apply <code className="rounded bg-[#fff0cf] px-1">src/db/migrations/0002_catalogue_change_proposals.sql</code> to create the proposal queue and enable detail pages and decisions. The source fetcher is not yet implemented, so applying the migration alone will not create proposals.</p></div></section> : <section className="mt-5 overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9e5] px-4 py-4 sm:px-5"><div><h2 className="text-lg font-bold text-[#172b35]">{filtered.length} {filtered.length === 1 ? "proposal" : "proposals"}</h2><p className="mt-1 text-sm text-[#53665e]">{selectedStatus === "needs_review" ? "Waiting for reviewer action" : selectedStatus === "all" ? "All recorded proposal decisions" : statusNames[selectedStatus]}</p></div></div>{filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#f4f7f5] text-xs font-bold uppercase tracking-wide text-[#53665e]"><tr><th className="px-5 py-3">Entity</th><th className="px-3 py-3">Field</th><th className="px-3 py-3">Current value</th><th className="px-3 py-3">Proposed value</th><th className="px-3 py-3">Source</th><th className="px-3 py-3">Fetched</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">{filtered.map((proposal) => <tr key={proposal.id} className="hover:bg-[#fbfcfb]"><td className="px-5 py-4"><Link href={`/admin/change-history/proposed/${proposal.id}`} className="font-semibold text-[#145c42] underline decoration-[#a9c8b9] underline-offset-2">{proposal.entityName}</Link><span className="mt-0.5 block text-xs text-[#718078]">{proposal.entityType} · {proposal.entityRef}</span></td><td className="px-3 py-4 text-[#455b51]">{proposal.fieldName.replaceAll("_", " ")}</td><td className="max-w-44 truncate px-3 py-4 text-[#53665e]" title={proposal.currentValue ?? "Not recorded"}>{proposal.currentValue || "Not recorded"}</td><td className="max-w-44 truncate px-3 py-4 font-medium text-[#73521b]" title={proposal.proposedValue}>{proposal.proposedValue}</td><td className="px-3 py-4">{proposal.sourceUrl ? <a href={proposal.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#17634b] underline">Open source<ExternalLink aria-hidden className="h-3 w-3"/></a> : <span className="text-xs text-[#718078]">Not recorded</span>}</td><td className="whitespace-nowrap px-3 py-4 text-xs text-[#53665e]">{dateLabel(proposal.fetchedAt)}</td><td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${proposal.status === "needs_review" ? "border-[#efdfbd] bg-[#fff5df] text-[#94610c]" : "border-[#d8e4dd] bg-[#edf5f0] text-[#426652]"}`}>{statusNames[proposal.status] ?? proposal.status}</span></td></tr>)}</tbody></table></div> : <div className="px-5 py-14 text-center"><p className="font-semibold text-[#263d32]">{query ? "No proposals match your search" : selectedStatus === "needs_review" ? "No proposed changes are waiting for review" : "No proposals in this status"}</p><p className="mt-1 text-sm leading-relaxed text-[#687970]">{selectedStatus === "needs_review" && !query ? "New proposals will appear here when an authorized source process submits them. The automated fetcher is not active yet." : "Try another status or search term."}</p>{query && <Link href={tabHref(selectedStatus)} className="mt-3 inline-flex text-sm font-bold text-[#145c42] underline">Clear search</Link>}</div>}</section>}
    <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#d8e1dc] bg-[#edf2ef] p-3 text-xs leading-relaxed text-[#53665e]"><ArrowRight aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>Open a proposal row to compare evidence and record a review decision. Decision history is retained for audit purposes.</p>
  </AdminPortalShell>;
}
