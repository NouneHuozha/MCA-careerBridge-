import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ChangeHistoryWorkspace, type HistoryEntry } from "@/components/admin/change-history-workspace";
import { db } from "@/db";
import { auditEvents } from "@/db/schema";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Change history · Admin workspace" };

function dateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function AdminChangeHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/change-history")}`);
  if (user.role !== "admin") redirect("/");

  let records: (typeof auditEvents.$inferSelect)[] = [];
  try {
    records = await db.select().from(auditEvents).orderBy(desc(auditEvents.createdAt), desc(auditEvents.id)).limit(500);
  } catch (error) {
    console.warn("[careerbridge] change history unavailable", error);
  }
  const institutions = await getInstitutions({});
  const namesByCode = new Map(institutions.map((institution) => [institution.code, institution.name]));
  const entries: HistoryEntry[] = records.map((event) => ({
    id: event.id,
    actor: event.actor ?? "System",
    action: event.action,
    entityType: event.entityType ?? "other",
    entityRef: event.entityRef ?? "",
    entityName: event.entityType === "institution" && event.entityRef ? namesByCode.get(event.entityRef) ?? event.entityRef : event.entityRef || "Unspecified record",
    metadata: event.metadata ?? {},
    createdAt: event.createdAt.toISOString(),
  }));
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 30);
  return <AdminPortalShell active="history" breadcrumb="Change history"><ChangeHistoryWorkspace entries={entries} initialFrom={dateOnly(from)} initialTo={dateOnly(now)} /></AdminPortalShell>;
}
