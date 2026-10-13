import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { adminWorkspaceSettings } from "@/db/schema";

export const dynamic = "force-dynamic";
const key = "workspace_preferences";
const frequencies = new Set(["daily", "weekly", "monthly", "quarterly", "manual"]);
const reviewFields = new Set(["eligibility", "fees", "deadlines", "course availability"]);
const defaults = { refreshFrequency: "weekly", automaticRefresh: false, reviewFields: ["eligibility", "fees", "deadlines", "course availability"], retainPreviousValues: true };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  try {
    const [record] = await db.select().from(adminWorkspaceSettings).where(eq(adminWorkspaceSettings.settingKey, key)).limit(1);
    return NextResponse.json({ preferences: record?.settingValue ?? defaults, updatedAt: record?.updatedAt.toISOString() ?? null });
  } catch (error) {
    console.error("[careerbridge] admin settings read failed", error);
    return NextResponse.json({ error: "Settings storage is unavailable. Apply migration 0004_admin_workspace_settings.sql." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed as Record<string, unknown>;
  } catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const { refreshFrequency, automaticRefresh, reviewFields: selectedFields, retainPreviousValues } = input;
  if (typeof refreshFrequency !== "string" || !frequencies.has(refreshFrequency)) return NextResponse.json({ error: "Choose a supported refresh frequency." }, { status: 400 });
  if (typeof automaticRefresh !== "boolean" || typeof retainPreviousValues !== "boolean") return NextResponse.json({ error: "Toggle settings must be true or false." }, { status: 400 });
  if (!Array.isArray(selectedFields) || selectedFields.some((field) => typeof field !== "string" || !reviewFields.has(field))) return NextResponse.json({ error: "Choose supported review fields." }, { status: 400 });
  const preferences = { refreshFrequency, automaticRefresh, reviewFields: [...new Set(selectedFields as string[])], retainPreviousValues };
  const updatedAt = new Date();
  try {
    await db.insert(adminWorkspaceSettings).values({ settingKey: key, settingValue: preferences, updatedBy: user.id, updatedAt }).onConflictDoUpdate({
      target: adminWorkspaceSettings.settingKey,
      set: { settingValue: preferences, updatedBy: user.id, updatedAt },
    });
    return NextResponse.json({ ok: true, preferences, updatedAt: updatedAt.toISOString(), schedulerConnected: false });
  } catch (error) {
    console.error("[careerbridge] admin settings update failed", error);
    return NextResponse.json({ error: "Could not save settings. Confirm migration 0004_admin_workspace_settings.sql has been applied." }, { status: 503 });
  }
}
