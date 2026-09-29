import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Code2, GraduationCap, Wrench } from "lucide-react";
import { getField, getPathways } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Routes to explore" };

function stageLabel(stage: string, detail?: string | null) {
  const label = stage === "class10" ? "Class 10" : "Class 12";
  const detailLabels: Record<string, string> = { studying: "currently studying", completed: "results available", awaiting_results: "awaiting results" };
  return `${label}${detail && detailLabels[detail] ? ` · ${detailLabels[detail]}` : ""}`;
}

function RouteIcon({ type, index }: { type: string; index: number }) {
  if (type === "diploma" || type === "vocational") return <Wrench aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
  if (index === 1 || type === "academic") return <Code2 aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
  return <GraduationCap aria-hidden className="h-10 w-10" strokeWidth={1.45} />;
}

function routeName(title: string, type: string) {
  if (title.includes("B.Tech Computer Science")) return "Engineering or technical degree";
  if (title.includes("BCA")) return "Computing-focused degree";
  if (type === "diploma" || type === "vocational") return "Applied diploma or skill route";
  return title.split("→").slice(-1)[0]?.replace(/\s*→.*/, "").trim() || title;
}

function routeDescription(title: string, description: string, type: string) {
  if (title.includes("B.Tech Computer Science")) return "A longer degree route that may include mathematics, computing, engineering concepts, and deeper technical study.";
  if (title.includes("BCA")) return "A degree route centred on software, applications, information systems, or computer science, with different course structures.";
  if (type === "diploma" || type === "vocational") return "A more practical route that may focus on hands-on training, specific tools, and entering work or further study sooner.";
  return description;
}

function understandNext(title: string, type: string) {
  if (title.includes("B.Tech Computer Science")) return "subjects, entrance routes, and course options.";
  if (title.includes("BCA")) return "course differences, entry requirements, and outcomes.";
  if (type === "diploma" || type === "vocational") return "duration, progression options, and local availability.";
  return "the study style, requirements, and progression options.";
}

export default async function RoutesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [state, field] = await Promise.all([getSessionState(), getField(slug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field) redirect("/guidance/possibilities");

  const pathways = await getPathways({ stage: state.stage, fieldSlug: slug });
  const routeCards = pathways.slice(0, 6);
  const displayStage = stageLabel(state.stage, state.stageDetail);

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1220px]">
    <Link href={`/guidance/direction/${encodeURIComponent(field.slug)}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42]"><ArrowLeft aria-hidden className="h-4 w-4" />Back to {field.name} overview</Link>
    <div className="mx-auto mt-5 max-w-[1000px] text-center"><p className="font-serif text-[1rem] text-[#77786f]">Exploring {field.name} <span aria-hidden>·</span> Routes</p><h1 className="mt-5 font-serif text-[clamp(2.25rem,5vw,3.8rem)] leading-[1.06] tracking-[-.045em] text-[#202522]">How could you move towards {field.name}?</h1><p className="mx-auto mt-4 max-w-[850px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">There is more than one way forward. These route types are starting points to understand, not a ranking.</p><p className="mt-3 font-serif text-[1rem] text-[#77786f]">You are exploring from: {displayStage}</p></div>
    {routeCards.length ? <div id="route-cards" className="mt-7 grid gap-4 lg:grid-cols-3">{routeCards.map((route, index) => <article key={route.slug} className="flex min-w-0 flex-col rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-6 shadow-[0_5px_22px_-20px_rgba(40,69,60,.45)] sm:px-7 sm:py-7"><div className="grid h-20 w-20 place-items-center self-center rounded-full bg-[#e8f0ec] text-[#286b61]"><RouteIcon type={route.routeType} index={index} /></div><h2 className="mt-6 min-h-[58px] text-center font-serif text-[1.5rem] leading-[1.12] text-[#26312c]">{routeName(route.title, route.routeType)}</h2><p className="mt-4 min-h-[100px] font-serif text-[1.05rem] leading-[1.42] text-[#525950]">{routeDescription(route.title, route.description, route.routeType)}</p><div className="mt-5 min-h-[66px] border-t border-[#e7e3da] pt-4"><p className="font-serif text-[1rem] leading-[1.35] text-[#525950]"><strong className="font-semibold text-[#424a43]">What to understand next:</strong><br />{understandNext(route.title, route.routeType)}</p></div><Link href={`/guidance/direction/${encodeURIComponent(field.slug)}/routes/${encodeURIComponent(route.slug)}`} className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-xl bg-[#286b61] px-5 py-3 text-center font-serif text-[1.05rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4">Understand this route</Link></article>)}</div> : <section className="mx-auto mt-7 max-w-[700px] rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] p-8 text-center"><h2 className="font-serif text-2xl text-[#26312c]">Routes are still being added for this stage</h2><p className="mt-3 text-sm leading-relaxed text-[#626b63]">Return to the overview to explore the direction while course and route information is checked.</p><Link href={`/guidance/direction/${encodeURIComponent(field.slug)}`} className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#9ebfb2] px-5 text-sm font-semibold text-[#35675b]">Back to overview</Link></section>}
    <section className="mx-auto mt-5 max-w-[700px] border-t border-[#e5e2d8] pt-5 text-center"><h2 className="font-serif text-[1.45rem] text-[#26312c]">You do not need to decide now</h2><p className="mt-2 font-serif text-[1rem] leading-[1.4] text-[#77786f]">You can open more than one route, compare what matters, or return to the {field.name} overview.</p><div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"><Link href={`/compare?type=pathway&field=${encodeURIComponent(field.slug)}`} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Compare these routes</Link><span aria-hidden className="h-5 w-px bg-[#d8d8cf]" /><Link href={`/guidance/direction/${encodeURIComponent(field.slug)}`} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Return to overview</Link></div><p className="mt-5 border-t border-[#e5e2d8] pt-4 font-serif text-[14px] text-[#77786f]">Requirements and availability vary by course and institution. Check official details later.</p></section>
  </section></main>;
}
