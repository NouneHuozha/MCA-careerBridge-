import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { catalogueChangeProposals } from "@/db/schema";

export const dynamic = "force-dynamic";
const allowedFields: Record<string, string[]> = {
  scholarship: ["deadlineNote", "eligibility", "amountNote", "provider"],
  entrance_exam: ["applicationPeriod", "examDate", "eligibility"],
  institution: ["feeRangeNote", "officialWebsite", "admissionPortal"],
  course: ["eligibility", "durationLabel", "feeNote", "scholarshipNote"],
  opportunity: ["description", "costNote", "provider"],
  admission_information: ["applicationWindow", "feesNote"],
};
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
function validHttpUrl(value: string) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let input: Record<string, unknown>;
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== "object") throw new Error(); input = parsed as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }

  const entityType = clean(input.entityType);
  const entityRef = clean(input.entityRef);
  const entityName = clean(input.entityName);
  const fieldName = clean(input.fieldName);
  const proposedValue = typeof input.proposedValue === "string" ? input.proposedValue.trim() : "";
  const currentValue = input.currentValue === null || typeof input.currentValue === "string" ? input.currentValue : null;
  const sourceType = clean(input.sourceType) || null;
  const sourceUrl = clean(input.sourceUrl);
  const sourceSnapshotUrl = clean(input.sourceSnapshotUrl);
  const evidenceExcerpt = clean(input.evidenceExcerpt);
  if (!allowedFields[entityType]?.includes(fieldName)) return NextResponse.json({ error: "This catalogue field cannot be proposed for review." }, { status: 400 });
  if (!entityRef || entityRef.length > 120 || entityName.length < 2 || entityName.length > 180) return NextResponse.json({ error: "A valid entity identity and display name are required." }, { status: 400 });
  if (proposedValue.length > 4000 || (typeof currentValue === "string" && currentValue.length > 4000)) return NextResponse.json({ error: "Values must be 4,000 characters or fewer." }, { status: 400 });
  if (!sourceUrl || sourceUrl.length > 2048 || !validHttpUrl(sourceUrl)) return NextResponse.json({ error: "A valid official HTTP or HTTPS source URL is required." }, { status: 400 });
  if (sourceSnapshotUrl && (sourceSnapshotUrl.length > 2048 || !validHttpUrl(sourceSnapshotUrl))) return NextResponse.json({ error: "Snapshot URL must be a valid HTTP or HTTPS URL." }, { status: 400 });
  if (evidenceExcerpt.length > 4000 || (sourceType && sourceType.length > 80)) return NextResponse.json({ error: "Evidence excerpt or source type is too long." }, { status: 400 });
  try {
    const [proposal] = await db.insert(catalogueChangeProposals).values({ entityType, entityRef, entityName, fieldName, currentValue, proposedValue, sourceType, sourceUrl, sourceSnapshotUrl: sourceSnapshotUrl || null, evidenceExcerpt: evidenceExcerpt || null, fetchedAt: new Date(), status: "needs_review", decisionHistory: [] }).returning({ id: catalogueChangeProposals.id });
    return NextResponse.json({ ok: true, id: proposal.id, status: "needs_review" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] proposal creation failed", error);
    return NextResponse.json({ error: "Could not save the proposed change. Confirm the catalogue-change migration has been applied." }, { status: 503 });
  }
}
