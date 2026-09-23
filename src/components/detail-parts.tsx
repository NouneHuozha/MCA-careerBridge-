import Link from "next/link";
import { ArrowRight, Compass, MessageCircle, Route } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink, Eyebrow, IconTile, type Accent } from "@/components/ui";

export function LinkRow({ href, title, description, icon, accent = "mint", action = "Explore" }: { href: string; title: string; description?: string | null; icon?: ReactNode; accent?: Accent; action?: string }) {
  return <Link href={href} className="cb-link-row group">
    {icon && <IconTile accent={accent} size="sm">{icon}</IconTile>}
    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-snug text-ink-900 group-hover:text-forest-700">{title}</span>{description && <span className="mt-1 block text-xs leading-relaxed text-ink-500">{description}</span>}</span>
    <span className="hidden text-xs font-bold text-forest-700 xl:block">{action}</span><ArrowRight aria-hidden className="link-arrow" />
  </Link>;
}

export function DetailHeader({ eyebrow, title, description, icon, accent = "mint", facts, actions }: { eyebrow: string; title: string; description?: string | null; icon: ReactNode; accent?: Accent; facts?: ReactNode; actions: ReactNode }) {
  return <header className="cb-detail-header">
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex items-center gap-3"><IconTile accent={accent}>{icon}</IconTile><Eyebrow>{eyebrow}</Eyebrow></div>
      <h1 className="cb-page-title">{title}</h1>
      {description && <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-ink-600">{description}</p>}
      {facts && <div className="mt-4 flex flex-wrap gap-2">{facts}</div>}
      <div className="mt-6 flex flex-wrap items-start gap-3">{actions}</div>
    </div>
    <div aria-hidden className="relative hidden w-44 shrink-0 xl:block">
      <svg viewBox="0 0 180 160" className="w-full" fill="none"><path d="M12 134C44 142 39 47 85 65s18 76 58 38 18-70 24-79" stroke="#9dbca2" strokeWidth="2" strokeDasharray="5 6" /><circle cx="34" cy="43" r="21" fill="#f9e9b9" /><circle cx="137" cy="105" r="26" fill="#e8e1f8" /><circle cx="88" cy="83" r="32" fill="white" stroke="#b8d1bf" /><path d="m76 96 6-18 18-8-7 19-17 7Z" stroke="#277559" strokeWidth="2" strokeLinejoin="round" /><circle cx="88" cy="83" r="3" fill="#277559" /><path d="M34 34v18M25 43h18" stroke="#957221" strokeWidth="2" strokeLinecap="round" /><path d="m129 106 6 6 12-14" stroke="#69519b" strokeWidth="2" strokeLinecap="round" /></svg>
    </div>
  </header>;
}

export function NextStepPanel({ title, text, href, cta, mentorQuestion }: { title: string; text: string; href: string; cta: string; mentorQuestion?: string }) {
  return <section className="rounded-2xl border border-forest-300 bg-mint p-6">
    <span className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700"><Route aria-hidden className="h-4 w-4" /> Your next step</span>
    <h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-relaxed text-ink-600">{text}</p>
    <ButtonLink href={href} className="mt-5 w-full">{cta}<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>
    <ButtonLink href={mentorQuestion ? `/mentor?q=${encodeURIComponent(mentorQuestion)}` : "/mentor"} variant="secondary" className="mt-3 w-full"><MessageCircle aria-hidden className="h-4 w-4" />Talk it through</ButtonLink>
  </section>;
}

export function MiniJourney({ current = 0 }: { current?: number }) {
  return <ol aria-label="Your exploration journey" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
    {["Explore a field", "Find a pathway", "Check courses & colleges"].map((label, i) => <li key={label} className={`flex items-center gap-2 ${i === current ? "font-semibold text-forest-800" : "text-ink-500"}`} aria-current={i === current ? "step" : undefined}>
      <span className={`grid h-6 w-6 place-items-center rounded-full border ${i === current ? "border-forest-700 bg-forest-700 text-white" : "border-ink-200 bg-white"}`}>{i + 1}</span>{label}{i < 2 && <ArrowRight aria-hidden className="ml-1 h-3 w-3 text-ink-400" />}
    </li>)}
  </ol>;
}

export function NoCatalogItems({ href = "/explore", label = "Browse all fields" }: { href?: string; label?: string }) {
  return <div className="rounded-xl bg-ink-50 p-5"><p className="mb-4 text-sm text-ink-500">No verified listings are available here yet.</p><ButtonLink href={href} variant="secondary" size="sm"><Compass aria-hidden className="h-4 w-4" />{label}</ButtonLink></div>;
}
