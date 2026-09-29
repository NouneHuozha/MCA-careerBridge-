import { NextResponse } from "next/server";
import { getField } from "@/services/catalog";
import {
  EXPLORATION_COOKIE,
  getExplorationHistory,
  getExplorationState,
  getSessionState,
  saveExplorationHistory,
  type ExplorationHistoryRecord,
  type ExplorationState,
} from "@/services/profile";

export const dynamic = "force-dynamic";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

function redirectBack(request: Request, path: string, error?: string) {
  const url = new URL(path, request.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

function upsertHistory(records: ExplorationHistoryRecord[], record: ExplorationHistoryRecord) {
  return [record, ...records.filter((item) => item.directionSlug !== record.directionSlug)].slice(0, 10);
}

export async function GET() {
  return NextResponse.json({ exploration: await getExplorationState() });
}

export async function POST(request: Request) {
  const form = await request.formData();
  if (form.get("clear") === "true") {
    const response = redirectBack(request, "/profile");
    response.cookies.delete(EXPLORATION_COOKIE);
    return response;
  }
  const directionSlug = String(form.get("directionSlug") ?? "").trim();
  const returnTo = String(form.get("returnTo") ?? "").trim();
  const field = directionSlug ? await getField(directionSlug) : null;
  if (!field) return redirectBack(request, "/profile", "That direction is not available right now.");

  const now = new Date().toISOString();
  const [previous, history] = await Promise.all([getExplorationState(), getExplorationHistory()]);
  const withPrevious = previous
    ? upsertHistory(history, {
        directionSlug: previous.directionSlug,
        selectedAt: previous.selectedAt,
        lastLocation: history.find((record) => record.directionSlug === previous.directionSlug)?.lastLocation ?? null,
        lastMeaningfulAt: history.find((record) => record.directionSlug === previous.directionSlug)?.lastMeaningfulAt ?? null,
        completedSteps: previous.completedSteps,
      })
    : history;
  const known = withPrevious.find((record) => record.directionSlug === field.slug);
  const selectedAt = known?.selectedAt ?? now;
  const nextHistory = upsertHistory(withPrevious, {
    directionSlug: field.slug,
    selectedAt,
    lastLocation: known?.lastLocation ?? null,
    lastMeaningfulAt: known?.lastMeaningfulAt ?? null,
    completedSteps: previous?.directionSlug === field.slug ? previous.completedSteps : known?.completedSteps ?? ["reflection", "direction"],
  });
  await saveExplorationHistory(nextHistory);

  const state: ExplorationState = {
    directionSlug: field.slug,
    selectedAt,
    completedSteps: previous?.directionSlug === field.slug ? previous.completedSteps : known?.completedSteps ?? ["reflection", "direction"],
  };
  const safeReturn = returnTo.startsWith("/my-journey/") ? returnTo : "/my-direction";
  const response = redirectBack(request, safeReturn);
  response.cookies.set(EXPLORATION_COOKIE, JSON.stringify(state), cookieOptions);
  return response;
}

export async function PATCH(request: Request) {
  let pathname = "";
  try {
    const body = (await request.json()) as { pathname?: unknown };
    pathname = typeof body.pathname === "string" ? body.pathname : "";
  } catch {
    return NextResponse.json({ error: "Invalid history update." }, { status: 400 });
  }

  const match = pathname.match(/^\/guidance\/direction\/([^/]+)(?:\/.*)?$/);
  if (!match || pathname.length > 300 || pathname.includes("?") || pathname.includes("#") || pathname.includes("\\")) {
    return NextResponse.json({ error: "Invalid exploration location." }, { status: 400 });
  }
  let directionSlug = "";
  try {
    directionSlug = decodeURIComponent(match[1]);
  } catch {
    return NextResponse.json({ error: "Invalid exploration direction." }, { status: 400 });
  }

  const [field, state, active, history] = await Promise.all([
    getField(directionSlug),
    getSessionState(),
    getExplorationState(),
    getExplorationHistory(),
  ]);
  if (!field || !state || state.status !== "completed") return new NextResponse(null, { status: 204 });
  const prefix = `/guidance/direction/${encodeURIComponent(field.slug)}`;
  if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
    return NextResponse.json({ error: "Exploration location does not match its direction." }, { status: 400 });
  }

  const previousDirection = active && active.directionSlug !== field.slug
    ? history.find((record) => record.directionSlug === active.directionSlug)
    : undefined;
  const baseHistory = active && active.directionSlug !== field.slug
    ? upsertHistory(history, {
        directionSlug: active.directionSlug,
        selectedAt: active.selectedAt,
        lastLocation: previousDirection?.lastLocation ?? null,
        lastMeaningfulAt: previousDirection?.lastMeaningfulAt ?? null,
        completedSteps: active.completedSteps,
      })
    : history;
  const existing = baseHistory.find((record) => record.directionSlug === field.slug);
  const now = new Date().toISOString();
  const record: ExplorationHistoryRecord = {
    directionSlug: field.slug,
    selectedAt: existing?.selectedAt ?? (active?.directionSlug === field.slug ? active.selectedAt : now),
    lastLocation: pathname,
    lastMeaningfulAt: now,
    completedSteps: existing?.completedSteps ?? (active?.directionSlug === field.slug ? active.completedSteps : ["reflection", "direction"]),
  };
  await saveExplorationHistory(upsertHistory(baseHistory, record));

  const response = NextResponse.json({ ok: true });
  if (active?.directionSlug !== field.slug) {
    response.cookies.set(
      EXPLORATION_COOKIE,
      JSON.stringify({ directionSlug: field.slug, selectedAt: record.selectedAt, completedSteps: record.completedSteps }),
      cookieOptions,
    );
  }
  return response;
}

export async function DELETE(request: Request) {
  const response = redirectBack(request, "/profile");
  response.cookies.delete(EXPLORATION_COOKIE);
  return response;
}
