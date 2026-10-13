import { desc, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AdmissionInformationEditor } from "@/components/admin/admission-information-editor";
import { db } from "@/db";
import { admissionInformationDrafts } from "@/db/schema";
import { getAdmissionInfo, getCourses, getInstitution, getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admission information · Admin catalogue" };

type SearchParams = Promise<{ recordId?: string; draftId?: string }>;

export default async function AdminAdmissionInformationPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: SearchParams }) {
  const [{ code }, query, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/admin/catalogue/institutions/${code}/admission`)}`);
  if (user.role !== "admin") notFound();
  const institution = await getInstitution(code);
  if (!institution) notFound();
  const [records, allInstitutions, allCourses] = await Promise.all([
    getAdmissionInfo(institution.code), getInstitutions(), getCourses({}),
  ]);
  let drafts: (typeof admissionInformationDrafts.$inferSelect)[] = [];
  let draftStorageAvailable = true;
  try {
    drafts = await db.select().from(admissionInformationDrafts).where(eq(admissionInformationDrafts.institutionCode, institution.code)).orderBy(desc(admissionInformationDrafts.updatedAt));
  } catch (error) {
    console.warn("[careerbridge] admission draft storage unavailable; apply migration 0005_admission_information_editor.sql", error);
    draftStorageAvailable = false;
  }
  const requestedDraftId = Number.parseInt(query.draftId ?? "", 10);
  const initialDraftId = drafts.some((draft) => draft.id === requestedDraftId) ? requestedDraftId : null;
  const requestedRecordId = Number.parseInt(query.recordId ?? "", 10);
  const initialRecordId = records.some((record) => record.id === requestedRecordId)
    ? String(requestedRecordId)
    : query.draftId && !query.recordId ? "new" : String(records[0]?.id ?? "new");

  return <AdminPortalShell active="catalogue" breadcrumb={`Institutions / ${institution.name} / Admission information`}>
    <AdmissionInformationEditor
      institution={{ code: institution.code, name: institution.name, admissionPortal: institution.admissionPortal }}
      institutions={allInstitutions.map((item) => ({ code: item.code, name: item.name }))}
      courses={allCourses.map((item) => ({ slug: item.slug, name: item.name }))}
      records={records.map((item) => ({
        id: item.id, institutionCode: item.institutionCode, courseSlug: item.courseSlug, cycleLabel: item.cycleLabel,
        applicationWindow: item.applicationWindow, applicationStartDate: item.applicationStartDate ?? null, applicationEndDate: item.applicationEndDate ?? null,
        applicationWindowStatus: item.applicationWindowStatus ?? "not_confirmed", importantDates: item.importantDates,
        process: item.process, documents: item.documents, documentRequirements: item.documentRequirements ?? [],
        applicationFeeNote: item.applicationFeeNote ?? null, courseFeeNote: item.courseFeeNote ?? null, feesNote: item.feesNote,
        sourceTitle: item.sourceTitle ?? null, sourceUrl: item.sourceUrl, retrievedAt: item.retrievedAt?.toISOString() ?? null,
        lastVerifiedAt: item.lastVerifiedAt?.toISOString() ?? null, verificationStatus: item.verificationStatus,
      }))}
      drafts={drafts.map((draft) => ({ id: draft.id, admissionId: draft.admissionId, payload: draft.payload, reviewNote: draft.reviewNote, updatedAt: draft.updatedAt.toISOString() }))}
      initialRecordId={initialRecordId}
      initialDraftId={initialDraftId}
      draftStorageAvailable={draftStorageAvailable}
    />
  </AdminPortalShell>;
}
