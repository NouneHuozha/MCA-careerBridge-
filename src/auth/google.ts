import { createPublicKey, createVerify, randomBytes, timingSafeEqual, type JsonWebKey } from "node:crypto";
import { signInWithGoogle } from "@/auth";

const STATE_COOKIE = "cb_google_state";
const NONCE_COOKIE = "cb_google_nonce";
const NEXT_COOKIE = "cb_google_next";
const FORM_COOKIE = "cb_google_form";

export function isGoogleAuthConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.APP_URL);
}

export function getGoogleAuthCookieNames() {
  return [STATE_COOKIE, NONCE_COOKIE, NEXT_COOKIE, FORM_COOKIE];
}

export function getGoogleAuthCookieOptions(path = "/api/auth/google") {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge: 600,
  };
}

export function getGoogleCallbackUrl() {
  const appUrl = new URL(process.env.APP_URL!);
  if (!["http:", "https:"].includes(appUrl.protocol) || appUrl.username || appUrl.password) {
    throw new Error("APP_URL must be a valid HTTP(S) origin.");
  }
  if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production.");
  }
  return new URL("/api/auth/google/callback", appUrl).toString();
}

export function createGoogleOAuthState() {
  return { state: randomBytes(32).toString("base64url"), nonce: randomBytes(32).toString("base64url") };
}

export function matchesGoogleOAuthState(actual: string, expected: string) {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

type GoogleIdTokenClaims = {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nonce: string;
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
};

export async function verifyGoogleIdToken(token: string, expectedNonce: string) {
  if (token.length > 16_384) throw new Error("Invalid Google identity token.");
  const [encodedHeader, encodedClaims, encodedSignature, extra] = token.split(".");
  if (!encodedHeader || !encodedClaims || !encodedSignature || extra) throw new Error("Invalid Google identity token.");

  const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8")) as { alg?: string; kid?: string };
  const claims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8")) as Partial<GoogleIdTokenClaims>;
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported Google identity token.");

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs", { cache: "no-store" });
  if (!response.ok) throw new Error("Google signing keys are unavailable.");
  const { keys } = await response.json() as { keys: (JsonWebKey & { kid?: string })[] };
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Google signing key was not found.");

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedClaims}`);
  verifier.end();
  if (!verifier.verify(createPublicKey({ key: jwk, format: "jwk" }), Buffer.from(encodedSignature, "base64url"))) {
    throw new Error("Google identity token signature is invalid.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    !["accounts.google.com", "https://accounts.google.com"].includes(claims.iss ?? "") ||
    claims.aud !== process.env.GOOGLE_CLIENT_ID ||
    typeof claims.exp !== "number" || claims.exp <= now ||
    typeof claims.iat !== "number" || claims.iat > now + 300 ||
    claims.nonce !== expectedNonce ||
    typeof claims.sub !== "string" || !claims.sub ||
    typeof claims.email !== "string" || !claims.email.includes("@") ||
    claims.email_verified !== true
  ) {
    throw new Error("Google identity token claims are invalid.");
  }
  return signInWithGoogle({ subject: claims.sub, email: claims.email, name: typeof claims.name === "string" ? claims.name : null });
}

export const googleAuthCookies = { STATE_COOKIE, NONCE_COOKIE, NEXT_COOKIE, FORM_COOKIE };
