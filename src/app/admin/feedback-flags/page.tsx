import { desc, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { FeedbackFlagsWorkspace, type FeedbackFlagRow } from "@/components/admin/feedback-flags-workspace";
import { db } from "@/db";
import { flags, users } from "@/db/schema";
import { getCourses, getExams, getInstitutions, getOpportunities, getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feedback flags · Admin workspace" };

export default async function AdminFeedbackFlagsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/feedback-flags")}`);
  if (user.role !== "admin") redirect("/");
  let records: (typeof flags.$inferSelect)[] = [];
  let storageAvailable = true;
  try { records = await db.select().from(flags).orderBy(desc(flags.createdAt), desc(flags.id)).limit(500); }
  catch (error) { storageAvailable = false; console.warn("[careerbridge] feedback flag storage unavailable; apply migration 0003_feedback_flag_review.sql", error); }
  const [institutions, courses, scholarships, exams, opportunities] = await Promise.all([getInstitutions({}), getCourses(), getScholarships(), getExams(), getOpportunities()]);
  const names = new Map<string, string>();
  institutions.forEach((item) => names.set(`institution:${item.code}`, item.name));
  courses.forEach((item) => names.set(`course:${item.slug}`, item.name));
  scholarships.forEach((item) => names.set(`scholarship:${item.slug}`, item.name));
  exams.forEach((item) => names.set(`entrance_exam:${item.slug}`, item.shortName ?? item.name));
  opportunities.forEach((item) => names.set(`opportunity:${item.slug}`, item.title));
  let reporterNames = new Map<number, string>();
  try {
    const userIds = [...new Set(records.flatMap((item) => item.userId ? [item.userId] : []))];
    if (userIds.length) {
      const reporterRows = await db.select({ id: users.id, fullName: users.fullName, email: users.email }).from(users).where(inArray(users.id, userIds));
      reporterNames = new Map(reporterRows.map((item) => [item.id, item.fullName || item.email]));
    }
  } catch (error) { console.warn("[careerbridge] feedback reporter names unavailable", error); }
  const rows: FeedbackFlagRow[] = records.map((item) => ({
    id: item.id,
    entityType: item.entityType,
    entityRef: item.entityRef,
    entityName: names.get(`${item.entityType}:${item.entityRef}`) ?? item.entityRef,
    issueType: item.issueType,
    reason: item.reason,
    sourceUrl: item.sourceUrl,
    status: item.status,
    assignedTo: item.assignedTo,
    resolutionReason: item.resolutionReason,
    createdAt: item.createdAt.toISOString(),
    reporter: item.userId ? reporterNames.get(item.userId) ?? "Student" : "Student",
  }));
  return <AdminPortalShell active="flags" breadcrumb="Review queue / Feedback flags">{storageAvailable ? <FeedbackFlagsWorkspace rows={rows} /> : <section className="flex items-start gap-3 rounded-xl border border-[#efdfbd] bg-[#fff8e8] p-5 text-sm leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0"/><div><h1 className="font-bold">Feedback flag review storage is unavailable</h1><p className="mt-1">Apply <code className="rounded bg-[#fff0cf] px-1">src/db/migrations/0003_feedback_flag_review.sql</code> to enable issue categories, assignment, and closure reasons.</p></div></section>}</AdminPortalShell>;
}
