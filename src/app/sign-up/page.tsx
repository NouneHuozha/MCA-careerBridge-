import { safeReturnPath } from "@/lib/return-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Callout, Card } from "@/components/ui";
import { getCurrentUser } from "@/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <div className="cb-container max-w-md py-16">
      <Card className="p-7 sm:p-8">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-ink-500">
          Saving your account keeps your profile, saved options and action plan for next time.
        </p>

        {params.error ? (
          <div className="mt-4">
            <Callout tone="amber" title="We couldn't create that account">
              <p>{params.error}</p>
            </Callout>
          </div>
        ) : null}

        <form action="/api/auth/sign-up" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink-700">
              Your name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="What should we call you?"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-forest-400"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-forest-400"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-forest-400"
            />
            <p className="mt-1 text-xs text-ink-400">At least 8 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-ink-700">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-forest-400"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Create account
          </Button>
        </form>

        <p className="mt-5 text-sm text-ink-500">
          Already have an account?{" "}
          <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="font-medium text-forest-700 underline underline-offset-2">
            Sign in
          </Link>
        </p>
        <p className="mt-4 text-xs text-ink-400">
          Privacy by design: we ask only for what guidance needs. No address, no income figures, no phone number.
        </p>
      </Card>
    </div>
  );
}
