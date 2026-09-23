import Link from "next/link";
import { GraduationCap, Search } from "lucide-react";
import { ArrowGlyph, Badge, FilterDisclosure, EmptyState, Eyebrow, VerificationBadge, cx } from "@/components/ui";
import { levelLabelSafe } from "@/components/course-helpers";
import { Reveal } from "@/components/reveal";
import { getCourses, getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses" };

const levels = ["higher_secondary", "certificate", "diploma", "undergraduate", "postgraduate"];

const levelTone: Record<string, "forest" | "green" | "amber" | "lavender" | "neutral"> = {
  higher_secondary: "neutral",
  certificate: "amber",
  diploma: "green",
  undergraduate: "forest",
  postgraduate: "lavender",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; field?: string; q?: string }>;
}) {
  const params = await searchParams;
  const [allCourses, fields] = await Promise.all([getCourses({}), getFields()]);

  const q = params.q?.trim().toLowerCase() ?? "";
  const courses = allCourses.filter((course) => {
    if (params.level && course.level !== params.level) return false;
    if (params.field && course.fieldSlug !== params.field) return false;
    if (q && !`${course.name} ${(course.careerDirections ?? []).join(" ")}`.toLowerCase().includes(q)) return false;
    return true;
  });

  const qs = (patch: Record<string, string | undefined>) => {
    const merged = { ...params, ...patch };
    const entries = Object.entries(merged).filter(([, v]) => v);
    return entries.length ? `/courses?${new URLSearchParams(entries as [string, string][]).toString()}` : "/courses";
  };

  return (
    <div className="cb-container cb-page">
      <div className="flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-lavender-ink/20 bg-lavender/25 p-6 sm:p-8">
        <div className="max-w-lg">
          <Eyebrow className="animate-rise">Courses</Eyebrow>
          <h1 className="animate-rise delay-1 mt-4 text-[clamp(1.9rem,4.2vw,2.6rem)] font-semibold">
            What you could study
          </h1>
          <p className="animate-rise delay-2 mt-3 text-[15px] text-ink-500">
            Structure and eligibility for each route. Fees appear only when verified.
          </p>
        </div>

        <form action="/courses" className="animate-rise delay-3 w-full max-w-sm">
          {params.field ? <input type="hidden" name="field" value={params.field} /> : null}
          {params.level ? <input type="hidden" name="level" value={params.level} /> : null}
          <label htmlFor="q" className="sr-only">
            Search courses
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="BCA, nursing, diploma…"
              className="w-full rounded-full border border-ink-200 bg-white py-3 pl-11 pr-24 text-sm outline-none transition-colors focus:border-forest-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-forest-700 px-4 py-2 text-[13px] font-medium text-white hover:bg-forest-800"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* --------------------------------------------------- level tabs */}
      <div className="animate-rise delay-4 mt-8 flex flex-wrap gap-2">
        <Link
          href={qs({ level: undefined })}
          className={cx(
            "rounded-full border px-4 py-2 text-[13px] transition-all duration-200",
            !params.level ? "border-forest-500 bg-forest-600 text-white" : "border-ink-200 bg-white text-ink-600 hover:-translate-y-0.5 hover:border-forest-300",
          )}
        >
          All levels
        </Link>
        {levels.map((level) => (
          <Link
            key={level}
            href={qs({ level })}
            className={cx(
              "rounded-full border px-4 py-2 text-[13px] transition-all duration-200",
              params.level === level
                ? "border-forest-500 bg-forest-600 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:-translate-y-0.5 hover:border-forest-300",
            )}
          >
            {levelLabelSafe(level)}
          </Link>
        ))}
      </div>

      {/* ------------------------------------------------- field filter */}
      <div className="mt-4 max-w-2xl">
        <FilterDisclosure label="Filter by field" count={params.field ? 1 : 0}>
          <div className="flex flex-wrap gap-2">
            <Link
              href={qs({ field: undefined })}
              className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-[13px] text-ink-600 hover:border-forest-300"
            >
              Any field
            </Link>
            {fields.map((field) => (
              <Link
                key={field.slug}
                href={qs({ field: field.slug })}
                className={cx(
                  "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                  params.field === field.slug
                    ? "border-forest-500 bg-forest-50 text-forest-800"
                    : "border-ink-200 bg-white text-ink-600 hover:border-forest-300",
                )}
              >
                {field.name}
              </Link>
            ))}
          </div>
        </FilterDisclosure>
      </div>

      <p className="mt-7 text-sm text-ink-500">
        <span className="font-semibold text-ink-900">{courses.length}</span> course{courses.length === 1 ? "" : "s"}
      </p>

      {/* -------------------------------------------------------- list */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {courses.map((course, index) => (
          <Reveal key={course.slug} delay={Math.min(index * 35, 320)}>
            <article className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-forest-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={levelTone[course.level] ?? "neutral"}>{levelLabelSafe(course.level)}</Badge>
                  {course.durationLabel ? <Badge>{course.durationLabel}</Badge> : null}
                </div>
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-canvas-deep text-ink-500">
                  <GraduationCap className="h-4 w-4" strokeWidth={1.7} />
                </span>
              </div>

              <Link href={`/courses/${course.slug}`} className="mt-3 text-[15px] font-semibold text-ink-900 group-hover:text-forest-700">
                {course.name}
              </Link>

              <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-ink-500">{course.eligibility}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3.5">
                <VerificationBadge status={course.verificationStatus} lastVerifiedAt={course.lastVerifiedAt} />
                <Link href={`/courses/${course.slug}`} className="cb-button cb-button-primary px-4 py-2 text-sm">
                  Explore pathway
                  <ArrowGlyph className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {!courses.length ? (
        <div className="mt-6 max-w-xl">
          <EmptyState
            icon={<GraduationCap className="h-4 w-4" />}
            title="No courses match"
            description="Try removing a filter, or browse all levels."
          />
        </div>
      ) : null}
    </div>
  );
}
