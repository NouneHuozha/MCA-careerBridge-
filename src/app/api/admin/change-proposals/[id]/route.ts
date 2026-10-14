import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { admissionInformation, auditEvents, catalogueChangeProposals, courses, entranceExams, institutions, opportunities, scholarships, type ChangeProposalDecision } from "@/db/schema";

export const dynamic = "force-dynamic";
type Decision = "approve" | "edit_approve" | "keep_current" | "reject" | "keep_pending";
const approvedFields: Record<string, string[]> = {
  scholarship: ["deadlineNote", "eligibility", "amountNote", "provider"],
  entrance_exam: ["applicationPeriod", "examDate", "eligibility"],
  institution: ["feeRangeNote", "officialWebsite", "admissionPortal"],
  course: ["eligibility", "durationLabel", "feeNote", "scholarshipNote"],
  opportunity: ["description", "costNote", "provider"],
  admission_information: ["applicationWindow", "feesNote"],
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Invalid proposal id." }, { status: 400 });
  let input: Record<string, unknown>;
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== "object") throw new Error(); input = parsed as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const action = input.action as Decision;
  if (!["approve", "edit_approve", "keep_current", "reject", "keep_pending"].includes(action)) return NextResponse.json({ error: "Choose a supported review decision." }, { status: 400 });
  const reviewNote = typeof input.reviewNote === "string" ? input.reviewNote.trim() : "";
  if ((action !== "keep_pending" && reviewNote.length < 8) || reviewNote.length > 500) return NextResponse.json({ error: "Add a review note between 8 and 500 characters." }, { status: 400 });
  if (["approve", "edit_approve"].includes(action) && input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that you checked the source evidence before approval." }, { status: 400 });
  const editedValue = typeof input.editedValue === "string" ? input.editedValue.trim() : "";
  if (action === "edit_approve" && (!editedValue || editedValue.length > 4000)) return NextResponse.json({ error: "Enter a revised value between 1 and 4,000 characters." }, { status: 400 });

  try {
    const result = await db.transaction(async (tx) => {
      const [proposal] = await tx.select().from(catalogueChangeProposals).where(eq(catalogueChangeProposals.id, id)).limit(1);
      if (!proposal) return { error: "Proposed change not found.", httpStatus: 404 as const };
      if (proposal.status !== "needs_review") return { error: "This proposal has already been decided.", httpStatus: 409 as const };
      if (!approvedFields[proposal.entityType]?.includes(proposal.fieldName)) return { error: "This proposal targets a field that cannot be published through review.", httpStatus: 400 as const };
      const now = new Date();
      const value = action === "edit_approve" ? editedValue : proposal.proposedValue;
      const finalAction: ChangeProposalDecision["action"] = action === "approve" ? "approved" : action === "edit_approve" ? "edited_and_approved" : action === "keep_current" ? "kept_current" : action === "reject" ? "rejected" : "kept_pending";
      const event: ChangeProposalDecision = { action: finalAction, actor: user.email, note: reviewNote, value: ["approve", "edit_approve"].includes(action) ? value : null, createdAt: now.toISOString() };
      const status = action === "approve" || action === "edit_approve" ? "approved" : action === "keep_current" ? "kept_current" : action === "reject" ? "rejected" : "needs_review";
      const changed = await tx.update(catalogueChangeProposals).set({ status, approvedValue: status === "approved" ? value : null, reviewNote, decisionHistory: [...(proposal.decisionHistory ?? []), event], updatedAt: now }).where(and(eq(catalogueChangeProposals.id, id), eq(catalogueChangeProposals.status, "needs_review"))).returning({ id: catalogueChangeProposals.id });
      if (!changed.length) return { error: "This proposal was decided by another reviewer. Refresh to see its current state.", httpStatus: 409 as const };

      if (status === "approved") {
        const verifyAndUpdate = async <T extends object>(read: () => Promise<T[]>, getCurrentValue: (row: T) => unknown, update: () => Promise<unknown>) => {
          const [row] = await read();
          if (!row) throw new Error("The catalogue record no longer exists.");
          if ((getCurrentValue(row) ?? null) !== (proposal.currentValue ?? null)) throw new Error("This catalogue value changed after the proposal was fetched. Keep it pending and refresh the comparison.");
          await update();
        };
        const common = { verificationStatus: "verified", lastVerifiedAt: now, sourceUrl: proposal.sourceUrl };
        switch (proposal.entityType) {
          case "scholarship": {
            const field = proposal.fieldName as "deadlineNote" | "eligibility" | "amountNote" | "provider";
            await verifyAndUpdate(() => tx.select().from(scholarships).where(eq(scholarships.slug, proposal.entityRef)).limit(1), (row) => row[field], () => tx.update(scholarships).set({ ...common, [field]: value } as Partial<typeof scholarships.$inferInsert>).where(eq(scholarships.slug, proposal.entityRef))); break;
          }
          case "entrance_exam": {
            const field = proposal.fieldName as "applicationPeriod" | "examDate" | "eligibility";
            await verifyAndUpdate(() => tx.select().from(entranceExams).where(eq(entranceExams.slug, proposal.entityRef)).limit(1), (row) => row[field], () => tx.update(entranceExams).set({ ...common, officialWebsite: proposal.sourceUrl, [field]: value } as Partial<typeof entranceExams.$inferInsert>).where(eq(entranceExams.slug, proposal.entityRef))); break;
          }
          case "institution": {
            const field = proposal.fieldName as "feeRangeNote" | "officialWebsite" | "admissionPortal";
            await verifyAndUpdate(() => tx.select().from(institutions).where(eq(institutions.code, proposal.entityRef)).limit(1), (row) => row[field], () => tx.update(institutions).set({ ...common, [field]: value } as Partial<typeof institutions.$inferInsert>).where(eq(institutions.code, proposal.entityRef))); break;
          }
          case "course": {
            const field = proposal.fieldName as "eligibility" | "durationLabel" | "feeNote" | "scholarshipNote";
            await verifyAndUpdate(() => tx.select().from(courses).where(eq(courses.slug, proposal.entityRef)).limit(1), (row) => row[field], () => tx.update(courses).set({ ...common, [field]: value } as Partial<typeof courses.$inferInsert>).where(eq(courses.slug, proposal.entityRef))); break;
          }
          case "opportunity": {
            const field = proposal.fieldName as "description" | "costNote" | "provider";
            await verifyAndUpdate(() => tx.select().from(opportunities).where(eq(opportunities.slug, proposal.entityRef)).limit(1), (row) => row[field], () => tx.update(opportunities).set({ ...common, [field]: value } as Partial<typeof opportunities.$inferInsert>).where(eq(opportunities.slug, proposal.entityRef))); break;
          }
          case "admission_information": {
            const field = proposal.fieldName as "applicationWindow" | "feesNote";
            const admissionId = Number(proposal.entityRef);
            if (!Number.isSafeInteger(admissionId) || admissionId < 1) throw new Error("The admission record reference is invalid.");
            await verifyAndUpdate(() => tx.select().from(admissionInformation).where(eq(admissionInformation.id, admissionId)).limit(1), (row) => row[field], () => tx.update(admissionInformation).set({ verificationStatus: "verified", retrievedAt: now, sourceUrl: proposal.sourceUrl, [field]: value } as Partial<typeof admissionInformation.$inferInsert>).where(eq(admissionInformation.id, admissionId))); break;
          }
        }
      }
      await tx.insert(auditEvents).values({ actor: user.email, action: `change_proposal_${action}`, entityType: proposal.entityType, entityRef: proposal.entityRef, metadata: { proposalId: id, entityName: proposal.entityName, fieldName: proposal.fieldName, currentValue: proposal.currentValue, proposedValue: proposal.proposedValue, approvedValue: status === "approved" ? value : null, sourceUrl: proposal.sourceUrl, reviewNote, status } });
      return { ok: true, status };
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[careerbridge] proposal decision failed", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save the review decision." }, { status: 503 });
  }
}
