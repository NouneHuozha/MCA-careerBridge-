import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, institutionSources, institutions } from "@/db/schema";

export const dynamic = "force-dynamic";
const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string" || value.length > 2048) return false;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
};
const allowedSourceTypes = new Set(["official_api", "official_site", "govt_portal", "official_pdf", "secondary"]);

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const { code } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;

  try {
    const existing = await db.select().from(institutions).where(eq(institutions.code, code)).limit(1);
    const institution = existing[0];
    if (!institution) return NextResponse.json({ error: "Institution not found." }, { status: 404 });

    if (input.action === "add_source") {
      const title = typeof input.title === "string" ? input.title.trim() : "";
      const sourceType = typeof input.sourceType === "string" ? input.sourceType : "";
      const url = input.url;
      if (title.length < 2 || title.length > 200) return NextResponse.json({ error: "Source title must be between 2 and 200 characters." }, { status: 400 });
      if (!allowedSourceTypes.has(sourceType)) return NextResponse.json({ error: "Choose a supported source type." }, { status: 400 });
      if (!isHttpUrl(url)) return NextResponse.json({ error: "Enter a valid HTTP or HTTPS source URL." }, { status: 400 });
      const duplicate = await db.select({ id: institutionSources.id }).from(institutionSources).where(and(eq(institutionSources.institutionCode, code), eq(institutionSources.url, url))).limit(1);
      if (duplicate.length) return NextResponse.json({ error: "This source URL is already attached to the institution." }, { status: 409 });
      const result = await db.transaction(async (tx) => {
        const [source] = await tx.insert(institutionSources).values({
          institutionCode: code,
          sourceType,
          priority: 3,
          title,
          url,
          status: "unverified",
          retrievedAt: null,
        }).returning({ id: institutionSources.id });
        await tx.insert(auditEvents).values({
          actor: user.email,
          action: "institution_source_added",
          entityType: "institution",
          entityRef: code,
          metadata: { sourceId: source.id, title, sourceType, url, status: "unverified" },
        });
        return source;
      });
      return NextResponse.json({ ok: true, sourceId: result.id, status: "unverified" }, { status: 201 });
    }

    if (input.action !== "mark_verified") return NextResponse.json({ error: "Unsupported institution action." }, { status: 400 });
    const sourceUrl = input.sourceUrl;
    const reviewNote = typeof input.reviewNote === "string" ? input.reviewNote.trim() : "";
    if (!isHttpUrl(sourceUrl)) return NextResponse.json({ error: "Add a valid official source URL before verifying." }, { status: 400 });
    if (input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that the current details were checked against this evidence." }, { status: 400 });
    if (reviewNote.length < 8 || reviewNote.length > 500) return NextResponse.json({ error: "Add a review note between 8 and 500 characters." }, { status: 400 });

    const checkedAt = new Date();
    await db.transaction(async (tx) => {
      await tx.update(institutions).set({ verificationStatus: "verified", sourceUrl, lastVerifiedAt: checkedAt, updatedAt: checkedAt }).where(eq(institutions.code, code));
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "institution_marked_verified",
        entityType: "institution",
        entityRef: institution.code,
        metadata: {
          previousStatus: institution.verificationStatus,
          newStatus: "verified",
          previousSourceUrl: institution.sourceUrl,
          sourceUrl,
          reviewNote,
          lastVerifiedAt: checkedAt.toISOString(),
        },
      });
    });
    return NextResponse.json({ ok: true, verificationStatus: "verified", lastVerifiedAt: checkedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] institution admin action failed", error);
    return NextResponse.json({ error: "Could not save the admin action." }, { status: 503 });
  }
}
