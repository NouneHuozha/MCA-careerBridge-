import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { flags } from "@/db/schema";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to view this profile." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  let actionableCount: number | null = null;
  try {
    const [institutions, openFlags] = await Promise.all([
      getInstitutions({}),
      db.select({ id: flags.id }).from(flags).where(inArray(flags.status, ["open", "in_review"])),
    ]);
    const verified = new Set(["verified", "current", "recently_verified", "published_verified"]);
    const reviewCutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const needsReview = institutions.filter((institution) => !verified.has(institution.verificationStatus) || !institution.lastVerifiedAt || institution.lastVerifiedAt.getTime() < reviewCutoff).length;
    actionableCount = needsReview + openFlags.length;
  } catch (error) {
    console.warn("[careerbridge] profile actionable count unavailable", error);
  }
  const roleLabels: Record<string, string> = { admin: "Administrator", content_editor: "Content editor", verifier: "Verifier", viewer: "Viewer" };
  return NextResponse.json({ name: user.name, email: user.email, role: user.role, roleLabel: roleLabels[user.role] ?? "Workspace member", actionableCount });
}
