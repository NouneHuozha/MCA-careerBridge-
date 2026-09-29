import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Scale } from "lucide-react";
import { getField, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare courses" };

export default async function CompareCoursesPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string }> }) {
  const { slug, pathwaySlug } = await params;
  const [state, field, route] = await Promise.all([getSessionState(), getField(slug), getPathway(pathwaySlug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || route.courseSlugs === null || route.courseSlugs === undefined) {
    redirect(`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses`);
  }

  const coursesHref = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses`;

  return <main className="min-h-[calc(100dvh-150px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-12">
    <section className="mx-auto w-full max-w-[1800px]">
      <h1 className="text-center font-serif text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.06] tracking-[-.045em] text-[#182b48]">Compare courses</h1>

      <div className="mt-8 rounded-[1rem] border border-[#e4e2d9] bg-white px-5 py-12 sm:mt-10 sm:px-8 sm:py-14 lg:mt-12 lg:min-h-[360px] lg:px-12 lg:py-14">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
          <div aria-hidden="true" className="mb-8 flex items-center justify-center gap-5 sm:gap-7">
            <div className="grid h-[118px] w-[144px] content-center gap-3 rounded-xl border border-[#c9ddd3] bg-[#f2f8f5] px-5 sm:h-[132px] sm:w-[188px]">
              <span className="h-10 w-10 rounded-full bg-[#dceae3]" />
              <span className="h-2.5 w-full rounded-full bg-[#dceae3]" />
              <span className="h-2.5 w-4/5 rounded-full bg-[#dceae3]" />
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf5f1] text-[#075a58] sm:h-14 sm:w-14"><Plus className="h-8 w-8" strokeWidth={1.8} /></span>
            <div className="grid h-[118px] w-[144px] content-center gap-3 rounded-xl border border-[#c9ddd3] bg-[#f2f8f5] px-5 sm:h-[132px] sm:w-[188px]">
              <span className="h-10 w-10 rounded-full bg-[#dceae3]" />
              <span className="h-2.5 w-full rounded-full bg-[#dceae3]" />
              <span className="h-2.5 w-4/5 rounded-full bg-[#dceae3]" />
            </div>
          </div>

          <h2 className="font-serif text-[clamp(1.65rem,3vw,2.45rem)] leading-tight tracking-[-.035em] text-[#182b48]">You haven’t added any courses to compare yet.</h2>
          <p className="mt-3 max-w-[900px] font-serif text-[clamp(1.05rem,1.8vw,1.4rem)] leading-relaxed text-[#666c7e]">Add courses from this route to view them side by side. Comparing is optional — it won’t choose for you.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-5 text-center">
        <Link href={coursesHref} className="inline-flex min-h-14 w-full max-w-[400px] items-center justify-center gap-3 rounded-xl bg-[#0b6966] px-7 py-3 font-serif text-[1.1rem] font-semibold text-white transition hover:bg-[#075a58] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
          <Scale aria-hidden className="h-5 w-5" />Browse courses in this route
        </Link>
        <p className="font-serif text-sm leading-relaxed text-[#6a7082]">Your comparison is empty. Your other saved exploration work stays as it is.</p>
      </div>
    </section>
  </main>;
}
