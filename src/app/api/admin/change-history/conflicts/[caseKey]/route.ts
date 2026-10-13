import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, catalogueSourceConflicts, institutionCourses } from "@/db/schema";
import { AVAILABILITY_OPTIONS } from "@/lib/source-conflicts";

export const dynamic = "force-dynamic";
type DecisionAction = "approve_selected" | "edit_value" | "keep_current" | "keep_pending" | "reject_detected";
const validActions = new Set<DecisionAction>(["approve_selected", "edit_value", "keep_current", "keep_pending", "reject_detected"]);
const validValues = new Set<string>(AVAILABILITY_OPTIONS.map((item) => item.value));
class ConflictDecisionAbort extends Error { constructor(message: string, readonly httpStatus = 409) { super(message); } }
function safeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

export async function POST(request: Request, { params }: { params: Promise<{ caseKey: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const caseKey = (await params).caseKey.trim().slice(0, 120);
  if (!caseKey) return NextResponse.json({ error: "A valid conflict case is required." }, { status: 400 });
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed as Record<string, unknown>;
  } catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const action = input.action as DecisionAction;
  if (!validActions.has(action)) return NextResponse.json({ error: "Choose a supported conflict decision." }, { status: 400 });
  const reviewNote = typeof input.reviewNote === "string" ? input.reviewNote.trim() : "";
  if (reviewNote.length < 8 || reviewNote.length > 500) return NextResponse.json({ error: "Add a review note between 8 and 500 characters." }, { status: 400 });
  if (action !== "keep_pending" && input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that you reviewed source authority, dates, and evidence before deciding." }, { status: 400 });
  const selectedValue = typeof input.selectedValue === "string" ? input.selectedValue : "";
  const editedValue = typeof input.editedValue === "string" ? input.editedValue : "";
  if (action === "approve_selected" && !validValues.has(selectedValue)) return NextResponse.json({ error: "Choose one of the supported availability values." }, { status: 400 });
  if (action === "edit_value" && !validValues.has(editedValue)) return NextResponse.json({ error: "Choose a valid reviewed availability value." }, { status: 400 });

  try {
    const result = await db.transaction(async (tx) => {
      const [conflict] = await tx.select().from(catalogueSourceConflicts).where(eq(catalogueSourceConflicts.caseKey, caseKey)).limit(1);
      if (!conflict) return { error: "Conflict case not found.", httpStatus: 404 as const };
      if (conflict.status !== "needs_decision") return { error: "This conflict already has a decision. Refresh the page to review its history.", httpStatus: 409 as const };

      let value: string | null = null;
      if (action === "approve_selected") value = selectedValue;
      else if (action === "edit_value") value = editedValue;
      else if (action === "keep_current") value = conflict.currentApprovedValue;
      const nextStatus = action === "keep_pending" ? "needs_decision" : action === "keep_current" ? "kept_current" : action === "reject_detected" ? "rejected" : "resolved";
      let sourceUrl: string | null = null;
      let linkToUpdate: { id: number; currentValue: string } | null = null;

      if (!conflict.isSample && ["approve_selected", "edit_value", "keep_current"].includes(action)) {
        if (conflict.entityType !== "institution_course" || conflict.fieldName.toLowerCase() !== "availability") return { error: "This conflict targets a field that is not enabled for guarded publication.", httpStatus: 400 as const };
        const linkId = Number(conflict.entityRef);
        if (!Number.isSafeInteger(linkId) || linkId < 1) return { error: "The institution-course reference is invalid.", httpStatus: 400 as const };
        const primarySource = conflict.sources.find((source) => source.authorityLevel === "primary");
        if (!primarySource || !safeHttpUrl(primarySource.sourceUrl)) return { error: "Add a valid official-source URL before publishing an availability decision.", httpStatus: 400 as const };
        sourceUrl = primarySource.sourceUrl;
        const [link] = await tx.select().from(institutionCourses).where(eq(institutionCourses.id, linkId)).limit(1);
        if (!link) return { error: "The institution-course record no longer exists.", httpStatus: 404 as const };
        if (link.verificationStatus !== conflict.currentApprovedValue) return { error: "The catalogue value changed after this conflict was detected. Keep it pending and refresh the comparison.", httpStatus: 409 as const };
        linkToUpdate = { id: linkId, currentValue: conflict.currentApprovedValue };
      }

      const now = new Date();
      const decision = { action, actor: user.email, note: reviewNote, value, createdAt: now.toISOString() };
      const updated = await tx.update(catalogueSourceConflicts).set({
        status: nextStatus,
        resolvedValue: value,
        reviewNote,
        reviewedBy: user.email,
        reviewedAt: now,
        decisionHistory: [...(conflict.decisionHistory ?? []), decision],
        updatedAt: now,
      }).where(and(eq(catalogueSourceConflicts.caseKey, caseKey), eq(catalogueSourceConflicts.status, "needs_decision"), eq(catalogueSourceConflicts.currentApprovedValue, conflict.currentApprovedValue))).returning({ caseKey: catalogueSourceConflicts.caseKey });
      if (!updated.length) return { error: "Another reviewer changed this conflict. Refresh to see the latest status.", httpStatus: 409 as const };
      if (linkToUpdate && value && sourceUrl) {
        const updatedLink = await tx.update(institutionCourses).set({ verificationStatus: value, sourceUrl, lastVerifiedAt: now }).where(and(eq(institutionCourses.id, linkToUpdate.id), eq(institutionCourses.verificationStatus, linkToUpdate.currentValue))).returning({ id: institutionCourses.id });
        if (!updatedLink.length) throw new ConflictDecisionAbort("The catalogue value changed while this decision was being saved. No changes were published; refresh and compare again.");
      }

      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "source_conflict_decision",
        entityType: "source_conflict",
        entityRef: conflict.caseKey,
        metadata: {
          entityName: conflict.entityName,
          fieldName: conflict.fieldName,
          previousValue: conflict.currentApprovedValue,
          newValue: value ?? (action === "reject_detected" ? "Detected change rejected" : "Kept pending"),
          currentApprovedValue: conflict.currentApprovedValue,
          resolvedValue: value,
          decisionAction: action,
          status: nextStatus,
          reviewNote,
          sourceUrl,
          sourceType: "Source conflict review",
          sources: conflict.sources,
          sampleOnly: conflict.isSample,
        },
      });
      return { ok: true, status: nextStatus, resolvedValue: value, sampleOnly: conflict.isSample };
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[careerbridge] source conflict decision failed", error);
    if (error instanceof ConflictDecisionAbort) return NextResponse.json({ error: error.message }, { status: error.httpStatus });
    return NextResponse.json({ error: "Could not save the conflict decision. Please try again." }, { status: 503 });
  }
}
