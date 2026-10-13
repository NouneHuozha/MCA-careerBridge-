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
