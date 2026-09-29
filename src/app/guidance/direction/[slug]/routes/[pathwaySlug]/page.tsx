import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, BookOpen, BriefcaseBusiness, Check, Code2, Cog, GraduationCap, Monitor, UsersRound } from "lucide-react";
import { getField, getPathway } from "@/services/catalog";
import { scoreField } from "@/recommendation/engine";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Route detail" };

function activityIcon(index: number) {
  if (index === 0) return <Cog aria-hidden className="h-7 w-7" strokeWidth={1.55} />;
  if (index === 1) return <BarChart3 aria-hidden className="h-7 w-7" strokeWidth={1.55} />;
  return <UsersRound aria-hidden className="h-7 w-7" strokeWidth={1.55} />;
}
function shapeIcon(index: number) {
  if (index === 0) return <GraduationCap aria-hidden className="h-6 w-6" strokeWidth={1.55} />;
  if (index === 1) return <BookOpen aria-hidden className="h-6 w-6" strokeWidth={1.55} />;
  if (index === 2) return <BriefcaseBusiness aria-hidden className="h-6 w-6" strokeWidth={1.55} />;
  return <BarChart3 aria-hidden className="h-6 w-6" strokeWidth={1.55} />;
}
function routeLabel(title: string) {
  if (title.includes("BCA")) return "Computing and applications degree";
  if (title.includes("B.Tech Computer Science")) return "Engineering or technical degree";
  return title.split("→").slice(-1)[0]?.trim() || title;
}
function atAGlance(routeType: string, title: string, steps: { label: string; detail: string }[], duration: string | null) {
  const degree = routeType === "academic" ? (title.includes("Class 12") ? "Degree-level study" : "Academic study") : routeType === "diploma" ? "Diploma-level study" : "Skill-based study";
  const includes = steps.slice(0, 2).map((step) => step.detail).join(" ") || "Subjects and practical work vary by programme.";
  return [
    ["Study pattern", degree],
    ["Often includes", includes],
    ["Learning may include", "Classes, projects, practice, and independent work"],
    ["Important to check", `Course-specific subjects, ${duration ? "duration, " : ""}cost, and admission rules`],
  ];
}
export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string }> }) {
  const { slug, pathwaySlug } = await params;
  const [state, field, route] = await Promise.all([getSessionState(), getField(slug), getPathway(pathwaySlug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || route.fieldSlug !== slug && !(slug === "technology" && ["class10-science-stream", "class10-polytechnic-diploma", "class10-iti-trade"].includes(route.slug))) redirect(`/guidance/direction/${encodeURIComponent(slug)}/routes`);

  const steps = route.steps ?? [];
  const suggestion = scoreField(field, state.snapshot);
  const connection = suggestion.reasons[0]?.detail ?? "You can understand this route alongside other options before deciding whether it is useful for you.";
  const activities = steps.slice(0, 3).map((step) => step.detail || step.label);
  const glance = atAGlance(route.routeType, route.title, steps, route.typicalDuration);
  const shape = steps.slice(0, 4);
  const currentStage = state.stage === "class10" ? "Class 10" : "Class 12";

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1380px]">
    <Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes`} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42]"><ArrowLeft aria-hidden className="h-4 w-4" />Back to {field.name} routes</Link>
    <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start"><div><p className="text-center font-serif text-[1rem] text-[#77786f] lg:text-left">Exploring {field.name} <span aria-hidden>·</span> Routes <span aria-hidden>·</span> {routeLabel(route.title)}</p><h1 className="mt-5 text-center font-serif text-[clamp(2.25rem,5vw,3.7rem)] leading-[1.06] tracking-[-.045em] text-[#202522] lg:text-left">A degree route focused on computing in practice</h1><p className="mt-4 max-w-[850px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">{route.description} The exact course structure varies.</p><section aria-labelledby="why-title" className="mt-7 flex flex-col gap-4 rounded-[1rem] border border-[#e4e2d9] bg-[#f7faf6] px-6 py-5 sm:flex-row sm:items-center sm:px-7"><span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center self-center rounded-full bg-[#e8f0ec] text-[#286b61]"><Monitor className="h-8 w-8" strokeWidth={1.5} /></span><div><h2 id="why-title" className="font-serif text-[1.5rem] leading-tight text-[#26312c]">Why you may want to understand this route</h2><p className="mt-2 font-serif text-[1.04rem] leading-[1.42] text-[#525950]">{connection} This route is worth understanding because it can include applied projects as well as technical study.</p></div></section><section aria-labelledby="involve-title" className="mt-7"><h2 id="involve-title" className="font-serif text-[1.7rem] text-[#26312c]">What this route can involve</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{activities.map((activity, index) => <article key={activity} className="flex min-h-[120px] items-center gap-4 rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-4"><span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]">{activityIcon(index)}</span><p className="font-serif text-[1.02rem] leading-[1.3] text-[#424a43]">{activity}</p></article>)}</div></section><section aria-labelledby="shape-title" className="mt-7"><div className="flex flex-wrap items-end justify-between gap-3"><h2 id="shape-title" className="font-serif text-[1.7rem] text-[#26312c]">A typical shape of the route</h2><span className="font-serif text-sm text-[#77786f]">A general guide, not a guaranteed sequence.</span></div><div className="mt-3 grid gap-3 md:grid-cols-4">{shape.map((step, index) => <div key={step.label} className="relative"><article className="h-full rounded-[1rem] border border-[#e4e2d9] bg-[#f7faf6] px-4 py-4"><span aria-hidden className="grid h-11 w-11 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]">{shapeIcon(index)}</span><h3 className="mt-3 font-serif text-[1rem] leading-tight text-[#26312c]">{step.label}</h3><p className="mt-1 text-sm leading-[1.35] text-[#626b63]">{step.detail}</p></article>{index < shape.length - 1 ? <span aria-hidden className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-xl text-[#4d887a] md:block">→</span> : null}</div>)}</div></section><section aria-labelledby="checks-title" className="mt-5 rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-5 sm:px-7"><h2 id="checks-title" className="font-serif text-[1.45rem] text-[#26312c]">Before you choose a course</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{["Compare what each course actually teaches", "Check current entry and admission requirements", "Confirm duration, fees, and available support"].map((check) => <p key={check} className="flex items-start gap-3 border-t border-[#e7e3da] pt-3 font-serif text-[1rem] leading-[1.35] text-[#525950] md:border-l md:border-t-0 md:pl-4"><span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><Check className="h-4 w-4" /></span>{check}</p>)}</div></section></div><aside aria-labelledby="glance-title" className="rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-5 py-5 shadow-[0_5px_22px_-20px_rgba(40,69,60,.45)] sm:px-6 lg:sticky lg:top-6"><h2 id="glance-title" className="font-serif text-[1.55rem] text-[#26312c]">At a glance</h2><dl className="mt-4 rounded-[.8rem] border border-[#e4e2d9] px-4">{glance.map(([label, value]) => <div key={label} className="grid grid-cols-[.9fr_1.1fr] gap-3 border-b border-[#e7e3da] py-4 last:border-b-0"><dt className="font-serif text-[.95rem] text-[#77786f]">{label}</dt><dd className="font-serif text-[.98rem] leading-[1.3] text-[#424a43]">{value}</dd></div>)}</dl><p className="mt-4 text-sm text-[#77786f]">Varies by course and institution.</p></aside></div>
    <div className="mx-auto mt-6 flex max-w-[620px] flex-col items-center text-center"><Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(route.slug)}/courses`} className="inline-flex min-h-[58px] w-full items-center justify-center rounded-xl bg-[#286b61] px-6 py-4 font-serif text-[1.15rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4">See courses in this route</Link><div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"><Link href={`/compare?type=pathway&field=${encodeURIComponent(field.slug)}`} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Compare another route</Link><span aria-hidden className="h-5 w-px bg-[#d8d8cf]" /><Link href={`/guidance/direction/${encodeURIComponent(slug)}/routes`} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Back to routes</Link></div><p className="mt-5 w-full border-t border-[#e5e2d8] pt-4 font-serif text-[15px] text-[#77786f]">You can explore this route without committing to it.</p></div>
  </section></main>;
}
