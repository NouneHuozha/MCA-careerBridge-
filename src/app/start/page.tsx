import { redirect } from "next/navigation";
import { ArrowRight, Check, GraduationCap, HelpCircle, School, Sparkles } from "lucide-react";
import { ArrowGlyph, Button, Eyebrow } from "@/components/ui";
import { startSession } from "@/services/profile";
import { questionsForStage, type Stage } from "@/data/counselling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start your journey" };

type StartParams = { stage?: string; error?: string };
const stageCards: { stage: Stage; label: string; description: string; opens: string[]; icon: typeof School; accent: string }[] = [
  { stage: "class10", label: "I’m finishing or have completed Class 10", description: "This includes students waiting for Class 10 results or thinking about what to do next.", opens: ["Streams", "Polytechnic", "ITI and vocational routes"], icon: School, accent: "bg-mint text-mint-ink" },
  { stage: "class12", label: "I’m finishing or have completed Class 12", description: "This includes students waiting for Class 12 results or deciding on further study and work.", opens: ["Degrees", "Entrance exams", "Admissions"], icon: GraduationCap, accent: "bg-lavender text-lavender-ink" },
];

export default async function StartPage({ searchParams }: { searchParams: Promise<StartParams> }) {
  const params = await searchParams;

  async function begin(formData: FormData) {
    "use server";
    const rawStage = String(formData.get("stage") ?? "");
    const rawDetail = String(formData.get("stageDetail") ?? "");
    if (!["class10", "class12"].includes(rawStage) || !["studying", "completed", "awaiting_results"].includes(rawDetail)) {
      redirect("/start?error=choose-options");
    }
    try {
      await startSession(rawStage as Stage, rawDetail);
    } catch {
      redirect("/start?error=unavailable");
    }
    redirect("/counselling");
  }

  const error = params.error === "choose-options" ? "Choose your stage and current situation to continue." : params.error === "unavailable" ? "We could not save your starting point just now. Please try again in a moment." : null;
  return <div className="min-h-[calc(100dvh-5rem)] bg-[#f5f8fb]">
    <header className="cb-counselling-header"><span className="text-base font-semibold tracking-[-.03em] text-forest-900">CareerBridge</span><span className="hidden text-right text-xs text-ink-400 sm:block">Your space to think</span></header>
    <div className="cb-container py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-[1110px]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,245px)_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block"><p className="text-xl font-semibold tracking-[-.03em] text-forest-900">Your journey</p><p className="mt-2 text-sm leading-relaxed text-ink-500">A short conversation about you.</p><ol className="mt-8 space-y-5" aria-label="Journey progress"><li className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#7256df] bg-[#7256df] text-sm font-bold text-white">1</span><span><span className="block text-sm font-semibold text-[#5b43be]">Choose your starting point</span><span className="mt-1 block text-xs leading-relaxed text-ink-500">You are here</span></span></li><li className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#c7d9e2] bg-white text-sm font-semibold text-[#9aabb7]">2</span><span><span className="block text-sm font-semibold text-ink-500">Answer a few questions</span><span className="mt-1 block text-xs leading-relaxed text-ink-500">About 5 minutes</span></span></li><li className="flex items-start gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#c7d9e2] bg-white text-sm font-semibold text-[#9aabb7]">3</span><span><span className="block text-sm font-semibold text-ink-500">Explore your possibilities</span><span className="mt-1 block text-xs leading-relaxed text-ink-500">No final decision needed</span></span></li></ol><div className="mt-8 rounded-2xl border border-white bg-[#d9eee2] p-4"><p className="text-sm font-semibold text-forest-900">You stay in control.</p><p className="mt-1 text-xs leading-relaxed text-forest-800">Your answers are starting points. You can edit them or change direction later.</p></div></aside>
          <main>
            <div className="flex flex-wrap items-center gap-3"><Eyebrow>Step 1 of 3</Eyebrow><span aria-hidden className="h-px flex-1 bg-ink-200" /><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500"><Sparkles aria-hidden className="h-3.5 w-3.5 text-butter-ink" />About 5 minutes</span></div>
            <div className="mt-6 max-w-2xl"><h1 className="text-[clamp(2rem,4.5vw,3.4rem)] font-semibold tracking-[-.04em]">Let’s find your starting point.</h1><p className="mt-4 text-base leading-relaxed text-ink-600 sm:text-lg">Tell us where you are in your education journey. We’ll use this to show relevant questions and routes—it does not decide anything for you.</p></div>
            {error && <p className="mt-6 rounded-xl border border-peach-ink/20 bg-peach/45 px-4 py-3 text-sm font-medium text-peach-ink" role="alert">{error}</p>}
            <form action={begin} className="mt-8 space-y-8">
              <fieldset><legend className="mb-3 text-base font-semibold text-ink-900">Which stage sounds like you?</legend><div className="grid gap-4 sm:grid-cols-2">{stageCards.map((card) => <label key={card.stage} className="group relative cursor-pointer rounded-2xl border-2 border-ink-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-300 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50 has-[:checked]:shadow-[0_16px_36px_-24px_rgba(16,56,42,0.6)] sm:p-6"><input type="radio" name="stage" value={card.stage} required className="peer sr-only" /><span aria-hidden className="absolute right-5 top-5 grid h-6 w-6 place-items-center rounded-full border-2 border-ink-200 text-transparent transition-colors peer-checked:border-forest-600 peer-checked:bg-forest-600 peer-checked:text-white"><Check className="h-3.5 w-3.5" /></span><span aria-hidden className={`grid h-12 w-12 place-items-center rounded-xl ${card.accent}`}><card.icon className="h-5 w-5" strokeWidth={1.7} /></span><span className="mt-4 block text-lg font-semibold text-ink-900">{card.label}</span><span className="mt-1 block max-w-[32ch] text-sm leading-relaxed text-ink-600">{card.description}</span><span className="mt-4 flex flex-wrap gap-1.5">{card.opens.map((item) => <span key={item} className="rounded-full bg-canvas-deep px-2.5 py-1 text-[11px] text-ink-600">{item}</span>)}</span></label>)}</div></fieldset>
              <fieldset><legend className="mb-3 text-base font-semibold text-ink-900">What describes you right now?</legend><div className="flex flex-wrap gap-2">{[{ value: "studying", label: "I’m still studying" }, { value: "completed", label: "I’ve completed it" }, { value: "awaiting_results", label: "I’m waiting for results" }].map((option) => <label key={option.value} className="cursor-pointer rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[13px] font-medium text-ink-700 transition-all duration-200 hover:border-forest-300 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-700 has-[:checked]:text-white"><input type="radio" name="stageDetail" value={option.value} required className="sr-only" />{option.label}</label>)}</div></fieldset>
              <div className="flex flex-col gap-4 border-t border-ink-100 pt-7 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-2 text-sm text-ink-500"><HelpCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" /><span>No marks, right answers or pressure. You can change everything later.</span></div><Button type="submit" size="lg" className="shrink-0">Continue<ArrowGlyph /></Button></div>
            </form>
            <p className="mt-5 text-center text-xs text-ink-400 sm:text-left">{questionsForStage("class10").length} short questions · We never ask for your exact address.</p>
          </main>
        </div>
      </div>
    </div>
  </div>;
}
