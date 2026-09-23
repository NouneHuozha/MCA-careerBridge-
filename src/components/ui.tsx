import Link from "next/link";
import { ArrowRight, ChevronDown, ExternalLink, SlidersHorizontal, Plus } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: (string | false | null | undefined)[]) { return parts.filter(Boolean).join(" "); }

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";
const variants: Record<Variant, string> = {
  primary: "cb-button-primary", secondary: "cb-button-secondary",
  ghost: "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50",
  quiet: "text-forest-700 underline underline-offset-4 hover:bg-forest-50",
};
const sizes: Record<Size, string> = { sm: "px-3.5 py-2 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-base min-h-[52px]" };

export function Button({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cx("cb-button group", variants[variant], sizes[size], className)} {...props} />;
}
export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={cx("cb-button group", variants[variant], sizes[size], className)} {...props} />;
}
export function ArrowGlyph({ className }: { className?: string }) {
  return <ArrowRight aria-hidden className={cx("h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5", className)} strokeWidth={2} />;
}

export type Accent = "mint" | "butter" | "lavender" | "peach" | "sky" | "forest";
export const accentSurface: Record<Accent, string> = {
  mint: "bg-mint text-mint-ink", butter: "bg-butter text-butter-ink", lavender: "bg-lavender text-lavender-ink",
  peach: "bg-peach text-peach-ink", sky: "bg-sky text-sky-ink", forest: "bg-forest-100 text-forest-700",
};
export function IconTile({ children, accent = "forest", size = "md", className }: { children: ReactNode; accent?: Accent; size?: "sm" | "md"; className?: string }) {
  return <span aria-hidden className={cx("grid shrink-0 place-items-center rounded-xl", size === "sm" ? "h-9 w-9" : "h-11 w-11", accentSurface[accent], className)}>{children}</span>;
}
export function Card({ className, as: As = "div", hover = false, children }: { className?: string; as?: "div" | "article" | "section" | "li"; hover?: boolean; children: ReactNode }) {
  return <As className={cx("cb-card p-5", hover && "cb-lift", className)}>{children}</As>;
}
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("cb-eyebrow", className)}>{children}</p>;
}
export function SectionHeading({ eyebrow, title, description, align = "left", className }: { eyebrow?: string; title: ReactNode; description?: ReactNode; align?: "left" | "center"; className?: string }) {
  return <div className={cx(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl", className)}>
    {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
    <h2 className="text-[1.65rem] font-semibold sm:text-[2rem]">{title}</h2>
    {description && <div className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-500">{description}</div>}
  </div>;
}
export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "forest" | "amber" | "red" | "green" | "lavender"; className?: string }) {
  const tones = { neutral: "bg-ink-50 text-ink-600 border-ink-200", forest: "bg-forest-100 text-forest-800 border-forest-200", amber: "bg-butter text-butter-ink border-butter-ink/15", red: "bg-peach text-peach-ink border-peach-ink/15", green: "bg-mint text-mint-ink border-mint-ink/15", lavender: "bg-lavender text-lavender-ink border-lavender-ink/15" };
  return <span className={cx("inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium", tones[tone], className)}>{children}</span>;
}
export function Callout({ title, children, tone = "neutral", icon }: { title?: string; children: ReactNode; tone?: "neutral" | "forest" | "amber"; icon?: ReactNode }) {
  const tones = { neutral: "border-ink-200 bg-ink-50", forest: "border-forest-200 bg-forest-50", amber: "border-butter-ink/20 bg-butter/45" };
  return <div className={cx("rounded-xl border-l-[3px] p-4 text-sm leading-relaxed text-ink-600", tones[tone])}>
    {title && <p className="mb-1.5 flex items-center gap-2 font-semibold text-ink-800">{icon}{title}</p>}
    <div className="[&>p:last-child]:mb-0 [&>p]:mb-2">{children}</div>
  </div>;
}

/** Content remains available, but students choose when to read it. */
export function Disclosure({ summary, hint, children, tone = "neutral", defaultOpen = false }: { summary: string; hint?: string; children: ReactNode; tone?: "neutral" | "forest" | "amber"; defaultOpen?: boolean }) {
  const tones = { neutral: "border-ink-200 bg-ink-50", forest: "border-forest-200 bg-forest-50", amber: "border-butter-ink/20 bg-butter/35" };
  return <details open={defaultOpen} className={cx("cb-disclosure group/disclosure rounded-xl border", tones[tone])}>
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink-800 hover:bg-white/40">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">{summary}{hint && <span className="text-xs font-normal text-ink-500">{hint}</span>}</span>
      <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-forest-200 bg-white text-forest-700 transition-transform group-open/disclosure:rotate-180"><ChevronDown className="h-4 w-4" /></span>
    </summary>
    <div className="cb-disclosure-body bg-white/80 px-4 py-4 text-sm leading-relaxed text-ink-600">{children}</div>
  </details>;
}

/** Filters have a compact, recognisable button instead of a page-wide white bar. */
export function FilterDisclosure({ children, count = 0, label = "More filters", defaultOpen = false }: { children: ReactNode; count?: number; label?: string; defaultOpen?: boolean }) {
  return <details className="cb-filter group/filter" open={defaultOpen}>
    <summary><SlidersHorizontal aria-hidden className="h-4 w-4" />{label}{count > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-forest-700 text-[11px] text-white">{count}</span>}<ChevronDown aria-hidden className="filter-chevron ml-2 h-4 w-4 transition-transform" /></summary>
    <div className="border-t border-forest-200 bg-white/70 p-5">{children}</div>
  </details>;
}

export function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-forest-300 bg-forest-50/60 px-6 py-12 text-center">
    {icon && <IconTile accent="mint">{icon}</IconTile>}<p className="text-base font-semibold text-ink-800">{title}</p><p className="max-w-md text-sm text-ink-500">{description}</p>{action}
  </div>;
}
export function ProgressDots({ total, current, label }: { total: number; current: number; label?: string }) {
  return <div className="flex items-center gap-1.5" role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(current, total)}>
    {Array.from({ length: total }, (_, i) => <span key={i} aria-hidden className={cx("h-2 rounded-full transition-all duration-300", i < current ? "w-5 bg-forest-600" : "w-2 bg-ink-200")} />)}
  </div>;
}

export function formatDate(value?: string | Date | null) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
export function VerificationBadge({ status, lastVerifiedAt, className }: { status?: string | null; lastVerifiedAt?: string | Date | null; className?: string }) {
  const date = formatDate(lastVerifiedAt);
  const map: Record<string, { tone: "green" | "forest" | "amber" | "neutral"; label: string }> = {
    verified: { tone: date ? "green" : "amber", label: date ? `Verified ${date}` : "Needs verification" },
    recently_verified: { tone: date ? "forest" : "amber", label: date ? `Checked ${date}` : "Needs verification" },
    needs_verification: { tone: "amber", label: "Needs verification" }, unavailable: { tone: "neutral", label: "Currently unavailable" }, sample: { tone: "neutral", label: "Sample data" },
  };
  const entry = map[status ?? "needs_verification"] ?? map.needs_verification;
  return <Badge tone={entry.tone} className={className}><span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{entry.label}</Badge>;
}

export function SourceLink({ href, children = "Visit official source", variant = "primary", className }: { href?: string | null; children?: ReactNode; variant?: "primary" | "secondary" | "inline"; className?: string }) {
  let valid = false;
  try { valid = !!href && ["https:", "http:"].includes(new URL(href).protocol); } catch { /* Show unavailable instead of an unsafe/broken link. */ }
  if (!valid) return <span className="text-sm text-ink-500">Official source currently unavailable</span>;
  return <a href={href!} target="_blank" rel="noopener noreferrer" className={cx(variant === "inline" ? "cb-source" : `cb-button ${variants[variant]} px-4 py-2.5 text-sm`, className)}>
    {children}<ExternalLink aria-hidden className="h-4 w-4 shrink-0" /><span className="sr-only"> (opens in a new tab)</span>
  </a>;
}
export function FactValue({ value, fallbackHref }: { value?: string | null; fallbackHref?: string | null }) {
  if (value?.trim()) return <span className="text-ink-700">{value}</span>;
  return <span className="inline-flex flex-col gap-1.5 text-ink-500">Currently unavailable{fallbackHref && <SourceLink href={fallbackHref} variant="inline">Check official source</SourceLink>}</span>;
}
export function BulletList({ items, className }: { items: string[]; className?: string }) {
  if (!items?.length) return <p className="text-sm text-ink-500">Currently unavailable.</p>;
  return <ul className={cx("space-y-2.5 text-sm leading-relaxed text-ink-600", className)}>{items.map((item) => <li key={item} className="flex gap-2.5"><span aria-hidden className="mt-[.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-forest-400" /><span>{item}</span></li>)}</ul>;
}
export function StepList({ items }: { items: { title: string; detail: string }[] }) {
  return <ol className="relative space-y-7 border-l-2 border-dashed border-forest-200 pl-7">{items.map((item, index) => <li key={item.title} className="relative">
    <span aria-hidden className="absolute -left-[2.65rem] grid h-7 w-7 place-items-center rounded-full border border-forest-200 bg-mint text-xs font-bold text-forest-700">{index + 1}</span>
    <p className="text-sm font-semibold text-ink-900">{item.title}</p><p className="mt-1 text-sm leading-relaxed text-ink-500">{item.detail}</p>
  </li>)}</ol>;
}
export function AddLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="cb-button border border-ink-200 bg-white px-3 py-2 text-xs text-forest-700 hover:bg-mint"><Plus aria-hidden className="h-3.5 w-3.5" />{children}</Link>; }
