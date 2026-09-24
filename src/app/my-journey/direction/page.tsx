import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Compass, Heart, Info, Lightbulb, MessageCircle, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { StartingPointShell } from "@/components/starting-point-shell";
import { FieldIcon } from "@/components/field-visuals";
import { getSessionState } from "@/services/profile";
import { suggestFields, type FieldSuggestion } from "@/recommendation/engine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Possibility map" };

const palettes = [
  { card: "bg-[#f6f4fc]", icon: "bg-[#ece7fb] text-[#6848cf]", button: "bg-[#6441ca] hover:bg-[#5334b5]", dot: "bg-[#7b59d5]" },
  { card: "bg-[#eff9f5]", icon: "bg-[#def2e9] text-[#188464]", button: "bg-[#148260] hover:bg-[#0d6d50]", dot: "bg-[#168767]" },
  { card: "bg-[#eff6fc]", icon: "bg-[#e1eefc] text-[#2877c8]", button: "bg-[#2877c8] hover:bg-[#2064a8]", dot: "bg-[#2877c8]" },
  { card: "bg-[#fff9e9]", icon: "bg-[#fff0c4] text-[#a77600]", button: "bg-[#bd8c0b] hover:bg-[#a67600]", dot: "bg-[#c19111]" },
  { card: "bg-[#fbf3fa]", icon: "bg-[#f4e1f3] text-[#b13d9e]", button: "bg-[#b13d9e] hover:bg-[#963084]", dot: "bg-[#b13d9e]" },
  { card: "bg-[#eff9f8]", icon: "bg-[#def1ed] text-[#1a8577]", button: "bg-[#138477] hover:bg-[#0f7066]", dot: "bg-[#138477]" },
];

const cardNames: Record<string, string> = {
  technology: "Technology & digital tools",
  healthcare: "Helping people & health",
  engineering: "Building & engineering",
  business: "Business & communication",
  "arts-design": "Creative & media work",
  government: "Public service & community",
};

function shortFact(items: string[] | null | undefined, fallback: string) {
  return items?.length ? items.slice(0, 2).join("; ") : fallback;
}

function PossibilityCard({ suggestion, index }: { suggestion: FieldSuggestion; index: number }) {
  const { field } = suggestion;
  const palette = palettes[index % palettes.length];
  const reason = suggestion.reasons[0]?.detail ?? "A broad area to look into as you learn more about yourself.";
  return <article className={`flex min-w-0 flex-col rounded-xl border border-white/80 p-3.5 shadow-[0_8px_24px_-22px_rgba(19,50,41,.55)] sm:p-4 ${palette.card}`}>
    <header className="flex min-h-[46px] items-center gap-2.5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${palette.icon}`}><FieldIcon slug={field.slug} className="h-[19px] w-[19px]" /></span>
      <div className="min-w-0 flex-1"><h2 className="truncate text-[14px] font-semibold leading-tight text-[#243c35] sm:text-[15px]">{cardNames[field.slug] ?? field.name}</h2><span aria-hidden className="mt-1 flex gap-1">{[0, 1, 2].map((dot) => <span key={dot} className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />)}</span></div>
    </header>
    <div className="mt-3 grid flex-1 grid-cols-3 gap-2 border-t border-[#294f4218] pt-2.5">
      <div><h3 className="text-[9px] font-semibold leading-tight text-[#465d55] sm:text-[10px]">Why this appeared</h3><p className="mt-1 line-clamp-4 text-[9px] leading-[1.4] text-[#64746f] sm:text-[10px]">{reason}</p></div>
      <div><h3 className="text-[9px] font-semibold leading-tight text-[#465d55] sm:text-[10px]">What people may do</h3><p className="mt-1 line-clamp-4 text-[9px] leading-[1.4] text-[#64746f] sm:text-[10px]">{shortFact(field.whatPeopleDo, "Explore different kinds of work in this area.")}</p></div>
      <div><h3 className="text-[9px] font-semibold leading-tight text-[#465d55] sm:text-[10px]">What you might study</h3><p className="mt-1 line-clamp-4 text-[9px] leading-[1.4] text-[#64746f] sm:text-[10px]">{shortFact(field.usefulSubjects, "Subjects vary by route and institution.")}</p></div>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      <form action="/api/exploration" method="post"><input type="hidden" name="directionSlug" value={field.slug} /><input type="hidden" name="returnTo" value={`/my-journey/direction/${field.slug}/confirm`} /><button className={`inline-flex min-h-8 w-full items-center justify-center gap-1 rounded-md px-1.5 text-[10px] font-semibold text-white transition sm:text-[11px] ${palette.button}`}>Explore <ArrowRight aria-hidden className="h-3 w-3" /></button></form>
      <Link href={`/explore/${field.slug}`} className="inline-flex min-h-8 items-center justify-center rounded-md border border-[#d8dfdf] bg-white/75 px-1 text-[10px] font-medium text-[#4a5c56] transition hover:bg-white sm:text-[11px]">I’m curious</Link>
      <Link href="/counselling?edit=interests" className="inline-flex min-h-8 items-center justify-center rounded-md border border-[#d8dfdf] bg-white/75 px-1 text-[10px] font-medium text-[#65736e] transition hover:bg-white sm:text-[11px]">Not for me</Link>
    </div>
  </article>;
}

