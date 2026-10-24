import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LibrarySearch } from "@/components/library-search";

export function LibraryPageHeader({
  title,
  description,
  action,
  query,
  searchLabel,
  placeholder,
  count,
  browseHref = "/explore",
  browseLabel = "Browse the Explore Library",
}: {
  title: string;
  description: string;
  action?: string;
  query?: string;
  searchLabel?: string;
  placeholder?: string;
  count?: string;
  browseHref?: string;
  browseLabel?: string;
}) {
  return (
    <header className="relative overflow-hidden bg-[#e6eeea]">
      <div className="relative mx-auto grid max-w-[1440px] gap-9 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_.72fr] lg:items-end lg:px-12 lg:py-20">
        <div className="max-w-[780px]">
          <Link href={browseHref} className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#36544a] hover:text-[#09332a]">
            <ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" />
            {browseLabel}
          </Link>
          <h1 className="mt-6 max-w-[15ch] text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[.96] tracking-[-.06em] text-[#17201b]">
            {title}
          </h1>
          <p className="mt-5 max-w-[58ch] text-base leading-relaxed text-[#3d5246] sm:text-lg">
            {description}
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:pb-1">
          {action ? (
            <LibrarySearch
              action={action}
              query={query}
              label={searchLabel ?? "Search this collection"}
              placeholder={placeholder ?? "Search this collection"}
            />
          ) : null}
          {count ? <p className="text-sm text-[#3d5246]">{count}</p> : null}
        </div>
      </div>
    </header>
  );
}
