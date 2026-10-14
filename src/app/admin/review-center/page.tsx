import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ReviewCenterWorkspace, type ReviewCenterItem } from "@/components/admin/review-center-workspace";
import { db } from "@/db";
import { catalogueChangeProposals, flags, institutionSources } from "@/db/schema";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review center · Admin workspace" };

const unavailableStatuses = new Set(["unavailable", "blocked", "source_unavailable"]);
const issueLabels: Record<string, string> = {
  incorrect_detail: "Incorrect detail", broken_application_link: "Broken application link", outdated_deadline: "Deadline may be outdated", wrong_course_availability: "Course availability", missing_source: "Missing source", other: "Other issue",
};
const entityLabels: Record<string, string> = { institution: "Institution", course: "Course", scholarship: "Scholarship", entrance_exam: "Entrance exam", opportunity: "Opportunity", institution_course: "Institution-course link" };

export default async function AdminReviewCenterPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/review-center"));
  if (user.role !== "admin") redirect("/");

  const items: ReviewCenterItem[] = [];
  const [institutions] = await Promise.all([getInstitutions({})]);
  const institutionNames = new Map(institutions.map((item) => [item.code, item.name]));

  try {
    const proposals = await db.select().from(catalogueChangeProposals).where(eq(catalogueChangeProposals.status, "needs_review")).orderBy(desc(catalogueChangeProposals.fetchedAt)).limit(250);
    for (const proposal of proposals) items.push({
      id: `proposal-${proposal.id}`, kind: "change", createdAt: proposal.createdAt.toISOString(), category: "Content change", entity: proposal.entityName,
      detail: `${proposal.fieldName.replaceAll("_", " ")}: ${proposal.currentValue || "No previous value"} → ${proposal.proposedValue}`,
      priority: "High priority", status: "Needs review", href: `/admin/change-history/proposed/${proposal.id}`, assignedTo: null,
    });
  } catch (error) { console.warn("[careerbridge] review center proposals unavailable", error); }

  try {
    const completed = await db.select().from(catalogueChangeProposals).where(inArray(catalogueChangeProposals.status, ["approved", "rejected"])).orderBy(desc(catalogueChangeProposals.updatedAt)).limit(100);
    for (const proposal of completed) items.push({
      id: `proposal-${proposal.id}`, kind: "change", createdAt: proposal.updatedAt.toISOString(), category: "Content change", entity: proposal.entityName,
      detail: `${proposal.fieldName.replaceAll("_", " ")}: ${proposal.currentValue || "No previous value"} → ${proposal.approvedValue || proposal.proposedValue}`,
      priority: "High priority", status: proposal.status === "approved" ? "Approved" : "Rejected", href: `/admin/change-history/proposed/${proposal.id}`, assignedTo: null,
    });
  } catch (error) { console.warn("[careerbridge] review center completed changes unavailable", error); }

  try {
    const sources = await db.select().from(institutionSources);
    for (const source of sources.filter((item) => unavailableStatuses.has(item.status))) items.push({
      id: `source-${source.id}`, kind: "source", createdAt: source.retrievedAt?.toISOString() ?? "", category: "Source problem",
      entity: source.title || institutionNames.get(source.institutionCode) || source.institutionCode,
      detail: `Source unavailable${source.url ? ` · ${source.url}` : " · previous approved value retained"}`,
      priority: "Needs attention", status: "Source unavailable", href: "/admin/sources/history", assignedTo: null,
    });
  } catch (error) { console.warn("[careerbridge] review center source problems unavailable", error); }

  try {
    const reports = await db.select().from(flags).orderBy(desc(flags.createdAt), desc(flags.id)).limit(500);
    for (const report of reports) {
      const resolved = report.status === "resolved" || report.status === "dismissed";
      const entity = report.entityType === "institution" ? institutionNames.get(report.entityRef) ?? report.entityRef : report.entityRef;
      items.push({
        id: `flag-${report.id}`, kind: "report", createdAt: report.createdAt.toISOString(), category: "Student report", entity,
        detail: `${issueLabels[report.issueType] ?? report.issueType}${report.reason ? ` · ${report.reason}` : ""}`,
        priority: "Normal priority", status: report.status === "in_review" ? "In review" : report.status === "resolved" ? "Resolved" : report.status === "dismissed" ? "Dismissed" : "Open",
        href: "/admin/feedback-flags", assignedTo: report.assignedTo,
      });
    }
  } catch (error) { console.warn("[careerbridge] review center student reports unavailable", error); }

  items.sort((a, b) => {
    const resolved = (item: ReviewCenterItem) => ["Resolved", "Dismissed", "Approved", "Rejected"].includes(item.status);
    const priority: Record<ReviewCenterItem["priority"], number> = { Blocking: 0, "High priority": 1, "Needs attention": 2, "Normal priority": 3 };
    return Number(resolved(a)) - Number(resolved(b)) || priority[a.priority] - priority[b.priority] || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return <AdminPortalShell active="queue" breadcrumb="Review queue / Review center">
    <ReviewCenterWorkspace items={items} currentUserEmail={user.email ?? ""} />
  </AdminPortalShell>;
}
