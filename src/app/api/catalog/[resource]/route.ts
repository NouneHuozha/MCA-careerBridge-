import { NextResponse } from "next/server";
import {
  getCareers,
  getCourses,
  getExams,
  getFields,
  getOpportunities,
  getPathways,
  getScholarships,
} from "@/services/catalog";

export const dynamic = "force-dynamic";

/**
 * Read-only catalogue endpoints:
 *   /api/catalog/fields | careers | courses | pathways | exams | scholarships | opportunities
 */
export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const { resource } = await context.params;
  const params = new URL(request.url).searchParams;
  const field = params.get("field") ?? undefined;

  try {
    switch (resource) {
      case "fields":
        return NextResponse.json({ fields: await getFields() });
      case "careers":
        return NextResponse.json({ careers: await getCareers(field) });
      case "courses":
        return NextResponse.json({
          courses: await getCourses({ fieldSlug: field, level: params.get("level") ?? undefined }),
        });
      case "pathways":
        return NextResponse.json({
          pathways: await getPathways({ fieldSlug: field, stage: params.get("stage") ?? undefined }),
        });
      case "exams":
        return NextResponse.json({ exams: await getExams() });
      case "scholarships":
        return NextResponse.json({ scholarships: await getScholarships({ stage: params.get("stage") ?? undefined }) });
      case "opportunities":
        return NextResponse.json({ opportunities: await getOpportunities({ fieldSlug: field }) });
      default:
        return NextResponse.json({ error: "Unknown catalogue resource." }, { status: 404 });
    }
  } catch (error) {
    console.error("[careerbridge] catalog API failed", error);
    return NextResponse.json({ error: "That information is unavailable right now." }, { status: 503 });
  }
}
