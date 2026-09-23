"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[careerbridge] page error", error);
  }, [error]);

  return (
    <div className="cb-container max-w-xl py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">Something went wrong</p>
      <h1 className="mt-3 text-2xl font-semibold">We couldn&apos;t load this page right now</h1>
      <p className="mt-3 text-sm text-ink-500">
        This is our side, not yours. Your saved answers are safe. You can try again, or keep exploring elsewhere in
        CareerBridge.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-800"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}
