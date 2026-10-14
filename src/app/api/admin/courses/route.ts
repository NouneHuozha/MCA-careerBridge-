import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, courses } from "@/db/schema";
import { getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";
const levels = new Set(["higher_secondary", "diploma", "undergraduate", "postgraduate", "certificate"]);
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
function validUrl(value: string) {
  if (!value) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const slug = clean(input.slug);
  const name = clean(input.name);
  const level = clean(input.level);
  const fieldSlug = clean(input.fieldSlug) || null;
  const durationLabel = clean(input.durationLabel) || null;
  const eligibility = clean(input.eligibility);
  const sourceUrl = clean(input.sourceUrl) || null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return NextResponse.json({ error: "Use a lowercase stable slug with letters, numbers, and hyphens." }, { status: 400 });
  if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Course name must be between 2 and 160 characters." }, { status: 400 });
  if (!levels.has(level)) return NextResponse.json({ error: "Choose a supported course level." }, { status: 400 });
  if (durationLabel && durationLabel.length > 60) return NextResponse.json({ error: "Duration must be 60 characters or fewer." }, { status: 400 });
  if (eligibility.length < 2 || eligibility.length > 4000) return NextResponse.json({ error: "General eligibility must be between 2 and 4,000 characters." }, { status: 400 });
  if (sourceUrl && (sourceUrl.length > 2048 || !validUrl(sourceUrl))) return NextResponse.json({ error: "Enter a valid HTTP or HTTPS source URL." }, { status: 400 });
  if (fieldSlug) {
    const fields = await getFields();
    if (!fields.some((field) => field.slug === fieldSlug)) return NextResponse.json({ error: "Choose a field that exists in the catalogue." }, { status: 400 });
  }

  try {
    const existing = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1);
    if (existing.length) return NextResponse.json({ error: "A course with this slug already exists." }, { status: 409 });
    await db.transaction(async (tx) => {
      await tx.insert(courses).values({
        slug,
        name,
        level,
        durationLabel,
        eligibility,
        relevantSubjects: [],
        entranceRequirement: null,
        careerDirections: [],
        furtherStudy: [],
        fieldSlug,
        feeNote: null,
        scholarshipNote: null,
        examSlugs: [],
        sourceUrl,
        verificationStatus: "needs_verification",
        lastVerifiedAt: null,
      });
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "course_created",
        entityType: "course",
        entityRef: slug,
        metadata: { name, level, fieldSlug, durationLabel, verificationStatus: "needs_verification", sourceUrl },
      });
    });
    return NextResponse.json({ ok: true, slug, verificationStatus: "needs_verification" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] course creation failed", error);
    return NextResponse.json({ error: "Could not save the course. Please confirm database access and try again." }, { status: 503 });
  }
}
