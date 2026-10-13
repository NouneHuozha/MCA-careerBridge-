import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { CourseReviewWorkspace } from "@/components/admin/course-review-workspace";
import { getCourse, getFields, getInstitutionLinksForCourse, getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
const VERIFIED_STATUSES = new Set(["verified", "current", "published_verified", "recently_verified"]);
function isFreshVerification(status: string, checkedAt: Date | null) {
  return VERIFIED_STATUSES.has(status.toLowerCase()) && Boolean(checkedAt) && checkedAt!.getTime() >= Date.now() - 90 * 86_400_000;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const course = await getCourse((await params).slug);
  return { title: course ? `${course.name} · Admin catalogue` : "Course review · Admin catalogue" };
}
export default async function AdminCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/admin/catalogue/courses/${slug}`)}`);
  if (user.role !== "admin") notFound();
  const course = await getCourse(slug);
  if (!course) notFound();
  const [fields, links, institutions] = await Promise.all([getFields(), getInstitutionLinksForCourse(slug), getInstitutions({})]);
  const fieldsBySlug = new Map(fields.map((field) => [field.slug, field.name]));
  const institutionsByCode = new Map(institutions.map((institution) => [institution.code, institution.name]));
  return <AdminPortalShell active="catalogue" breadcrumb={`Catalogue / Courses / ${course.name}`}>
    <CourseReviewWorkspace
      course={{
        slug: course.slug,
        name: course.name,
        level: course.level,
        durationLabel: course.durationLabel,
        eligibility: course.eligibility,
        relevantSubjects: course.relevantSubjects,
        entranceRequirement: course.entranceRequirement,
        careerDirections: course.careerDirections,
        furtherStudy: course.furtherStudy,
        feeNote: course.feeNote,
        scholarshipNote: course.scholarshipNote,
        examSlugs: course.examSlugs,
        sourceUrl: course.sourceUrl,
        verificationStatus: course.verificationStatus,
        lastVerifiedAt: course.lastVerifiedAt?.toISOString() ?? null,
        verificationFresh: isFreshVerification(course.verificationStatus, course.lastVerifiedAt),
      }}
      fieldName={course.fieldSlug ? fieldsBySlug.get(course.fieldSlug) ?? "" : ""}
      institutionLinks={links.map((link) => ({
        id: link.id,
        institutionCode: link.institutionCode,
        institutionName: institutionsByCode.get(link.institutionCode) ?? link.institutionCode,
        verificationStatus: link.verificationStatus,
        sourceUrl: link.sourceUrl,
        lastVerifiedAt: link.lastVerifiedAt?.toISOString() ?? null,
        verificationFresh: isFreshVerification(link.verificationStatus, link.lastVerifiedAt),
      }))}
    />
  </AdminPortalShell>;
}
