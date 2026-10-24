import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isPasswordResetConfigured } from "@/auth";
import { Logo } from "@/components/logo";
import { Callout } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({ searchParams }: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (user) redirect("/guidance");

  return (
    <main className="cb-container flex min-h-[70vh] items-center justify-center py-12">
      <section className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-sm sm:p-10" aria-labelledby="reset-title">
        <Logo size="sm" />
        <h1 id="reset-title" className="mt-8 text-3xl font-semibold text-[#073c32]">Reset your password</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-600">Enter the email address for your CareerBridge account and we’ll send a secure reset link.</p>
        {params.sent === "1" && <p role="status" className="mt-5 rounded-xl bg-[#edf7f0] px-4 py-3 text-sm text-[#286b61]">If an account uses that email, a reset link will arrive shortly. Check your inbox.</p>}
        {!isPasswordResetConfigured() && <Callout tone="amber" title="Password reset isn’t configured yet"><p>Email delivery needs a verified Resend sender and environment settings. Contact the CareerBridge team for help meanwhile.</p></Callout>}
        {params.error === "send" && <Callout tone="amber" title="We couldn’t send the reset email"><p>Please try again later or contact the CareerBridge team.</p></Callout>}
        {params.error === "invalid" && <Callout tone="amber" title="Check the email address"><p>Enter a valid email address and try again.</p></Callout>}
        {isPasswordResetConfigured() && (
          <form action="/api/auth/forgot-password" method="post" className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-ink-800">Email</label>
              <input id="email" name="email" type="email" required maxLength={191} autoComplete="email" placeholder="you@example.com" className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 text-base outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
            </div>
            <button type="submit" className="h-14 w-full rounded-xl bg-[#397e70] px-5 text-base font-semibold text-white transition hover:bg-[#2f6d61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2">Send reset link</button>
          </form>
        )}
        <p className="mt-7 text-center text-sm text-ink-600"><Link href="/sign-in" className="font-medium text-[#7054b2] underline underline-offset-2">Back to sign in</Link></p>
      </section>
    </main>
  );
}
