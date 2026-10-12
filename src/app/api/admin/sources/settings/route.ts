import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, sourceRefreshSettings } from "@/db/schema";
import { getAdminSourceRegistry } from "@/services/admin-sources";

export const dynamic = "force-dynamic";
const allowedFrequencies = new Set(["daily", "weekly", "monthly", "quarterly", "manual"]);

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const sourceKey = typeof input.sourceKey === "string" ? input.sourceKey.trim() : "";
  const refreshEnabled = input.refreshEnabled;
  const refreshFrequency = input.refreshFrequency;
  if (sourceKey.length > 2048) return NextResponse.json({ error: "Source URL is too long." }, { status: 400 });
  try {
    const parsed = new URL(sourceKey);
    if (!["http:", "https:"].includes(parsed.protocol)) return NextResponse.json({ error: "Choose a valid HTTP or HTTPS catalogue source." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Choose a valid HTTP or HTTPS catalogue source." }, { status: 400 });
  }
  if (typeof refreshEnabled !== "boolean") return NextResponse.json({ error: "Refresh enabled must be true or false." }, { status: 400 });
  if (typeof refreshFrequency !== "string" || !allowedFrequencies.has(refreshFrequency)) return NextResponse.json({ error: "Choose a supported refresh frequency." }, { status: 400 });
  if (refreshEnabled && refreshFrequency === "manual") return NextResponse.json({ error: "Choose a scheduled frequency or turn automatic refresh off." }, { status: 400 });

  try {
    const registry = await getAdminSourceRegistry();
    const source = registry.sources.find((item) => item.sourceKey === sourceKey);
    if (!source) return NextResponse.json({ error: "That source is not in the current catalogue." }, { status: 404 });

    const [previous] = await db.select().from(sourceRefreshSettings).where(eq(sourceRefreshSettings.sourceKey, sourceKey)).limit(1);
    const updatedAt = new Date();
    const sourceRef = createHash("sha256").update(sourceKey).digest("hex").slice(0, 24);
    await db.transaction(async (tx) => {
      await tx.insert(sourceRefreshSettings).values({
        sourceKey,
        refreshEnabled,
        refreshFrequency: refreshFrequency as "daily" | "weekly" | "monthly" | "quarterly" | "manual",
        fetchMethod: "manual",
        updatedBy: user.email,
        updatedAt,
      }).onConflictDoUpdate({
        target: sourceRefreshSettings.sourceKey,
        set: {
          refreshEnabled,
          refreshFrequency: refreshFrequency as "daily" | "weekly" | "monthly" | "quarterly" | "manual",
          updatedBy: user.email,
          updatedAt,
        },
      });
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "source_refresh_settings_updated",
        entityType: "source",
        entityRef: sourceRef,
        metadata: {
          sourceTitle: source.title,
          sourceKey,
          previous: previous ? { refreshEnabled: previous.refreshEnabled, refreshFrequency: previous.refreshFrequency } : null,
          next: { refreshEnabled, refreshFrequency },
          schedulerConnected: false,
        },
        createdAt: updatedAt,
      });
    });
    return NextResponse.json({ ok: true, updatedAt: updatedAt.toISOString(), schedulerConnected: false });
  } catch (error) {
    console.error("[careerbridge] source refresh settings update failed", error);
    return NextResponse.json({ error: "Could not save settings. Confirm that the source refresh settings migration has been applied and try again." }, { status: 503 });
  }
}
