import Link from "next/link";

export default function NotFound() {
  return (
    <div className="cb-container max-w-xl py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">Page not found</p>
      <h1 className="mt-3 text-2xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-sm text-ink-500">
        The link may be out of date, or the item may not be in our catalogue yet. Try exploring from one of these
        starting points.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/explore" className="rounded-full bg-forest-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-forest-800">
          Explore fields
        </Link>
        <Link href="/institutions" className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
          Find institutions
        </Link>
        <Link href="/mentor" className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50">
          Ask the mentor
        </Link>
      </div>
    </div>
  );
}
