"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, GraduationCap, Info, LoaderCircle, Monitor, Plus, Save, Trash2 } from "lucide-react";

type Course = {
  slug: string;
  name: string;
  durationLabel: string | null;
  eligibility: string;
  relevantSubjects: string[] | null;
  entranceRequirement: string | null;
  careerDirections: string[] | null;
  furtherStudy: string[] | null;
  verificationStatus: string;
};

type Props = {
  courses: Course[];
  coursesHref: string;
  courseDetailsHref: (courseSlug: string) => string;
  signedIn: boolean;
};

function displayName(course: Course) {
  if (course.slug === "bca") return "BCA";
  if (course.slug === "bsc-computer-science") return "B.Sc. Computer Science";
  return course.name;
}

function description(course: Course) {
  if (course.slug === "bca") return "A course that may combine computing foundations with practical application and software-focused study.";
  if (course.slug === "bsc-computer-science") return "A course that may explore computing concepts, systems, programming, and more theoretical foundations.";
  return course.eligibility;
}

function emphasis(course: Course) {
  if (course.slug === "bca") return "May combine applied computing, software, and practical problem-solving.";
  if (course.slug === "bsc-computer-science") return "May include computing concepts, programming, systems, and analytical foundations.";
  return `May include ${(course.relevantSubjects ?? []).slice(0, 3).join(", ") || "course-specific subjects"}.`;
}

function learningMethods(course: Course) {
  if (course.slug === "bca") return "May include practical projects, labs, and applied assignments.";
  if (course.slug === "bsc-computer-science") return "May include theory, programming practice, labs, and analytical work.";
  return "Check the individual programme for its teaching and assessment methods.";
}

function exploreAfterwards(course: Course) {
  const options = course.careerDirections ?? [];
  const further = course.furtherStudy ?? [];
  if (course.slug === "bca") return "May connect to software, applications, support, or further study.";
  if (course.slug === "bsc-computer-science") return "May connect to software, systems, data, research, or further study.";
  return `May connect to ${[...options, ...further].slice(0, 4).join(", ") || "further study or related work"}.`;
}

function courseIcon(course: Course) {
  return course.slug === "bsc-computer-science" ? <GraduationCap aria-hidden className="h-8 w-8" strokeWidth={1.5} /> : <Monitor aria-hidden className="h-8 w-8" strokeWidth={1.5} />;
}

