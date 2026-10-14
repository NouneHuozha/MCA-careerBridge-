import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { InstitutionCourseLinksWorkspace } from "@/components/admin/institution-course-links-workspace";
import { getAllInstitutionCourseLinks, getCourses, getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Course availability by institution · Admin catalogue" };

export default async function InstitutionCourseLinksPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/institution-courses"));
  if (user.role !== "admin") redirect("/");
  const [links, institutions, courses] = await Promise.all([getAllInstitutionCourseLinks(), getInstitutions({}), getCourses({})]);
  const institutionByCode = new Map(institutions.map((item) => [item.code, item]));
  const courseBySlug = new Map(courses.map((item) => [item.slug, item]));
  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Institution-course links">
    <InstitutionCourseLinksWorkspace
      initialLinks={links.map((link) => ({
        id: link.id,
        institutionCode: link.institutionCode,
        institutionName: institutionByCode.get(link.institutionCode)?.name ?? link.institutionCode,
        district: institutionByCode.get(link.institutionCode)?.district ?? "",
        courseSlug: link.courseSlug,
        courseName: courseBySlug.get(link.courseSlug)?.name ?? link.courseSlug,
        availability: link.verificationStatus,
        seatsNote: link.seatsNote ?? "",
        feeNote: link.feeNote ?? "",
        sourceUrl: link.sourceUrl ?? "",
        lastVerifiedAt: link.lastVerifiedAt?.toISOString() ?? null,
      }))}
      institutions={institutions.map((item) => ({ code: item.code, name: item.name, district: item.district }))}
      courses={courses.map((item) => ({ slug: item.slug, name: item.name }))}
    />
  </AdminPortalShell>;
}
