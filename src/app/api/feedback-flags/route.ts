import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, courses, entranceExams, flags, institutions, opportunities, scholarships } from "@/db/schema";

export const dynamic = "force-dynamic";
const entityTypes = ["institution", "course", "scholarship", "entrance_exam", "opportunity"] as const;
const issueTypes = ["incorrect_detail", "broken_application_link", "outdated_deadline", "wrong_course_availability", "missing_source", "other"] as const;
function validHttpUrl(value: string) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to send a report." }, { status: 401 });
  let input: Record<string, unknown>;
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== "object") throw new Error(); input = parsed as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const entityType = typeof input.entityType === "string" ? input.entityType : "";
  const entityRef = typeof input.entityRef === "string" ? input.entityRef.trim() : "";
  const issueType = typeof input.issueType === "string" ? input.issueType : "";
  const reason = typeof input.reason === "string" ? input.reason.trim() : "";
  const sourceUrl = typeof input.sourceUrl === "string" ? input.sourceUrl.trim() : "";
  if (!entityTypes.includes(entityType as typeof entityTypes[number]) || !entityRef || entityRef.length > 120) return NextResponse.json({ error: "Choose a valid catalogue record." }, { status: 400 });
  if (!issueTypes.includes(issueType as typeof issueTypes[number])) return NextResponse.json({ error: "Choose one of the available issue types." }, { status: 400 });
  if (reason.length < 8 || reason.length > 1000) return NextResponse.json({ error: "Please describe the issue in 8 to 1,000 characters." }, { status: 400 });
  if (sourceUrl && (sourceUrl.length > 2048 || !validHttpUrl(sourceUrl))) return NextResponse.json({ error: "Enter a valid HTTP or HTTPS source URL." }, { status: 400 });
  try {
    let entityExists = false;
    switch (entityType) {
      case "institution": entityExists = (await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.code, entityRef)).limit(1)).length > 0; break;
      case "course": entityExists = (await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, entityRef)).limit(1)).length > 0; break;
      case "scholarship": entityExists = (await db.select({ id: scholarships.id }).from(scholarships).where(eq(scholarships.slug, entityRef)).limit(1)).length > 0; break;
      case "entrance_exam": entityExists = (await db.select({ id: entranceExams.id }).from(entranceExams).where(eq(entranceExams.slug, entityRef)).limit(1)).length > 0; break;
      case "opportunity": entityExists = (await db.select({ id: opportunities.id }).from(opportunities).where(eq(opportunities.slug, entityRef)).limit(1)).length > 0; break;
    }
    if (!entityExists) return NextResponse.json({ error: "That catalogue record could not be found." }, { status: 404 });
    const createdAt = new Date();
    const [created] = await db.transaction(async (tx) => {
      const inserted = await tx.insert(flags).values({ userId: user.id, entityType, entityRef, issueType, reason, sourceUrl: sourceUrl || null, status: "open", assignedTo: null, resolutionReason: null, createdAt, updatedAt: createdAt }).returning({ id: flags.id });
      await tx.insert(auditEvents).values({ actor: user.email, action: "student_feedback_flag_created", entityType, entityRef, metadata: { flagId: inserted[0].id, issueType, sourceUrl: sourceUrl || null } });
      return inserted;
    });
    return NextResponse.json({ ok: true, id: created.id, status: "open" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] student feedback flag creation failed", error);
    return NextResponse.json({ error: "Could not send your report. Please try again later." }, { status: 503 });
  }
}
