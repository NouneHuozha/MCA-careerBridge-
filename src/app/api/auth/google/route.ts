import { NextResponse } from "next/server";
import { safeReturnPath } from "@/lib/return-path";
import { createGoogleOAuthState, getGoogleAuthCookieOptions, getGoogleCallbackUrl, googleAuthCookies, isGoogleAuthConfigured } from "@/auth/google";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const form = url.searchParams.get("form") === "sign-up" ? "sign-up" : "sign-in";
  const next = safeReturnPath(url.searchParams.get("next"));
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL(`/${form}?error=google-unavailable&next=${encodeURIComponent(next)}`, request.url));
  }

  try {
    const { state, nonce } = createGoogleOAuthState();
    const callbackUrl = getGoogleCallbackUrl();
    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.search = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
      nonce,
      prompt: "select_account",
    }).toString();

    const response = NextResponse.redirect(googleUrl);
    const options = getGoogleAuthCookieOptions();
    response.cookies.set(googleAuthCookies.STATE_COOKIE, state, options);
    response.cookies.set(googleAuthCookies.NONCE_COOKIE, nonce, options);
    response.cookies.set(googleAuthCookies.NEXT_COOKIE, next, options);
    response.cookies.set(googleAuthCookies.FORM_COOKIE, form, options);
    return response;
  } catch (error) {
    console.error("[careerbridge] Google sign-in could not start", error);
    return NextResponse.redirect(new URL(`/${form}?error=google-unavailable&next=${encodeURIComponent(next)}`, request.url));
  }
}
