import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { ArrowLeft, ExternalLink, FileText, Info } from "lucide-react";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import { auditEvents } from "@/db/schema";

export const dynamic = "force-dynamic";

const pretty = (value: string) => value.replaceAll("_", " ").replace(/([A-Z])/g, " $1").replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
const asText = (value: unknown, fallback = "Not recorded"): string => value === null || value === undefined || value === "" ? fallback : typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value);
const safeUrl = (value: unknown) => {
  if (typeof value !== "string") return null;
  try { const parsed = new URL(value); return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : null; } catch { return null; }
};
const dateTime = (value: Date) => new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(value);

function recordHref(entityType: string, entityRef: string) {
  if (!entityRef) return null;
  const ref = encodeURIComponent(entityRef);
  if (entityType === "institution") return `/admin/catalogue/institutions/${ref}`;
  if (entityType === "course") return `/admin/catalogue/courses/${ref}`;
  if (entityType === "scholarship") return `/admin/catalogue/scholarships/${ref}`;
  if (entityType === "exam") return `/admin/catalogue/exams/${ref}`;
  return null;
}

function lifecycleFor(action: string, metadata: Record<string, unknown>) {
  const normalized = action.toLowerCase();
  if (normalized.includes("reject") || metadata.status === "rejected") return [
    { label: "Detected", state: "done" }, { label: "Reviewed", state: "done" }, { label: "Rejected", state: "current" }, { label: "Published", state: "skipped" },
  ];
  if (normalized.includes("approve") || normalized.includes("verified") || metadata.status === "approved" || metadata.status === "published") return [
    { label: "Detected", state: "done" }, { label: "Reviewed", state: "done" }, { label: "Approved", state: "done" }, { label: metadata.status === "published" ? "Published" : "Recorded", state: "current" },
  ];
  if (normalized.includes("propos") || normalized.includes("detect")) return [
    { label: "Detected", state: "done" }, { label: "Reviewed", state: "current" }, { label: "Approved", state: "pending" }, { label: "Published", state: "pending" },
  ];
  return [
    { label: "Recorded", state: "done" }, { label: "Reviewed", state: "pending" }, { label: "Approved", state: "pending" }, { label: "Published", state: "pending" },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: `Audit event ${((await params).id)} · Change history` };
}

