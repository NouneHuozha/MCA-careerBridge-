import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ChangeHistoryWorkspace, type HistoryEntry } from "@/components/admin/change-history-workspace";
import { PendingChangeProposals } from "@/components/admin/pending-change-proposals";
import { db } from "@/db";
import { auditEvents, catalogueChangeProposals, users } from "@/db/schema";
import { getCourses, getInstitutions, getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Change history · Admin workspace" };

function actorFallback(value: string | null) {
  if (!value) return "System";
  if (!value.includes("@")) return value;
  return value.split("@")[0].split(/[._-]+/).filter(Boolean).map((part) => part.length === 1 ? `${part.toUpperCase()}.` : part[0].toUpperCase() + part.slice(1)).join(" ");
}

function dateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function AdminChangeHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent("/admin/change-history")}`);
  if (user.role !== "admin") redirect("/");

  let records: (typeof auditEvents.$inferSelect)[] = [];
  try {
    records = await db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt), desc(auditEvents.id)).limit(500);
  } catch (error) {
    console.warn("[careerbridge] change history unavailable", error);
  }
  let pendingProposals: (typeof catalogueChangeProposals.$inferSelect)[] = [];
  let proposalStoreAvailable = true;
  try {
    pendingProposals = await db.select().from(catalogueChangeProposals).where(eq(catalogueChangeProposals.status, "needs_review")).orderBy(desc(catalogueChangeProposals.fetchedAt)).limit(20);
  } catch (error) {
    proposalStoreAvailable = false;
    console.warn("[careerbridge] proposal review queue unavailable; apply migration 0002_catalogue_change_proposals.sql", error);
  }
  let namesByEmail = new Map<string, string>();
  try {
    const actorEmails = [...new Set(records.flatMap((event) => event.actor?.includes("@") ? [event.actor.toLowerCase()] : []))];
    if (actorEmails.length) {
      const userNames = await db.select({ email: users.email, fullName: users.fullName }).from(users).where(inArray(users.email, actorEmails));
      namesByEmail = new Map(userNames.filter((item) => item.fullName).map((item) => [item.email.toLowerCase(), item.fullName!]));
    }
  } catch (error) {
    console.warn("[careerbridge] actor names unavailable; using audit actor identifiers", error);
  }
  const [institutions, courses, scholarships] = await Promise.all([getInstitutions({}), getCourses(), getScholarships()]);
  const namesByCode = new Map(institutions.map((institution) => [institution.code, institution.name]));
  const namesByCourse = new Map(courses.map((course) => [course.slug, course.name]));
  const namesByScholarship = new Map(scholarships.map((scholarship) => [scholarship.slug, scholarship.name]));
  const entries: HistoryEntry[] = records.map((event) => ({
    id: event.id,
    actor: event.actor ? namesByEmail.get(event.actor.toLowerCase()) ?? actorFallback(event.actor) : "System",
    actorEmail: event.actor?.includes("@") ? event.actor : null,
    action: event.action,
    entityType: event.entityType ?? "other",
    entityRef: event.entityRef ?? "",
    entityName: event.entityType === "source" && typeof event.metadata?.sourceTitle === "string"
      ? event.metadata.sourceTitle
      : event.entityType === "institution" && event.entityRef
        ? namesByCode.get(event.entityRef) ?? event.entityRef
      : event.entityType === "source_conflict" && typeof event.metadata?.entityName === "string"
        ? event.metadata.entityName
      : event.entityType === "course" && event.entityRef
          ? namesByCourse.get(event.entityRef) ?? event.entityRef
        : event.entityType === "institution_course" && event.metadata && typeof event.metadata.institutionName === "string" && typeof event.metadata.courseName === "string"
          ? `${event.metadata.institutionName} — ${event.metadata.courseName}`
        : event.entityType === "scholarship" && event.entityRef
          ? namesByScholarship.get(event.entityRef) ?? event.entityRef
        : event.entityRef || "Unspecified record",
    metadata: event.metadata ?? {},
    createdAt: event.createdAt.toISOString(),
  }));
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return <AdminPortalShell active="history" breadcrumb="Change history"><div className="space-y-5"><PendingChangeProposals available={proposalStoreAvailable} proposals={pendingProposals.map((proposal) => ({ id: proposal.id, entityName: proposal.entityName, fieldName: proposal.fieldName, currentValue: proposal.currentValue, proposedValue: proposal.proposedValue, sourceUrl: proposal.sourceUrl, fetchedAt: proposal.fetchedAt.toISOString() }))} /><Link href="/admin/change-history/conflicts" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm transition hover:border-[#a9c8b9] hover:bg-[#f8fbf9] sm:px-5"><div><p className="text-xs font-bold uppercase tracking-wide text-[#65776e]">Screen 21 · Conflict review</p><h2 className="mt-1 font-bold text-[#172b35]">Conflicting source values</h2><p className="mt-1 text-sm text-[#596a63]">Compare source authority, dates and evidence before recording an explicit decision.</p></div><span className="inline-flex min-h-10 items-center rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white">Open conflict queue</span></Link><ChangeHistoryWorkspace entries={entries} initialFrom={dateOnly(from)} initialTo={dateOnly(to)} /></div></AdminPortalShell>;
}
