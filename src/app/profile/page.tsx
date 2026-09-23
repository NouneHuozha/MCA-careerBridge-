import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleHelp, Compass } from "lucide-react";
import { JourneyShell } from "@/components/journey-sidebar";
import { ButtonLink, EmptyState } from "@/components/ui";
import { FACTOR_LABELS, suggestFields } from "@/recommendation/engine";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "My possibilities" };

const visualBySlug: Record<string, string> = {
  technology: "/images/field-technology.png",
  healthcare: "/images/field-healthcare.png",
  engineering: "/images/field-engineering.png",
  business: "/images/field-business.png",
};
const fallbackVisuals = ["/images/field-technology.png", "/images/field-healthcare.png", "/images/field-engineering.png", "/images/field-business.png"];
const accents = ["bg-[#e5f2ff]", "bg-[#e4f6ef]", "bg-[#fff4df]", "bg-[#f0edff]"];

export default async function ProfilePage() {
  const state = await getSessionState();
  if (!state) {
    return <JourneyShell current={3}><div className="cb-container cb-page"><EmptyState icon={<Compass className="h-5 w-5" />} title="Let’s find your starting points." description="A few short questions help us show possibilities that may be worth exploring." action={<ButtonLink href="/start">Start here<ArrowRight className="h-4 w-4" /></ButtonLink>} /></div></JourneyShell>;
  }
  const suggestions = (await suggestFields(state.snapshot, 4)).slice(0, 4);

  return <JourneyShell current={3}>
    <div className="min-w-0 bg-white">
      <div className="cb-container cb-page mx-auto max-w-[1320px]">
        <header className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="cb-eyebrow text-[#735bd1]">Your possibilities</p>
            <h1 className="mt-2 text-[clamp(2rem,3.1vw,3.25rem)] font-semibold leading-[1.08] tracking-[-.045em] text-forest-900">Here are a few directions worth looking into.</h1>
            <p className="mt-3 text-[17px] leading-relaxed text-ink-500">These are starting points, not final answers.</p>
          </div>
          <Link href="#why" className="cb-source mb-1 hidden shrink-0 text-sm md:inline-flex">Why am I seeing this? <CircleHelp className="h-4 w-4" /></Link>
        </header>

        <section className="relative h-[218px] overflow-hidden rounded-2xl border border-[#c1e2df] bg-[#dff5f1]" aria-label="Possibilities introduction">
          <Image src="/images/possibilities-landscape.png" alt="A student looking at many paths across the hills of Nagaland" fill sizes="(max-width: 1100px) 100vw, 1100px" className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#dff5f1] via-[#dff5f1e8] via-32% to-transparent" />
          <div className="relative z-10 flex h-full max-w-[400px] flex-col justify-center px-8 sm:px-11">
            <h2 className="text-[27px] font-semibold leading-[1.08] tracking-[-.035em] text-forest-900">Many paths.<br />A brighter you.</h2>
            <span className="mt-5 block h-0.5 w-10 bg-[#41a993]" />
            <p className="mt-4 max-w-[220px] text-[15px] leading-relaxed text-ink-600">Nagaland’s tomorrow needs your unique journey.</p>
          </div>
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-2" aria-label="Recommended possibilities">
          {suggestions.map((suggestion, index) => {
            const image = visualBySlug[suggestion.field.slug] ?? fallbackVisuals[index % fallbackVisuals.length];
            const reason = suggestion.reasons[0];
            return <article key={suggestion.field.slug} className={`grid h-[174px] min-w-0 grid-cols-[52%_48%] overflow-hidden rounded-2xl border border-white ${accents[index]} shadow-[0_1px_0_rgba(31,74,60,.03)]`}>
              <div className="relative min-w-0 overflow-hidden"><Image src={image} alt="" fill sizes="(max-width: 768px) 52vw, 360px" className="object-cover object-left" /></div>
              <div className="flex min-w-0 flex-col justify-center px-4 py-4 sm:px-6">
                <h2 className="text-[18px] font-semibold leading-[1.12] tracking-[-.025em] text-forest-900">{suggestion.field.name}</h2>
                <Link href={`/explore/${suggestion.field.slug}`} className="cb-source mt-5 w-fit text-sm">Explore this <ArrowRight className="h-4 w-4" /></Link>
                {reason ? <p className="sr-only">{FACTOR_LABELS[reason.factor]}: {reason.detail}</p> : null}
              </div>
            </article>;
          })}
        </section>

        <section id="why" className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#c1e2df] bg-[#eef9f5] px-6 py-4"><div><p className="text-sm font-semibold text-forest-900">Starting points, not predictions.</p><p className="mt-1 text-sm text-ink-500">We use what you shared to help you notice options. You remain in charge.</p></div><ButtonLink href="/counselling" variant="secondary">Change my answers<ArrowRight className="h-4 w-4" /></ButtonLink></section>
      </div>
    </div>
  </JourneyShell>;
}
