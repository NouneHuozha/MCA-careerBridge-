import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { LibrarySearch } from "@/components/library-search";
import { LibraryReveal } from "@/components/library-motion";
import { OpportunityTypeFilters } from "@/components/opportunity-type-filters";
import { getFields, getOpportunities } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore skills and opportunities" };

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; field?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const [allOpportunities, fields] = await Promise.all([getOpportunities(), getFields()]);
  const opportunities = allOpportunities.filter((item) =>
    (!query || `${item.title} ${item.provider ?? ""} ${item.description ?? ""} ${(item.skillTags ?? []).join(" ")}`.toLocaleLowerCase().includes(query)) &&
    (!params.type || item.type === params.type) &&
    (!params.field || (item.fieldSlugs ?? []).includes(params.field)),
  );
  const types = [...new Set(allOpportunities.map((item) => item.type))].sort();
  const fieldBySlug = new Map(fields.map((field) => [field.slug, field.name]));
  const typeAccents: Record<string, string> = {
    certification: "border-[#6f887b]",
    internship: "border-[#6aa6c8]",
    learning: "border-[#ca9878]",
    project: "border-[#c99d20]",
  };

  return (
    <div className="min-h-svh bg-[#f7f8f5]">
      <header className="bg-[#f7f8f5]">
        <div className="mx-auto grid min-h-[530px] min-w-0 w-full gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[600px] lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:px-[clamp(3rem,7vw,8rem)] lg:py-16">
          <div className="min-w-0">
            <LibraryReveal>
              <h1 className="max-w-[15ch] text-[clamp(3rem,7.5vw,7.6rem)] font-semibold leading-[.9] tracking-[-.075em] text-[#17201b]">Try a new direction.</h1>
            </LibraryReveal>
            <p className="mt-7 max-w-[55ch] text-lg leading-relaxed text-[#34463c] sm:text-xl">Find learning programmes, projects and other ways to build experience. Check current availability and terms with each provider.</p>
            <p className="mt-7 text-base font-semibold text-[#36544a]">{opportunities.length} ways to explore in this catalogue</p>
          </div>
          <div className="min-w-0 bg-[#d6eaf4] p-5 sm:p-7 lg:p-9">
            <Compass aria-hidden="true" className="h-6 w-6 text-[#874926]" />
            <h2 className="mt-5 max-w-[14ch] text-3xl font-semibold leading-tight tracking-[-.04em] text-[#17201b]">A small experiment can teach you a lot.</h2>
            <p className="mt-4 text-base leading-relaxed text-[#3f3027]">Try a project, course or competition to discover what you enjoy practising.</p>
            <LibrarySearch action="/opportunities" query={params.q} label="Search skills and opportunities" placeholder="Skill or activity" className="mt-6" />
            <a href="#opportunity-list" className="mt-6 inline-flex min-h-10 items-center gap-2 text-base font-semibold text-[#704329] underline underline-offset-4">See what you can try <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </div>
      </header>
      <main className="min-w-0 w-full px-5 pb-24 pt-12 sm:px-8 lg:px-[clamp(3rem,7vw,8rem)] lg:pt-20">
        <div className="grid min-w-0 gap-12 xl:grid-cols-[minmax(260px,.58fr)_minmax(0,1.42fr)] xl:gap-20">
          <aside className="h-fit min-w-0 bg-[#e6eeea] p-5 sm:p-7 xl:sticky xl:top-8">
            <h2 className="text-2xl font-semibold tracking-[-.04em] text-[#17201b]">Choose a way to try</h2>
            <form action="/opportunities" className="mt-5 grid gap-3">
              {params.q && <input type="hidden" name="q" value={params.q} />}
              {params.type && <input type="hidden" name="type" value={params.type} />}
              <label htmlFor="opportunity-field" className="mt-2 text-base font-semibold text-[#17201b]">Area of interest</label>
              <select id="opportunity-field" name="field" defaultValue={params.field ?? ""} className="min-h-12 min-w-0 bg-[#f7f8f5] px-3 text-base text-[#17201b] outline-none focus-visible:ring-2 focus-visible:ring-[#09332a]"><option value="">All areas</option>{fields.map((field) => <option key={field.slug} value={field.slug}>{field.name}</option>)}</select>
              <button type="submit" className="mt-2 min-h-12 bg-[#09332a] px-4 text-base font-semibold text-white transition-colors hover:bg-[#126048]">Apply filters</button>
              {(params.type || params.field || params.q) && <Link href="/opportunities" className="pt-1 text-base font-semibold text-[#36544a] underline underline-offset-4">Clear filters</Link>}
            </form>
          </aside>
          <section id="opportunity-list" aria-label="Skills and opportunities" className="min-w-0 scroll-mt-24">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h2 className="text-3xl font-semibold tracking-[-.045em] text-[#17201b] sm:text-4xl">Open opportunities</h2><p className="text-base font-medium text-[#36544a]">{opportunities.length} results</p></div>
            <div className="mb-8">
              <OpportunityTypeFilters types={types} activeType={params.type} query={params.q} field={params.field} />
            </div>
            {opportunities.length ? <ul className="space-y-4">
              {opportunities.map((item, index) => (
                <li key={item.slug} className={`${index % 2 === 0 ? "bg-[#e6eeea]" : "bg-[#e3edf3]"} border-l-4 ${typeAccents[item.type] ?? "border-[#6f887b]"}`}>
                  <LibraryReveal delay={Math.min(index * 45, 270)}>
                    <details className="group/opportunity">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-3 p-5 transition-colors hover:bg-[#dde4df] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#09332a] sm:flex-nowrap sm:p-7">
                        <span className="w-full min-w-0 sm:flex-1">
                          <h3 className="text-[clamp(1rem,5vw,1.5rem)] font-semibold leading-tight tracking-[-.035em] text-[#17201b]">{item.title}</h3>
                          <span className="mt-3 block text-base leading-relaxed text-[#34463c]">{[item.type.replaceAll("_", " "), item.provider, item.costNote].filter(Boolean).join(" · ")}</span>
                        </span>
                        <span className="ml-auto shrink-0 text-base font-semibold text-[#09332a]">
                          <span className="group-open/opportunity:hidden">Details</span>
                          <span className="hidden group-open/opportunity:inline">Close</span>
                        </span>
                      </summary>
                      <div className="grid gap-5 px-5 pb-6 sm:grid-cols-[minmax(0,1fr)_minmax(200px,.55fr)_auto] sm:items-end sm:px-7 sm:pb-7">
                        <p className="max-w-[68ch] text-base leading-relaxed text-[#263a30]">{item.description || "Description is not currently listed. Check the provider's information for current details."}</p>
                        <div className="grid gap-3 text-base text-[#263a30]">
                          {(item.skillTags ?? []).length > 0 && <p><span className="font-semibold">Skills mentioned:</span> {(item.skillTags ?? []).slice(0, 3).join(", ")}</p>}
                          {item.fieldSlugs?.length ? <p className="text-sm text-[#41594d]">{item.fieldSlugs.map((slug) => fieldBySlug.get(slug)).filter(Boolean).join(", ")}</p> : null}
                        </div>
                        <Link href={`/opportunities/${item.slug}`} className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#09332a] underline underline-offset-4">
                          View details <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </Link>
                      </div>
                    </details>
                  </LibraryReveal>
                </li>
              ))}
            </ul> : <div className="bg-[#e6eeea] p-7 sm:p-10"><h3 className="text-2xl font-semibold text-[#17201b]">No opportunities match those filters</h3><p className="mt-3 text-base text-[#34463c]">Try another type, area or search term.</p><Link href="/opportunities" className="mt-6 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#09332a] underline underline-offset-4">Browse all opportunities <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
