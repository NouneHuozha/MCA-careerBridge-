import { NextResponse } from "next/server";
import { deleteCurrentAccount, getCurrentUser } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url), { status: 303 });
  if (!await getCurrentUser()) return redirectTo("/sign-in?next=%2Fguidance%2Faccount");

  let confirmation: FormData;
  try {
    confirmation = await request.formData();
  } catch {
    return redirectTo("/guidance/account?deletionError=confirmation");
  }
  if (confirmation.get("confirmation") !== "DELETE") {
    return redirectTo("/guidance/account?deletionError=confirmation");
  }

  try {
    if (!await deleteCurrentAccount()) return redirectTo("/sign-in?next=%2Fguidance%2Faccount");
    return redirectTo("/sign-in?deleted=1");
  } catch (error) {
    console.error("[careerbridge] account deletion failed", error);
    return redirectTo("/guidance/account?deletionError=failed");
  }
}
