import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Building2, Info, ShieldCheck } from "lucide-react";
import { getCourse, getField, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Illustrative course availability state" };

export default async function CourseUnavailableAtInstitutionPage({
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

  const institutionsHref = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(course.slug)}/institutions`;

  return (
    <main className="min-h-[calc(100dvh-150px)] bg-[#fcfcfa] px-5 pb-12 pt-8 text-[#243b32] sm:px-8 sm:pt-10 lg:px-12">
      <section className="mx-auto max-w-[1440px]">
        <header className="flex flex-wrap items-center gap-5">
          <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#e8f0ec] text-[#294c47] sm:h-[4.5rem] sm:w-[4.5rem]">
            <Building2 className="h-10 w-10" strokeWidth={1.6} />
          </span>
          <h1 className="font-serif text-[clamp(2.3rem,5vw,3.8rem)] leading-[1.05] tracking-[-.045em] text-[#102c43]">
            BCA at Example institution A
          </h1>
          <span className="rounded-full bg-[#fff0d1] px-4 py-2 font-serif text-sm text-[#79551d] sm:ml-1">
            Sample record · design reference only
          </span>
        </header>

        <section aria-labelledby="availability-title" className="mt-7 rounded-[1rem] border border-[#dedfdc] bg-white px-6 py-6 sm:px-8 sm:py-7">
          <div className="grid gap-5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-start sm:gap-7">
            <span aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-[#fff5df] text-[#286b61] sm:h-[5.5rem] sm:w-[5.5rem]">
              <BookOpen className="h-9 w-9" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 id="availability-title" className="font-serif text-[clamp(1.5rem,2.7vw,2.15rem)] leading-tight text-[#173344]">
                BCA is not listed in this institution’s current course catalogue.
              </h2>
              <p className="mt-2 font-serif text-[clamp(1.05rem,1.8vw,1.25rem)] leading-relaxed text-[#66756e]">
                This status applies only to this example institution. It does not mean BCA is unavailable elsewhere.
              </p>
              <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-serif text-[1.05rem]">
                <dt className="text-[#69756f]">Course availability</dt>
                <dd className="m-0 rounded-full bg-[#f9e5e6] px-4 py-2 text-[#934b53]" aria-label="Illustrative status: not listed">
                  Not listed · sample state
                </dd>
              </dl>
            </div>
          </div>
        </section>

        <section aria-labelledby="source-check-title" className="mt-5 rounded-[1rem] border border-[#dfe4df] bg-white px-6 py-5 sm:px-8 sm:py-6">
          <div className="grid gap-5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-center sm:gap-7">
            <span aria-hidden className="grid h-16 w-16 place-items-center rounded-full bg-[#e5f2ed] text-[#075b55] sm:h-[5.5rem] sm:w-[5.5rem]">
              <ShieldCheck className="h-9 w-9" strokeWidth={1.8} />
            </span>
            <div>
              <h2 id="source-check-title" className="font-serif text-[clamp(1.4rem,2.3vw,1.9rem)] leading-tight text-[#173344]">
                Source check needed before real use
              </h2>
              <p className="mt-2 font-serif text-[1.05rem] leading-relaxed text-[#66756e]">
                A live student record needs a dated check of the institution’s current official course list.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Link href={institutionsHref} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#075b55] px-6 py-4 font-serif text-[1.08rem] font-semibold text-white transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
            <ArrowLeft aria-hidden className="h-5 w-5" />
            Return to BCA institutions
          </Link>
        </div>

        <p role="note" className="mt-5 flex items-start gap-3 border-t border-[#e4e5e1] pt-4 font-serif text-[1rem] leading-relaxed text-[#68766f]">
          <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#47766c]" />
          Illustrative state only — do not show as a real availability result without current official verification.
        </p>
      </section>
    </main>
  );
}
