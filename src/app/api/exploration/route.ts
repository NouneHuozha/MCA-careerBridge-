import { NextResponse } from "next/server";
import { getField } from "@/services/catalog";
import { EXPLORATION_COOKIE, getExplorationState, type ExplorationState } from "@/services/profile";

export const dynamic = "force-dynamic";

function redirectBack(request: Request, path: string, error?: string) {
  const url = new URL(path, request.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
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

  const state: ExplorationState = {
    directionSlug: field.slug,
    selectedAt: new Date().toISOString(),
    completedSteps: ["reflection", "direction"],
  };
  const safeReturn = returnTo.startsWith("/my-journey/") ? returnTo : "/my-direction";
  const response = redirectBack(request, safeReturn);
  response.cookies.set(EXPLORATION_COOKIE, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export async function DELETE(request: Request) {
  const response = redirectBack(request, "/profile");
  response.cookies.delete(EXPLORATION_COOKIE);
  return response;
}
