import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, scholarshipReviewDrafts, scholarships, type ScholarshipEditorPayload } from "@/db/schema";

export const dynamic = "force-dynamic";
const DOCUMENTS = ["Academic record", "Identity document", "Income certificate, if applicable", "Category certificate, if applicable", "Bank details, if applicable", "Institution verification, if applicable"] as const;
const STAGES = new Set(["class10", "class12", "undergraduate", "postgraduate", "certificate"]);
const FIELD_LIMITS: Record<keyof Omit<ScholarshipEditorPayload, "documents" | "appliesToStage">, number> = {
  name: 180, provider: 160, category: 80, eligibility: 5000, academicConditions: 3000,
  incomeCategoryConditions: 3000, residencyConditions: 3000, otherConditions: 3000,
  amountNote: 2000, tuitionSupport: 2000, maintenanceSupport: 2000, renewalNote: 2000,
  deadlineNote: 160, cycleLabel: 80, officialUrl: 2048, sourceUrl: 2048, sourceTitle: 180, sourceRetrievedAt: 10,
};
function validHttpUrl(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; }
  catch { return false; }
}
function parsePayload(value: unknown): { payload?: ScholarshipEditorPayload; error?: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Scholarship details must be an object." };
  const input = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const item = input[field];
    if (typeof item !== "string" || item.length > limit) return { error: `Invalid ${field} value.` };
    result[field] = item.trim();
  }
  if (result.sourceRetrievedAt && !/^\d{4}-\d{2}-\d{2}$/.test(String(result.sourceRetrievedAt))) return { error: "Retrieved date must be a valid calendar date." };
  if (result.sourceRetrievedAt) {
    const date = new Date(`${result.sourceRetrievedAt}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== result.sourceRetrievedAt) return { error: "Retrieved date must be a valid calendar date." };
  }
  if (!String(result.name).trim() || String(result.name).trim().length < 2) return { error: "Scholarship name must contain at least 2 characters." };
  for (const field of ["officialUrl", "sourceUrl"] as const) {
    if (!validHttpUrl(String(result[field]))) return { error: `${field === "sourceUrl" ? "Evidence" : "Official"} URL must be valid HTTP or HTTPS without embedded credentials.` };
  }
  if (!Array.isArray(input.appliesToStage) || input.appliesToStage.length > 10 || input.appliesToStage.some((stage) => typeof stage !== "string" || !STAGES.has(stage))) return { error: "Choose valid applicable education stages." };
  result.appliesToStage = [...new Set(input.appliesToStage as string[])];
  if (!Array.isArray(input.documents) || input.documents.length !== DOCUMENTS.length) return { error: "Review every required-document row." };
  const documents = new Map<string, "required" | "not_confirmed" | "not_required">();
  for (const row of input.documents) {
    if (!row || typeof row !== "object" || Array.isArray(row)) return { error: "Document review rows are invalid." };
    const item = row as Record<string, unknown>;
    if (typeof item.label !== "string" || !DOCUMENTS.includes(item.label as typeof DOCUMENTS[number])) return { error: "Document review contains an unsupported item." };
    if (!["required", "not_confirmed", "not_required"].includes(String(item.status))) return { error: `Choose a status for ${item.label}.` };
    documents.set(item.label, item.status as "required" | "not_confirmed" | "not_required");
  }
  if (documents.size !== DOCUMENTS.length) return { error: "Review every required-document row." };
  result.documents = DOCUMENTS.map((label) => ({ label, status: documents.get(label)! }));
  return { payload: result as unknown as ScholarshipEditorPayload };
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const { slug } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 64) return NextResponse.json({ error: "A valid scholarship slug is required." }, { status: 400 });
  if (input.action !== "save_draft" && input.action !== "mark_verified") return NextResponse.json({ error: "Unsupported scholarship review action." }, { status: 400 });
  const parsed = parsePayload(input.scholarship);
  if (!parsed.payload) return NextResponse.json({ error: parsed.error ?? "Scholarship details are invalid." }, { status: 400 });
  const payload = parsed.payload;

  if (input.action === "save_draft") {
    try {
      const [existing] = await db.select({ slug: scholarships.slug }).from(scholarships).where(eq(scholarships.slug, slug)).limit(1);
      if (!existing) return NextResponse.json({ error: "Scholarship not found." }, { status: 404 });
      const [oldDraft] = await db.select().from(scholarshipReviewDrafts).where(eq(scholarshipReviewDrafts.scholarshipSlug, slug)).limit(1);
      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.insert(scholarshipReviewDrafts).values({ scholarshipSlug: slug, payload, savedBy: user.email, updatedAt: now }).onConflictDoUpdate({
          target: scholarshipReviewDrafts.scholarshipSlug,
          set: { payload, savedBy: user.email, updatedAt: now },
        });
        await tx.insert(auditEvents).values({ actor: user.email, action: "scholarship_detail_draft_saved", entityType: "scholarship", entityRef: slug, metadata: { previousDraft: oldDraft?.payload ?? null, proposedDraft: payload, publishedValuesUnchanged: true } });
      });
      return NextResponse.json({ ok: true, draftSaved: true });
    } catch (error) {
      console.error("[careerbridge] scholarship detail draft save failed", error);
      return NextResponse.json({ error: "Could not save the scholarship draft. Confirm the scholarship detail migration has been applied." }, { status: 503 });
    }
  }

  const reviewNote = typeof input.reviewNote === "string" ? input.reviewNote.trim() : "";
  if (reviewNote.length < 8 || reviewNote.length > 500) return NextResponse.json({ error: "Add a review note between 8 and 500 characters." }, { status: 400 });
  if (input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that the current scholarship notice and cycle were reviewed." }, { status: 400 });
  if (!payload.provider || !payload.appliesToStage.length || !payload.cycleLabel || !payload.deadlineNote || !payload.eligibility || !payload.sourceUrl || !payload.sourceTitle) {
    return NextResponse.json({ error: "To verify this cycle, add the provider, applicable stage, cycle, deadline or honest confirmation state, eligibility summary, source title, and evidence URL. Do not guess missing values." }, { status: 400 });
  }
  const publishedOfficialUrl = payload.officialUrl || payload.sourceUrl;
  try {
    const [existing] = await db.select().from(scholarships).where(eq(scholarships.slug, slug)).limit(1);
    if (!existing) return NextResponse.json({ error: "Scholarship not found." }, { status: 404 });
    const checkedAt = new Date();
    const documentStatus = Object.fromEntries(payload.documents.map(({ label, status }) => [label, status]));
    const requiredDocuments = payload.documents.filter((item) => item.status === "required").map((item) => item.label);
    await db.transaction(async (tx) => {
      await tx.update(scholarships).set({
        name: payload.name,
        provider: payload.provider || null,
        category: payload.category || null,
        eligibility: payload.eligibility || null,
        academicConditions: payload.academicConditions || null,
        incomeCategoryConditions: payload.incomeCategoryConditions || null,
        residencyConditions: payload.residencyConditions || null,
        otherConditions: payload.otherConditions || null,
        amountNote: payload.amountNote || null,
        tuitionSupport: payload.tuitionSupport || null,
        maintenanceSupport: payload.maintenanceSupport || null,
        renewalNote: payload.renewalNote || null,
        deadlineNote: payload.deadlineNote || null,
        cycleLabel: payload.cycleLabel || null,
        documents: requiredDocuments,
        documentStatus,
        officialUrl: publishedOfficialUrl,
        sourceUrl: payload.sourceUrl,
        sourceTitle: payload.sourceTitle,
        sourceRetrievedAt: payload.sourceRetrievedAt ? new Date(`${payload.sourceRetrievedAt}T00:00:00.000Z`) : null,
        appliesToStage: payload.appliesToStage,
        verificationStatus: "verified",
        lastVerifiedAt: checkedAt,
      }).where(eq(scholarships.slug, slug));
      await tx.delete(scholarshipReviewDrafts).where(eq(scholarshipReviewDrafts.scholarshipSlug, slug));
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "scholarship_detail_marked_verified",
        entityType: "scholarship",
        entityRef: slug,
        metadata: {
          reviewNote, sourceUrl: payload.sourceUrl, sourceTitle: payload.sourceTitle,
          sourceRetrievedAt: payload.sourceRetrievedAt || null, lastVerifiedAt: checkedAt.toISOString(),
          previous: { name: existing.name, provider: existing.provider, category: existing.category, eligibility: existing.eligibility, amountNote: existing.amountNote, deadlineNote: existing.deadlineNote, cycleLabel: existing.cycleLabel, documents: existing.documents, officialUrl: existing.officialUrl, sourceUrl: existing.sourceUrl, appliesToStage: existing.appliesToStage, verificationStatus: existing.verificationStatus },
          approved: { ...payload, officialUrl: publishedOfficialUrl, documents: requiredDocuments },
        },
      });
    });
    return NextResponse.json({ ok: true, verificationStatus: "verified", lastVerifiedAt: checkedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] scholarship detail verification failed", error);
    return NextResponse.json({ error: "Could not verify the scholarship. Confirm the scholarship detail migration has been applied." }, { status: 503 });
  }
}
