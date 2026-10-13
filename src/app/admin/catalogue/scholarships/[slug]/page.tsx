import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ScholarshipReviewWorkspace } from "@/components/admin/scholarship-review-workspace";
import { db } from "@/db";
import { scholarshipReviewDrafts, type ScholarshipEditorPayload } from "@/db/schema";
import { getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scholarship = (await getScholarships()).find((item) => item.slug === slug);
  return { title: scholarship ? `${scholarship.name} · Admin catalogue` : "Scholarship review · Admin catalogue" };
}

const DOCUMENTS = ["Academic record", "Identity document", "Income certificate, if applicable", "Category certificate, if applicable", "Bank details, if applicable", "Institution verification, if applicable"] as const;
function dateInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default async function AdminScholarshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(`/admin/catalogue/scholarships/${slug}`)}`);
  if (user.role !== "admin") notFound();
  const scholarship = (await getScholarships()).find((item) => item.slug === slug);
  if (!scholarship) notFound();

  let savedDraft: ScholarshipEditorPayload | null = null;
  let migrationAvailable = true;
  try {
    const [row] = await db.select().from(scholarshipReviewDrafts).where(eq(scholarshipReviewDrafts.scholarshipSlug, slug)).limit(1);
    savedDraft = row?.payload ?? null;
  } catch {
    migrationAvailable = false;
  }
  const savedDocumentStatus = scholarship.documentStatus ?? {};
  const initialPayload: ScholarshipEditorPayload = {
    name: scholarship.name,
    provider: scholarship.provider ?? "",
    category: scholarship.category ?? "",
    eligibility: scholarship.eligibility ?? "",
    academicConditions: scholarship.academicConditions ?? "",
    incomeCategoryConditions: scholarship.incomeCategoryConditions ?? "",
    residencyConditions: scholarship.residencyConditions ?? "",
    otherConditions: scholarship.otherConditions ?? "",
    amountNote: scholarship.amountNote ?? "",
    tuitionSupport: scholarship.tuitionSupport ?? "",
    maintenanceSupport: scholarship.maintenanceSupport ?? "",
    renewalNote: scholarship.renewalNote ?? "",
    deadlineNote: scholarship.deadlineNote ?? "",
    cycleLabel: scholarship.cycleLabel ?? "",
    documents: DOCUMENTS.map((label) => ({ label, status: savedDocumentStatus[label] ?? ((scholarship.documents ?? []).includes(label) ? "required" : "not_confirmed") })),
    officialUrl: scholarship.officialUrl ?? "",
    sourceUrl: scholarship.sourceUrl ?? scholarship.officialUrl ?? "",
    sourceTitle: scholarship.sourceTitle ?? "",
    sourceRetrievedAt: dateInput(scholarship.sourceRetrievedAt),
    appliesToStage: scholarship.appliesToStage ?? [],
  };

  return <AdminPortalShell active="catalogue" referenceNav breadcrumb={`Catalogue / Scholarships / ${scholarship.name}`}>
    <ScholarshipReviewWorkspace
      slug={scholarship.slug}
      initialPayload={initialPayload}
      savedDraft={savedDraft}
      verificationStatus={scholarship.verificationStatus}
      lastVerifiedAt={scholarship.lastVerifiedAt?.toISOString() ?? null}
      migrationAvailable={migrationAvailable}
    />
  </AdminPortalShell>;
}