export function CourseComparison({ courses, coursesHref, courseDetailsHref, signedIn }: Props) {
  const [visibleSlugs, setVisibleSlugs] = useState(() => courses.map((course) => course.slug));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const visibleCourses = courses.filter((course) => visibleSlugs.includes(course.slug));

  function removeCourse(slug: string) {
    setVisibleSlugs((current) => current.filter((currentSlug) => currentSlug !== slug));
    setSaved(false);
    setSaveError(null);
  }

  async function saveComparison() {
    if (!signedIn || visibleCourses.length < 2 || saving || saved) return;
    setSaving(true);
    setSaveError(null);
    try {
      const response = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "course", itemRefs: visibleCourses.map((course) => course.slug) }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error ?? "Unable to save");
      setSaved(true);
    } catch {
      setSaveError("We couldn't save this comparison right now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return <>
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
      <p className="text-sm text-[#677184]">{visibleCourses.length} course{visibleCourses.length === 1 ? "" : "s"} shown</p>
      <button type="button" onClick={saveComparison} disabled={!signedIn || visibleCourses.length < 2 || saving || saved} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#43857d] bg-white px-4 text-sm font-semibold text-[#176b6b] transition hover:bg-[#eef7f4] disabled:cursor-not-allowed disabled:opacity-60">
        {saving ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : saved ? <Check aria-hidden className="h-4 w-4" /> : <Save aria-hidden className="h-4 w-4" />}
        {saving ? "Saving…" : saved ? "Comparison saved" : "Save comparison"}
      </button>
      {!signedIn && <Link href="/sign-in" className="text-sm text-[#286b61] underline decoration-[#9ebfb2] underline-offset-4">Sign in to save</Link>}
      {saveError && <p role="status" className="basis-full text-right text-sm text-[#a04d35]">{saveError}</p>}
    </div>

    {visibleCourses.length < 2 ? <section className="mt-4 rounded-2xl border border-[#d8e6df] bg-white p-8 text-center">
      <h2 className="font-serif text-2xl text-[#183748]">Add another course to compare</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#677184]">A side-by-side comparison is most useful with at least two courses.</p>
      <Link href={coursesHref} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b6966] px-5 text-sm font-semibold text-white"><Plus aria-hidden className="h-4 w-4" />Add another course</Link>
    </section> : <>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {visibleCourses.map((course) => <article key={course.slug} className="rounded-xl border border-[#dfe4de] bg-white p-5 shadow-[0_6px_22px_-22px_rgba(40,69,60,.45)] sm:p-6">
          <div className="flex items-start gap-4">
            <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e5f2ec] text-[#176b6b]">{courseIcon(course)}</span>
            <div className="min-w-0"><h2 className="font-serif text-[1.55rem] leading-tight text-[#122440]">{displayName(course)}</h2><p className="mt-1 font-serif text-[1rem] leading-relaxed text-[#5d697b]">{description(course)}</p></div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={courseDetailsHref(course.slug)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0b6966] px-4 text-sm font-semibold text-white transition hover:bg-[#075a58]">View course details <ArrowRight aria-hidden className="h-4 w-4" /></Link>
            <button type="button" onClick={() => removeCourse(course.slug)} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm text-[#286b61] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]"><Trash2 aria-hidden className="h-4 w-4" />Remove from comparison</button>
          </div>
        </article>)}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#dfe4de] bg-white">
        <div className="grid grid-cols-[minmax(150px,.8fr)_repeat(2,minmax(0,1fr))] border-b border-[#dfe4de] bg-[#edf6f1] text-sm font-semibold text-[#284e4a]">
          <div className="p-4">Compare by</div>{visibleCourses.map((course) => <div key={course.slug} className="border-l border-[#dfe4de] p-4">{displayName(course)}</div>)}
        </div>
        {[
          ["What the course may emphasise", emphasis],
          ["Ways students may learn", learningMethods],
          ["Areas to explore afterwards", exploreAfterwards],
          ["Programme variation", () => "Check the individual programme."],
        ].map(([label, value]) => <div key={label as string} className="grid grid-cols-[minmax(150px,.8fr)_repeat(2,minmax(0,1fr))] border-b border-[#e5e9e4] last:border-0">
          <div className="bg-[#f4faf6] p-4 font-serif text-[.97rem] font-semibold text-[#284e4a]">{label as string}</div>{visibleCourses.map((course) => <div key={course.slug} className="border-l border-[#e5e9e4] p-4 font-serif text-[.96rem] leading-relaxed text-[#59677a]">{(value as (course: Course) => string)(course)}</div>)}
        </div>)}
        <div className="grid grid-cols-[minmax(150px,.8fr)_repeat(2,minmax(0,1fr))]">
          <div className="bg-[#f4faf6] p-4 font-serif text-[.97rem] font-semibold text-[#284e4a]">Current facts</div>{visibleCourses.map((course) => <div key={course.slug} className="border-l border-[#e5e9e4] p-4"><span className="inline-flex items-center gap-2 rounded-full bg-[#fff4d8] px-3 py-1.5 text-sm text-[#625638]"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#e8a814]" />{course.verificationStatus === "verified" ? "Verified" : "Needs verification"}</span></div>)}
        </div>
      </div>
    </>}

    <aside className="mt-4 flex items-start gap-3 rounded-xl border border-[#d8e9e0] bg-[#eef7f3] px-4 py-3.5 text-sm leading-relaxed text-[#536c6d]"><Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#176b6b]" />Entry requirements, duration, fees, availability, and application rules can vary by institution and year. Check the current official source before relying on them.</aside>
    <div className="mt-5 flex flex-wrap items-center gap-5">
      <Link href={coursesHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#6c9c91] bg-white px-5 text-sm font-semibold text-[#286b61]"><ArrowLeft aria-hidden className="h-4 w-4" />Back to courses in this route</Link>
      <Link href={coursesHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#286b61] underline decoration-[#9ebfb2] underline-offset-4"><BookOpen aria-hidden className="h-4 w-4" />Add another course</Link>
    </div>
  </>;
}
