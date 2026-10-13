import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";
const allowedRoles = new Set(["admin", "content_editor", "verifier", "viewer"]);
const teamRoles = ["admin", "content_editor", "verifier", "viewer"];

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const team = await db.select({ id: users.id, name: users.fullName, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).where(inArray(users.role, teamRoles)).orderBy(users.createdAt);
    return NextResponse.json({ team });
  } catch (error) {
    console.error("[careerbridge] team access list failed", error);
    return NextResponse.json({ error: "Could not load team access." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed as Record<string, unknown>;
  } catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const userId = Number(input.userId);
  const role = input.role;
  if (!Number.isSafeInteger(userId) || userId < 1 || typeof role !== "string" || !allowedRoles.has(role)) return NextResponse.json({ error: "Choose a valid team member and role." }, { status: 400 });
  try {
    const [target] = await db.select({ id: users.id, role: users.role }).from(users).where(and(eq(users.id, userId), inArray(users.role, teamRoles))).limit(1);
    if (!target) return NextResponse.json({ error: "That account is not an active team member." }, { status: 404 });
    if (target.role === "admin" && role !== "admin") {
      const administrators = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
      if (administrators.length <= 1) return NextResponse.json({ error: "At least one administrator must remain." }, { status: 409 });
    }
    await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
    return NextResponse.json({ ok: true, userId, role });
  } catch (error) {
    console.error("[careerbridge] team role update failed", error);
    return NextResponse.json({ error: "Could not update this role." }, { status: 503 });
  }
}
