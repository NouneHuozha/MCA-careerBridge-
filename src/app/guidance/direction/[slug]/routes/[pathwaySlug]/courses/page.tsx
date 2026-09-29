import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Check, CircleUserRound, GraduationCap, Info, List, Scale } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourses, getField, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Courses in this route" };

function courseIcon(index: number) {
  if (index === 0) return <BookOpen aria-hidden className="h-8 w-8" strokeWidth={1.5} />;
  if (index === 1) return <GraduationCap aria-hidden className="h-8 w-8" strokeWidth={1.5} />;
  return <Scale aria-hidden className="h-8 w-8" strokeWidth={1.5} />;
}
function courseDescription(course: { name: string; careerDirections: string[] | null; relevantSubjects: string[] | null }) {
  const name = course.name.toLowerCase();
  if (name.includes("bachelor of computer applications")) return "A degree that commonly focuses on software, applications, programming, and practical computing.";
  if (name.includes("b.sc computer science")) return "A degree that may combine computer science concepts, programming, mathematics, and practical or theoretical study.";
  if (name.includes("information technology")) return "A degree that may focus on information systems, digital tools, networks, and how technology is used in organisations.";
  const areas = course.careerDirections?.slice(0, 2).join(" and ") || course.relevantSubjects?.slice(0, 2).join(" and ") || "the subject area";
  return `A course that may build knowledge and practical skills connected to ${areas.toLowerCase()}.`;
}
function compareItems(course: { name: string; relevantSubjects: string[] | null; careerDirections: string[] | null }, index: number) {
  if (index === 0) return ["Course structure", "Project work", "Entry requirements"];
  if (index === 1) return ["Subject emphasis", "Mathematics", "Further study"];
  return ["Systems focus", "Practical work", "Local availability"];
}

export default async function CoursesInRoutePage({ params }: { params: Promise<{ slug: string; pathwaySlug: string }> }) {
  const { slug, pathwaySlug } = await params;
  const [state, field, route] = await Promise.all([getSessionState(), getField(slug), getPathway(pathwaySlug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || route.courseSlugs === null || route.courseSlugs === undefined) redirect(`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}`);

  const courses = await getCourses({ slugs: route.courseSlugs });
  const stage = state.stage === "class10" ? "Class 10" : "Class 12";
  const routeLabel = route.title.includes("BCA") ? "Computing and applications degree" : route.title.split("→").slice(-1)[0]?.trim() || route.title;

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1400px]">

    <div className="mt-5"><h1 className="mt-5 font-serif text-[clamp(2.25rem,5vw,3.8rem)] leading-[1.06] tracking-[-.045em] text-[#202522]">Courses to understand in this route</h1><p className="mt-4 max-w-[900px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">These are course options connected to the route you opened. They are not ranked, and the right choice depends on what you want to learn and what each institution offers.</p></div>
    <section aria-label="Course context" className="mt-7 grid gap-4 rounded-[1rem] border border-[#e4e2d9] bg-[#f7faf6] px-5 py-5 sm:grid-cols-[1fr_1fr_1.35fr] sm:items-center sm:px-7"><div className="flex items-center gap-3"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><GraduationCap className="h-6 w-6" /></span><div><p className="text-sm text-[#77786f]">You are exploring:</p><p className="font-serif text-[1.05rem] text-[#424a43]">{routeLabel}</p></div></div><div className="flex items-center gap-3 border-t border-[#e1e6df] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><CircleUserRound className="h-6 w-6" /></span><div><p className="text-sm text-[#77786f]">Your current stage:</p><p className="font-serif text-[1.05rem] text-[#424a43]">{stage}</p></div></div><div className="flex items-start gap-3 border-t border-[#e1e6df] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0"><Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#47766c]" /><p className="text-sm leading-[1.35] text-[#626b63]">Course names, availability, entry rules, duration, and fees vary by institution. Check official course details before deciding.</p></div></section>
    {courses.length ? <div className="mt-4 grid gap-4 lg:grid-cols-3">{courses.map((course, index) => <article key={course.slug} className="flex min-w-0 flex-col rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-5 shadow-[0_5px_22px_-20px_rgba(40,69,60,.45)] sm:px-6"><div className="flex items-start gap-4"><span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]">{courseIcon(index)}</span><h2 className="pt-1 font-serif text-[1.35rem] leading-[1.15] text-[#26312c]">{course.name}</h2></div><p className="mt-5 min-h-[82px] font-serif text-[1.03rem] leading-[1.4] text-[#525950]">{courseDescription(course)}</p><div className="mt-4 flex gap-3 rounded-[.8rem] bg-[#f7faf6] px-4 py-3"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><List className="h-5 w-5" /></span><div><p className="font-serif text-[.98rem] text-[#424a43]">Compare by:</p><ul className="mt-1 list-disc pl-4 text-sm leading-[1.35] text-[#626b63]">{compareItems(course, index).map((item) => <li key={item}>{item}</li>)}</ul></div></div><div className="mt-5 grid gap-2 sm:grid-cols-3"><Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(course.slug)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#286b61] px-3 text-center font-serif text-[.95rem] font-semibold text-white transition hover:bg-[#1f5b53]">View course details</Link><Link href={`/compare?type=course&a=${encodeURIComponent(course.slug)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#9ebfb2] px-3 text-center text-sm font-medium text-[#35675b] transition hover:bg-[#eef5f1]">Add to compare</Link><SaveButton itemType="course" itemRef={course.slug} label={course.name} className="w-full [&>button]:min-h-11 [&>button]:w-full [&>button]:justify-center [&>button]:rounded-xl [&>button]:border-[#9ebfb2] [&>button]:bg-transparent [&>button]:font-serif [&>button]:text-[.95rem] [&>button]:text-[#35675b]" saveText="Save for later" savedText="Saved" /></div></article>)}</div> : <section className="mx-auto mt-7 max-w-[700px] rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] p-8 text-center"><h2 className="font-serif text-2xl text-[#26312c]">Courses are still being checked</h2><p className="mt-3 text-sm leading-relaxed text-[#626b63]">This route does not have course options linked yet. Return to route details while the catalogue is updated.</p><Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#9ebfb2] px-5 text-sm font-semibold text-[#35675b]">Back to route details</Link></section>}
    <section className="mt-4 flex flex-col gap-4 rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7"><div className="flex items-center gap-3"><span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><Scale className="h-5 w-5" /></span><div><h2 className="font-serif text-[1.15rem] text-[#26312c]">Compare courses</h2><p className="text-sm text-[#77786f]">Compare options from this route side by side. Comparing is optional.</p></div></div><Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/compare`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#dbe9e3] px-5 text-sm font-semibold text-[#47766c]">Compare courses</Link></section>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e2d8] pt-4"><Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}`} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4">← Back to route details</Link><p className="flex items-center gap-2 font-serif text-sm text-[#77786f]">You can save courses and return later.</p></div>
  </section></main>;
}
