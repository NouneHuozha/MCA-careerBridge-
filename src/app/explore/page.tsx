import Link from "next/link";
import { Search, Compass } from "lucide-react";
import { ArrowGlyph, Badge, ButtonLink, Disclosure, EmptyState, Eyebrow, accentSurface } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Blob, Sparkle } from "@/components/decor";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { getFields, searchEverything } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { FACTOR_LABELS, suggestFields } from "@/recommendation/engine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore" };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const [fields, state] = await Promise.all([getFields(), getSessionState()]);
  const results = query ? await searchEverything(query) : [];
  const suggestions = state ? await suggestFields(state.snapshot, 3) : [];
  const suggestedSlugs = new Set(suggestions.map((s) => s.field.slug));

  return (
    <div className="relative overflow-hidden">
      <Blob className="pointer-events-none absolute -right-28 -top-20 h-80 w-80 text-mint/60" />

      <div className="cb-container cb-page relative">
        {/* ---------------------------------------------------- header */}
        <div className="flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-forest-200 bg-mint/45 p-6 sm:p-8">
          <div className="max-w-xl">
            <div className="animate-rise flex items-center gap-2">
              <Eyebrow>Explore</Eyebrow>
              <Sparkle className="h-3.5 w-3.5 text-butter-ink/50" />
            </div>
            <h1 className="animate-rise delay-1 mt-4 text-[clamp(2rem,4.5vw,2.7rem)] font-semibold">
              What would you like to explore?
            </h1>
            <p className="animate-rise delay-2 mt-3 text-[15px] text-ink-500">
              Open anything that makes you curious. Nothing here is chosen for you.
            </p>
          </div>

          <form action="/explore" className="animate-rise delay-3 w-full max-w-sm">
            <label htmlFor="q" className="sr-only">
              Search fields, careers, courses, institutions
            </label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="q"
                name="q"
                defaultValue={query}
                placeholder="Search anything…"
                className="w-full rounded-full border border-ink-200 bg-white py-3 pl-11 pr-24 text-sm outline-none transition-colors focus:border-forest-400"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-forest-700 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-forest-800"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* --------------------------------------------------- results */}
        {query ? (
          <section className="mt-10" aria-label="Search results">
            <p className="text-sm text-ink-500">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            {results.length ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {results.map((result, index) => (
                  <Reveal key={`${result.type}-${result.href}`} delay={Math.min(index * 30, 240)} as="li">
                    <Link
                      href={result.href}
                      className="cb-lift flex h-full items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4"
                    >
                      <Badge tone="forest" className="mt-0.5 shrink-0">
                        {result.type}
                      </Badge>
                      <span>
                        <span className="block text-sm font-semibold text-ink-900">{result.title}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[13px] text-ink-500">{result.subtitle}</span>
                      </span>
                    </Link>
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="mt-4">
                <EmptyState
                  icon={<Search className="h-4 w-4" />}
                  title="No matches"
                  description="Try a shorter word, or browse the fields below."
                />
              </div>
            )}
          </section>
        ) : null}

        {/* ------------------------------------------------ suggestions */}
        {suggestions.length ? (
          <Reveal>
            <section className="mt-12 rounded-[1.5rem] border border-forest-100 bg-forest-50/50 p-6 sm:p-8" aria-label="Related to your answers">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800">
                  <Compass aria-hidden className="h-4 w-4" strokeWidth={1.8} />
                  Based on what you told us
                </p>
                <Link href="/profile" className="text-[13px] text-forest-700 underline-offset-4 hover:underline">
                  Review answers
                </Link>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {suggestions.map((suggestion) => {
                  const { accent } = fieldVisual(suggestion.field.slug);
                  return (
                    <div key={suggestion.field.slug} className="rounded-2xl border border-ink-100 bg-white p-5">
                      <span aria-hidden className={`grid h-9 w-9 place-items-center rounded-xl ${accentSurface[accent]}`}>
                        <FieldIcon slug={suggestion.field.slug} />
                      </span>
                      <Link
                        href={`/explore/${suggestion.field.slug}`}
                        className="mt-3 block text-[15px] font-semibold text-ink-900 hover:text-forest-700"
                      >
                        {suggestion.field.name}
                      </Link>
                      <ButtonLink href={`/explore/${suggestion.field.slug}`} size="sm" className="mt-4">Explore this field<ArrowGlyph /></ButtonLink>
                      <div className="mt-3">
                        <Disclosure summary="Why this?" tone="forest">
                          <ul className="space-y-2">
                            {suggestion.reasons.slice(0, 3).map((reason) => (
                              <li key={reason.detail}>
                                <span className="font-medium text-ink-700">{FACTOR_LABELS[reason.factor]}: </span>
                                {reason.detail}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-[12px] text-ink-400">Relevant factors — not a score or a prediction.</p>
                        </Disclosure>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </Reveal>
        ) : (
          <Reveal>
            <section className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-[1.5rem] border border-ink-100 bg-white p-6 sm:p-8">
              <div>
                <p className="text-[15px] font-semibold text-ink-900">Want this ordered around you?</p>
                <p className="mt-1 text-sm text-ink-500">Eight short questions, then we&apos;ll explain every suggestion.</p>
              </div>
              <ButtonLink href="/start">
                Start
                <ArrowGlyph />
              </ButtonLink>
            </section>
          </Reveal>
        )}

        {/* ------------------------------------------------- all fields */}
        <section className="mt-14" aria-label="All career fields">
          <h2 className="text-lg font-semibold">All fields</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field, index) => {
              const { accent } = fieldVisual(field.slug);
              return (
                <Reveal key={field.slug} delay={Math.min(index * 45, 380)}>
                  <Link
                    href={`/explore/${field.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300"
                  >
                    <span
                      aria-hidden
                      className={`absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-40 transition-transform duration-500 group-hover:scale-125 ${accentSurface[accent]}`}
                    />
                    <span aria-hidden className={`relative grid h-10 w-10 place-items-center rounded-xl ${accentSurface[accent]}`}>
                      <FieldIcon slug={field.slug} />
                    </span>
                    <span className="relative mt-4 flex items-center gap-2 text-[15px] font-semibold text-ink-900">
                      {field.name}
                      {suggestedSlugs.has(field.slug) ? (
                        <span className="rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-medium text-forest-700">
                          worth exploring
                        </span>
                      ) : null}
                    </span>
                    <span className="relative mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-500">{field.tagline}</span>
                    <span className="cb-button cb-button-primary relative mt-4 self-start px-4 py-2 text-sm">
                      Explore
                      <ArrowGlyph className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
