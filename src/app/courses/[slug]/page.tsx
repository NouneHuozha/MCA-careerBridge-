import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Building2, CalendarDays, CheckCircle2, ClipboardList, GraduationCap, Scale, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge, ButtonLink, Callout, Eyebrow, VerificationBadge } from "@/components/ui";
import { CourseJourneyShell } from "@/components/journey-sidebar";
import { ContextualMentor } from "@/components/contextual-mentor";
import { levelLabelSafe } from "@/components/course-helpers";
import { SaveButton } from "@/components/save-button";
import { getCourse, getCourses, getExams, getField, getInstitutionsForCourse } from "@/services/catalog";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await getCourse((await params).slug))?.name ?? "Course" };
}

const tabs = ["Overview", "What you learn", "Where to study", "Entry requirements", "Fees and support"];

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const course = await getCourse((await params).slug);
  if (!course) notFound();
  const [institutions, exams, field, siblings] = await Promise.all([
    getInstitutionsForCourse(course.slug),
    getExams({ slugs: course.examSlugs ?? [] }),
    course.fieldSlug ? getField(course.fieldSlug) : Promise.resolve(null),
    getCourses({ fieldSlug: course.fieldSlug ?? undefined }),
  ]);
  void institutions; void exams; void field; void siblings;
  const skills = (course.relevantSubjects ?? []).slice(0, 5);
  const nextSteps = (course.careerDirections ?? []).slice(0, 4);
  const requirements = [course.eligibility, course.entranceRequirement].filter(Boolean).slice(0, 3) as string[];

  return (
    <CourseJourneyShell current={2}>
      <div className="bg-white">
        <div className="cb-container cb-page mx-auto max-w-[1320px]">
          <div className="mb-6 flex items-center gap-3 text-sm text-ink-500"><Link href="/explore" className="hover:text-forest-700">Explore</Link><span>/</span><Link href="/courses" className="hover:text-forest-700">Courses</Link><span>/</span><span className="text-ink-800">{course.name}</span></div>
          <header className="flex flex-wrap items-start justify-between gap-8">
            <div className="min-w-0 flex-1"><Eyebrow>Course</Eyebrow><h1 className="mt-2 max-w-[900px] text-[clamp(2.2rem,4.3vw,4.4rem)] font-semibold leading-[1.04] tracking-[-.055em] text-[#071533]">{course.name}</h1><p className="mt-3 max-w-[850px] text-xl text-ink-500">Build practical knowledge and skills for a tech-enabled world.</p><div className="mt-5 flex flex-wrap gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-[#eef3fb] px-4 py-2 text-sm font-semibold text-ink-600"><GraduationCap className="h-4 w-4 text-forest-700" />{levelLabelSafe(course.level)}</span>{course.durationLabel && <span className="inline-flex items-center gap-2 rounded-full bg-[#eef3fb] px-4 py-2 text-sm font-semibold text-ink-600"><CalendarDays className="h-4 w-4 text-forest-700" />{course.durationLabel}</span>}<span className="inline-flex items-center gap-2 rounded-full bg-[#eef3fb] px-4 py-2 text-sm font-semibold text-ink-600"><Users className="h-4 w-4 text-forest-700" />After Class 12</span></div><div className="mt-6 flex flex-wrap gap-3"><ButtonLink href={`/institutions?course=${course.slug}`}><Building2 className="h-4 w-4" />Find institutions</ButtonLink><SaveButton itemType="course" itemRef={course.slug} label={course.name} /><ButtonLink href={`/compare?type=course&a=${course.slug}`} variant="secondary"><Scale className="h-4 w-4" />Compare</ButtonLink></div></div>
            <div className="relative hidden h-[190px] w-[270px] overflow-hidden rounded-2xl border border-ink-100 bg-[#f1f8fb] lg:block"><Image src="/images/possibilities-landscape.png" alt="" fill sizes="270px" className="object-cover object-right opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-[#e8f4f4] via-transparent to-transparent" /><ClipboardList className="absolute left-12 top-9 h-20 w-20 text-forest-700/70" /></div>
          </header>
          <nav aria-label="Course sections" className="mt-7 border-b border-ink-200"><ol className="flex gap-1 overflow-x-auto">{tabs.map((tab, index) => <li key={tab}><a href={index === 0 ? "#overview" : "#learn"} className={`block whitespace-nowrap border-b-[3px] px-4 py-3 text-sm font-semibold ${index === 0 ? "border-[#198b6e] text-forest-700" : "border-transparent text-ink-500 hover:border-forest-300 hover:text-ink-800"}`}>{tab}</a></li>)}</ol></nav>
          <main className="mt-5 grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              <section id="overview" className="grid gap-5 rounded-2xl border border-ink-100 bg-[#f7fbfb] p-5 sm:grid-cols-3 sm:p-6">
                <article><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#dff3eb] text-forest-700"><GraduationCap className="h-6 w-6" /></span><h2 className="text-lg font-semibold text-[#071533]">What you will learn</h2></div><p className="mt-3 text-sm leading-relaxed text-ink-500">Core subjects and practical skills to build a strong foundation.</p><ul className="mt-5 space-y-3">{skills.map((item) => <li key={item} className="flex gap-2 text-sm text-ink-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />{item}</li>)}</ul><Link href="#learn" className="cb-source mt-6 text-sm">View full curriculum <ArrowRight className="h-4 w-4" /></Link></article>
                <article id="learn" className="rounded-2xl bg-[#fbf9ff] p-1"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#eee7ff] text-[#7252b8]"><ClipboardList className="h-6 w-6" /></span><h2 className="text-lg font-semibold text-[#071533]">What do I need to apply?</h2></div><p className="mt-3 text-sm leading-relaxed text-ink-500">Check the basic eligibility and documents.</p><ul className="mt-5 space-y-3">{requirements.map((item) => <li key={item} className="flex gap-2 text-sm text-ink-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a70d2]" />{item}</li>)}</ul><div className="mt-5 rounded-xl bg-white px-3 py-2"><VerificationBadge status={course.verificationStatus} lastVerifiedAt={course.lastVerifiedAt} /></div></article>
                <article className="rounded-2xl bg-[#fffaf0] p-1"><div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#fff0c9] text-[#a77b1c]"><BarChart3 className="h-6 w-6" /></span><h2 className="text-lg font-semibold text-[#071533]">Possible next steps</h2></div><p className="mt-3 text-sm leading-relaxed text-ink-500">Where this route can take you.</p><ul className="mt-5 space-y-3">{nextSteps.map((item) => <li key={item} className="flex gap-2 text-sm text-ink-700"><ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#d29b20]" />{item}</li>)}</ul><Link href={`/explore/${course.fieldSlug ?? "technology"}`} className="cb-source mt-6 text-sm">Explore career options <ArrowRight className="h-4 w-4" /></Link></article>
              </section>
              <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d6e5f0] bg-[#f1f7fc] px-5 py-4 text-sm text-ink-600"><span>Course duration, fees and eligibility may vary. Always confirm details on the official website.</span><Link href={course.sourceUrl ?? "/courses"} className="cb-source">Learn more <ArrowRight className="h-4 w-4" /></Link></section>
            </div>
            <div className="xl:sticky xl:top-24"><ContextualMentor courseName={course.name} sourceUrl={course.sourceUrl} /></div>
          </main>
          <div className="mt-5"><Callout tone="neutral"><p>Course information is a starting point. Always verify current admission, fees and eligibility with the institution.</p></Callout></div>
        </div>
      </div>
    </CourseJourneyShell>
  );
}
