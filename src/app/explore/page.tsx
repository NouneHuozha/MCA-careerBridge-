import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleHelp, Search } from "lucide-react";
import { JourneyShell } from "@/components/journey-sidebar";
import { ButtonLink, Disclosure } from "@/components/ui";
import { getFields, searchEverything } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { FACTOR_LABELS, suggestFields } from "@/recommendation/engine";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your possibilities" };
const visualBySlug: Record<string, string> = { technology: "/images/field-technology.png", healthcare: "/images/field-healthcare.png", engineering: "/images/field-engineering.png", business: "/images/field-business.png" };
const fallbackVisuals = ["/images/field-technology.png", "/images/field-healthcare.png", "/images/field-engineering.png", "/images/field-business.png"];
const accents = ["bg-[#e6f3ff]", "bg-[#e7f7f0]", "bg-[#fff4df]", "bg-[#f0edff]"];
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; mode?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const personal = params.mode === "personal";
  const [fields, state] = await Promise.all([getFields(), getSessionState()]);
  const results = query ? await searchEverything(query) : [];
  const suggestions = personal && state ? await suggestFields(state.snapshot, 4) : [];
  const cards = (suggestions.length ? suggestions.map((s) => s.field) : fields.slice(0, 4)).slice(0, 4);
  return <JourneyShell current={3}>
    <div className="bg-white">
      <div className="cb-container cb-page max-w-[1260px]">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="cb-eyebrow text-[#735bd1]">Your possibilities</p><h1 className="mt-2 max-w-4xl text-[clamp(2rem,3.8vw,3.5rem)] font-semibold leading-tight tracking-[-.04em] text-forest-900">Here are a few directions worth looking into.</h1><p className="mt-2 text-lg text-ink-500">These are starting points, not final answers.</p></div>
          <Link href="#why" className="cb-source text-sm">Why am I seeing this? <CircleHelp className="h-4 w-4" /></Link>
        </header>
        <section className="relative min-h-[210px] overflow-hidden rounded-2xl border border-[#b8dfdc] bg-[#dff5f1]" aria-label="Possibilities introduction">
          <Image src="/images/possibilities-landscape.png" alt="A student looking at many paths across the hills of Nagaland" fill sizes="(max-width: 1000px) 100vw, 1100px" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#dff5f1] via-[#dff5f1cc] to-transparent" />
          <div className="relative z-10 max-w-[420px] px-8 py-8 sm:px-12 sm:py-10"><h2 className="text-3xl font-semibold leading-tight text-forest-900">Many paths.<br />A brighter you.</h2><span className="mt-5 block h-0.5 w-10 bg-[#41a993]" /><p className="mt-4 text-base leading-relaxed text-ink-600">Nagaland’s tomorrow needs your unique journey.</p></div>
        </section>
        {results.length > 0 && <section className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/50 p-5"><form action="/explore" className="flex gap-3"><input name="q" defaultValue={query} placeholder="Search careers, courses or institutions" className="min-h-11 flex-1 rounded-xl border border-ink-200 bg-white px-4 text-sm outline-none focus:border-forest-500" /><button className="cb-button cb-button-primary px-5" type="submit"><Search className="h-4 w-4" />Search</button></form><div className="mt-4 grid gap-2 sm:grid-cols-2">{results.slice(0, 6).map((result) => <Link href={result.href} key={`${result.type}-${result.href}`} className="rounded-xl border border-ink-100 bg-white p-3 text-sm"><b>{result.title}</b><span className="ml-2 text-ink-500">{result.type}</span></Link>)}</div></section>}
        <section className="mt-5 grid gap-5 md:grid-cols-2" aria-label="Suggested fields">
          {cards.map((field, index) => { const image = visualBySlug[field.slug] ?? fallbackVisuals[index % fallbackVisuals.length]; return <article key={field.slug} className={`group relative min-h-[170px] overflow-hidden rounded-2xl border border-white ${accents[index]}`}><Image src={image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-left opacity-95 transition-transform duration-500 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-white/90" /><div className="relative z-10 ml-auto flex min-h-[170px] w-[52%] flex-col justify-center px-5 py-5 sm:px-8"><h2 className="max-w-[13ch] text-xl font-semibold leading-tight text-forest-900">{field.name}</h2><Link href={`/explore/${field.slug}`} className="cb-source mt-5 text-sm">Explore this <ArrowRight className="h-4 w-4" /></Link>{suggestions[index]?.reasons?.length ? <Disclosure summary="Why this?" tone="forest"><p className="text-xs">{FACTOR_LABELS[suggestions[index].reasons[0].factor]}: {suggestions[index].reasons[0].detail}</p></Disclosure> : null}</div></article>; })}
        </section>
        <section id="why" className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#b8dfdc] bg-[#eef9f5] px-6 py-5"><div><p className="text-sm font-semibold text-forest-900">Starting points, not predictions.</p><p className="mt-1 text-sm text-ink-500">We use what you shared to help you notice options. You remain in charge.</p></div><ButtonLink href="/profile" variant="secondary">Review my answers<ArrowRight className="h-4 w-4" /></ButtonLink></section>
        <section className="mt-12" aria-label="All career fields"><h2 className="text-xl font-semibold text-forest-900">See all directions</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{fields.slice(4).map((field) => <Link key={field.slug} href={`/explore/${field.slug}`} className="cb-link-row"><span className="text-sm font-semibold">{field.name}</span><ArrowRight className="link-arrow" /></Link>)}</div></section>
      </div>
    </div>
  </JourneyShell>;
}
