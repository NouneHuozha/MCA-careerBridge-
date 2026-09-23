import { cx } from "@/components/ui";

/** Neutral shimmer-free skeleton — a calm placeholder, not a flashing block. */
export function Bar({ className }: { className?: string }) {
  return <span aria-hidden className={cx("block animate-fade rounded-full bg-ink-100", className)} />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5">
      <Bar className="h-9 w-9 rounded-xl" />
      <Bar className="mt-4 h-3.5 w-2/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bar key={i} className={cx("mt-2.5 h-2.5", i === lines - 1 ? "w-1/2" : "w-full")} />
      ))}
    </div>
  );
}

export function PageSkeleton({ title, cards = 6 }: { title: string; cards?: number }) {
  return (
    <div className="cb-container py-12 lg:py-16">
      <span className="sr-only" role="status">
        Loading {title}
      </span>
      <Bar className="h-3 w-28" />
      <Bar className="mt-5 h-9 w-80 max-w-full rounded-xl" />
      <Bar className="mt-4 h-3 w-64 max-w-full" />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
