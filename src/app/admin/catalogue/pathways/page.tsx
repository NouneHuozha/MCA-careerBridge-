import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { PathwaysOpportunitiesWorkspace } from "@/components/admin/pathways-opportunities-workspace";
import { getAllInstitutionCourseLinks, getCourses, getExams, getFields, getOpportunities, getPathways } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pathways and opportunities · Admin workspace" };

export default async function AdminPathwaysPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/pathways"));
  if (user.role !== "admin") redirect("/");
  const [{ tab }, pathways, opportunities, courses, institutionLinks, fields, exams] = await Promise.all([
    searchParams,
    getPathways(),
    getOpportunities(),
    getCourses(),
    getAllInstitutionCourseLinks(),
    getFields(),
    getExams(),
  ]);
  const initialTab = tab === "opportunities" ? "opportunities" : "pathways";

  return <AdminPortalShell active="catalogue" referenceNav breadcrumb="Catalogue / Pathways and opportunities">
    <PathwaysOpportunitiesWorkspace pathways={pathways} opportunities={opportunities} courses={courses} institutionLinks={institutionLinks} fields={fields} exams={exams} initialTab={initialTab} />
  </AdminPortalShell>;
}
