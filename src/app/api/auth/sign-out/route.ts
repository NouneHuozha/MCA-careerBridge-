import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function POST(request: Request) {
  await signOut().catch(() => undefined);
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return NextResponse.redirect(new URL("/", `${proto}://${host}`), { status: 303 });
}
