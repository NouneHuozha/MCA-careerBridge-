import Link from "next/link";
import { ArrowRight, Edit3, HeartHandshake, MapPin, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionState, labelFor } from "@/services/profile";
import { JourneyShell, JourneyIntro, PrimaryLink } from "@/components/journey";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your reflection" };

export default async function ReflectionPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  const s = state.snapshot;
  const interests = s.interests.slice(0, 3).map((v) => labelFor("interest", v));
  const subjects = s.subjectsEnjoy.slice(0, 3).map((v) => labelFor("subject", v));
  const strengths = s.strengths.slice(0, 3).map((v) => labelFor("strength", v));
  const opening = interests.length ? `You are curious about ${interests.join(", ").toLowerCase()}` : subjects.length ? `You enjoy ${subjects.join(" and ").toLowerCase()}` : "You are still discovering what interests you";
  const location = s.locationPref === "home-district" ? "near your own district" : s.locationPref === "within-nagaland" ? "within Nagaland" : "in different places";
  return <JourneyShell current="reflection"><JourneyIntro eyebrow="Reflection complete · Step 1 of 8" title="Here is what we understood about you." description="This is a starting point, not a label. Review your answers before choosing what to explore." />
    <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <div className="rounded-[1.75rem] border border-[#cfe8dc] bg-[#effaf5] p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#287d65]"><HeartHandshake className="h-6 w-6" /></span><div><p className="text-lg leading-relaxed text-[#155b4d]">{opening}. Your strengths include {strengths.length ? strengths.join(" and ").toLowerCase() : "things you are still noticing"}.</p><p className="mt-3 text-sm leading-relaxed text-ink-600">You would like to keep study options {location} in view.</p></div></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><Summary title="Subjects I enjoy" values={subjects} tone="bg-white" /><Summary title="Things I am curious about" values={interests} tone="bg-[#f8f5ff]" /><Summary title="Strengths I notice" values={strengths} tone="bg-[#fffaf0]" /><Summary title="Practical preferences" values={[`Study ${location}`, s.budget ? "A broad fee preference shared" : "Fees still open to explore"]} tone="bg-[#eff7ff]" /></div></div>
      <aside className="space-y-4"><div className="overflow-hidden rounded-[1.75rem] bg-[#dff0e7] p-6"><div className="grid h-44 place-items-center rounded-2xl bg-[#b8dcca] text-[#287d65]"><Sparkles className="h-14 w-14" /></div><p className="mt-5 text-lg font-semibold text-[#123f38]">You are allowed to change your mind.</p><p className="mt-2 text-sm leading-relaxed text-ink-600">We will help you understand one direction at a time. Nothing here locks you in.</p></div><Link href="/counselling?edit=interests" className="inline-flex items-center gap-2 text-sm font-semibold text-[#28775f] underline decoration-[#9bcdb9] underline-offset-4">Review my answers<Edit3 className="h-4 w-4" /></Link></aside>
    </section><div className="mt-8 flex flex-col gap-4 border-t border-ink-100 pt-6 sm:flex-row sm:items-center"><PrimaryLink href="/my-journey/direction">Choose a direction to explore</PrimaryLink><span className="text-sm text-ink-400">You can go back at any time.</span></div>
  </JourneyShell>;
}
function Summary({ title, values, tone }: { title: string; values: string[]; tone: string }) { return <div className={`rounded-2xl p-4 ${tone}`}><p className="text-xs font-bold uppercase tracking-[.1em] text-[#28775f]">{title}</p><p className="mt-2 text-sm leading-relaxed text-ink-700">{values.length ? values.join(" · ") : "Not shared yet"}</p></div>; }
