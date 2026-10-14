import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, institutions } from "@/db/schema";

export const dynamic = "force-dynamic";

const institutionTypes = new Set(["university", "college", "institute", "polytechnic", "iti", "school", "training_centre"]);
const ownershipTypes = new Set(["government", "private", "autonomous", "central"]);
const cleanText = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });

  const input = body as Record<string, unknown>;
  const rawCode = cleanText(input.code);
  const code = rawCode.toUpperCase();
  const name = cleanText(input.name);
  const type = cleanText(input.type);
  const ownership = cleanText(input.ownership);
  const district = cleanText(input.district);
  const state = cleanText(input.state);

  if (rawCode.length > 64 || !/^[A-Z0-9]+(?:[-_][A-Z0-9]+)*$/.test(code) || code.length < 2) {
    return NextResponse.json({ error: "Use a 2–64 character code containing letters, numbers, hyphens, or underscores." }, { status: 400 });
  }
  if (name.length < 2 || name.length > 200) return NextResponse.json({ error: "Institution name must be between 2 and 200 characters." }, { status: 400 });
  if (type.length > 60 || !institutionTypes.has(type)) return NextResponse.json({ error: "Choose a supported institution type." }, { status: 400 });
  if (ownership.length > 40 || !ownershipTypes.has(ownership)) return NextResponse.json({ error: "Choose a supported ownership type." }, { status: 400 });
  if (district.length < 2 || district.length > 60) return NextResponse.json({ error: "District must be between 2 and 60 characters." }, { status: 400 });
  if (state.length < 2 || state.length > 60) return NextResponse.json({ error: "State must be between 2 and 60 characters." }, { status: 400 });

  try {
    const existing = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.code, code)).limit(1);
    if (existing.length) return NextResponse.json({ error: "An institution with this code already exists." }, { status: 409 });

    await db.transaction(async (tx) => {
      await tx.insert(institutions).values({
        code,
        name,
        type,
        ownership,
        district,
        state,
        datasetLabel: "admin-entry-v1",
        verificationStatus: "needs_verification",
        sourceUrl: null,
        lastVerifiedAt: null,
      });
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "institution_created",
        entityType: "institution",
        entityRef: code,
        metadata: {
          name,
          type,
          ownership,
          district,
          state,
          verificationStatus: "needs_verification",
        },
      });
    });

    return NextResponse.json({ ok: true, code, verificationStatus: "needs_verification" }, { status: 201 });
  } catch (error) {
    console.error("[careerbridge] institution creation failed", error);
    return NextResponse.json({ error: "Could not save the institution. Please try again." }, { status: 503 });
  }
}
