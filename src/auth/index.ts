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
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  actionItems,
  actionPlans,
  academicProfiles,
  auditEvents,
  authSessions,
  comparisons,
  counsellingResponses,
  counsellingSessions,
  flags,
  mentorConversations,
  mentorMessages,
  passwordResetTokens,
  preferences,
  recommendationReasons,
  recommendations,
  savedItems,
  studentGoals,
  studentInterests,
  studentProfiles,
  studentStrengths,
  users,
} from "@/db/schema";
import { safeReturnPath } from "@/lib/return-path";

export const SESSION_COOKIE = "cb_session";
export const ADMIN_SESSION_NOTICE_COOKIE = "cb_admin_session_notice";
const SESSION_DAYS = 30;
const EXPIRED_NOTICE_DAYS = 7;

export type AuthUser = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  authProvider: string;
  hasPassword: boolean;
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

async function createSession(userId: number, isAdmin = false) {
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
  if (isAdmin) {
    // This marker only improves expiry messaging; the database expiry remains authoritative.
    jar.set(ADMIN_SESSION_NOTICE_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(expiresAt.getTime() + EXPIRED_NOTICE_DAYS * 24 * 60 * 60 * 1000),
    });
  } else {
    jar.delete(ADMIN_SESSION_NOTICE_COOKIE);
  }
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
        authProvider: users.authProvider,
        hasPassword: sql<boolean>`${users.passwordHash} IS NOT NULL`,
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

export async function getAdminAuthRedirect(next: string): Promise<string> {
  const requested = safeReturnPath(next, "/admin");
  const destination = requested === "/admin" || requested.startsWith("/admin/") ? requested : "/admin";
  const jar = await cookies();
  const expiredAdminNotice = jar.get(ADMIN_SESSION_NOTICE_COOKIE)?.value === "1" && !jar.get(SESSION_COOKIE)?.value;
  const page = expiredAdminNotice ? "/admin/session-expired" : "/admin/login";
  return `${page}?next=${encodeURIComponent(destination)}`;
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
    .returning({ id: users.id, email: users.email, name: users.fullName, role: users.role, authProvider: users.authProvider });

  const user = inserted[0];
  await db.insert(studentProfiles).values({ userId: user.id, displayName: user.name }).onConflictDoNothing();
  await createSession(user.id, user.role === "admin");
  return { ok: true, user: { ...user, hasPassword: true } };
}

export async function signInWithPassword(input: { email: string; password: string; requiredRole?: string }): Promise<AuthResult> {
  const email = normaliseEmail(input.email);
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const record = rows[0];
  if (!record || !verifyPassword(input.password, record.passwordHash) || (input.requiredRole && record.role !== input.requiredRole)) {
    const error = input.requiredRole === "admin"
      ? "We couldn't verify an administrator account with those details."
      : "We couldn't match that email and password.";
    return { ok: false, error };
  }
  await createSession(record.id, record.role === "admin");
  return {
    ok: true,
    user: { id: record.id, email: record.email, name: record.fullName, role: record.role, authProvider: record.authProvider, hasPassword: Boolean(record.passwordHash) },
  };
}

export async function signInWithGoogle(input: { subject: string; email: string; name: string | null }): Promise<AuthResult> {
  const email = normaliseEmail(input.email);
  const existing = await db.select().from(users).where(eq(users.externalId, input.subject)).limit(1);
  let user = existing[0];

  if (user && user.authProvider !== "google") {
    return { ok: false, error: "This Google account is linked to a different sign-in method." };
  }
  if (!user) {
    const emailOwner = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (emailOwner.length) {
      return { ok: false, error: "An account with this email already exists. Sign in with your password first." };
    }
    const inserted = await db.insert(users).values({
      externalId: input.subject,
      email,
      fullName: input.name,
      authProvider: "google",
    }).returning();
    user = inserted[0];
    await db.insert(studentProfiles).values({ userId: user.id, displayName: user.fullName }).onConflictDoNothing();
  }

  await createSession(user.id, user.role === "admin");
  return { ok: true, user: { id: user.id, email: user.email, name: user.fullName, role: user.role, authProvider: user.authProvider, hasPassword: Boolean(user.passwordHash) } };
}

export function isPasswordResetConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM && process.env.APP_URL);
}

