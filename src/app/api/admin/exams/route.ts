import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, entranceExams } from "@/db/schema";

export const dynamic = "force-dynamic";
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
  const shortName = clean(input.shortName) || null;
  const conductingBody = clean(input.conductingBody) || null;
  const levelStage = clean(input.levelStage);
  const sourceUrl = clean(input.sourceUrl) || null;
  const appliesTo = typeof input.appliesTo === "string" ? input.appliesTo.split(/\r?\n/).map((item) => item.trim()).filter(Boolean).slice(0, 20) : [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 64) return NextResponse.json({ error: "Use a lowercase stable slug with letters, numbers, and hyphens." }, { status: 400 });
  if (name.length < 2 || name.length > 160) return NextResponse.json({ error: "Exam name must be between 2 and 160 characters." }, { status: 400 });
  if (shortName && shortName.length > 40) return NextResponse.json({ error: "Short name must be 40 characters or fewer." }, { status: 400 });
  if (conductingBody && conductingBody.length > 160) return NextResponse.json({ error: "Conducting body must be 160 characters or fewer." }, { status: 400 });
  if (appliesTo.join(" ").length > 2000) return NextResponse.json({ error: "Programmes must total 2,000 characters or fewer." }, { status: 400 });
  if (!["after_class10", "after_class12"].includes(levelStage)) return NextResponse.json({ error: "Choose a supported education stage." }, { status: 400 });
  if (sourceUrl && (sourceUrl.length > 2048 || !validUrl(sourceUrl))) return NextResponse.json({ error: "Enter a valid HTTP or HTTPS source URL." }, { status: 400 });

  try {
    const existing = await db.select({ id: entranceExams.id }).from(entranceExams).where(eq(entranceExams.slug, slug)).limit(1);
    if (existing.length) return NextResponse.json({ error: "An entrance exam with this slug already exists." }, { status: 409 });
    await db.transaction(async (tx) => {
      await tx.insert(entranceExams).values({ slug, name, shortName, conductingBody, appliesTo, eligibility: null, applicationPeriod: null, examDate: null, officialWebsite: sourceUrl, documents: [], preparation: [], levelStage, sourceUrl, verificationStatus: "needs_verification", lastVerifiedAt: null });
      await tx.insert(auditEvents).values({ actor: user.email, action: "entrance_exam_created", entityType: "entrance_exam", entityRef: slug, metadata: { name, shortName, conductingBody, levelStage, appliesTo, sourceUrl, verificationStatus: "needs_verification" } });
    });
    return NextResponse.json({ ok: true, slug, verificationStatus: "needs_verification" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] entrance exam creation failed", error);
    return NextResponse.json({ error: "Could not save the exam. Please confirm database access and try again." }, { status: 503 });
  }
}
