import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { safeReturnPath } from "@/lib/return-path";
import { isGoogleAuthConfigured } from "@/auth/google";
import { AuthPageLayout } from "@/components/auth/auth-page-layout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string; reset?: string; deleted?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);

  const errorMessage = params.error === "google-unavailable"
    ? "Google sign-in is not configured on this deployment yet."
    : params.error === "google-account-conflict"
      ? "An account with this email already exists. Sign in with your password first."
      : params.error?.startsWith("google-")
        ? "Google sign-in could not be completed. Please try again or use your email and password."
        : params.error;
  return (
    <AuthPageLayout
      initialMode="sign-in"
      next={next}
      googleConfigured={isGoogleAuthConfigured()}
      errorMessage={errorMessage}
      deleted={params.deleted === "1"}
      reset={params.reset === "1"}
    />
  );
}