export default async function AuditEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect(`/admin/change-history/${(await params).id}`));
  if (user.role !== "admin") redirect("/");
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) notFound();

  let event: typeof auditEvents.$inferSelect | null = null;
  try { event = (await db.select().from(auditEvents).where(eq(auditEvents.id, id)).limit(1))[0] ?? null; }
  catch (error) { console.warn("[careerbridge] audit event detail unavailable", error); }
  if (!event) notFound();

  const metadata = event.metadata ?? {};
  const entityType = event.entityType ?? "other";
  const entityRef = event.entityRef ?? "";
  const entityName = typeof metadata.entityName === "string" ? metadata.entityName : entityRef || "Unspecified record";
  const fieldName = typeof metadata.fieldName === "string" ? pretty(metadata.fieldName) : Array.isArray(metadata.changedFields) ? metadata.changedFields.map((field) => pretty(String(field))).join(", ") : "Catalogue update";
  const previous = metadata.currentValue ?? metadata.previousValue ?? metadata.oldValue ?? metadata.previous;
  const next = metadata.approvedValue ?? metadata.newValue ?? metadata.proposedValue ?? metadata.next ?? metadata.status;
  const sourceUrl = safeUrl(metadata.sourceUrl ?? metadata.url ?? metadata.evidenceSource);
  const sourceSnapshotUrl = safeUrl(metadata.sourceSnapshotUrl);
  const sourceLabel = typeof metadata.sourceType === "string" ? pretty(metadata.sourceType) : typeof metadata.sourceTitle === "string" ? metadata.sourceTitle : sourceUrl ? new URL(sourceUrl).hostname : "Not recorded";
  const actionLabel = pretty(event.action);
  const reviewNote = asText(metadata.reviewNote ?? metadata.note, "No review note was recorded.");
  const proposalId = Number(metadata.proposalId);
  const proposalHref = Number.isSafeInteger(proposalId) && proposalId > 0 ? `/admin/change-history/proposed/${proposalId}` : null;
  const catalogueHref = recordHref(entityType, entityRef);
  const lifecycle = lifecycleFor(event.action, metadata);
  let relatedEvents: (typeof auditEvents.$inferSelect)[] = [];
  if (entityRef) {
    try { relatedEvents = await db.select().from(auditEvents).where(and(eq(auditEvents.entityType, entityType), eq(auditEvents.entityRef, entityRef), ne(auditEvents.id, id))).orderBy(desc(auditEvents.createdAt)).limit(5); }
    catch (error) { console.warn("[careerbridge] related audit events unavailable", error); }
  }

  return <AdminPortalShell active="history" breadcrumb="Change history / Audit event">
    <div className="space-y-4">
      <Link href="/admin/change-history" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#145c42] hover:bg-[#e9f3ee]"><ArrowLeft aria-hidden className="h-4 w-4" />Change history</Link>
      <header className="border-b border-[#dce5e0] pb-4"><p className="text-xs font-bold uppercase tracking-wide text-[#53665e]">Change history / Audit event</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-[#142e27]">Audit event detail</h1><p className="mt-1.5 text-sm text-[#53665e]">Review who changed a catalogue value, why it changed, and what evidence supported the action.</p></header>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.85fr)]">
        <div className="space-y-4">
          <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="event-details-heading"><div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="event-details-heading" className="text-base font-bold text-[#263d32]">Audit event details</h2><p className="mt-0.5 text-xs text-[#687970]">Full record of a catalogue action · no student data included.</p></div><dl className="divide-y divide-[#e7ece9] px-4">{[
            ["Event type", actionLabel], ["Actor", event.actor || "System"], ["Date and time", dateTime(event.createdAt)], ["Entity", entityName], ["Field", fieldName], ["Previous value", asText(previous)], ["New value", asText(next)], ["Source", sourceLabel], ["Review note", reviewNote],
          ].map(([label, value]) => <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[minmax(150px,.6fr)_minmax(0,1fr)]"><dt className="text-xs font-medium text-[#687970]">{label}</dt><dd className="break-words text-sm text-[#344b41]">{value}</dd></div>)}</dl></section>

          <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="related-links-heading"><div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="related-links-heading" className="text-base font-bold text-[#263d32]">Related links</h2></div><div className="flex flex-wrap gap-2 p-4">{catalogueHref && <Link href={catalogueHref} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">View catalogue record</Link>}{sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">View source evidence<ExternalLink aria-hidden className="h-3.5 w-3.5" /></a>}{sourceSnapshotUrl && <a href={sourceSnapshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Open source snapshot<ExternalLink aria-hidden className="h-3.5 w-3.5" /></a>}{proposalHref && <Link href={proposalHref} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]">View related change</Link>}{!catalogueHref && !sourceUrl && !sourceSnapshotUrl && !proposalHref && <p className="text-xs text-[#687970]">No linked catalogue record or evidence URL was stored with this event.</p>}</div></section>
          <details className="rounded-xl border border-[#d7e1dc] bg-white px-4 py-3 shadow-sm"><summary className="cursor-pointer text-sm font-semibold text-[#344b41]">Show full recorded metadata</summary><dl className="mt-3 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-[180px_1fr]">{Object.entries(metadata).map(([key, value]) => <div key={key} className="contents"><dt className="font-medium text-[#687970]">{pretty(key)}</dt><dd className="break-all text-[#344b41]">{asText(value)}</dd></div>)}</dl></details>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="lifecycle-heading"><div className="border-b border-[#e2e9e5] pb-3"><h2 id="lifecycle-heading" className="text-base font-bold text-[#263d32]">Change lifecycle</h2><p className="mt-0.5 text-xs text-[#687970]">Progress inferred from this event’s recorded action and status.</p></div><ol className="mt-4 grid grid-cols-4 gap-2">{lifecycle.map((step, index) => <li key={`${step.label}-${index}`} className="relative text-center"><span className={`mx-auto grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${step.state === "done" ? "bg-[#e6f3ec] text-[#267252]" : step.state === "current" ? "bg-[#dcefe5] text-[#17634b] ring-2 ring-[#b7d9c7]" : step.state === "skipped" ? "bg-[#f1f3f2] text-[#89958f]" : "bg-[#f1f3f2] text-[#89958f]"}`}>{index + 1}</span>{index < lifecycle.length - 1 && <span aria-hidden className="absolute left-[calc(50%+16px)] right-[calc(-50%+16px)] top-3.5 h-px bg-[#dfe8e3]" />}<span className="mt-1.5 block text-[10px] font-medium text-[#53665e]">{step.label}</span></li>)}</ol></section>

          <section className="rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="before-after-heading"><div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="before-after-heading" className="text-base font-bold text-[#263d32]">Before and after</h2><p className="mt-0.5 text-xs text-[#687970]">{actionLabel}</p></div><div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><div className="min-w-0"><p className="text-[11px] text-[#687970]">Field</p><p className="mt-0.5 break-words text-sm font-semibold text-[#344b41]">{fieldName}</p></div><div className="min-w-0"><p className="text-[11px] text-[#687970]">Previous value</p><p className="mt-0.5 break-words text-sm font-semibold text-[#344b41]">{asText(previous)}</p></div><div className="min-w-0"><p className="text-[11px] text-[#687970]">New value</p><p className="mt-0.5 break-words text-sm font-semibold text-[#17634b]">{asText(next)}</p></div><div className="min-w-0"><p className="text-[11px] text-[#687970]">Review note</p><p className="mt-0.5 break-words text-sm font-semibold text-[#344b41]">{reviewNote}</p></div></div></section>

          {relatedEvents.length > 0 && <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="related-events-heading"><h2 id="related-events-heading" className="text-base font-bold text-[#263d32]">Related events</h2><ul className="mt-2 divide-y divide-[#e7ece9]">{relatedEvents.map((related) => <li key={related.id} className="py-2"><Link href={`/admin/change-history/${related.id}`} className="flex items-start justify-between gap-2 text-xs text-[#344b41] hover:text-[#17634b]"><span><span className="font-semibold">{pretty(related.action)}</span><span className="mt-0.5 block text-[#687970]">{dateTime(related.createdAt)}</span></span><FileText aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /></Link></li>)}</ul></section>}
          <p className="flex items-start gap-2 rounded-lg border border-[#dce8e1] bg-[#f7faf8] px-3 py-2.5 text-xs leading-relaxed text-[#53665e]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Audit details are read-only. This record does not itself edit or republish catalogue values.</p>
        </aside>
      </div>
    </div>
  </AdminPortalShell>;
}
