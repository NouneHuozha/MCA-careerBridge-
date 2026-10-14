import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, courses, institutionCourses, institutions } from "@/db/schema";

export const dynamic = "force-dynamic";
const availabilityStates = new Set(["offered", "not_currently_confirmed", "historically_offered", "not_offered", "unknown"]);
function httpUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}
const cleanText = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const institutionCode = cleanText(input.institutionCode, 64);
  const courseSlug = cleanText(input.courseSlug, 80);
  if (!institutionCode || !courseSlug) return NextResponse.json({ error: "Choose an institution and course." }, { status: 400 });
  try {
    const [[institution], [course]] = await Promise.all([
      db.select({ code: institutions.code, name: institutions.name }).from(institutions).where(eq(institutions.code, institutionCode)).limit(1),
      db.select({ slug: courses.slug, name: courses.name }).from(courses).where(eq(courses.slug, courseSlug)).limit(1),
    ]);
    if (!institution) return NextResponse.json({ error: "Institution not found." }, { status: 404 });
    if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
    const [duplicate] = await db.select({ id: institutionCourses.id }).from(institutionCourses).where(and(eq(institutionCourses.institutionCode, institutionCode), eq(institutionCourses.courseSlug, courseSlug))).limit(1);
    if (duplicate) return NextResponse.json({ error: "This institution-course link already exists." }, { status: 409 });
    const created = await db.transaction(async (tx) => {
      const [link] = await tx.insert(institutionCourses).values({ institutionCode, courseSlug, verificationStatus: "unknown", sourceUrl: null, lastVerifiedAt: null, seatsNote: null, feeNote: null }).returning({ id: institutionCourses.id });
      await tx.insert(auditEvents).values({ actor: user.email, action: "institution_course_link_created", entityType: "institution_course", entityRef: String(link.id), metadata: { linkId: link.id, institutionCode, institutionName: institution.name, courseSlug, courseName: course.name, availability: "unknown" } });
      return link;
    });
    return NextResponse.json({ ok: true, id: created.id, availability: "unknown" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] institution-course link creation failed", error);
    return NextResponse.json({ error: "Could not add the institution-course link. Please try again." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  if (input.action !== "review_availability") return NextResponse.json({ error: "Unsupported institution-course action." }, { status: 400 });
  const id = Number(input.id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "A valid institution-course link is required." }, { status: 400 });
  const availability = input.availability;
  if (typeof availability !== "string" || !availabilityStates.has(availability)) return NextResponse.json({ error: "Choose a supported availability status." }, { status: 400 });
  const rawSourceUrl = cleanText(input.sourceUrl, 2048);
  const sourceUrl = rawSourceUrl || null;
  if (rawSourceUrl && !httpUrl(rawSourceUrl)) return NextResponse.json({ error: "Evidence URL must be a valid HTTP or HTTPS URL." }, { status: 400 });
  if (["offered", "not_offered", "historically_offered"].includes(availability) && !sourceUrl) return NextResponse.json({ error: "Add reliable source evidence before recording a confirmed availability status." }, { status: 400 });
  const reviewNote = cleanText(input.reviewNote, 500);
  if (reviewNote.length < 8) return NextResponse.json({ error: "Add a reviewer note of at least 8 characters." }, { status: 400 });
  if (input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that availability was checked against this evidence." }, { status: 400 });
  const seatsNote = cleanText(input.seatsNote, 500);
  const feeNote = cleanText(input.feeNote, 500);

  try {
    const [link] = await db.select().from(institutionCourses).where(eq(institutionCourses.id, id)).limit(1);
    if (!link) return NextResponse.json({ error: "Institution-course link not found." }, { status: 404 });
    const [[institution], [course]] = await Promise.all([
      db.select({ name: institutions.name }).from(institutions).where(eq(institutions.code, link.institutionCode)).limit(1),
      db.select({ name: courses.name }).from(courses).where(eq(courses.slug, link.courseSlug)).limit(1),
    ]);
    const checkedAt = new Date();
    await db.transaction(async (tx) => {
      await tx.update(institutionCourses).set({ verificationStatus: availability, sourceUrl, seatsNote: seatsNote || null, feeNote: feeNote || null, lastVerifiedAt: checkedAt }).where(eq(institutionCourses.id, id));
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "institution_course_availability_reviewed",
        entityType: "institution_course",
        entityRef: String(id),
        metadata: {
          linkId: id,
          institutionCode: link.institutionCode,
          institutionName: institution?.name ?? link.institutionCode,
          courseSlug: link.courseSlug,
          courseName: course?.name ?? link.courseSlug,
          previousAvailability: link.verificationStatus,
          availability,
          previousSeatsNote: link.seatsNote,
          seatsNote: seatsNote || null,
          previousFeeNote: link.feeNote,
          feeNote: feeNote || null,
          previousSourceUrl: link.sourceUrl,
          sourceUrl,
          reviewNote,
          lastCheckedAt: checkedAt.toISOString(),
        },
      });
    });
    return NextResponse.json({ ok: true, availability, lastCheckedAt: checkedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] institution-course availability review failed", error);
    return NextResponse.json({ error: "Could not save the availability review. Please try again." }, { status: 503 });
  }
}
