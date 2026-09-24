import Link from "next/link";
import { ArrowRight, Compass, Monitor, UsersRound, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionState } from "@/services/profile";
import { suggestFields, type FieldSuggestion } from "@/recommendation/engine";
import { JourneyShell, JourneyIntro } from "@/components/journey";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a direction" };
const icons = [Monitor, UsersRound, Wrench];
const tones = ["bg-[#f1fbf6] border-[#cfe8dc]", "bg-[#f8f5ff] border-[#d9cef5]", "bg-[#fffaf0] border-[#f0d99a]"];

export default async function DirectionPage() {
  const state = await getSessionState();
  if (!state || state.status !== "completed") redirect("/reflection");
  const suggestions = (await suggestFields(state.snapshot, 6)).slice(0, 3);
  return <JourneyShell current="direction"><JourneyIntro eyebrow="Step 2 of 8 · Based on what you shared" title="What would you like to explore first?" description="These are broad directions, not final careers. Choose one direction to understand better. You can change your mind later." />
    <div className="mt-9 grid gap-5 lg:grid-cols-3">{suggestions.map((suggestion, index) => <DirectionCard key={suggestion.field.slug} suggestion={suggestion} index={index} />)}</div>
    <section className="mt-7 rounded-2xl border border-dashed border-[#cfded8] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-[#123f38]">None of these feel right?</h2><p className="mt-1 text-sm text-ink-500">That is okay. Your answers are starting points, not a decision.</p></div><Link href="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6043bd] underline decoration-[#baa9ef] underline-offset-4">See other directions<Compass className="h-4 w-4" /></Link></div></section>
  </JourneyShell>;
}
function DirectionCard({ suggestion, index }: { suggestion: FieldSuggestion; index: number }) { const Icon = icons[index] ?? Compass; const reason = suggestion.reasons[0]?.detail ?? "This direction connects with some of the interests you shared."; return <article className={`flex flex-col rounded-[1.5rem] border-2 p-5 ${tones[index]}`}><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#287d65]"><Icon className="h-6 w-6" /></span><span className="text-xs font-bold uppercase tracking-[.1em] text-[#28775f]">Possible direction</span></div><h2 className="mt-6 text-2xl font-semibold tracking-[-.03em] text-[#092b25]">{suggestion.field.name}</h2><p className="mt-2 text-sm leading-relaxed text-ink-600">{suggestion.field.tagline ?? suggestion.field.overview}</p><div className="mt-5 rounded-xl bg-white/80 p-3.5"><p className="text-xs font-bold uppercase tracking-[.1em] text-[#28775f]">Why it appeared</p><p className="mt-2 text-sm leading-relaxed text-[#28584c]">{reason}</p></div><p className="mt-4 text-xs leading-relaxed text-ink-500"><strong>Keep in mind:</strong> Understanding a direction is different from choosing a final career.</p><form action="/api/exploration" method="post" className="mt-6"><input type="hidden" name="directionSlug" value={suggestion.field.slug} /><input type="hidden" name="returnTo" value={`/my-journey/direction/${suggestion.field.slug}/confirm`} /><button className="cb-button cb-button-primary w-full justify-center">Choose this direction<ArrowRight className="h-4 w-4" /></button></form></article>; }
