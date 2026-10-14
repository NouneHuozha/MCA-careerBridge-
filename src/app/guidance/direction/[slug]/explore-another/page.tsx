import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, BriefcaseBusiness, Compass, Cog, HeartPulse, Leaf, Monitor, UsersRound } from "lucide-react";
import { suggestFields } from "@/recommendation/engine";
import { getExplorationHistory, getSessionState } from "@/services/profile";
import { getField, type Field } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore another possibility" };

function DirectionIcon({ slug }: { slug: string }) {
  if (slug === "technology") return <Monitor aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  if (slug === "healthcare") return <HeartPulse aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  if (slug === "government" || slug === "social-sciences") return <UsersRound aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  if (slug === "education") return <BookOpen aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  if (slug === "engineering") return <Cog aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  if (slug === "agriculture-environment") return <Leaf aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  if (slug === "business") return <BriefcaseBusiness aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
  return <Compass aria-hidden className="h-8 w-8" strokeWidth={1.55} />;
}

function PossibilityCard({ field }: { field: Field }) {
  return <article className="grid min-w-0 grid-cols-[72px_minmax(0,1fr)] gap-x-4 gap-y-3 rounded-xl border border-[#e4e2d9] bg-[#fffefa] p-4 sm:p-5">
    <span aria-hidden className="row-span-1 grid h-[72px] w-[72px] place-items-center self-center rounded-full bg-[#e8f0ec] text-[#12615b]"><DirectionIcon slug={field.slug} /></span>
    <div className="self-center">
      <h2 className="font-serif text-[1.3rem] leading-tight text-[#18364a]">{field.name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#5d6962]">{field.tagline || field.overview}</p>
    </div>
    <Link href={`/guidance/direction/${encodeURIComponent(field.slug)}`} className="col-span-2 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#07655f] px-4 text-center font-serif text-base font-semibold text-white transition hover:bg-[#075a58] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Explore this possibility</Link>
  </article>;
}

export default async function ExploreAnotherPossibilityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const [currentField, history, suggestions] = await Promise.all([
    getField(slug),
    getExplorationHistory(),
    suggestFields(state.snapshot, 12),
  ]);
  if (!currentField) redirect("/guidance/possibilities");

  const saved = history.some((record) => record.directionSlug === currentField.slug);
  const alternatives = suggestions
    .filter((suggestion) => suggestion.field.slug !== currentField.slug)
    .slice(0, 3)
    .sort((a, b) => a.field.orderIndex - b.field.orderIndex)
    .map((suggestion) => suggestion.field);
  const possibilities = [currentField, ...alternatives];

  return <main className="min-h-[calc(100dvh-150px)] overflow-hidden px-5 pb-0 pt-5 sm:px-8 sm:pt-7 lg:px-12">
    <section className="mx-auto max-w-[1108px]">
      {saved ? <div role="status" aria-live="polite" className="mx-auto flex max-w-[830px] items-center gap-4 rounded-xl border border-[#d4e9de] bg-[#eaf6ef] px-5 py-4 text-[#214b3f]">
        <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#21806b] text-white"><svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2.6"><path d="m5 12 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
        <p className="m-0 font-serif text-base leading-snug"><strong>{currentField.name} exploration saved.</strong><br /><span className="text-sm font-normal">You can return to it anytime from <Link href="/guidance/explorations" className="font-semibold underline underline-offset-2">My Explorations</Link>.</span></p>
      </div> : null}

      <header className="mx-auto mt-5 max-w-[850px] text-center">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#286b61]">Look around without choosing yet</p>
        <h1 className="mt-2 font-serif text-[clamp(2.3rem,5vw,3.7rem)] leading-[1.04] tracking-[-.04em] text-[#102c43]">Explore another possibility.</h1>
        <p className="mx-auto mt-3 max-w-[760px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.42] text-[#59645e]">These are different areas you can understand at your own pace. Opening one does not close or replace your {currentField.name} exploration.</p>
        <p className="mx-auto mt-3 inline-flex min-h-9 items-center rounded-full bg-[#eaf5ef] px-5 text-sm font-medium text-[#315f53]">Every direction is a starting point, not a prediction</p>
      </header>

      <section aria-label="Other possibilities to explore" className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
        {possibilities.map((field) => <PossibilityCard key={field.slug} field={field} />)}
      </section>

      <section className="mx-auto mt-4 max-w-[1108px] border-t border-[#e5e2d8] pt-3 text-center">
        <Link href="/guidance/not-sure" className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]">I’m not sure yet — help me look around</Link>
      </section>
    </section>

    <div aria-hidden className="relative mx-auto mt-3 h-[96px] w-full max-w-[1500px] sm:h-[112px]">
      <Image src="/images/possibilities-landscape.png" alt="" fill sizes="100vw" className="object-cover object-[center_78%]" />
    </div>
  </main>;
}
