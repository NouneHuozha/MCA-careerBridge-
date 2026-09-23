import Link from "next/link";
import { Compass, Hammer, Layers, Sparkles } from "lucide-react";
import { ArrowGlyph, Badge, ButtonLink, Eyebrow, accentSurface, cx, type Accent } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { CurveLine } from "@/components/decor";
import { getFields, getPathways } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { suggestPathways } from "@/recommendation/engine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pathways" };

const routeMeta: Record<string, { label: string; accent: Accent; icon: typeof Layers }> = {
  academic: { label: "Academic", accent: "sky", icon: Layers },
  diploma: { label: "Diploma", accent: "mint", icon: Compass },
  vocational: { label: "Vocational", accent: "butter", icon: Hammer },
  professional: { label: "Professional", accent: "lavender", icon: Sparkles },
};

export default async function PathwaysPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; field?: string }>;
}) {
  const params = await searchParams;
  const stage = params.stage === "class12" ? "class12" : params.stage === "class10" ? "class10" : undefined;

  const [pathways, fields, state] = await Promise.all([
    getPathways({ stage, fieldSlug: params.field }),
    getFields(),
    getSessionState(),
  ]);
  const suggested = state ? await suggestPathways(state.snapshot, 3) : [];
  const suggestedSlugs = new Set(suggested.map((s) => s.pathway.slug));

  return (
    <div className="relative overflow-hidden">
      <CurveLine className="pointer-events-none absolute -right-10 top-20 hidden h-40 w-56 text-forest-200 lg:block" />

      <div className="cb-container relative py-12 lg:py-16">
        <Eyebrow className="animate-rise">Pathways</Eyebrow>
        <h1 className="animate-rise delay-1 mt-4 max-w-xl text-[clamp(1.9rem,4.2vw,2.6rem)] font-semibold">
          There is more than one way forward
        </h1>
        <p className="animate-rise delay-2 mt-3 max-w-lg text-[15px] text-ink-500">
          Diploma, vocational and degree routes are all legitimate. What differs is time, cost and what stays open.
        </p>

        {/* --------------------------------------------------- filters */}
        <div className="animate-rise delay-3 mt-8 flex flex-wrap items-center gap-2">
          {[
            { href: "/pathways", label: "All routes", active: !stage },
            { href: "/pathways?stage=class10", label: "After Class 10", active: stage === "class10" },
            { href: "/pathways?stage=class12", label: "After Class 12", active: stage === "class12" },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cx(
                "rounded-full border px-4 py-2 text-[13px] transition-all duration-200",
                tab.active
                  ? "border-forest-500 bg-forest-600 text-white"
                  : "border-ink-200 bg-white text-ink-600 hover:-translate-y-0.5 hover:border-forest-300",
              )}
            >
              {tab.label}
            </Link>
          ))}
          {params.field ? (
            <Link
              href={stage ? `/pathways?stage=${stage}` : "/pathways"}
              className="rounded-full border border-ink-200 bg-white px-4 py-2 text-[13px] text-ink-500"
            >
              {fields.find((f) => f.slug === params.field)?.name ?? params.field} ✕
            </Link>
          ) : null}
        </div>

        {/* --------------------------------------------- suggested band */}
        {suggested.length ? (
          <Reveal>
            <section className="mt-10 rounded-[1.5rem] border border-forest-100 bg-forest-50/50 p-6" aria-label="Routes related to you">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800">
                <Sparkles aria-hidden className="h-4 w-4" strokeWidth={1.8} />
                Related to your answers
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {suggested.map(({ pathway, reasons }) => (
                  <Link
                    key={pathway.slug}
                    href={`/pathways/${pathway.slug}`}
                    className="cb-lift rounded-2xl border border-ink-100 bg-white p-4"
                  >
                    <Badge tone="forest">{routeMeta[pathway.routeType]?.label ?? pathway.routeType}</Badge>
                    <p className="mt-2.5 text-[14px] font-semibold leading-snug text-ink-900">{pathway.title}</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-400">{reasons[0]}</p>
                  </Link>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {/* ------------------------------------------- journey listing */}
        <section className="mt-12" aria-label="All pathways">
          <div className="space-y-4">
            {pathways.map((pathway, index) => {
              const meta = routeMeta[pathway.routeType] ?? routeMeta.academic;
              const steps = pathway.steps ?? [];
              return (
                <Reveal key={pathway.slug} delay={Math.min(index * 50, 320)}>
                  <Link
                    href={`/pathways/${pathway.slug}`}
                    className={cx(
                      "group block rounded-[1.25rem] border bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300",
                      suggestedSlugs.has(pathway.slug) ? "border-forest-200" : "border-ink-100",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentSurface[meta.accent]}`}>
                          <meta.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge>{pathway.entryStage === "class10" ? "From Class 10" : "From Class 12"}</Badge>
                            <Badge tone="forest">{meta.label}</Badge>
                            {pathway.typicalDuration ? <Badge>{pathway.typicalDuration}</Badge> : null}
                          </div>
                          <p className="mt-2.5 text-[16px] font-semibold text-ink-900">{pathway.title}</p>
                        </div>
                      </div>
                      <ArrowGlyph className="mt-2 h-4 w-4 shrink-0 text-ink-300 group-hover:text-forest-600" />
                    </div>

                    {/* Visual journey rail — the point of a pathway page */}
                    {steps.length ? (
                      <ol className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-2 border-t border-dashed border-ink-100 pt-5">
                        {steps.map((step, stepIndex) => (
                          <li key={step.label} className="flex items-center gap-1.5">
                            <span className="rounded-full bg-canvas-deep px-3 py-1.5 text-[12px] text-ink-600 transition-colors group-hover:bg-forest-50">
                              {step.label}
                            </span>
                            {stepIndex < steps.length - 1 ? (
                              <span aria-hidden className="text-ink-300">
                                →
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {!pathways.length ? (
            <p className="mt-6 text-sm text-ink-400">No route matches that filter yet.</p>
          ) : null}
        </section>

        {!state ? (
          <Reveal>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] border border-ink-100 bg-white p-6 sm:p-8">
              <div>
                <p className="text-[15px] font-semibold text-ink-900">Which of these fits you?</p>
                <p className="mt-1 text-sm text-ink-500">Answer eight questions and we&apos;ll highlight the closest routes.</p>
              </div>
              <ButtonLink href="/start">
                Find out
                <ArrowGlyph />
              </ButtonLink>
            </div>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
