import { notFound, redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ExamReviewWorkspace } from "@/components/admin/exam-review-workspace";
import { getExam } from "@/services/catalog";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const exam = await getExam((await params).slug);
  return { title: exam ? `${exam.name} · Admin catalogue` : "Entrance exam review · Admin catalogue" };
}

type ReviewDraft = {
  name: string; shortName: string; conductingBody: string; levelStage: string; appliesTo: string[];
  cycleLabel: string; applicationPeriod: string; examDate: string; correctionWindow: string; resultDate: string;
  eligibility: string; requiredSubjects: string[]; minimumAcademicCondition: string; ageAttemptNotes: string;
  documentStatus: Record<string, "required" | "not_confirmed">; preparation: string[]; sourceUrl: string;
};
const DOCUMENTS = ["Photograph", "Signature", "Identity document", "Academic details", "Category certificate, if applicable"] as const;
function stringValue(value: unknown, fallback = "") { return typeof value === "string" ? value : fallback; }
function stringArray(value: unknown, fallback: string[] = []) { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : fallback; }

export default async function AdminEntranceExamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect(`/admin/catalogue/exams/${slug}`));
  if (user.role !== "admin") notFound();
  const exam = await getExam(slug);
  if (!exam) notFound();

  const saved = exam.reviewDraft && typeof exam.reviewDraft === "object" ? exam.reviewDraft as Partial<ReviewDraft> : null;
  const sourceDocStatus = exam.documentStatus && typeof exam.documentStatus === "object" ? exam.documentStatus : {};
  const documentStatus = Object.fromEntries(DOCUMENTS.map((label) => {
    const stored = saved?.documentStatus?.[label] ?? sourceDocStatus[label];
    const value = stored ?? ((exam.documents ?? []).includes(label) ? "required" : "not_confirmed");
    return [label, value === "required" ? "required" : "not_confirmed"];
  })) as ReviewDraft["documentStatus"];
  const draft: ReviewDraft = {
    name: stringValue(saved?.name, exam.name),
    shortName: stringValue(saved?.shortName, exam.shortName ?? ""),
    conductingBody: stringValue(saved?.conductingBody, exam.conductingBody ?? ""),
    levelStage: stringValue(saved?.levelStage, exam.levelStage ?? ""),
    appliesTo: stringArray(saved?.appliesTo, exam.appliesTo ?? []),
    cycleLabel: stringValue(saved?.cycleLabel, exam.cycleLabel ?? ""),
    applicationPeriod: stringValue(saved?.applicationPeriod, exam.applicationPeriod ?? ""),
    examDate: stringValue(saved?.examDate, exam.examDate ?? ""),
    correctionWindow: stringValue(saved?.correctionWindow, exam.correctionWindow ?? ""),
    resultDate: stringValue(saved?.resultDate, exam.resultDate ?? ""),
    eligibility: stringValue(saved?.eligibility, exam.eligibility ?? ""),
    requiredSubjects: stringArray(saved?.requiredSubjects, exam.requiredSubjects ?? []),
    minimumAcademicCondition: stringValue(saved?.minimumAcademicCondition, exam.minimumAcademicCondition ?? ""),
    ageAttemptNotes: stringValue(saved?.ageAttemptNotes, exam.ageAttemptNotes ?? ""),
    documentStatus,
    preparation: stringArray(saved?.preparation, exam.preparation ?? []),
    sourceUrl: stringValue(saved?.sourceUrl, exam.sourceUrl ?? exam.officialWebsite ?? ""),
  };

  return <AdminPortalShell active="catalogue" referenceNav breadcrumb={`Catalogue / Entrance exams / ${exam.shortName || exam.name}`}>
    <ExamReviewWorkspace
      slug={exam.slug}
      exam={draft}
      verificationStatus={exam.verificationStatus}
      lastVerifiedAt={exam.lastVerifiedAt?.toISOString() ?? null}
      savedReviewDraft={Boolean(saved)}
      studentHref={`/exams/${encodeURIComponent(exam.slug)}`}
    />
  </AdminPortalShell>;
}
