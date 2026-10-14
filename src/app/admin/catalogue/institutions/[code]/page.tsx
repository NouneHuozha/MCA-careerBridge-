import { and, desc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { InstitutionVerificationWorkspace } from "@/components/admin/institution-verification-workspace";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents } from "@/db/schema";
import { getAdmissionInfo, getCourses, getInstitution, getInstitutionLinks, getInstitutionSources } from "@/services/catalog";

export const dynamic = "force-dynamic";
const verifiedStatuses = ["verified", "current", "recently_verified", "published_verified"];
function isVerificationFresh(status: string, lastVerifiedAt: Date | null) {
  return verifiedStatuses.includes(status) && Boolean(lastVerifiedAt) && lastVerifiedAt!.getTime() >= Date.now() - 90 * 24 * 60 * 60 * 1000;
}
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const institution = await getInstitution((await params).code);
  return { title: institution ? `${institution.name} · Admin verification` : "Institution verification" };
}
export default async function AdminInstitutionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect(`/admin/catalogue/institutions/${code}`));
  if (user.role !== "admin") notFound();

  const institution = await getInstitution(code);
  if (!institution) notFound();
  const [links, sourceRows, admissions, allCourses] = await Promise.all([
    getInstitutionLinks(institution.code), getInstitutionSources(institution.code), getAdmissionInfo(institution.code), getCourses({}),
  ]);
  let history: (typeof auditEvents.$inferSelect)[] = [];
  try {
    history = await db.select().from(auditEvents).where(and(eq(auditEvents.entityType, "institution"), eq(auditEvents.entityRef, institution.code))).orderBy(desc(auditEvents.createdAt)).limit(20);
  } catch (error) {
    console.error("[careerbridge] institution admin history query failed", error);
  }
  const courseBySlug = new Map(allCourses.map((course) => [course.slug, course.name]));
  const sources: { id: number | string; title: string; sourceType: string; url: string; status: string | null; retrievedAt: string | null; lastVerifiedAt?: string | null }[] = sourceRows.flatMap((source) => source.url ? [{ id: source.id, title: source.title ?? "Institution source", sourceType: source.sourceType, url: source.url, status: source.status, retrievedAt: source.retrievedAt?.toISOString() ?? null }] : []);
  if (institution.sourceUrl && !sources.some((source) => source.url === institution.sourceUrl)) sources.push({ id: "institution-record", title: "Source URL on institution record", sourceType: "record source", url: institution.sourceUrl, status: null, retrievedAt: null, lastVerifiedAt: institution.lastVerifiedAt?.toISOString() ?? null });

  return <AdminPortalShell active="catalogue" referenceNav breadcrumb={`Institutions / ${institution.name}`}>
    <InstitutionVerificationWorkspace
      institution={{
        code: institution.code, name: institution.name, type: institution.type, ownership: institution.ownership,
        state: institution.state, country: institution.country, district: institution.district, city: institution.city,
        latitude: institution.latitude, longitude: institution.longitude,
        officialWebsite: institution.officialWebsite, admissionPortal: institution.admissionPortal,
        contactEmail: institution.contactEmail, contactPhone: institution.contactPhone,
        studyLevels: institution.studyLevels ?? [], fieldSlugs: institution.fieldSlugs ?? [], feeRangeNote: institution.feeRangeNote,
        hostelAvailable: institution.hostelAvailable, admissionStatus: institution.admissionStatus,
        about: institution.about, datasetLabel: institution.datasetLabel, verificationStatus: institution.verificationStatus,
        sourceUrl: institution.sourceUrl, lastVerifiedAt: institution.lastVerifiedAt?.toISOString() ?? null,
        isFresh: isVerificationFresh(institution.verificationStatus, institution.lastVerifiedAt),
      }}
      courses={links.map((link) => ({ id: link.id, courseSlug: link.courseSlug, courseName: courseBySlug.get(link.courseSlug) ?? link.courseSlug, verificationStatus: link.verificationStatus, sourceUrl: link.sourceUrl, lastVerifiedAt: link.lastVerifiedAt?.toISOString() ?? null }))}
      admissions={admissions.map((entry) => ({ id: entry.id, cycleLabel: entry.cycleLabel, applicationWindow: entry.applicationWindow, importantDates: entry.importantDates, process: entry.process, documents: entry.documents, feesNote: entry.feesNote, sourceUrl: entry.sourceUrl, retrievedAt: entry.retrievedAt?.toISOString() ?? null, verificationStatus: entry.verificationStatus }))}
      sources={sources}
      history={history.map((event) => ({ id: event.id, actor: event.actor, action: event.action, entityType: event.entityType, metadata: event.metadata, createdAt: event.createdAt.toISOString() }))}
    />
  </AdminPortalShell>;
}
