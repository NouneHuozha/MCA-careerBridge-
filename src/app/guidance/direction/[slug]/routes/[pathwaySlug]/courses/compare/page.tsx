import { getCurrentUser } from "@/auth";
import { getField, getPathway, getCourses } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { redirect } from "next/navigation";
import { CourseComparison } from "./course-comparison";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare courses" };

export default async function CompareCoursesPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string }> }) {
  const { slug, pathwaySlug } = await params;
  const [state, field, route, user] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCurrentUser(),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !route.courseSlugs?.length) {
    redirect(`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses`);
  }

  const allCourses = await getCourses({ slugs: route.courseSlugs });
  const courses = route.courseSlugs
    .map((courseSlug) => allCourses.find((course) => course.slug === courseSlug))
    .filter((course): course is (typeof allCourses)[number] => Boolean(course));
  if (courses.length < 2) {
    redirect(`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses`);
  }

  const coursesHref = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses`;
  const courseDetailsHref = (courseSlug: string) =>
    `${coursesHref}/${encodeURIComponent(courseSlug)}`;

  return (
    <main id="main" className="min-h-[calc(100dvh-150px)] bg-[#fbfcf8] px-5 pb-16 pt-7 sm:px-8 sm:pt-9 lg:px-12 lg:pt-10">
      <section className="mx-auto w-full max-w-[1200px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a href={coursesHref} className="inline-flex min-h-10 items-center gap-2 font-serif text-[.98rem] text-[#286b61] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">
            <span aria-hidden>←</span> Back to courses in this route
          </a>
          <p className="font-serif text-sm text-[#6d756e]">Exploring {field.name} · Courses · Compare</p>
        </div>
        <div className="mt-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-serif text-[clamp(2.35rem,5vw,4.25rem)] leading-[.98] tracking-[-.055em] text-[#122440]">Compare courses</h1>
            <p className="mt-3 max-w-[820px] font-serif text-[clamp(1.05rem,1.8vw,1.32rem)] leading-relaxed text-[#59677a]">Look at the differences that may matter to you. This comparison is a starting point, not a recommendation.</p>
          </div>
          <p className="font-serif text-sm text-[#667083]">You are comparing {courses.length} courses</p>
        </div>
        <CourseComparison
          courses={courses}
          coursesHref={coursesHref}
          courseDetailsHref={courseDetailsHref}
          signedIn={Boolean(user)}
        />
      </section>
    </main>
  );
}
