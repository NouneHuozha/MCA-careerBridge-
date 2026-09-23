import { NextResponse } from "next/server";
import { getInstitutions } from "@/services/catalog";
import { districtCentre, haversineKm } from "@/maps";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;
    const institutions = await getInstitutions({
      q: params.get("q") ?? undefined,
      district: params.get("district") ?? undefined,
      type: params.get("type") ?? undefined,
      ownership: params.get("ownership") ?? undefined,
      level: params.get("level") ?? undefined,
      fieldSlug: params.get("field") ?? undefined,
      courseSlug: params.get("course") ?? undefined,
      hostel: params.get("hostel") ?? undefined,
    });

    const origin = districtCentre(params.get("near"));
    const radius = Number(params.get("radiusKm") ?? "0");

    const withDistance = institutions.map((institution) => {
      const point =
        institution.latitude != null && institution.longitude != null
          ? { latitude: institution.latitude, longitude: institution.longitude }
          : null;
      const distanceKm = origin && point ? Math.round(haversineKm(origin, point)) : null;
      return { ...institution, distanceKm };
    });

    const filtered =
      origin && radius > 0 ? withDistance.filter((i) => i.distanceKm != null && i.distanceKm <= radius) : withDistance;

    return NextResponse.json({
      count: filtered.length,
      dataset: "sample-dataset-v1",
      note: "Sample dataset — institution entries require verification. No fees, seats or dates are included.",
      institutions: filtered.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9)),
    });
  } catch (error) {
    console.error("[careerbridge] institutions API failed", error);
    return NextResponse.json({ error: "Institution data is unavailable right now." }, { status: 503 });
  }
}
