import { NextResponse } from "next/server";
import { db } from "@/db";
import { recommendationReasons, recommendations } from "@/db/schema";
import { getCurrentUser } from "@/auth";
import { getSessionState } from "@/services/profile";
import { suggestFields, suggestPathways } from "@/recommendation/engine";

export const dynamic = "force-dynamic";

/**
 * Areas worth exploring — never a prediction. Each item ships with the reasons
 * behind it, and the reasoning is persisted alongside the suggestion.
 */
export async function GET() {
  try {
    const state = await getSessionState();
    if (!state) {
      return NextResponse.json({
        started: false,
        message: "Tell us about yourself first so suggestions can be explained rather than guessed.",
        fields: [],
        pathways: [],
      });
    }

    const [fieldSuggestions, pathwaySuggestions] = await Promise.all([
      suggestFields(state.snapshot, 6),
      suggestPathways(state.snapshot, 4),
    ]);

    const user = await getCurrentUser();
    if (user) {
      try {
        for (const [index, suggestion] of fieldSuggestions.entries()) {
          const inserted = await db
            .insert(recommendations)
            .values({
              userId: user.id,
              sessionId: state.sessionId,
              itemType: "field",
              itemRef: suggestion.field.slug,
              rank: index + 1,
              relevance: suggestion.relevance,
              headline: suggestion.headline,
            })
            .returning({ id: recommendations.id });
          if (suggestion.reasons.length) {
            await db.insert(recommendationReasons).values(
              suggestion.reasons.map((reason) => ({
                recommendationId: inserted[0].id,
                factor: reason.factor,
                detail: reason.detail,
                weight: reason.weight,
              })),
            );
          }
        }
      } catch (error) {
        console.error("[careerbridge] could not persist recommendations", error);
      }
    }

    return NextResponse.json({
      started: true,
      disclaimer:
        "These are areas worth exploring based on what you told us. They are not predictions, match scores or decisions.",
      fields: fieldSuggestions.map((s) => ({
        slug: s.field.slug,
        name: s.field.name,
        headline: s.headline,
        reasons: s.reasons,
        cautions: s.cautions,
      })),
      pathways: pathwaySuggestions.map((p) => ({
        slug: p.pathway.slug,
        title: p.pathway.title,
        reasons: p.reasons,
      })),
    });
  } catch (error) {
    console.error("[careerbridge] recommendations failed", error);
    return NextResponse.json({ error: "Suggestions are unavailable right now." }, { status: 503 });
  }
}
