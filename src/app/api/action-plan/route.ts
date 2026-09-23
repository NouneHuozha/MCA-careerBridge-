import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { buildChecklist, ensurePlan, listPlans, setItemStatus } from "@/services/student";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  const params = new URL(request.url).searchParams;
  const focus = params.get("focus");

  if (!user) {
    const [focusType, focusRef] = (focus ?? "field:technology").split(":");
    return NextResponse.json({
      signedIn: false,
      preview: await buildChecklist(focusType, focusRef ?? "technology"),
    });
  }

  try {
    return NextResponse.json({ signedIn: true, plans: await listPlans(user.id) });
  } catch {
    return NextResponse.json({ error: "Your plans are unavailable right now." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to build an action plan." }, { status: 401 });

  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body.itemId) {
      const ok = await setItemStatus(user.id, Number(body.itemId), body.status === "done" ? "done" : "todo");
      return NextResponse.json({ ok });
    }
    const focusType = String(body.focusType ?? "");
    const focusRef = String(body.focusRef ?? "");
    if (!focusType || !focusRef) return NextResponse.json({ error: "Choose something to plan for." }, { status: 400 });
    const plan = await ensurePlan(user.id, focusType, focusRef);
    return NextResponse.json({ ok: true, planId: plan.id });
  } catch (error) {
    console.error("[careerbridge] action plan API failed", error);
    return NextResponse.json({ error: "We couldn't update your plan right now." }, { status: 503 });
  }
}
