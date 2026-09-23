import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { JourneyShell } from "@/components/journey-sidebar";
import { ButtonLink, Disclosure, EmptyState } from "@/components/ui";
import { FACTOR_LABELS, suggestFields } from "@/recommendation/engine";
import { getSessionState } from "@/services/profile";
import { Compass } from "lucide-react";
export const dynamic = "force-dynamic";
export const metadata = { title: "My possibilities" };
const visualBySlug: Record<string, string> = { technology: "/images/field-technology.png", healthcare: "/images/field-healthcare.png", engineering: "/images/field-engineering.png", business: "/images/field-business.png" };
const fallbackVisuals = ["/images/field-technology.png", "/images/field-healthcare.png", "/images/field-engineering.png", "/images/field-business.png"];
const accents = ["bg-[#e6f3ff]", "bg-[#e7f7f0]", "bg-[#fff4df]", "bg-[#f0edff]"];
export default async function ProfilePage() {
  const state = await getSessionState();
  if (!state) return <JourneyShell current={3}><div className="cb-container cb-page"><EmptyState icon={<Compass className="h-5 w-5" />} title="Let’s find your starting points." description="A few short questions help us show possibilities that may be worth exploring." action={<ButtonLink href="/start">Start here<ArrowRight className="h-4 w-4" /></ButtonLink>} /></div></JourneyShell>;
  const suggestions = await suggestFields(state.snapshot, 4);
  return <JourneyShell current={3}>
    <div className="bg-white"><div className="cb-container cb-page max-w-[1260px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="cb-eyebrow text-[#735bd1]">Your possibilities</p><h1 className="mt-2 max-w-4xl text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-[-.04em] text-forest-900">Here are a few directions worth looking into.</h1><p className="mt-2 text-lg text-ink-500">These are starting points, not final answers.</p></div><Link href="#why" className="cb-source text-sm">Why am I seeing this? <CircleHelp className="h-4 w-4" /></Link></header>
      <section className="relative min-h-[210px] overflow-hidden rounded-2xl border border-[#b8dfdc] bg-[#dff5f1]" aria-label="Possibilities introduction"><Image src="/images/possibilities-landscape.png" alt="A student looking at many paths across the hills of Nagaland" fill sizes="(max-width: 1000px) 100vw, 1100px" className="object-cover" priority /><div className="absolute inset-0 bg-gradient-to-r from-[#dff5f1] via-[#dff5f1cc] to-transparent" /><div className="relative z-10 max-w-[420px] px-8 py-8 sm:px-12 sm:py-10"><h2 className="text-3xl font-semibold leading-tight text-forest-900">Many paths.<br />A brighter you.</h2><span className="mt-5 block h-0.5 w-10 bg-[#41a993]" /><p className="mt-4 text-base leading-relaxed text-ink-600">Nagaland’s tomorrow needs your unique journey.</p></div></section>
      <section className="mt-5 grid gap-5 md:grid-cols-2" aria-label="Recommended possibilities">{suggestions.map((suggestion, index) => { const image = visualBySlug[suggestion.field.slug] ?? fallbackVisuals[index % fallbackVisuals.length]; return <article key={suggestion.field.slug} className={`group relative min-h-[170px] overflow-hidden rounded-2xl border border-white ${accents[index]}`}><Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-left opacity-95 transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-white/90" /><div className="relative z-10 ml-auto flex min-h-[170px] w-[52%] flex-col justify-center px-5 py-5 sm:px-8"><h2 className="max-w-[13ch] text-xl font-semibold leading-tight text-forest-900">{suggestion.field.name}</h2><Link href={`/explore/${suggestion.field.slug}`} className="cb-source mt-5 text-sm">Explore this <ArrowRight className="h-4 w-4" /></Link><Disclosure summary="Why this?" tone="forest"><p className="text-xs">{suggestion.reasons.length ? `${FACTOR_LABELS[suggestion.reasons[0].factor]}: ${suggestion.reasons[0].detail}` : "A starting point to browse, not a prediction."}</p></Disclosure></div></article>; })}</section>
      <section id="why" className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#b8dfdc] bg-[#eef9f5] px-6 py-5"><div><p className="text-sm font-semibold text-forest-900">Starting points, not predictions.</p><p className="mt-1 text-sm text-ink-500">We use what you shared to help you notice options. You remain in charge.</p></div><ButtonLink href="/counselling" variant="secondary">Change my answers<ArrowRight className="h-4 w-4" /></ButtonLink></section>
    </div></div>
  </JourneyShell>;
}
