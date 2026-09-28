import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, BriefcaseBusiness, Cog, HeartPulse, Leaf, Monitor, UsersRound } from "lucide-react";
import { getField } from "@/services/catalog";
import { scoreField } from "@/recommendation/engine";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Direction overview" };

function DirectionIcon({ slug, className = "h-10 w-10" }: { slug: string; className?: string }) {
  if (slug === "technology") return <Monitor aria-hidden className={className} strokeWidth={1.45} />;
  if (slug === "healthcare") return <HeartPulse aria-hidden className={className} strokeWidth={1.45} />;
  if (slug === "government" || slug === "social-sciences") return <UsersRound aria-hidden className={className} strokeWidth={1.45} />;
  if (slug === "agriculture-environment") return <Leaf aria-hidden className={className} strokeWidth={1.45} />;
  return <BriefcaseBusiness aria-hidden className={className} strokeWidth={1.45} />;
}

function InvolvedIcon({ index }: { index: number }) {
  if (index === 0) return <Cog aria-hidden className="h-8 w-8" strokeWidth={1.6} />;
  if (index === 1) return <BarChart3 aria-hidden className="h-8 w-8" strokeWidth={1.6} />;
  if (index === 2) return <UsersRound aria-hidden className="h-8 w-8" strokeWidth={1.6} />;
  return <Leaf aria-hidden className="h-8 w-8" strokeWidth={1.6} />;
}

export default async function DirectionOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [state, field] = await Promise.all([getSessionState(), getField(slug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field) redirect("/guidance/possibilities");

  const suggestion = scoreField(field, state.snapshot);
  const reasons = suggestion.reasons.slice(0, 2).map((reason) => reason.detail);
  const connection = reasons.length ? `${reasons.join(" ")} That is one reason this direction may be useful to explore — not a final answer about you.` : "This direction gives you another area to understand before deciding what feels useful. It is not a final answer about you.";
  const involved = (field.whatPeopleDo ?? []).slice(0, 4);

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1220px]">
    <Link href="/guidance/possibilities" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42]"><ArrowLeft aria-hidden className="h-4 w-4" />Back to possibilities</Link>
    <div className="mx-auto mt-5 max-w-[900px] text-center"><p className="font-serif text-[1rem] text-[#77786f]">Exploring {field.name} <span aria-hidden>·</span> Overview</p><div className="mx-auto mt-5 grid h-20 w-20 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><DirectionIcon slug={field.slug} /></div><h1 className="mt-5 font-serif text-[clamp(2.25rem,5vw,3.8rem)] leading-[1.06] tracking-[-.045em] text-[#202522]">{field.name} is broader than one job</h1><p className="mx-auto mt-4 max-w-[850px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#454740]">{field.tagline} {field.overview.split(" ").slice(0, 28).join(" ")}{field.overview.split(" ").length > 28 ? "…" : ""}</p></div>
    <section aria-labelledby="connection-title" className="mt-8 flex flex-col gap-5 rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-6 shadow-[0_5px_22px_-20px_rgba(40,69,60,.45)] sm:flex-row sm:items-center sm:px-8"><span aria-hidden className="grid h-20 w-20 shrink-0 place-items-center self-center rounded-full bg-[#e8f0ec] text-[#286b61]"><DirectionIcon slug={field.slug} /></span><div><h2 id="connection-title" className="font-serif text-[1.65rem] leading-tight text-[#26312c]">Why this may connect to you</h2><p className="mt-2 font-serif text-[1.06rem] leading-[1.45] text-[#525950]">{connection}</p></div></section>
    <section aria-labelledby="involved-title" className="mt-8"><h2 id="involved-title" className="font-serif text-[1.75rem] leading-tight text-[#26312c]">What could be involved?</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{involved.map((item, index) => <article key={item} className="flex min-h-[150px] flex-col items-center justify-center rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-4 py-5 text-center"><span aria-hidden className="grid h-14 w-14 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><InvolvedIcon index={index} /></span><p className="mt-4 font-serif text-[1.05rem] leading-[1.3] text-[#424a43]">{item}</p></article>)}</div></section>
    <div className="mx-auto mt-7 flex max-w-[600px] flex-col items-center text-center"><Link href={`/guidance/direction/${encodeURIComponent(field.slug)}/routes`} className="inline-flex min-h-[58px] w-full items-center justify-center rounded-xl bg-[#286b61] px-6 py-4 font-serif text-[1.15rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4">Explore possible routes</Link><div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"><Link href={`/guidance/direction/${encodeURIComponent(field.slug)}/courses`} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">See courses</Link><span aria-hidden className="h-5 w-px bg-[#d8d8cf]" /><Link href="/guidance/possibilities" className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">Explore another possibility</Link></div></div>
    <p className="mx-auto mt-7 max-w-[600px] border-t border-[#e5e2d8] pt-5 text-center font-serif text-[15px] text-[#77786f]">You can explore this direction without committing to it.</p>
  </section></main>;
}
