import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Landmark } from "lucide-react";
import { LibrarySearch } from "@/components/library-search";
import { LibraryReveal } from "@/components/library-motion";
import { getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore scholarships" };

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const allScholarships = await getScholarships();
  const scholarships = allScholarships.filter((scholarship) =>
    (!query || `${scholarship.name} ${scholarship.provider ?? ""} ${scholarship.category ?? ""}`.toLocaleLowerCase().includes(query)) &&
    (!params.stage || (scholarship.appliesToStage ?? []).includes(params.stage)),
  );

  return (
    <div className="min-h-svh bg-[#f7f8f5]">
      <header className="bg-[#f9e2d2]">
        <div className="mx-auto grid min-h-[500px] min-w-0 w-full gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[570px] lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-[clamp(3rem,7vw,8rem)] lg:py-16">
          <div className="min-w-0">
            <Link href="/explore" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#704329] transition-colors hover:text-[#09332a]"><ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" /> Explore the library</Link>
            <LibraryReveal>
              <p className="mt-12 flex items-center gap-2 text-base font-semibold text-[#874926]"><BadgeIndianRupee aria-hidden="true" className="h-5 w-5" /> Scholarship register</p>
              <h1 className="mt-5 max-w-[15ch] text-[clamp(3rem,7.8vw,8rem)] font-semibold leading-[.9] tracking-[-.075em] text-[#17201b]">Funding to explore.</h1>
            </LibraryReveal>
            <p className="mt-7 max-w-[55ch] text-lg leading-relaxed text-[#3f3027] sm:text-xl">Explore listed schemes and their recorded eligibility notes. Amounts, deadlines and rules can change. Verify with the official provider.</p>
            <p className="mt-7 text-base font-semibold text-[#704329]">{scholarships.length} scheme listings</p>
          </div>
          <div className="min-w-0 bg-[#09332a] p-5 text-white sm:p-7 lg:p-9">
            <Landmark aria-hidden="true" className="h-6 w-6 text-[#f2cf78]" />
            <h2 className="mt-5 max-w-[13ch] text-3xl font-semibold leading-tight tracking-[-.04em] text-white">Check the rules for this cycle.</h2>
            <p className="mt-4 text-base leading-relaxed text-[#d5ded8]">Eligibility, required documents and application channels can differ between schemes and years.</p>
            <LibrarySearch action="/scholarships" query={params.q} label="Search scholarships" placeholder="Scheme or provider" className="mt-6" />
            <a href="#scholarship-list" className="mt-6 inline-flex min-h-10 items-center gap-2 text-base font-semibold text-[#f2cf78] underline underline-offset-4">Review listed schemes <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </div>
      </header>
      <main className="min-w-0 w-full px-5 pb-24 pt-12 sm:px-8 lg:px-[clamp(3rem,7vw,8rem)] lg:pt-20">
        <form action="/scholarships" className="grid gap-4 bg-[#e6eeea] p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end sm:p-7">
          {params.q && <input type="hidden" name="q" value={params.q} />}
          <div className="grid gap-2"><label htmlFor="scholarship-stage" className="text-base font-semibold text-[#17201b]">Study stage</label><select id="scholarship-stage" name="stage" defaultValue={params.stage ?? ""} className="min-h-12 bg-[#f7f8f5] px-4 text-base text-[#17201b] outline-none focus-visible:ring-2 focus-visible:ring-[#09332a]"><option value="">Any listed stage</option><option value="class10">Class 10 and onward</option><option value="class12">Class 12 and onward</option><option value="undergraduate">Undergraduate study</option></select></div>
          <button type="submit" className="min-h-12 bg-[#09332a] px-5 text-base font-semibold text-white transition-colors hover:bg-[#126048]">Filter schemes</button>
          {(params.stage || params.q) && <Link href="/scholarships" className="inline-flex min-h-11 items-center text-base font-semibold text-[#36544a] underline underline-offset-4">Clear filters</Link>}
        </form>
        <section id="scholarship-list" aria-label="Scholarship listings" className="mt-16 scroll-mt-24 sm:mt-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#6f887b]">The scheme register</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-[#17201b] sm:text-4xl">Listings to review</h2></div><p className="text-base font-medium text-[#36544a]">{scholarships.length} results</p></div>
          {scholarships.length ? <ul className="grid grid-cols-1 gap-x-8 gap-y-5 xl:grid-cols-2">
            {scholarships.map((scholarship, index) => (
              <li key={scholarship.slug}>
                <LibraryReveal delay={Math.min(index * 45, 270)}>
                  <Link href={`/scholarships/${scholarship.slug}`} className="group grid min-h-[300px] grid-cols-[10px_minmax(0,1fr)] bg-white transition-transform duration-300 hover:-translate-y-1">
                    <span aria-hidden="true" className={index % 3 === 0 ? "bg-[#f2cf78]" : index % 3 === 1 ? "bg-[#6f887b]" : "bg-[#d6eaf4]"} />
                    <span className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-7">
                      <span>
                        <span className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-[#547065]"><span>{scholarship.category ?? "Scholarship"}</span><ArrowRight aria-hidden="true" className="h-5 w-5 text-[#09332a] transition-transform group-hover:translate-x-1" /></span>
                        <span className="mt-4 block max-w-[28ch] text-2xl font-semibold leading-tight tracking-[-.04em] text-[#17201b] transition-colors group-hover:text-[#126048] sm:text-3xl">{scholarship.name}</span>
                        <span className="mt-3 block text-base leading-relaxed text-[#34463c]">{scholarship.provider ?? "Provider not currently recorded"}</span>
                        {scholarship.eligibility && <span className="mt-3 block max-w-[70ch] text-base leading-relaxed text-[#405349]">{scholarship.eligibility}</span>}
                      </span>
                      <span className="flex flex-wrap items-end justify-between gap-3 bg-[#f7f8f5] p-3">
                        <span className="text-base text-[#34463c]">{scholarship.amountNote ?? "Amount not currently recorded"}</span>
                        {(scholarship.appliesToStage ?? []).length > 0 && <span className="bg-[#fdf3d3] px-3 py-1.5 text-sm font-semibold text-[#694e0b]">Listed for {(scholarship.appliesToStage ?? []).join(", ")}</span>}
                      </span>
                    </span>
                  </Link>
                </LibraryReveal>
              </li>
            ))}
          </ul> : <div className="bg-[#e6eeea] p-7 sm:p-10"><h3 className="text-2xl font-semibold text-[#17201b]">No scholarships match those filters</h3><p className="mt-3 text-base text-[#34463c]">Try another search or clear the stage filter to see all listings.</p><Link href="/scholarships" className="mt-6 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#09332a] underline underline-offset-4">Browse every scholarship <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>}
        </section>
      </main>
    </div>
  );
}
