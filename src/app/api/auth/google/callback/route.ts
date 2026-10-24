import { NextResponse } from "next/server";
import { verifyGoogleIdToken, getGoogleAuthCookieOptions, getGoogleCallbackUrl, googleAuthCookies, matchesGoogleOAuthState } from "@/auth/google";
import { getSessionState, persistExplorationCookiesForAccount, persistSnapshot, startSession } from "@/services/profile";
import { cookies } from "next/headers";
import { safeReturnPath } from "@/lib/return-path";

export const dynamic = "force-dynamic";

function clearFlowCookies(response: NextResponse) {
  const options = { ...getGoogleAuthCookieOptions(), maxAge: 0 };
  for (const name of Object.values(googleAuthCookies)) response.cookies.set(name, "", options);
  return response;
}

function flowRedirect(request: Request, form: string, next: string, error: string) {
  const destination = new URL(`/${form}`, request.url);
  destination.searchParams.set("error", error);
  destination.searchParams.set("next", next);
  return clearFlowCookies(NextResponse.redirect(destination));
}

export async function GET(request: Request) {
  const jar = await cookies();
  const state = jar.get(googleAuthCookies.STATE_COOKIE)?.value ?? "";
  const nonce = jar.get(googleAuthCookies.NONCE_COOKIE)?.value ?? "";
  const next = safeReturnPath(jar.get(googleAuthCookies.NEXT_COOKIE)?.value);
  const form = jar.get(googleAuthCookies.FORM_COOKIE)?.value === "sign-up" ? "sign-up" : "sign-in";
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!state || !nonce || !matchesGoogleOAuthState(url.searchParams.get("state") ?? "", state)) {
    return flowRedirect(request, form, next, "google-invalid-state");
  }
  if (!code || url.searchParams.has("error")) return flowRedirect(request, form, next, "google-cancelled");

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: getGoogleCallbackUrl(),
        grant_type: "authorization_code",
      }),
    });
    if (!response.ok) throw new Error(`Google token exchange failed (${response.status}).`);
    const tokens = await response.json() as { id_token?: string };
    if (!tokens.id_token) throw new Error("Google did not return an identity token.");
    const result = await verifyGoogleIdToken(tokens.id_token, nonce);
    if (!result.ok) return flowRedirect(request, form, next, "google-account-conflict");

    const journey = await getSessionState();
    if (journey) {
      await startSession(journey.stage, journey.stageDetail);
      await persistSnapshot(journey.snapshot);
    }
    await persistExplorationCookiesForAccount();
    return clearFlowCookies(NextResponse.redirect(new URL(next, request.url)));
  } catch (error) {
    console.error("[careerbridge] Google sign-in failed", error);
    return flowRedirect(request, form, next, "google-failed");
  }
}
