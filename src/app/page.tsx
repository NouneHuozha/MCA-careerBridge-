import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, MessageCircle, Route, ShieldCheck } from "lucide-react";
import { ButtonLink, Eyebrow, SectionHeading, accentSurface } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { GuidanceCompass } from "@/components/guidance-compass";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { JourneyShell } from "@/components/journey-sidebar";
import { getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";

const steps = [
  { number: "01", icon: Compass, accent: "mint" as const, title: "Tell us where you are", text: "Class 10 or Class 12? We’ll ask only the questions that help you begin." },
  { number: "02", icon: BookOpen, accent: "butter" as const, title: "Notice what fits", text: "Explore areas, work and subjects — without being told what to choose." },
  { number: "03", icon: Route, accent: "lavender" as const, title: "Take one next step", text: "Save, compare or make a small plan when something feels worth looking into." },
];

export default async function HomePage() {
  const fields = await getFields();
  return <JourneyShell current={0}>
    {/* Hero: one message, one action */}
    <section className="relative overflow-hidden border-b border-ink-200 bg-[#f4f7ef]">
      <div aria-hidden className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-mint/70 blur-3xl" />
      <div aria-hidden className="absolute -bottom-40 left-[30%] h-80 w-80 rounded-full bg-butter/35 blur-3xl" />
      <div className="cb-container relative grid items-center gap-10 py-12 lg:min-h-[680px] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:py-16">
        <div className="max-w-2xl">
          <div className="animate-rise flex flex-wrap items-center gap-3"><Eyebrow>Start here</Eyebrow></div>
          <h1 className="animate-rise delay-1 mt-6 max-w-[11ch] text-[clamp(2.7rem,5.4vw,5.6rem)] font-semibold leading-[1.01] tracking-[-.055em]">Find a direction that feels worth exploring.</h1>
          <p className="animate-rise delay-2 mt-6 max-w-[46ch] text-xl leading-relaxed text-ink-500">You do not need to know your career yet.</p>
          <div className="animate-rise delay-3 mt-8"><ButtonLink href="/start" size="lg">Start with a few questions<ArrowRight aria-hidden className="h-5 w-5" /></ButtonLink></div>
          <div className="mt-10 grid max-w-[530px] grid-cols-3 gap-5 text-sm text-ink-600"><div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#dff3eb] text-base font-semibold text-[#1e8267]">1</span><p className="mt-3">Answer a few questions</p></div><div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e9f1ff] text-base font-semibold text-[#4773bb]">2</span><p className="mt-3">See what fits</p></div><div><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0eaff] text-base font-semibold text-[#735bd1]">3</span><p className="mt-3">Take one next step</p></div></div>
        </div>
        <div className="relative min-w-0 lg:pl-4"><div className="absolute -right-8 top-0 h-64 w-64 rounded-full bg-[#dfeeff]" /><div className="relative mx-auto aspect-[1.08] max-w-[720px] overflow-hidden rounded-[2rem] bg-transparent"><Image src="/images/home-journey.png" alt="A student exploring different paths with a map" fill priority sizes="(max-width: 1024px) 92vw, 48vw" className="object-contain" /></div></div>
      </div>
    </section>

    {/* How it works + our promise, merged into one section instead of two */}
    <section className="cb-container py-14 sm:py-18" aria-labelledby="how-starts">
      <SectionHeading eyebrow="A simple place to begin" title="You do not need to have it all figured out." description="CareerBridge helps you take the next useful step — one question, one possibility and one decision at a time." />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,.8fr)] lg:items-center">
        <div id="how-starts" className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {steps.map((step, index) => <Reveal key={step.number} delay={index * 80}>
            <article className="flex items-start gap-4 rounded-2xl border border-ink-200 bg-white p-5">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${accentSurface[step.accent]}`}><step.icon aria-hidden className="h-5 w-5" /></span>
              <div><h2 className="text-base font-semibold">{step.title}</h2><p className="mt-1 text-sm leading-relaxed text-ink-500">{step.text}</p></div>
            </article>
          </Reveal>)}
        </div>
        <div className="rounded-[1.5rem] border border-forest-200 bg-mint/35 p-4 sm:p-7">
          <Eyebrow>Our promise</Eyebrow>
          <h2 className="mt-2 text-xl font-semibold">Guide, don’t decide.</h2>
          <GuidanceCompass />
        </div>
      </div>
    </section>

    {/* Browse fields, with the "still unsure" CTA folded in as a footer row instead of its own full section */}
    <section className="cb-container pb-16" aria-labelledby="browse-title">
      <div className="flex flex-wrap items-end justify-between gap-5"><SectionHeading eyebrow="If you already have a question" title="You can look around too." /><ButtonLink href="/explore" variant="secondary">Browse all areas<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{fields.slice(0, 8).map((field) => <Link href={`/explore/${field.slug}`} key={field.slug} className="cb-link-row group"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentSurface[fieldVisual(field.slug).accent]}`}><FieldIcon slug={field.slug} /></span><span className="text-sm font-semibold text-ink-800">{field.name}</span><ArrowRight aria-hidden className="link-arrow" /></Link>)}</div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sky-ink/20 bg-sky/35 p-5"><p className="flex items-center gap-2 text-sm font-semibold text-sky-ink"><MessageCircle aria-hidden className="h-4 w-4" />Still unsure? You can talk it through before choosing anything.</p><ButtonLink href="/mentor" size="sm">Ask Mentor<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div>
    </section>
  </JourneyShell>;
}
