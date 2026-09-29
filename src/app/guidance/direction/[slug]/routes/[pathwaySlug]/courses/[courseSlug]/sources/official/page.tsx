import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, FileText, Info, Landmark, Link2, ShieldCheck } from "lucide-react";
import { getCourse, getField, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verified official source" };

const officialProgrammeUrl = "https://www.ignou.ac.in/schools/programme/BCA_NEW";

export default async function OfficialProgrammeSourcePage({
  params,
}: {
  params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string }>;
}) {
  const { slug, pathwaySlug, courseSlug } = await params;
  const [state, field, route, course] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
  ]);

  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (
    slug !== "technology" ||
    !field ||
    !route ||
    !course ||
    course.slug !== "bca" ||
    !route.courseSlugs?.includes(course.slug)
  ) {
    notFound();
  }

  return (
    <main className="min-h-[calc(100dvh-150px)] bg-[#fcfcfa] px-5 pb-12 pt-8 text-[#26312c] sm:px-8 sm:pt-10 lg:px-12">
      <section className="mx-auto max-w-[1440px]">
        <header>
          <h1 className="font-serif text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.04] tracking-[-.045em] text-[#102c43]">
            BCA programme at IGNOU
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#e5f2ed] px-5 py-2 font-serif text-[1.08rem] text-[#285e56]">
              <ShieldCheck aria-hidden className="h-6 w-6" />
              Verified official source
            </span>
            <span aria-hidden className="hidden h-7 w-px bg-[#d6ddd8] sm:block" />
            <p className="m-0 font-serif text-[1.05rem] text-[#65736c]">
              <time dateTime="2026-09-29">Checked 29 Sep 2026</time>
            </p>
          </div>
          <p className="mt-5 max-w-[1100px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#4d5b55]">
            This official programme page confirms its stated objective. It does not confirm every current admission detail.
          </p>
        </header>

        <section aria-labelledby="source-confirms-title" className="mt-7 rounded-[1rem] border border-[#e1e3df] bg-white px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-5 sm:gap-7">
            <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e8f3ee] text-[#17665d] sm:h-20 sm:w-20">
              <FileText className="h-9 w-9" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="source-confirms-title" className="font-serif text-[clamp(1.5rem,2.4vw,2rem)] leading-tight text-[#173344]">
                What this source confirms
              </h2>
              <p className="mt-3 font-serif text-[1.05rem] text-[#68746d]">Programme objective</p>
              <blockquote className="mt-2 m-0 font-serif text-[clamp(1.15rem,2.1vw,1.7rem)] leading-[1.38] text-[#344c55]">
                “The basic objective of the programme is to open a channel of admission for computing courses for students, who have done the 10+2 and are interested in taking computing/IT as a career.”
              </blockquote>
            </div>
          </div>
        </section>

        <section aria-labelledby="not-established-title" className="mt-5 rounded-[1rem] border border-[#efe2bd] bg-[#fff9e9] px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start gap-5 sm:gap-7">
            <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#fff1ce] text-[#806315] sm:h-16 sm:w-16">
              <Info className="h-8 w-8" strokeWidth={1.7} />
            </span>
            <div>
              <h2 id="not-established-title" className="font-serif text-[clamp(1.35rem,2vw,1.7rem)] leading-tight text-[#4b4537]">
                Not established on this page
              </h2>
              <p className="mt-2 font-serif text-[1.02rem] leading-relaxed text-[#6d6554]">
                Current fees, admission dates, and complete eligibility requirements still need checking in the current official admission notice.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="institution-source-title" className="mt-5 grid gap-5 rounded-[1rem] border border-[#e1e3df] bg-white px-6 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-8 sm:py-6">
          <div className="flex min-w-0 items-start gap-5 sm:gap-7">
            <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e8f3ee] text-[#365c58] sm:h-20 sm:w-20">
              <Landmark className="h-9 w-9" strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <h2 id="institution-source-title" className="font-serif text-[clamp(1.4rem,2.2vw,1.85rem)] leading-tight text-[#173344]">
                Indira Gandhi National Open University (IGNOU)
              </h2>
              <p className="mt-1 font-serif text-[1.03rem] text-[#68746d]">Official BCA programme page</p>
              <a href={officialProgrammeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-2 break-all font-serif text-[1rem] text-[#286b61] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
                <Link2 aria-hidden className="h-4 w-4 shrink-0" />
                ignou.ac.in/schools/programme/BCA_NEW
              </a>
              <p className="mt-2 font-serif text-sm text-[#65736c]">
                <time dateTime="2026-09-29">Checked 29 Sep 2026</time>
              </p>
            </div>
          </div>
          <a href={officialProgrammeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#075b55] px-6 py-3 font-serif text-[1rem] font-semibold text-white transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] sm:min-w-[290px]">
            <ExternalLink aria-hidden className="h-5 w-5" />
            Open official programme page
          </a>
        </section>
      </section>
    </main>
  );
}
