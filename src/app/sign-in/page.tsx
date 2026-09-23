import { safeReturnPath } from "@/lib/return-path";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Callout, Card } from "@/components/ui";
import { getCurrentUser } from "@/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <div className="cb-container max-w-md py-16">
      <Card className="p-7 sm:p-8">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-500">Sign in to continue your journey. Your exploration is saved.</p>

        {params.error ? (
          <div className="mt-4">
            <Callout tone="amber" title="We couldn't sign you in">
              <p>{params.error}</p>
            </Callout>
          </div>
        ) : null}

        <form action="/api/auth/sign-in" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={next} />
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
              autoComplete="current-password"
              className="w-full rounded-xl border border-ink-200 px-3.5 py-3 text-sm outline-none transition-colors focus:border-forest-400"
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Sign in
          </Button>
        </form>

        <p className="mt-5 text-sm text-ink-500">
          Don&apos;t have an account?{" "}
          <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-forest-700 underline underline-offset-2">
            Create one
          </Link>
        </p>
        <p className="mt-4 text-xs text-ink-400">
          Your progress stays with your account. No home address or phone number needed.
        </p>
      </Card>
    </div>
  );
}
