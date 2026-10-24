import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/logo";
import { Callout } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: {
  searchParams: Promise<{ error?: string; token?: string }>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (user) redirect("/guidance");
  const token = params.token?.slice(0, 128) ?? "";

  return (
    <main className="cb-container flex min-h-[70vh] items-center justify-center py-12">
      <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-sm sm:p-10" aria-labelledby="new-password-title">
        <Logo size="sm" />
        <h1 id="new-password-title" className="mt-8 text-3xl font-semibold text-[#073c32]">Choose a new password</h1>
        {params.error === "expired" && <Callout tone="amber" title="This reset link has expired"><p>Request a new password reset link and try again.</p></Callout>}
        {params.error === "unavailable" && <Callout tone="amber" title="We couldn’t reset your password"><p>Please request a new reset link and try again.</p></Callout>}
        {params.error && params.error !== "expired" && params.error !== "unavailable" && <Callout tone="amber" title="Check your password"><p>{params.error}</p></Callout>}
        {token ? <ResetPasswordForm token={token} /> : <p className="mt-4 text-base text-ink-600">This reset link is incomplete. <Link href="/forgot-password" className="font-medium text-[#7054b2] underline underline-offset-2">Request another link.</Link></p>}
      </section>
    </main>
  );
}
