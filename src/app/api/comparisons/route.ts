import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { saveComparison } from "@/services/student";

export const dynamic = "force-dynamic";

function parseBody(body: Record<string, unknown>) {
  const kind = String(body.kind ?? "");
  const itemRefs = Array.isArray(body.itemRefs)
    ? body.itemRefs.map((ref) => String(ref).trim()).filter(Boolean).slice(0, 6)
    : [];
  if (!["field", "career", "course", "institution", "pathway"].includes(kind) || itemRefs.length < 2 || new Set(itemRefs).size !== itemRefs.length) return null;
  return { kind, itemRefs };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save this comparison." }, { status: 401 });
  try {
    const parsed = parseBody((await request.json()) as Record<string, unknown>);
    if (!parsed) return NextResponse.json({ error: "Choose at least two different options of the same type." }, { status: 400 });
    await saveComparison(user.id, parsed.kind, parsed.itemRefs);
    revalidatePath("/guidance/explorations");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn't save this comparison right now." }, { status: 503 });
  }
}
