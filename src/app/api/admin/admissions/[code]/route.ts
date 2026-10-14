import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { admissionInformation, admissionInformationDrafts, auditEvents, courses, institutions } from "@/db/schema";
import type { AdmissionEditorPayload } from "@/db/schema";

export const dynamic = "force-dynamic";

const cleanText = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";
const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));
function validHttpUrl(value: string) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
function validDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  try { return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value; } catch { return false; }
}
function parsePayload(value: unknown): { payload?: AdmissionEditorPayload; error?: string } {
  if (!isObject(value)) return { error: "Admission form data is required." };
  const confirmations = isObject(value.confirmations) ? value.confirmations : {};
  const dateRows = Array.isArray(value.importantDates) ? value.importantDates : [];
  const documentRows = Array.isArray(value.documentRequirements) ? value.documentRequirements : [];
  const process = Array.isArray(value.process) ? value.process : [];
  if (dateRows.length > 30 || documentRows.length > 40 || process.length > 30) return { error: "This admission record has too many dates, document rows, or steps." };
  const importantDates = dateRows.filter(isObject).map((row) => ({
    label: cleanText(row.label, 120), value: cleanText(row.value, 200), sourceTitle: cleanText(row.sourceTitle, 200), sourceUrl: cleanText(row.sourceUrl, 2048),
    verificationStatus: ["verified", "needs_verification", "not_available"].includes(String(row.verificationStatus)) ? row.verificationStatus as "verified" | "needs_verification" | "not_available" : "needs_verification",
  })).filter((row) => row.label);
  const documentRequirements = documentRows.filter(isObject).map((row) => ({
    label: cleanText(row.label, 160),
    status: ["required", "not_confirmed", "not_required"].includes(String(row.status)) ? row.status as "required" | "not_confirmed" | "not_required" : "not_confirmed",
    sourceUrl: cleanText(row.sourceUrl, 2048),
  })).filter((row) => row.label);
  const courseSlug = typeof value.courseSlug === "string" ? value.courseSlug.trim().slice(0, 80) || null : null;
  const payload: AdmissionEditorPayload = {
    courseSlug,
    cycleLabel: cleanText(value.cycleLabel, 80),
    applicationStartDate: cleanText(value.applicationStartDate, 10),
    applicationEndDate: cleanText(value.applicationEndDate, 10),
    applicationWindowStatus: value.applicationWindowStatus === "confirmed" ? "confirmed" : "not_confirmed",
    importantDates,
    process: process.map((step) => cleanText(step, 300)).filter(Boolean),
    documentRequirements,
    applicationFeeNote: cleanText(value.applicationFeeNote, 500),
    courseFeeNote: cleanText(value.courseFeeNote, 500),
    sourceTitle: cleanText(value.sourceTitle, 200),
    sourceUrl: cleanText(value.sourceUrl, 2048),
    sourceRetrievedAt: cleanText(value.sourceRetrievedAt, 10),
    confirmations: {
      cycle: confirmations.cycle === true,
      applicationWindow: confirmations.applicationWindow === true,
      process: confirmations.process === true,
      documents: confirmations.documents === true,
      feeNote: confirmations.feeNote === true,
      applicationLink: confirmations.applicationLink === true,
    },
  };
  if (!validDate(payload.applicationStartDate) || !validDate(payload.applicationEndDate) || !validDate(payload.sourceRetrievedAt)) return { error: "Enter valid calendar dates." };
  if (payload.applicationStartDate && payload.applicationEndDate && payload.applicationEndDate < payload.applicationStartDate) return { error: "The end date cannot be earlier than the start date." };
  for (const url of [payload.sourceUrl, ...importantDates.map((row) => row.sourceUrl), ...documentRequirements.map((row) => row.sourceUrl)]) {
    if (url && !validHttpUrl(url)) return { error: "Source URLs must use a valid HTTP or HTTPS address." };
  }
  return { payload };
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const { code } = await context.params;
  let input: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!isObject(body)) throw new Error();
    input = body;
  } catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const action = cleanText(input.action, 40);
  if (action !== "save_draft" && action !== "mark_verified") return NextResponse.json({ error: "Choose Save draft or Mark verified." }, { status: 400 });
  const parsed = parsePayload(input.payload);
  if (!parsed.payload) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const payload = parsed.payload;
  const admissionId = Number.isInteger(input.admissionId) && Number(input.admissionId) > 0 ? Number(input.admissionId) : null;
  const draftId = Number.isInteger(input.draftId) && Number(input.draftId) > 0 ? Number(input.draftId) : null;
  const reviewNote = cleanText(input.reviewNote, 500);
  if (input.admissionId != null && admissionId == null) return NextResponse.json({ error: "Invalid admission record." }, { status: 400 });

  try {
    const [institution] = await db.select({ code: institutions.code, admissionPortal: institutions.admissionPortal }).from(institutions).where(eq(institutions.code, code)).limit(1);
    if (!institution) return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    if (payload.courseSlug) {
      const [course] = await db.select({ slug: courses.slug }).from(courses).where(eq(courses.slug, payload.courseSlug)).limit(1);
      if (!course) return NextResponse.json({ error: "Select a course in the catalogue or choose general admission." }, { status: 400 });
    }
    let current = null;
    if (admissionId) {
      const [row] = await db.select().from(admissionInformation).where(and(eq(admissionInformation.id, admissionId), eq(admissionInformation.institutionCode, code))).limit(1);
      if (!row) return NextResponse.json({ error: "Admission record not found for this institution." }, { status: 404 });
      current = row;
    }

    if (action === "save_draft") {
      let existingDraft = null;
      if (draftId) {
        const [row] = await db.select().from(admissionInformationDrafts).where(and(eq(admissionInformationDrafts.id, draftId), eq(admissionInformationDrafts.institutionCode, code))).limit(1);
        if (!row) return NextResponse.json({ error: "Admission draft not found." }, { status: 404 });
        if ((row.admissionId ?? null) !== admissionId) return NextResponse.json({ error: "This draft belongs to a different admission record." }, { status: 409 });
        existingDraft = row;
      } else if (admissionId) {
        const [row] = await db.select().from(admissionInformationDrafts).where(eq(admissionInformationDrafts.admissionId, admissionId)).limit(1);
        existingDraft = row ?? null;
      } else {
        const [row] = await db.select().from(admissionInformationDrafts).where(and(eq(admissionInformationDrafts.institutionCode, code), isNull(admissionInformationDrafts.admissionId))).orderBy(desc(admissionInformationDrafts.updatedAt)).limit(1);
        existingDraft = row ?? null;
      }
      const now = new Date();
      const saved = await db.transaction(async (tx) => {
        if (existingDraft) {
          const [row] = await tx.update(admissionInformationDrafts).set({ payload, reviewNote: reviewNote || null, savedBy: user.email, updatedAt: now }).where(eq(admissionInformationDrafts.id, existingDraft.id)).returning({ id: admissionInformationDrafts.id });
          await tx.insert(auditEvents).values({ actor: user.email, action: "admission_information_draft_saved", entityType: "admission_information", entityRef: admissionId ? String(admissionId) : `draft:${row.id}`, metadata: { institutionCode: code, cycleLabel: payload.cycleLabel, courseSlug: payload.courseSlug, note: reviewNote || null, draftId: row.id } });
          return row;
        }
        const [row] = await tx.insert(admissionInformationDrafts).values({ admissionId, institutionCode: code, payload, reviewNote: reviewNote || null, savedBy: user.email, updatedAt: now }).returning({ id: admissionInformationDrafts.id });
        await tx.insert(auditEvents).values({ actor: user.email, action: "admission_information_draft_saved", entityType: "admission_information", entityRef: admissionId ? String(admissionId) : `draft:${row.id}`, metadata: { institutionCode: code, cycleLabel: payload.cycleLabel, courseSlug: payload.courseSlug, note: reviewNote || null } });
        return row;
      });
      return NextResponse.json({ ok: true, draftId: saved.id, status: "draft" });
    }

    const confirmations = payload.confirmations;
    if (!payload.cycleLabel) return NextResponse.json({ error: "Confirm an admission cycle before verification." }, { status: 400 });
    if (!Object.values(confirmations).every(Boolean)) return NextResponse.json({ error: "Complete each verification checklist item before publishing." }, { status: 400 });
    if (reviewNote.length < 8) return NextResponse.json({ error: "Add a reviewer note of at least 8 characters." }, { status: 400 });
    if (payload.sourceTitle.length < 2 || !payload.sourceUrl || !validHttpUrl(payload.sourceUrl)) return NextResponse.json({ error: "Attach a source title and valid official HTTP or HTTPS URL before verification." }, { status: 400 });
    if (draftId) {
      const [draft] = await db.select().from(admissionInformationDrafts).where(and(eq(admissionInformationDrafts.id, draftId), eq(admissionInformationDrafts.institutionCode, code))).limit(1);
      if (!draft) return NextResponse.json({ error: "Admission draft not found." }, { status: 404 });
      if ((draft.admissionId ?? null) !== admissionId) return NextResponse.json({ error: "This draft belongs to a different admission record." }, { status: 409 });
    }
    if (payload.applicationWindowStatus === "confirmed" && !payload.applicationStartDate && !payload.applicationEndDate) return NextResponse.json({ error: "Enter at least one confirmed application date, or mark the window as not currently confirmed." }, { status: 400 });
    if (payload.importantDates.some((row) => row.verificationStatus === "verified" && !row.value)) return NextResponse.json({ error: "Add a value for each important date marked verified." }, { status: 400 });
    const missingRequiredEvidence = payload.documentRequirements.some((row) => row.status !== "not_confirmed" && !row.sourceUrl && !payload.sourceUrl);
    if (missingRequiredEvidence) return NextResponse.json({ error: "Each confirmed document requirement needs an evidence URL." }, { status: 400 });
    const cycleConditions = [eq(admissionInformation.institutionCode, code), eq(admissionInformation.cycleLabel, payload.cycleLabel), payload.courseSlug ? eq(admissionInformation.courseSlug, payload.courseSlug) : isNull(admissionInformation.courseSlug)];
    if (current) cycleConditions.push(ne(admissionInformation.id, current.id));
    const [duplicateCycle] = await db.select({ id: admissionInformation.id }).from(admissionInformation).where(and(...cycleConditions)).limit(1);
    if (duplicateCycle) return NextResponse.json({ error: "An admission record already exists for this course and cycle. Open that record instead of creating a duplicate." }, { status: 409 });
    const checkedAt = new Date();
    const applicationWindow = payload.applicationWindowStatus === "not_confirmed"
      ? "Not currently confirmed"
      : `Start: ${payload.applicationStartDate || "Not specified"} · End: ${payload.applicationEndDate || "Not specified"}`;
    const feeParts = [payload.applicationFeeNote ? `Application fee: ${payload.applicationFeeNote}` : "Application fee: Not currently confirmed", payload.courseFeeNote ? `Course fee: ${payload.courseFeeNote}` : "Course fee note: Not currently confirmed"];
    const values = {
      institutionCode: code,
      courseSlug: payload.courseSlug,
      cycleLabel: payload.cycleLabel,
      applicationWindow,
      applicationStartDate: payload.applicationStartDate || null,
      applicationEndDate: payload.applicationEndDate || null,
      applicationWindowStatus: payload.applicationWindowStatus,
      importantDates: payload.importantDates,
      process: payload.process,
      documentRequirements: payload.documentRequirements,
      documents: payload.documentRequirements.filter((row) => row.status === "required").map((row) => row.label),
      applicationFeeNote: payload.applicationFeeNote || null,
      courseFeeNote: payload.courseFeeNote || null,
      feesNote: feeParts.join(" · "),
      sourceTitle: payload.sourceTitle,
      sourceUrl: payload.sourceUrl,
      retrievedAt: payload.sourceRetrievedAt ? new Date(`${payload.sourceRetrievedAt}T12:00:00.000Z`) : null,
      lastVerifiedAt: checkedAt,
      verificationStatus: "verified",
    };
    const published = await db.transaction(async (tx) => {
      let recordId: number;
      let previousStatus: string | null = null;
      if (current) {
        previousStatus = current.verificationStatus;
        const [row] = await tx.update(admissionInformation).set(values).where(eq(admissionInformation.id, current.id)).returning({ id: admissionInformation.id });
        recordId = row.id;
      } else {
        const [row] = await tx.insert(admissionInformation).values(values).returning({ id: admissionInformation.id });
        recordId = row.id;
      }
      await tx.insert(auditEvents).values({ actor: user.email, action: "admission_information_verified", entityType: "admission_information", entityRef: String(recordId), metadata: { institutionCode: code, courseSlug: payload.courseSlug, cycleLabel: payload.cycleLabel, previousStatus, verificationStatus: "verified", sourceTitle: payload.sourceTitle, sourceUrl: payload.sourceUrl, reviewerNote: reviewNote, confirmations, lastVerifiedAt: checkedAt.toISOString() } });
      if (draftId) await tx.delete(admissionInformationDrafts).where(and(eq(admissionInformationDrafts.id, draftId), eq(admissionInformationDrafts.institutionCode, code)));
      else if (admissionId) await tx.delete(admissionInformationDrafts).where(eq(admissionInformationDrafts.admissionId, admissionId));
      return { id: recordId };
    });
    return NextResponse.json({ ok: true, admissionId: published.id, status: "verified", lastVerifiedAt: checkedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] admission editor action failed", error);
    return NextResponse.json({ error: "Could not save this admission information. Confirm migration 0005_admission_information_editor.sql is applied, then try again." }, { status: 503 });
  }
}
