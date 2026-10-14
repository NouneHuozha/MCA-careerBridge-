import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, courses } from "@/db/schema";

export const dynamic = "force-dynamic";
function validHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const { slug } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (input.action === "save_draft") {
    const draft = input.course;
    if (!draft || typeof draft !== "object" || Array.isArray(draft)) return NextResponse.json({ error: "Course draft must be an object." }, { status: 400 });
    const values = draft as Record<string, unknown>;
    const stringFields = ["name", "level", "durationLabel", "eligibility", "entranceRequirement", "feeNote", "scholarshipNote", "sourceUrl"] as const;
    const arrayFields = ["relevantSubjects", "careerDirections", "furtherStudy"] as const;
    for (const field of stringFields) {
      const value = values[field];
      if (typeof value !== "string") return NextResponse.json({ error: `Invalid ${field} value.` }, { status: 400 });
      if (value.length > (field === "sourceUrl" ? 2048 : field === "eligibility" || field === "entranceRequirement" || field === "feeNote" || field === "scholarshipNote" ? 4000 : 500)) return NextResponse.json({ error: `${field} is too long.` }, { status: 400 });
    }
    if (!String(values.name).trim() || !String(values.level).trim() || !String(values.eligibility).trim()) return NextResponse.json({ error: "Course name, level, and eligibility are required." }, { status: 400 });
    const sourceUrl = String(values.sourceUrl).trim();
    if (sourceUrl && !validHttpUrl(sourceUrl)) return NextResponse.json({ error: "Source URL must be a valid HTTP or HTTPS URL." }, { status: 400 });
    for (const field of arrayFields) {
      const value = values[field];
      if (!Array.isArray(value) || value.length > 40 || value.some((item) => typeof item !== "string" || item.length > 300)) return NextResponse.json({ error: `Invalid ${field} list.` }, { status: 400 });
    }
    try {
      const [course] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
      if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
      const updates: Partial<typeof courses.$inferInsert> = {
        name: String(values.name).trim(), level: String(values.level).trim(), durationLabel: String(values.durationLabel).trim() || null,
        eligibility: String(values.eligibility).trim(), entranceRequirement: String(values.entranceRequirement).trim() || null,
        feeNote: String(values.feeNote).trim() || null, scholarshipNote: String(values.scholarshipNote).trim() || null,
        sourceUrl: sourceUrl || null,
        relevantSubjects: (values.relevantSubjects as string[]).map((item) => item.trim()).filter(Boolean),
        careerDirections: (values.careerDirections as string[]).map((item) => item.trim()).filter(Boolean),
        furtherStudy: (values.furtherStudy as string[]).map((item) => item.trim()).filter(Boolean),
      };
      const previous = { name: course.name, level: course.level, durationLabel: course.durationLabel, eligibility: course.eligibility, relevantSubjects: course.relevantSubjects, entranceRequirement: course.entranceRequirement, careerDirections: course.careerDirections, furtherStudy: course.furtherStudy, feeNote: course.feeNote, scholarshipNote: course.scholarshipNote, sourceUrl: course.sourceUrl };
      const changedFields = Object.keys(updates).filter((key) => JSON.stringify(previous[key as keyof typeof previous] ?? null) !== JSON.stringify(updates[key as keyof typeof updates] ?? null));
      if (changedFields.length) await db.transaction(async (tx) => {
        await tx.update(courses).set(updates).where(eq(courses.slug, slug));
        await tx.insert(auditEvents).values({ actor: user.email, action: "course_draft_saved", entityType: "course", entityRef: slug, metadata: { changedFields, previous, proposed: updates, verificationStatusPreserved: course.verificationStatus } });
      });
      return NextResponse.json({ ok: true, changedFields, verificationStatus: course.verificationStatus });
    } catch (error) {
      console.error("[careerbridge] course draft save failed", error);
      return NextResponse.json({ error: "Could not save the course draft. Please try again." }, { status: 503 });
    }
  }
  if (input.action !== "mark_verified") return NextResponse.json({ error: "Unsupported course action." }, { status: 400 });
  const sourceUrl = input.sourceUrl;
  if (!validHttpUrl(sourceUrl)) return NextResponse.json({ error: "Add a valid HTTP or HTTPS evidence URL before verifying." }, { status: 400 });
  const reviewNote = typeof input.reviewNote === "string" ? input.reviewNote.trim() : "";
  if (reviewNote.length < 8 || reviewNote.length > 500) return NextResponse.json({ error: "Add a review note between 8 and 500 characters." }, { status: 400 });
  if (input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that the course record was checked against this evidence." }, { status: 400 });

  try {
    const [course] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    const checkedAt = new Date();
    await db.transaction(async (tx) => {
      await tx.update(courses).set({ verificationStatus: "verified", sourceUrl, lastVerifiedAt: checkedAt }).where(eq(courses.slug, slug));
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "course_marked_verified",
        entityType: "course",
        entityRef: slug,
        metadata: {
          previousStatus: course.verificationStatus,
          newStatus: "verified",
          previousSourceUrl: course.sourceUrl,
          sourceUrl,
          reviewNote,
          lastVerifiedAt: checkedAt.toISOString(),
        },
      });
    });
    return NextResponse.json({ ok: true, verificationStatus: "verified", lastVerifiedAt: checkedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] course verification failed", error);
    return NextResponse.json({ error: "Could not save the course review. Please try again." }, { status: 503 });
  }
}
