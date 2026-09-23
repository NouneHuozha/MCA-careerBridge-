import { NextResponse } from "next/server";
import { searchEverything } from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  try {
    const results = await searchEverything(query);
    return NextResponse.json({ query, count: results.length, results });
  } catch (error) {
    console.error("[careerbridge] search failed", error);
    return NextResponse.json({ error: "Search is unavailable right now." }, { status: 503 });
  }
}
