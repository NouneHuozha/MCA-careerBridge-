import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { SAVEABLE_TYPES, listSaved, saveItem, unsaveItem, type SaveableType } from "@/services/student";

export const dynamic = "force-dynamic";

function parseBody(body: Record<string, unknown>) {
  const itemType = String(body.itemType ?? "");
  const itemRef = String(body.itemRef ?? "").slice(0, 100);
  const label = String(body.label ?? "").slice(0, 200);
  if (!SAVEABLE_TYPES.includes(itemType as SaveableType) || !itemRef) return null;
  return { itemType: itemType as SaveableType, itemRef, label };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: await listSaved(user.id) });
  } catch {
    return NextResponse.json({ items: [], error: "Saved items are unavailable right now." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in to save this." }, { status: 401 });
  try {
    const parsed = parseBody((await request.json()) as Record<string, unknown>);
    if (!parsed) return NextResponse.json({ error: "That item can't be saved." }, { status: 400 });
    await saveItem(user.id, parsed.itemType, parsed.itemRef, parsed.label);
    revalidatePath("/saved");
    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn't save that right now." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  try {
    const parsed = parseBody((await request.json()) as Record<string, unknown>);
    if (!parsed) return NextResponse.json({ error: "Unknown item." }, { status: 400 });
    await unsaveItem(user.id, parsed.itemType, parsed.itemRef);
    revalidatePath("/saved");
    revalidatePath("/dashboard");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We couldn't update that right now." }, { status: 503 });
  }
}