export async function requestPasswordReset(emailInput: string) {
  if (!isPasswordResetConfigured()) return false;
  const email = normaliseEmail(emailInput);
  await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, new Date()));
  const rows = await db.select({ id: users.id, email: users.email, fullName: users.fullName })
    .from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user) return true;

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, user.id));
  await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt });

  const appUrl = new URL(process.env.APP_URL!);
  if (!["http:", "https:"].includes(appUrl.protocol) || appUrl.username || appUrl.password) {
    throw new Error("APP_URL must be a valid HTTP(S) origin.");
  }
  if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production.");
  }
  const resetUrl = new URL("/reset-password", appUrl);
  resetUrl.searchParams.set("token", token);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM,
        to: [user.email],
        subject: "Reset your CareerBridge password",
        text: `Hello${user.fullName ? ` ${user.fullName}` : ""},\n\nUse this one-time link to reset your CareerBridge password. It expires in one hour:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
      }),
    });
    if (response.ok) return true;
    throw new Error(`Password reset email delivery failed (${response.status}).`);
  } catch (error) {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash));
    throw error;
  }
}

export async function resetPassword(token: string, password: string) {
  if (password.length < 8 || token.length > 128) return false;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const now = new Date();
  return db.transaction(async (transaction) => {
    const rows = await transaction.delete(passwordResetTokens)
      .where(and(eq(passwordResetTokens.tokenHash, tokenHash), gt(passwordResetTokens.expiresAt, now)))
      .returning({ userId: passwordResetTokens.userId });
    const reset = rows[0];
    if (!reset) return false;
    await transaction.update(users).set({ passwordHash: hashPassword(password), updatedAt: now })
      .where(eq(users.id, reset.userId));
    await transaction.delete(authSessions).where(eq(authSessions.userId, reset.userId));
    return true;
  });
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      await db.delete(authSessions).where(eq(authSessions.token, token));
    } catch (error) {
      console.error("[careerbridge] session revocation failed during sign-out", error);
    }
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(ADMIN_SESSION_NOTICE_COOKIE);
  // A shared device must not retain access to the previous student's journey.
  // Account-owned answers stay in PostgreSQL and return after sign-in.
  jar.delete("cb_journey");
}

export async function deleteCurrentAccount() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const deleted = await db.transaction(async (transaction) => {
    const activeSession = await transaction
      .select({ userId: authSessions.userId, email: users.email })
      .from(authSessions)
      .innerJoin(users, eq(users.id, authSessions.userId))
      .where(and(eq(authSessions.token, token), gt(authSessions.expiresAt, new Date())))
      .limit(1);
    const userId = activeSession[0]?.userId;
    if (!userId) return false;

    const profiles = await transaction.select({ id: studentProfiles.id })
      .from(studentProfiles).where(eq(studentProfiles.userId, userId));
    const profileIds = profiles.map(({ id }) => id);
    const sessionRows = await transaction.select({ id: counsellingSessions.id })
      .from(counsellingSessions)
      .where(profileIds.length
        ? or(eq(counsellingSessions.userId, userId), inArray(counsellingSessions.profileId, profileIds))
        : eq(counsellingSessions.userId, userId));
    const sessionIds = sessionRows.map(({ id }) => id);
    const conversationRows = await transaction.select({ id: mentorConversations.id })
      .from(mentorConversations).where(eq(mentorConversations.userId, userId));
    const conversationIds = conversationRows.map(({ id }) => id);
    const planRows = await transaction.select({ id: actionPlans.id })
      .from(actionPlans).where(eq(actionPlans.userId, userId));
    const planIds = planRows.map(({ id }) => id);
    const ownedRecommendations = await transaction.select({ id: recommendations.id })
      .from(recommendations).where(eq(recommendations.userId, userId));
    const sessionRecommendations = sessionIds.length
      ? await transaction.select({ id: recommendations.id }).from(recommendations)
        .where(inArray(recommendations.sessionId, sessionIds))
      : [];
    const recommendationIds = [...new Set([...ownedRecommendations, ...sessionRecommendations].map(({ id }) => id))];

    if (conversationIds.length) await transaction.delete(mentorMessages).where(inArray(mentorMessages.conversationId, conversationIds));
    await transaction.delete(mentorConversations).where(eq(mentorConversations.userId, userId));
    if (planIds.length) await transaction.delete(actionItems).where(inArray(actionItems.planId, planIds));
    await transaction.delete(actionPlans).where(eq(actionPlans.userId, userId));
    if (recommendationIds.length) await transaction.delete(recommendationReasons).where(inArray(recommendationReasons.recommendationId, recommendationIds));
    if (sessionIds.length) await transaction.delete(counsellingResponses).where(inArray(counsellingResponses.sessionId, sessionIds));
    if (sessionIds.length) await transaction.delete(recommendations).where(inArray(recommendations.sessionId, sessionIds));
    await transaction.delete(recommendations).where(eq(recommendations.userId, userId));
    if (profileIds.length) {
      await transaction.delete(academicProfiles).where(inArray(academicProfiles.profileId, profileIds));
      await transaction.delete(studentInterests).where(inArray(studentInterests.profileId, profileIds));
      await transaction.delete(studentStrengths).where(inArray(studentStrengths.profileId, profileIds));
      await transaction.delete(studentGoals).where(inArray(studentGoals.profileId, profileIds));
      await transaction.delete(preferences).where(inArray(preferences.profileId, profileIds));
      await transaction.delete(counsellingSessions).where(inArray(counsellingSessions.profileId, profileIds));
    }
    await transaction.delete(counsellingSessions).where(eq(counsellingSessions.userId, userId));
    await transaction.delete(savedItems).where(eq(savedItems.userId, userId));
    await transaction.delete(comparisons).where(eq(comparisons.userId, userId));
    await transaction.delete(flags).where(eq(flags.userId, userId));
    const resetTokenTable = await transaction.execute(sql`select to_regclass(current_schema() || '.password_reset_tokens') as name`);
    if (resetTokenTable.rows[0]?.name) {
      await transaction.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    }
    await transaction.update(auditEvents).set({ actor: "Deleted account" }).where(eq(auditEvents.actor, activeSession[0].email));
    await transaction.delete(authSessions).where(eq(authSessions.userId, userId));
    await transaction.delete(studentProfiles).where(eq(studentProfiles.userId, userId));
    await transaction.delete(users).where(eq(users.id, userId));
    return true;
  });

  if (deleted) {
    for (const name of [SESSION_COOKIE, ADMIN_SESSION_NOTICE_COOKIE, "cb_journey", "cb_exploration", "cb_exploration_history"]) {
      jar.delete(name);
    }
  }
  return deleted;
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
