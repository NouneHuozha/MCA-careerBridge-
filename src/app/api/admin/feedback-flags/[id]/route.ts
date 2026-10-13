import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { db } from "@/db";
import { auditEvents, flags } from "@/db/schema";

export const dynamic = "force-dynamic";
type Action = "mark_in_review" | "resolve" | "dismiss_duplicate";
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ error: "Invalid feedback flag id." }, { status: 400 });
  let input: Record<string, unknown>;
  try { const parsed: unknown = await request.json(); if (!parsed || typeof parsed !== "object") throw new Error(); input = parsed as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 }); }
  const action = input.action as Action;
  if (!["mark_in_review", "resolve", "dismiss_duplicate"].includes(action)) return NextResponse.json({ error: "Choose a supported feedback review action." }, { status: 400 });
  const assignedToRaw = typeof input.assignedTo === "string" ? input.assignedTo.trim() : user.email;
  if (assignedToRaw.length > 191) return NextResponse.json({ error: "Assignee must be 191 characters or fewer." }, { status: 400 });
  const resolutionReason = typeof input.resolutionReason === "string" ? input.resolutionReason.trim() : "";
  if (action !== "mark_in_review" && (resolutionReason.length < 8 || resolutionReason.length > 500)) return NextResponse.json({ error: "Add a closure reason between 8 and 500 characters." }, { status: 400 });
  try {
    const result = await db.transaction(async (tx) => {
      const [flag] = await tx.select().from(flags).where(eq(flags.id, id)).limit(1);
      if (!flag) return { error: "Feedback flag not found.", httpStatus: 404 as const };
      if (["resolved", "dismissed"].includes(flag.status)) return { error: "This feedback flag is already closed.", httpStatus: 409 as const };
      const now = new Date();
      const status = action === "mark_in_review" ? "in_review" : action === "resolve" ? "resolved" : "dismissed";
      const assignedTo = action === "mark_in_review" ? (assignedToRaw || null) : flag.assignedTo;
      const closedReason = action === "mark_in_review" ? flag.resolutionReason : resolutionReason;
      await tx.update(flags).set({ status, assignedTo, resolutionReason: closedReason, updatedAt: now }).where(eq(flags.id, id));
      await tx.insert(auditEvents).values({ actor: user.email, action: `feedback_flag_${action}`, entityType: flag.entityType, entityRef: flag.entityRef, metadata: { flagId: id, issueType: flag.issueType, previousStatus: flag.status, newStatus: status, assignedTo, resolutionReason: action === "mark_in_review" ? null : resolutionReason } });
      return { ok: true, id, status, assignedTo };
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[careerbridge] feedback flag update failed", error);
    return NextResponse.json({ error: "Could not save the feedback review. Please try again." }, { status: 503 });
  }
}
