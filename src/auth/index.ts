/**
 * Authentication abstraction.
 * -----------------------------------------------------------------------------
 * CareerBridge is designed to run on Clerk in production. Because sign-in must
 * keep working in environments where Clerk keys are not configured, auth is
 * accessed only through this module. `getAuthProvider()` returns the Clerk
 * adapter when Clerk env vars are present, otherwise a first-party session
 * provider backed by Postgres (scrypt password hashes + httpOnly cookies).
 *
 * Application code must never import a provider SDK directly.
 */
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { authSessions, studentProfiles, users } from "@/db/schema";

export const SESSION_COOKIE = "cb_session";
const SESSION_DAYS = 30;

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
};

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; error: string };

export function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );
}

export function authProviderName(): "clerk" | "local" {
  return isClerkConfigured() ? "clerk" : "local";
}

/* ------------------------------- hashing ------------------------------- */

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string | null) {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ------------------------------- sessions ------------------------------ */

async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(authSessions).values({ userId, token, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.fullName,
        role: users.role,
      })
      .from(authSessions)
      .innerJoin(users, eq(users.id, authSessions.userId))
      .where(and(eq(authSessions.token, token), gt(authSessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    // Database or cookie store unavailable — treat as signed out rather than crashing.
    return null;
  }
}

export async function requireUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  fullName?: string;
}): Promise<AuthResult> {
  const email = normaliseEmail(input.email);
  if (!email.includes("@") || email.length < 5) return { ok: false, error: "Please enter a valid email address." };
  if (input.password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { ok: false, error: "An account with this email already exists. Try signing in." };

  const inserted = await db
    .insert(users)
    .values({
      email,
      fullName: input.fullName?.trim() || null,
      passwordHash: hashPassword(input.password),
      authProvider: "local",
    })
    .returning({ id: users.id, email: users.email, name: users.fullName, role: users.role });

  const user = inserted[0];
  await db.insert(studentProfiles).values({ userId: user.id, displayName: user.name }).onConflictDoNothing();
  await createSession(user.id);
  return { ok: true, user };
}

export async function signInWithPassword(input: { email: string; password: string }): Promise<AuthResult> {
  const email = normaliseEmail(input.email);
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const record = rows[0];
  if (!record || !verifyPassword(input.password, record.passwordHash)) {
    return { ok: false, error: "We couldn't match that email and password." };
  }
  await createSession(record.id);
  return {
    ok: true,
    user: { id: record.id, email: record.email, name: record.fullName, role: record.role },
  };
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(authSessions).where(eq(authSessions.token, token)).catch(() => undefined);
  jar.delete(SESSION_COOKIE);
  // A shared device must not retain access to the previous student's journey.
  // Account-owned answers stay in PostgreSQL and return after sign-in.
  jar.delete("cb_journey");
}

/** Ensures a student profile row exists for the signed-in user. */
export async function getOrCreateProfileId(userId: number): Promise<number> {
  const existing = await db
    .select({ id: studentProfiles.id })
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const created = await db.insert(studentProfiles).values({ userId }).returning({ id: studentProfiles.id });
  return created[0].id;
}
