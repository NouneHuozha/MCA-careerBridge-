import Link from "next/link";

export function GoogleAuthButton({ next, form, configured }: { next: string; form: "sign-in" | "sign-up"; configured: boolean }) {
  const href = `/api/auth/google?form=${form}&next=${encodeURIComponent(next)}`;
  const className = "flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white text-base font-semibold text-ink-700 transition hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-600 focus-visible:ring-offset-2";
  return configured
    ? <Link href={href} className={className}><span aria-hidden className="text-xl font-bold text-[#4285f4]">G</span>Continue with Google</Link>
    : <div>
        <button type="button" disabled title="Google sign-in needs provider credentials" className={`${className} cursor-not-allowed opacity-60`}><span aria-hidden className="text-xl font-bold text-[#4285f4]">G</span>Continue with Google</button>
        <p className="mt-2 text-center text-xs text-ink-500">Google sign-in will be available after provider setup.</p>
      </div>;
}
