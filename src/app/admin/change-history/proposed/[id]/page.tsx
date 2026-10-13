import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { AlertTriangle, ArrowLeft, Clock3, ExternalLink, FileText } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ChangeProposalDecisionForm } from "@/components/admin/change-proposal-decision-form";
import { db } from "@/db";
import { catalogueChangeProposals } from "@/db/schema";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Proposed change ${((await params).id)} · Change history` };
}
const dateTimeLabel = (date: Date | string | null) => date ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(date)) : "Not recorded";
const fieldLabel = (value: string) => value.replaceAll("_", " ").replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()).trim();
const statusLabel = (status: string) => status === "needs_review" ? "Needs review" : status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default async function ProposedChangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent("/admin/change-history")}`);
  if (user.role !== "admin") redirect("/");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  let proposal: typeof catalogueChangeProposals.$inferSelect | null = null;
  let storageUnavailable = false;
  try { proposal = (await db.select().from(catalogueChangeProposals).where(eq(catalogueChangeProposals.id, id)).limit(1))[0] ?? null; }
  catch (error) { console.warn("[careerbridge] proposed change detail unavailable", error); storageUnavailable = true; }
  if (!proposal && !storageUnavailable) notFound();

  return <AdminPortalShell active="proposals" breadcrumb="Change history / Proposed change">
    <Link href="/admin/change-history" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#145c42] hover:bg-[#e9f3ee]"><ArrowLeft aria-hidden className="h-4 w-4"/>Change history</Link>
    {storageUnavailable || !proposal ? <section className="mt-5 rounded-xl border border-[#efdfbd] bg-[#fff8e8] p-5 text-sm leading-relaxed text-[#71551d]"><div className="flex items-start gap-3"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0"/><div><h1 className="font-bold">Proposal review storage is not available</h1><p className="mt-1">Apply the catalogue change proposals migration before reviewing proposed changes.</p></div></div></section> : <>
      <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.95fr)]">
        <div className="min-w-0 space-y-4">
          <header className="flex flex-wrap items-start gap-3"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff0cf] text-[#a66d08]"><Clock3 className="h-6 w-6"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h1 className="font-serif text-2xl font-semibold tracking-tight text-[#17392f] sm:text-3xl">{proposal.fieldName === "deadlineNote" ? "Deadline change detected" : `${fieldLabel(proposal.fieldName)} change detected`}</h1><span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${proposal.status === "needs_review" ? "border-[#efdfbd] bg-[#fff5df] text-[#94610c]" : "border-[#d8e4dd] bg-[#edf5f0] text-[#426652]"}`}>{proposal.status === "needs_review" && <Clock3 aria-hidden className="h-3.5 w-3.5"/>}{statusLabel(proposal.status)}</span></div><p className="mt-1 text-sm leading-relaxed text-[#53665e]">Compare the current approved value with the new evidence before publishing.</p></div></header>
          <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="comparison-title"><h2 id="comparison-title" className="text-lg font-bold tracking-tight text-[#172b35]">Change comparison</h2><dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-[200px_minmax(0,1fr)]"><dt className="text-[#687970]">Entity</dt><dd className="font-semibold text-[#263d32]">{proposal.entityName}</dd><dt className="text-[#687970]">Field</dt><dd className="font-medium text-[#263d32]">{fieldLabel(proposal.fieldName)}</dd><dt className="self-center text-[#687970]">Current approved value</dt><dd className="rounded-md bg-[#f0f3f4] px-3 py-2.5 text-[#263d32]">{proposal.currentValue?.trim() || "No approved value is recorded"}</dd><dt className="self-center text-[#687970]">Proposed value</dt><dd className="rounded-md bg-[#fff4e2] px-3 py-2.5 font-medium text-[#533d1c]">{proposal.proposedValue}</dd></dl><div className="mt-4 border-t border-[#e5ebe8] pt-4"><dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[200px_minmax(0,1fr)]"><dt className="text-[#687970]">Evidence source</dt><dd className="font-medium text-[#263d32]">{proposal.sourceType || "Official source"}</dd><dt className="text-[#687970]">Source URL</dt><dd>{proposal.sourceUrl ? <a href={proposal.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 break-all text-[#1768a5] underline">{proposal.sourceUrl}<ExternalLink aria-hidden className="h-3.5 w-3.5 shrink-0"/></a> : <span className="text-[#687970]">Not recorded</span>}</dd><dt className="text-[#687970]">Fetched date</dt><dd className="text-[#263d32]">{dateTimeLabel(proposal.fetchedAt)}</dd></dl>{proposal.sourceSnapshotUrl && <a href={proposal.sourceSnapshotUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f5f8f6]"><ExternalLink aria-hidden className="h-4 w-4"/>Open source snapshot</a>}</div></section>
          <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5" aria-labelledby="evidence-title"><h2 id="evidence-title" className="text-lg font-bold tracking-tight text-[#172b35]">Evidence excerpt</h2><div className="mt-3 flex gap-3 rounded-lg border border-[#e2e9e5] bg-[#f7f9f8] p-4"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e3f3ed] text-[#176b5d]"><FileText className="h-5 w-5"/></span><div className="min-w-0 flex-1"><p className="text-xs font-medium text-[#687970]">Excerpt from source{proposal.sourceType ? ` (${proposal.sourceType})` : ""}</p><blockquote className="mt-2 rounded-md border-l-4 border-[#176b5d] bg-white px-4 py-3 text-sm leading-relaxed text-[#263d32]">{proposal.evidenceExcerpt || "No source excerpt was saved with this proposal. Open the source to verify the proposed value."}</blockquote></div></div></section>
        </div>
        <aside className="xl:sticky xl:top-5 xl:self-start"><ChangeProposalDecisionForm proposalId={proposal.id} proposedValue={proposal.proposedValue} currentStatus={proposal.status}/></aside>
      </div>
      <section className="mt-5 overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="decisions-title"><h2 id="decisions-title" className="px-4 py-4 text-lg font-bold tracking-tight text-[#172b35] sm:px-5">Previous decisions</h2>{proposal.decisionHistory.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f4f7f5] text-xs font-bold text-[#53665e]"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Note</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">{proposal.decisionHistory.slice().reverse().map((decision, index) => <tr key={`${decision.createdAt}-${index}`}><td className="whitespace-nowrap px-4 py-3 text-[#53665e]">{dateTimeLabel(decision.createdAt)}</td><td className="px-4 py-3"><span className="rounded-full border border-[#d6e7dd] bg-[#edf5f0] px-2.5 py-1 text-xs font-bold text-[#426652]">{fieldLabel(decision.action)}</span></td><td className="px-4 py-3 text-[#263d32]">{decision.actor}</td><td className="max-w-64 px-4 py-3 text-[#263d32]">{decision.value || "—"}</td><td className="max-w-80 px-4 py-3 text-[#53665e]">{decision.note || "—"}</td></tr>)}</tbody></table></div> : <p className="px-4 pb-5 text-sm text-[#687970]">No decisions have been recorded for this proposal yet.</p>}</section>
    </>}
  </AdminPortalShell>;
}
