import { NextResponse } from "next/server";
import { suggestFields } from "@/recommendation/engine";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getSessionState();
    if (!state || state.status !== "completed") {
      return NextResponse.json({ options: [] });
    }

    const suggestions = await suggestFields(state.snapshot, 6);
    return NextResponse.json({
      options: suggestions.map(({ field }) => ({
        slug: field.slug,
        name: field.name,
        tagline: field.tagline ?? "",
      })),
    });
  } catch (error) {
    console.error("[careerbridge] exploration switch options failed", error);
    return NextResponse.json({ error: "Other possibilities are unavailable right now." }, { status: 503 });
  }
}
