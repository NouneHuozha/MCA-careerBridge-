import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { LibraryReveal } from "@/components/library-motion";

export type LibraryCrumb = {
  label: string;
  href?: string;
};

export function LibraryDetailFrame({ children }: { children: ReactNode }) {
  return (
    <div className="cb-container mx-auto w-full max-w-none py-7 sm:py-10">
      {children}
    </div>
  );
}

export function LibraryBreadcrumbs({ items }: { items: LibraryCrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink-600">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true" className="text-ink-400">/</span>}
            {item.href ? (
              <Link href={item.href} className="underline decoration-transparent underline-offset-4 transition hover:decoration-current">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-ink-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LibraryDetailIntro({
  title,
  description,
  facts,
  actions,
  aside,
  titleClassName,
  variant,
}: {
  title: string;
  description: string;
  facts?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  titleClassName?: string;
  variant?: "career" | "course" | "exam" | "institution" | "pathway" | "scholarship" | "opportunity";
}) {
  const variantStyles = {
    career: { surface: "bg-[#e6eeea]", grid: "lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]", aside: "lg:justify-self-end", content: "" },
    course: { surface: "bg-[#d6eaf4]", grid: "lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)]", aside: "", content: "" },
    exam: { surface: "bg-[#f2cf78]", grid: "lg:grid-cols-[minmax(260px,.65fr)_minmax(0,1.35fr)]", aside: "lg:order-first", content: "lg:order-last" },
    institution: { surface: "bg-[#dde4df]", grid: "lg:grid-cols-[minmax(0,1fr)]", aside: "lg:col-span-full", content: "" },
    pathway: { surface: "bg-[#d6eaf4]", grid: "lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,.7fr)]", aside: "lg:self-end", content: "" },
    scholarship: { surface: "bg-[#f9e2d2]", grid: "lg:grid-cols-[minmax(280px,.62fr)_minmax(0,1.38fr)]", aside: "lg:order-first", content: "lg:order-last" },
    opportunity: { surface: "bg-[#e6eeea]", grid: "lg:grid-cols-[minmax(0,1fr)_minmax(280px,.72fr)]", aside: "", content: "" },
  };
  const variantStyle = variant
    ? variantStyles[variant]
    : { surface: "bg-[#f7f8f5]", grid: "lg:grid-cols-[minmax(0,1fr)_minmax(250px,.45fr)]", aside: "", content: "" };

  return (
    <header className={`relative isolate mb-10 overflow-hidden px-5 py-8 sm:mb-14 sm:px-8 sm:py-12 lg:px-12 lg:py-14 ${variantStyle.surface}`}>
      <div className={`mx-auto grid w-full max-w-[1720px] gap-8 lg:items-end ${variantStyle.grid}`}>
      <div className={`min-w-0 ${variantStyle.content}`}>
        <LibraryReveal>
          <h1 className={titleClassName ?? "max-w-[18ch] text-[clamp(2.7rem,6vw,6.25rem)] font-semibold leading-[.94] tracking-[-.06em] text-[#17201b]"}>
            {title}
          </h1>
        </LibraryReveal>
        <LibraryReveal delay={0.08}>
          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-[#34463c] sm:text-lg">
            {description}
          </p>
        </LibraryReveal>
        {facts && <LibraryReveal delay={0.14}><div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#263a30]">{facts}</div></LibraryReveal>}
        {actions && <LibraryReveal delay={0.2}><div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div></LibraryReveal>}
      </div>
      {aside ? (
        <LibraryReveal className={`min-w-0 ${variantStyle.aside}`}>{aside}</LibraryReveal>
      ) : null}
      </div>
    </header>
  );
}

export function LibrarySection({
  title,
  intro,
  children,
  className = "",
  id,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-heading` : undefined} className={className}>
      <LibraryReveal>
        <div className="mb-6 max-w-3xl">
          <h2 id={id ? `${id}-heading` : undefined} className="text-2xl font-semibold leading-tight tracking-[-.04em] text-[#17201b] sm:text-3xl">
            {title}
          </h2>
          {intro && <p className="mt-3 max-w-[45ch] text-base leading-relaxed text-[#405349]">{intro}</p>}
        </div>
      </LibraryReveal>
      <LibraryReveal delay={0.08}>{children}</LibraryReveal>
    </section>
  );
}

export function LibraryRecordLink({
  href,
  title,
  detail,
  action = "Explore",
}: {
  href: string;
  title: string;
  detail?: string | null;
  action?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-16 items-center gap-4 px-4 py-4 transition-colors hover:bg-[#dde4df] focus-visible:bg-[#dde4df]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-[#17201b]">{title}</span>
        {detail && <span className="mt-1 block text-base leading-relaxed text-[#43564b]">{detail}</span>}
      </span>
      <span className="hidden text-sm font-medium text-[#09332a] sm:block">{action}</span>
      <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-[#09332a] transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function LibrarySourceLink({
  href,
  children,
}: {
  href?: string | null;
  children: ReactNode;
}) {
  if (!href) return <span className="text-sm text-[#52635a]">{children}</span>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline decoration-[#6f887b] underline-offset-4 transition hover:decoration-[#09332a]"
    >
      {children}
      <ExternalLink aria-hidden="true" className="h-4 w-4" />
    </a>
  );
}