export default async function DirectionPage() {
  const [state, user] = await Promise.all([getSessionState(), getCurrentUser()]);
  if (!state || state.status !== "completed") redirect("/reflection");
  const suggestions = (await suggestFields(state.snapshot, 6)).slice(0, 6);

  return <StartingPointShell currentStep="direction" stage={state.stage} studentName={user?.name ?? null} studentEmail={user?.email ?? null} signedIn={Boolean(user)}>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[#6650c4]">Possibility map</p><h1 className="mt-2 text-[clamp(2rem,3.2vw,2.55rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[#17372e]">What may be worth exploring?</h1><p className="mt-2 max-w-2xl text-sm text-[#687874]">These are possibilities based on what you shared — not final recommendations.</p></div>
      <Link href="/compare?type=field" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce3e4] bg-white px-4 text-sm font-medium text-[#344b43] shadow-sm transition hover:border-[#aab9b8] hover:bg-[#f8faf9]"><span className="text-lg leading-none">◎</span>Compare two possibilities</Link>
    </header>

    <section className="relative mt-4 grid min-h-[190px] overflow-hidden rounded-xl border border-[#e1eaeb] bg-[#f0f7f7] sm:min-h-[218px] sm:grid-cols-[.8fr_1.2fr]" aria-label="Many paths, a brighter you">
      <div className="relative z-10 flex flex-col justify-center px-5 py-5 sm:px-8"><h2 className="max-w-[14ch] text-[23px] font-semibold leading-tight tracking-[-.035em] text-[#1a3f34] sm:text-[26px]">Many paths.<br />A brighter you.</h2><p className="mt-2 max-w-[24ch] text-xs leading-relaxed text-[#5d716b] sm:text-sm">Your choices can grow and change with you.</p><details className="mt-3 w-fit"><summary className="flex min-h-8 cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-[#4e53b5] underline decoration-[#c2b9ee] underline-offset-4">Why am I seeing this?<Info aria-hidden className="h-3.5 w-3.5" /></summary><p className="mt-2 max-w-sm rounded-lg border border-[#e1e8e6] bg-white/95 p-3 text-xs leading-relaxed text-[#5d716b]">Each area is connected to interests, subjects, strengths or goals you chose. These are starting points—not a test result or a ranking. You can explore, compare, or change your answers at any time.</p></details></div>
      <div className="absolute inset-y-0 right-0 w-full sm:w-[72%]"><Image src="/images/possibilities-landscape.png" alt="A student looking toward several paths across a green Nagaland landscape" fill priority sizes="(max-width: 640px) 100vw, 74vw" className="object-cover object-[57%_53%]" /><div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#f0f7f7] via-[#f0f7f7e8] to-transparent sm:w-[44%]" /></div>
    </section>

    <section className="mt-4 grid gap-3.5 md:grid-cols-2 2xl:grid-cols-3" aria-label="Possibilities based on your answers">{suggestions.map((suggestion, index) => <PossibilityCard key={suggestion.field.slug} suggestion={suggestion} index={index} />)}</section>

    <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_.8fr]">
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-[#dae7f1] bg-[#eff6fc] p-3.5 sm:px-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#dceaf8] text-[#3478be]"><Compass aria-hidden className="h-6 w-6" /></span><div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-[#334c62]">I’m not sure yet</h2><p className="text-xs text-[#687d8b]">That’s okay. You can look around without choosing.</p></div><Link href="/explore" className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#4459ad] underline decoration-[#c3c8ee] underline-offset-4">Explore without choosing <ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></section>
      <section className="flex items-center gap-3 rounded-xl border border-[#efe5c9] bg-[#fff9eb] p-3.5 sm:px-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#fff0c7] text-[#a98416]"><Lightbulb aria-hidden className="h-5 w-5" /></span><div><h2 className="text-sm font-semibold text-[#4e4937]">What could change this view?</h2><p className="mt-1 text-xs leading-relaxed text-[#77715e]">New interests, experiences or goals can open new possibilities—there’s no rush.</p><Link href="/counselling?edit=interests" className="mt-1 inline-flex min-h-7 items-center gap-1 text-xs font-medium text-[#4e53b5] underline decoration-[#c2b9ee] underline-offset-4">Review your answers <ArrowUpRight aria-hidden className="h-3 w-3" /></Link></div></section>
    </div>
    <p className="mt-3 flex items-center gap-1.5 text-[10px] leading-relaxed text-[#80908b]"><ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />General guidance only. A possibility is not a prediction, a ranking or a decision made for you.</p>
  </StartingPointShell>;
}
