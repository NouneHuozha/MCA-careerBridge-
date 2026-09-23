import { NextResponse } from "next/server";
import { signInWithPassword, signUpWithPassword } from "@/auth";
import { getSessionState, persistSnapshot, startSession } from "@/services/profile";
import { safeReturnPath } from "@/lib/return-path";

export const dynamic = "force-dynamic";

async function keepJourneyWithAccount() {
  try {
    const journey = await getSessionState();
    if (journey) {
      await startSession(journey.stage, journey.stageDetail);
      await persistSnapshot(journey.snapshot);
    }
  } catch (error) {
    console.error("[careerbridge] journey handoff unavailable", error);
  }
}


/** Builds an absolute redirect that survives proxies (preview/prod deployments). */
function redirectTo(request: Request, path: string) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return NextResponse.redirect(new URL(path, `${proto}://${host}`), { status: 303 });
}

/**
 * Form-post endpoints so sign-in / sign-up work without JavaScript and can be
 * exercised by tooling. The auth abstraction handles provider selection.
 */
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectTo(request, "/sign-in?error=Something%20went%20wrong.");
  }

  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = safeReturnPath(form.get("next"));

  try {
    if (action === "sign-in") {
      const result = await signInWithPassword({ email, password });
      if (!result.ok) return redirectTo(request, `/sign-in?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
      await keepJourneyWithAccount();
      return redirectTo(request, next);
    }

    if (action === "sign-up") {
      const confirm = String(form.get("confirm") ?? "");
      const fullName = String(form.get("fullName") ?? "");
      if (password !== confirm) {
        return redirectTo(request, `/sign-up?error=${encodeURIComponent("Both passwords need to match.")}`);
      }
      const result = await signUpWithPassword({ email, password, fullName });
      if (!result.ok) return redirectTo(request, `/sign-up?error=${encodeURIComponent(result.error)}&next=${encodeURIComponent(next)}`);
      await keepJourneyWithAccount();
      return redirectTo(request, next);
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 404 });
  } catch (error) {
    console.error("[careerbridge] auth action failed", error);
    return redirectTo(
      request,
      `/${action === "sign-up" ? "sign-up" : "sign-in"}?error=${encodeURIComponent("We couldn't complete that just now. Please try again.")}`,
    );
  }
}
