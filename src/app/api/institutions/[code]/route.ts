import { NextResponse } from "next/server";
import { getAdmissionInfo, getInstitution, getInstitutionLinks, getInstitutionSources } from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  try {
    const institution = await getInstitution(code);
    if (!institution) {
      return NextResponse.json({ error: "We don't have an institution with that code." }, { status: 404 });
    }
    const [courses, sources, admissions] = await Promise.all([
      getInstitutionLinks(code),
      getInstitutionSources(code),
      getAdmissionInfo(code),
    ]);
    return NextResponse.json({ institution, courses, sources, admissions });
  } catch (error) {
    console.error("[careerbridge] institution detail API failed", error);
    return NextResponse.json({ error: "Institution data is unavailable right now." }, { status: 503 });
  }
}
