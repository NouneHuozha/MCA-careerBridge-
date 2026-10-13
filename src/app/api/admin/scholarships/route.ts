import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, scholarships } from "@/db/schema";

export const dynamic = "force-dynamic";
const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validUrl = (value: string) => { if (!value) return true; try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; } };
function stringList(value: unknown, maxItems: number, maxLength: number): string[] | null {
  const items = Array.isArray(value) ? value : typeof value === "string" ? value.split(/\r?\n/) : [];
  if (items.length > maxItems || items.some((item) => typeof item !== "string" || item.length > maxLength)) return null;
  return items.map((item) => String(item).trim()).filter(Boolean);
}
function parseScholarship(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { error: "Scholarship details must be an object." } as const;
  const input = value as Record<string, unknown>;
  const name = text(input.name, 180);
  const provider = text(input.provider, 160);
  const category = text(input.category, 80);
  const eligibility = text(input.eligibility, 5000);
  const amountNote = text(input.amountNote, 2000);
  const deadlineNote = text(input.deadlineNote, 160);
  const cycleLabel = text(input.cycleLabel, 80);
  const officialUrl = text(input.officialUrl, 2048);
  const sourceUrl = text(input.sourceUrl, 2048);
  const documents = stringList(input.documents, 50, 500);
  const appliesToStage = stringList(input.appliesToStage, 20, 80);
  if (name.length < 2) return { error: "Scholarship name must contain at least 2 characters." } as const;
  if (!documents || !appliesToStage) return { error: "Documents and education stages must be lists of valid text values." } as const;
  if (!validUrl(officialUrl) || !validUrl(sourceUrl)) return { error: "Official and source links must be valid HTTP or HTTPS URLs." } as const;
  return { value: { name, provider: provider || null, category: category || null, eligibility: eligibility || null, amountNote: amountNote || null, deadlineNote: deadlineNote || null, cycleLabel: cycleLabel || null, officialUrl: officialUrl || null, sourceUrl: sourceUrl || null, documents, appliesToStage } } as const;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const slug = text(input.slug, 64);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "Use a lowercase stable slug with letters, numbers, and hyphens." }, { status: 400 });
  const parsed = parseScholarship(input.scholarship);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const [existing] = await db.select({ id: scholarships.id }).from(scholarships).where(eq(scholarships.slug, slug)).limit(1);
    if (existing) return NextResponse.json({ error: "A scholarship with this slug already exists." }, { status: 409 });
    await db.transaction(async (tx) => {
      await tx.insert(scholarships).values({ slug, ...parsed.value, verificationStatus: "needs_verification", lastVerifiedAt: null });
      await tx.insert(auditEvents).values({ actor: user.email, action: "scholarship_created", entityType: "scholarship", entityRef: slug, metadata: { ...parsed.value, slug, verificationStatus: "needs_verification" } });
    });
    return NextResponse.json({ ok: true, slug, verificationStatus: "needs_verification" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] scholarship creation failed", error);
    return NextResponse.json({ error: "Could not save the scholarship. Confirm database access and try again." }, { status: 503 });
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
  const slug = text(input.slug, 64);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "A valid scholarship slug is required." }, { status: 400 });
  if (!["save_draft", "mark_verified"].includes(String(input.action))) return NextResponse.json({ error: "Unsupported scholarship action." }, { status: 400 });
  const parsed = parseScholarship(input.scholarship);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const reviewNote = text(input.reviewNote, 500);
  if (input.action === "mark_verified") {
    if (!parsed.value.sourceUrl) return NextResponse.json({ error: "Add an official evidence URL before verifying." }, { status: 400 });
    if (reviewNote.length < 8) return NextResponse.json({ error: "Add a reviewer note of at least 8 characters." }, { status: 400 });
    if (input.confirmEvidence !== true) return NextResponse.json({ error: "Confirm that the scholarship details and cycle-specific deadline were checked against the source." }, { status: 400 });
    if (parsed.value.deadlineNote && !parsed.value.cycleLabel) return NextResponse.json({ error: "Add the applicable cycle label when recording a deadline." }, { status: 400 });
  }
  try {
    const [existing] = await db.select().from(scholarships).where(eq(scholarships.slug, slug)).limit(1);
    if (!existing) return NextResponse.json({ error: "Scholarship not found." }, { status: 404 });
    const previous = { name: existing.name, provider: existing.provider, category: existing.category, eligibility: existing.eligibility, amountNote: existing.amountNote, deadlineNote: existing.deadlineNote, cycleLabel: existing.cycleLabel, documents: existing.documents, officialUrl: existing.officialUrl, sourceUrl: existing.sourceUrl, appliesToStage: existing.appliesToStage, verificationStatus: existing.verificationStatus };
    const changed = JSON.stringify({ name: previous.name, provider: previous.provider, category: previous.category, eligibility: previous.eligibility, amountNote: previous.amountNote, deadlineNote: previous.deadlineNote, cycleLabel: previous.cycleLabel, documents: previous.documents, officialUrl: previous.officialUrl, sourceUrl: previous.sourceUrl, appliesToStage: previous.appliesToStage }) !== JSON.stringify(parsed.value);
    const checkedAt = input.action === "mark_verified" ? new Date() : changed ? null : existing.lastVerifiedAt;
    const newStatus = input.action === "mark_verified" ? "verified" : changed ? "needs_verification" : existing.verificationStatus;
    await db.transaction(async (tx) => {
      await tx.update(scholarships).set({ ...parsed.value, verificationStatus: newStatus, lastVerifiedAt: checkedAt }).where(eq(scholarships.slug, slug));
      await tx.insert(auditEvents).values({ actor: user.email, action: input.action === "mark_verified" ? "scholarship_marked_verified" : "scholarship_draft_saved", entityType: "scholarship", entityRef: slug, metadata: { previous, proposed: parsed.value, verificationStatus: newStatus, lastVerifiedAt: checkedAt?.toISOString() ?? null, ...(input.action === "mark_verified" ? { reviewNote, sourceUrl: parsed.value.sourceUrl } : {}) } });
    });
    return NextResponse.json({ ok: true, slug, verificationStatus: newStatus, lastVerifiedAt: checkedAt?.toISOString() ?? null });
  } catch (error) {
    console.error("[careerbridge] scholarship update failed", error);
    return NextResponse.json({ error: "Could not save the scholarship review. Please try again." }, { status: 503 });
  }
}
