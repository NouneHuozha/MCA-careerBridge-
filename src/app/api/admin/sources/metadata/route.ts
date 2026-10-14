import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, institutionSources, sourceRefreshSettings } from "@/db/schema";
import { getAdminSourceRegistry, normaliseSourceUrl } from "@/services/admin-sources";

export const dynamic = "force-dynamic";
const allowedSourceTypes = new Set(["official_api", "official_site", "official_authority", "govt_portal", "official_pdf", "secondary"]);

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const sourceKey = typeof input.sourceKey === "string" ? normaliseSourceUrl(input.sourceKey) : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const sourceType = typeof input.sourceType === "string" ? input.sourceType : "";
  const rawUrl = typeof input.url === "string" ? input.url.trim() : "";
  if (!sourceKey || sourceKey.length > 2048) return NextResponse.json({ error: "Choose a source from the registry." }, { status: 400 });
  if (title.length < 2 || title.length > 200) return NextResponse.json({ error: "Source title must be between 2 and 200 characters." }, { status: 400 });
  if (!allowedSourceTypes.has(sourceType)) return NextResponse.json({ error: "Choose a supported source type." }, { status: 400 });
  if (rawUrl.length > 2048) return NextResponse.json({ error: "Source URL is too long." }, { status: 400 });
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
    if (!["https:", "http:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password) throw new Error("invalid");
  } catch {
    return NextResponse.json({ error: "Enter a valid HTTP or HTTPS source URL." }, { status: 400 });
  }
  const url = parsedUrl.toString();
  const nextSourceKey = normaliseSourceUrl(url);

  try {
    const registry = await getAdminSourceRegistry();
    const source = registry.sources.find((item) => item.sourceKey === sourceKey);
    if (!source) return NextResponse.json({ error: "That source is no longer in the catalogue." }, { status: 404 });
    if (!source.sourceRecordIds.length) return NextResponse.json({ error: "This source is derived from an approved catalogue field and cannot be edited in the source registry yet." }, { status: 409 });
    if (sourceKey !== nextSourceKey && registry.sources.some((item) => item.sourceKey === nextSourceKey)) {
      return NextResponse.json({ error: "Another catalogue source already uses that URL." }, { status: 409 });
    }

    const records = await db.select().from(institutionSources).where(inArray(institutionSources.id, source.sourceRecordIds));
    const matching = records.filter((item) => normaliseSourceUrl(item.url ?? "") === sourceKey);
    if (!matching.length) return NextResponse.json({ error: "The stored source record could not be found." }, { status: 404 });
    const matchingIds = matching.map((item) => item.id);
    const [existingNextSetting] = sourceKey === nextSourceKey ? [] : await db.select().from(sourceRefreshSettings).where(eq(sourceRefreshSettings.sourceKey, nextSourceKey)).limit(1);
    const [existingSetting] = await db.select().from(sourceRefreshSettings).where(eq(sourceRefreshSettings.sourceKey, sourceKey)).limit(1);
    if (existingNextSetting) return NextResponse.json({ error: "The new URL already has saved refresh settings; resolve that source before changing this URL." }, { status: 409 });

    const updatedAt = new Date();
    const sourceRef = createHash("sha256").update(nextSourceKey).digest("hex").slice(0, 24);
    await db.transaction(async (tx) => {
      await tx.update(institutionSources).set({ title, sourceType, url }).where(inArray(institutionSources.id, matchingIds));
      if (existingSetting && sourceKey !== nextSourceKey) {
        await tx.update(sourceRefreshSettings).set({ sourceKey: nextSourceKey, updatedBy: user.email, updatedAt }).where(eq(sourceRefreshSettings.sourceKey, sourceKey));
      }
      await tx.insert(auditEvents).values({
        actor: user.email,
        action: "source_record_updated",
        entityType: "source",
        entityRef: sourceRef,
        metadata: {
          sourceTitle: title,
          previous: { title: source.title, sourceType: source.sourceType, url: source.url },
          next: { title, sourceType, url },
          linkedInstitutionCodes: [...new Set(matching.map((item) => item.institutionCode))],
          updatedAt: updatedAt.toISOString(),
        },
        createdAt: updatedAt,
      });
    });
    return NextResponse.json({ ok: true, sourceKey: nextSourceKey, updatedAt: updatedAt.toISOString() });
  } catch (error) {
    console.error("[careerbridge] source metadata update failed", error);
    return NextResponse.json({ error: "Could not update the source. Confirm database access and try again." }, { status: 503 });
  }
}
