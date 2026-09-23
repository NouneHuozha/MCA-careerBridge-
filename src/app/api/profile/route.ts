import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [user, state] = await Promise.all([getCurrentUser(), getSessionState()]);
    return NextResponse.json({
      signedIn: Boolean(user),
      name: user?.name ?? null,
      started: Boolean(state),
      stage: state?.stage ?? null,
      completion: state?.snapshot.completion ?? 0,
      snapshot: state?.snapshot ?? null,
      note: "Everything here is what the student told us. It is never treated as verified external fact.",
    });
  } catch (error) {
    console.error("[careerbridge] profile API failed", error);
    return NextResponse.json({ error: "Profile data is unavailable right now." }, { status: 503 });
  }
}
