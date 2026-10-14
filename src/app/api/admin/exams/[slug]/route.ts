import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, entranceExams } from "@/db/schema";

export const dynamic = "force-dynamic";
const DOCUMENTS = ["Photograph", "Signature", "Identity document", "Academic details", "Category certificate, if applicable"] as const;
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
type DocumentStatus = "required" | "not_confirmed";
type ExamDraft = {
  name: string;
  shortName: string;
  conductingBody: string;
  levelStage: string;
  appliesTo: string[];
  cycleLabel: string;
  applicationPeriod: string;
  examDate: string;
  correctionWindow: string;
  resultDate: string;
  eligibility: string;
  requiredSubjects: string[];
  minimumAcademicCondition: string;
  ageAttemptNotes: string;
  documentStatus: Record<string, DocumentStatus>;
  preparation: string[];
  sourceUrl: string;
};

function validHttpUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

function readDraft(input: unknown): { draft?: ExamDraft; error?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Exam details must be an object." };
  const values = input as Record<string, unknown>;
  const textLimits: Record<string, number> = {
    name: 160, shortName: 40, conductingBody: 160, cycleLabel: 80,
    applicationPeriod: 160, examDate: 160, correctionWindow: 160, resultDate: 160,
    eligibility: 4000, minimumAcademicCondition: 4000, ageAttemptNotes: 2000, sourceUrl: 2048,
  };
  const result: Record<string, unknown> = {};
  for (const [field, limit] of Object.entries(textLimits)) {
    const value = values[field];
    if (typeof value !== "string" || value.length > limit) return { error: `Invalid ${field} value.` };
    result[field] = value.trim();
  }
  if (!result.name) return { error: "Exam name is required." };
  if (!result.levelStage || !["after_class10", "after_class12"].includes(String(values.levelStage))) return { error: "Choose an education stage." };
  result.levelStage = values.levelStage;
  for (const field of ["appliesTo", "requiredSubjects", "preparation"] as const) {
    const value = values[field];
    if (!Array.isArray(value) || value.length > 30 || value.some((item) => typeof item !== "string" || item.length > 300)) {
      return { error: `Invalid ${field} list.` };
    }
    result[field] = [...new Set((value as string[]).map((item) => item.trim()).filter(Boolean))];
  }
  const statusInput = values.documentStatus;
  if (!statusInput || typeof statusInput !== "object" || Array.isArray(statusInput)) return { error: "Review every document row." };
  const statusRecord = statusInput as Record<string, unknown>;
  const documentStatus: Record<string, DocumentStatus> = {};
  for (const label of DOCUMENTS) {
    const status = statusRecord[label];
    if (status !== "required" && status !== "not_confirmed") return { error: `Choose a status for ${label}.` };
    documentStatus[label] = status;
  }
  result.documentStatus = documentStatus;
  if (!validHttpUrl(String(result.sourceUrl))) return { error: "Source URL must use HTTP or HTTPS and must not include credentials." };
  return { draft: result as unknown as ExamDraft };
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
  const parsed = readDraft(input.exam);
  if (!parsed.draft) return NextResponse.json({ error: parsed.error ?? "Exam details are invalid." }, { status: 400 });
  const draft = parsed.draft;

  if (input.action === "save_draft") {
    try {
      const [exam] = await db.select().from(entranceExams).where(eq(entranceExams.slug, slug)).limit(1);
      if (!exam) return NextResponse.json({ error: "Entrance exam not found." }, { status: 404 });
      const previousDraft = exam.reviewDraft;
      if (JSON.stringify(previousDraft ?? null) !== JSON.stringify(draft)) {
        await db.transaction(async (tx) => {
          await tx.update(entranceExams).set({ reviewDraft: draft }).where(eq(entranceExams.slug, slug));
          await tx.insert(auditEvents).values({
            actor: user.email,
            action: "entrance_exam_draft_saved",
            entityType: "entrance_exam",
            entityRef: slug,
            metadata: { previousDraft, proposedDraft: draft, publishedValuesUnchanged: true },
          });
        });
      }
      return NextResponse.json({ ok: true, verificationStatus: exam.verificationStatus, draftSaved: true });
    } catch (error) {
      console.error("[careerbridge] entrance exam draft save failed", error);
      return NextResponse.json({ error: "Could not save the exam draft. Confirm the exam review migration has been applied." }, { status: 503 });
    }
  }

  if (input.action !== "mark_verified") return NextResponse.json({ error: "Unsupported entrance exam action." }, { status: 400 });
  const reviewNote = clean(input.reviewNote);
  if (reviewNote.length < 8 || reviewNote.length > 500) return NextResponse.json({ error: "Add a review note between 8 and 500 characters." }, { status: 400 });
  if (input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that the current official evidence was reviewed." }, { status: 400 });
  if (!draft.conductingBody || !draft.cycleLabel || !draft.applicationPeriod || !draft.examDate || !draft.eligibility || !draft.sourceUrl) {
    return NextResponse.json({ error: "To verify this record, add its conducting body, official cycle, application period, exam date, eligibility summary, and official source. Use ‘Not currently confirmed’ where an item was checked but could not be confirmed." }, { status: 400 });
  }
  try {
    const [exam] = await db.select().from(entranceExams).where(eq(entranceExams.slug, slug)).limit(1);
    if (!exam) return NextResponse.json({ error: "Entrance exam not found." }, { status: 404 });
    const checkedAt = new Date();
    const confirmedDocuments = DOCUMENTS.filter((label) => draft.documentStatus[label] === "required");
    await db.transaction(async (tx) => {
      await tx.update(entranceExams).set({
        name: draft.name,
        shortName: draft.shortName || null,
        conductingBody: draft.conductingBody || null,
        levelStage: draft.levelStage,
        appliesTo: draft.appliesTo,
        cycleLabel: draft.cycleLabel || null,
        applicationPeriod: draft.applicationPeriod || null,
        examDate: draft.examDate || null,
        correctionWindow: draft.correctionWindow || null,
        resultDate: draft.resultDate || null,
        eligibility: draft.eligibility || null,
        requiredSubjects: draft.requiredSubjects,
        minimumAcademicCondition: draft.minimumAcademicCondition || null,
        ageAttemptNotes: draft.ageAttemptNotes || null,
        documents: confirmedDocuments,
        documentStatus: draft.documentStatus,
        preparation: draft.preparation,
        officialWebsite: draft.sourceUrl,
        sourceUrl: draft.sourceUrl,
        verificationStatus: "verified",
        lastVerifiedAt: checkedAt,
        reviewDraft: null,
      }).where(eq(entranceExams.slug, slug));
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "entrance_exam_marked_verified",
        entityType: "entrance_exam",
        entityRef: slug,
        metadata: {
          reviewNote,
          sourceUrl: draft.sourceUrl,
          lastVerifiedAt: checkedAt.toISOString(),
          previous: {
            name: exam.name, shortName: exam.shortName, conductingBody: exam.conductingBody,
            levelStage: exam.levelStage, appliesTo: exam.appliesTo, eligibility: exam.eligibility,
            applicationPeriod: exam.applicationPeriod, examDate: exam.examDate,
            verificationStatus: exam.verificationStatus,
          },
          approved: { ...draft, documents: confirmedDocuments },
        },
      });
    });
    return NextResponse.json({ ok: true, verificationStatus: "verified", lastVerifiedAt: checkedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] entrance exam verification failed", error);
    return NextResponse.json({ error: "Could not save the exam review. Confirm the exam review migration has been applied." }, { status: 503 });
  }
}
