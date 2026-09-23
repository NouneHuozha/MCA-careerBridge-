import { redirect } from "next/navigation";
import { ArrowRight, Check, GraduationCap, HelpCircle, School, Sparkles } from "lucide-react";
import { ArrowGlyph, Button, Eyebrow } from "@/components/ui";
import { Blob, DottedGrid } from "@/components/decor";
import { startSession } from "@/services/profile";
import { questionsForStage, type Stage } from "@/data/counselling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start your journey" };

const stageCards: { stage: Stage; label: string; description: string; opens: string[]; icon: typeof School; accent: string }[] = [
  { stage: "class10", label: "I’m in Class 10", description: "Or I have just completed Class 10 / am waiting for results", opens: ["Streams", "Polytechnic", "ITI and vocational routes"], icon: School, accent: "bg-mint text-mint-ink" },
  { stage: "class12", label: "I’m in Class 12", description: "Or I have just completed Class 12 / am waiting for results", opens: ["Degrees", "Entrance exams", "Admissions"], icon: GraduationCap, accent: "bg-lavender text-lavender-ink" },
];

export default async function StartPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const params = await searchParams;
  const preselected = params.stage === "class12" ? "class12" : "class10";
  const count = questionsForStage(preselected as Stage).length;

  async function begin(formData: FormData) {
    "use server";
    const stage = (formData.get("stage") === "class12" ? "class12" : "class10") as Stage;
    const detail = String(formData.get("stageDetail") ?? "studying");
    await startSession(stage, detail);
    redirect("/counselling");
  }

  return <div className="relative overflow-hidden"><Blob className="pointer-events-none absolute -right-24 -top-16 h-72 w-72 text-mint/70" /><DottedGrid className="pointer-events-none absolute bottom-24 left-6 hidden h-12 w-24 text-ink-200 lg:block" />
    <div className="cb-container relative max-w-4xl py-10 sm:py-14 lg:py-20">
      <div className="animate-rise flex items-center gap-3"><Eyebrow>Step 1 of 3</Eyebrow><span aria-hidden className="h-px flex-1 bg-ink-200" /><span className="hidden items-center gap-1.5 text-xs font-semibold text-ink-500 sm:flex"><Sparkles aria-hidden className="h-3.5 w-3.5 text-butter-ink" />About 2 minutes</span></div>
      <div className="mt-6 max-w-2xl"><h1 className="animate-rise delay-1 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold">Let’s find your starting point.</h1><p className="animate-rise delay-2 mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">First, tell us where you are in your education journey. This only changes which questions and options we show you—it does not decide anything for you.</p></div>
      <form action={begin} className="mt-9 space-y-8">
        <fieldset className="animate-rise delay-3"><legend className="mb-3 text-base font-semibold text-ink-900">Which stage sounds like you?</legend><div className="grid gap-4 sm:grid-cols-2">{stageCards.map((card) => <label key={card.stage} className="group relative cursor-pointer rounded-2xl border-2 border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-300 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50 has-[:checked]:shadow-[0_16px_36px_-24px_rgba(16,56,42,0.6)] sm:p-6"><input type="radio" name="stage" value={card.stage} defaultChecked={preselected === card.stage} className="peer sr-only" /><span aria-hidden className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full border-2 border-ink-200 text-transparent transition-colors peer-checked:border-forest-600 peer-checked:bg-forest-600 peer-checked:text-white"><Check className="h-3.5 w-3.5" /></span><span aria-hidden className={`grid h-12 w-12 place-items-center rounded-xl ${card.accent}`}><card.icon className="h-5 w-5" strokeWidth={1.7} /></span><span className="mt-4 block text-lg font-semibold text-ink-900">{card.label}</span><span className="mt-1 block max-w-[32ch] text-sm leading-relaxed text-ink-600">{card.description}</span><span className="mt-4 flex flex-wrap gap-1.5">{card.opens.map((item) => <span key={item} className="rounded-full bg-canvas-deep px-2.5 py-1 text-[11px] text-ink-600">{item}</span>)}</span></label>)}</div></fieldset>
        <fieldset className="animate-rise delay-4"><legend className="mb-3 text-base font-semibold text-ink-900">What describes you right now?</legend><div className="flex flex-wrap gap-2">{[{ value: "studying", label: "I’m still studying" }, { value: "completed", label: "I’ve completed it" }, { value: "awaiting_results", label: "I’m waiting for results" }].map((option, index) => <label key={option.value} className="cursor-pointer rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[13px] font-medium text-ink-700 transition-all duration-200 hover:border-forest-300 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-700 has-[:checked]:text-white"><input type="radio" name="stageDetail" value={option.value} defaultChecked={index === 0} className="sr-only" />{option.label}</label>)}</div></fieldset>
        <div className="animate-rise delay-5 flex flex-col gap-4 border-t border-ink-100 pt-7 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-2 text-sm text-ink-500"><HelpCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" /><span>There are no right or wrong answers. You can change everything later.</span></div><Button type="submit" size="lg" className="shrink-0">Continue<ArrowGlyph /></Button></div>
      </form>
      <p className="mt-5 text-center text-xs text-ink-400 sm:text-left">{count} short questions · We never ask for your exact address.</p>
    </div>
  </div>;
}
