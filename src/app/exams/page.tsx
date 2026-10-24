import Link from "next/link";
import { ArrowRight, CalendarClock, ClipboardCheck, ExternalLink } from "lucide-react";
import { LibrarySearch } from "@/components/library-search";
import { LibraryReveal } from "@/components/library-motion";
import { getExams } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore entrance exams" };

export default async function ExamsPage({ searchParams }: { searchParams: Promise<{ q?: string; stage?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const allExams = await getExams();
  const exams = allExams.filter((exam) =>
    (!query || `${exam.name} ${exam.shortName ?? ""} ${exam.conductingBody ?? ""} ${(exam.appliesTo ?? []).join(" ")}`.toLocaleLowerCase().includes(query)) &&
    (!params.stage || exam.levelStage === params.stage),
  );

  return (
    <div className="min-h-svh bg-[#f7f8f5]">
      <header className="bg-[#f2cf78]">
        <div className="mx-auto grid min-h-[500px] min-w-0 w-full px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[570px] lg:grid-cols-[1fr_.68fr] lg:items-end lg:px-[clamp(3rem,7vw,8rem)] lg:py-16">
          <div className="flex min-w-0 flex-col justify-between">
            <Link href="/explore" className="inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-[#36544a] transition-colors hover:text-[#09332a]"><ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" /> Explore the library</Link>
            <div className="py-12">
              <LibraryReveal>
                <p className="mb-5 flex items-center gap-2 text-base font-semibold text-[#36544a]"><CalendarClock aria-hidden="true" className="h-5 w-5" /> Entrance exam guide</p>
                <h1 className="max-w-[15ch] text-[clamp(3rem,8vw,8rem)] font-semibold leading-[.9] tracking-[-.075em] text-[#17201b]">Know what comes next.</h1>
              </LibraryReveal>
              <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-[#263a30] sm:text-xl">Explore exam routes, who they may apply to and where to verify official requirements. Dates can change each cycle.</p>
            </div>
            <p className="text-base font-semibold text-[#36544a]">{exams.length} examinations listed</p>
          </div>
          <div className="min-w-0 bg-[#09332a] p-5 text-white sm:p-7 lg:mb-5 lg:p-9">
            <ClipboardCheck aria-hidden="true" className="h-7 w-7 text-[#f2cf78]" />
            <h2 className="mt-6 max-w-[14ch] text-3xl font-semibold leading-tight tracking-[-.04em] text-white">Every date needs a source.</h2>
            <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-[#d5ded8]">Use this catalogue to find the right notice. Confirm eligibility, dates, documents and fees with the exam-conducting body.</p>
            <a href="#exam-list" className="mt-7 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#f2cf78] underline underline-offset-4">Browse exam notices <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </div>
      </header>
      <main className="min-w-0 w-full px-5 pb-24 pt-12 sm:px-8 lg:px-[clamp(3rem,7vw,8rem)] lg:pt-20">
        <div className="grid min-w-0 gap-12 xl:grid-cols-[minmax(260px,.55fr)_minmax(0,1.45fr)] xl:gap-20">
          <aside className="h-fit min-w-0 bg-[#d6eaf4] p-5 sm:p-7 xl:sticky xl:top-8">
            <h2 className="text-2xl font-semibold tracking-[-.04em] text-[#17201b]">Find your exam</h2>
            <p className="mt-2 text-base leading-relaxed text-[#34463c]">Search by name, exam body or programme.</p>
            <LibrarySearch action="/exams" query={params.q} label="Search entrance exams" placeholder="Exam or exam body" className="mt-5" />
            <form action="/exams" className="mt-5 grid gap-3">
              {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
              <label htmlFor="exam-stage" className="text-base font-semibold text-[#17201b]">Stage</label>
              <select id="exam-stage" name="stage" defaultValue={params.stage ?? ""} className="min-h-12 bg-[#f7f8f5] px-4 text-base text-[#17201b] outline-none focus-visible:ring-2 focus-visible:ring-[#09332a]">
                <option value="">Any stage</option><option value="after_class10">After Class 10</option><option value="after_class12">After Class 12</option>
              </select>
              <button type="submit" className="mt-1 min-h-12 bg-[#09332a] px-5 text-base font-semibold text-white transition-colors hover:bg-[#126048]">Apply stage</button>
              {(params.stage || params.q) && <Link href="/exams" className="pt-1 text-base font-semibold text-[#36544a] underline underline-offset-4">Clear filters</Link>}
            </form>
          </aside>
          <section id="exam-list" aria-label="Entrance examinations" className="min-w-0 scroll-mt-24">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-sm font-semibold text-[#6f887b]">Browse by entry point</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-[#17201b] sm:text-4xl">Exams to look into</h2></div>
              <p className="text-base font-medium text-[#36544a]">{exams.length} results</p>
            </div>
            {exams.length ? <ul className="space-y-4">
              {exams.map((exam, index) => (
                <li key={exam.slug} className={index % 2 === 0 ? "bg-[#d6eaf4]" : "bg-[#e6eeea]"}>
                  <LibraryReveal delay={Math.min(index * 45, 270)}>
                    <Link id={exam.slug} href={`/exams/${exam.slug}`} className="group grid gap-4 p-5 transition-colors hover:bg-[#dde4df] sm:grid-cols-[minmax(0,1fr)_minmax(180px,.5fr)_auto] sm:items-center sm:p-7">
                      <span className="min-w-0">
                        <span className="inline-flex min-h-8 items-center bg-[#fdf3d3] px-3 text-sm font-semibold text-[#694e0b]">{exam.shortName ?? "Entrance exam"}</span>
                        <span className="mt-3 block text-2xl font-semibold leading-tight tracking-[-.035em] text-[#17201b] transition-colors group-hover:text-[#126048] sm:text-3xl">{exam.name}</span>
                        <span className="mt-2 block text-base text-[#34463c]">{exam.conductingBody ?? "Exam-conducting body not listed"}</span>
                      </span>
                      <span className="grid gap-2 text-base text-[#34463c]">
                        <span className="font-semibold text-[#17201b]">{exam.levelStage === "after_class10" ? "After Class 10" : exam.levelStage === "after_class12" ? "After Class 12" : "Stage not listed"}</span>
                        {(exam.appliesTo ?? []).length > 0 && <span>For {(exam.appliesTo ?? []).slice(0, 2).join(", ")}</span>}
                        {exam.examDate && <span className="text-sm text-[#547065]">Listed date: {exam.examDate}</span>}
                      </span>
                      <span className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#09332a]">Review <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                    </Link>
                  </LibraryReveal>
                </li>
              ))}
            </ul> : <div className="bg-[#e6eeea] p-7 sm:p-10"><h3 className="text-2xl font-semibold text-[#17201b]">No exams match these filters</h3><p className="mt-3 text-base text-[#34463c]">Clear the filters or try a different search.</p><Link href="/exams" className="mt-6 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#09332a] underline underline-offset-4">Browse all exams <ExternalLink aria-hidden="true" className="h-4 w-4" /></Link></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
