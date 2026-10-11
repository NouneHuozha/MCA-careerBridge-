"use client";

import Link from "next/link";
import { Check, ChevronDown, Circle } from "lucide-react";
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Logo } from "@/components/logo";
import { counsellingStages, type CounsellingStageKey } from "@/data/counselling-journey";

type QuestionProgress = { current: number; total: number };
type JourneyState = { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress };
type JourneyContextValue = { journey: JourneyState; setJourney: Dispatch<SetStateAction<JourneyState>> };
const JourneyContext = createContext<JourneyContextValue | null>(null);

export function useCounsellingJourney() {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useCounsellingJourney must be used inside CounsellingJourneyShell");
  return context;
}

export { counsellingStages };
export type { CounsellingStageKey };

function StageList({ currentSection, completedSections, mobile = false }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; mobile?: boolean }) {
  const currentIndex = counsellingStages.findIndex((stage) => stage.key === currentSection);
  return <ol className={mobile ? "grid gap-1 p-2" : "mt-7"} aria-label="Counselling progress">
    {counsellingStages.map((stage, index) => {
      const done = completedSections.includes(stage.key);
      const active = stage.key === currentSection;
      const available = done && Boolean(stage.editKey);
      const content = <>
        <span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors ${done ? "border-[#2c947c] bg-[#e4f5ee] text-[#24806a]" : active ? "border-[#267d69] bg-[#267d69] text-white" : "border-[#d5e0db] bg-white text-[#9eaca6]"}`}>
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : active ? <span className="text-sm font-bold">{index + 1}</span> : <Circle className="h-3 w-3" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-semibold ${active ? "text-[#176b58]" : done ? "text-[#29453a]" : "text-[#64746e]"}`}>{stage.label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-[#7c8984]">{active ? "You are here" : done ? "Completed · Edit answers" : index === currentIndex + 1 ? "Up next" : stage.detail}</span>
        </span>
      </>;
      return <li key={stage.key} className={`relative flex gap-3 ${mobile ? "rounded-xl px-2 py-2" : "min-h-[68px]"} ${active ? "rounded-xl bg-[#e9f5ef]" : ""}`}>
        {!mobile && index < counsellingStages.length - 1 ? <span aria-hidden className={`absolute left-[17px] top-9 h-[51px] w-px ${index < currentIndex || done ? "bg-[#62b79d]" : "bg-[#d4dfda]"}`} /> : null}
        {available ? <Link href={`/counselling?edit=${stage.editKey}`} className="flex min-w-0 flex-1 gap-3 rounded-xl px-2 py-2 hover:bg-white/70">{content}</Link> : <span className="flex min-w-0 flex-1 gap-3 rounded-xl px-2 py-2" aria-current={active ? "step" : undefined}>{content}</span>}
      </li>;
    })}
  </ol>;
}

function ProgressSummary({ currentSection, completedSections, progress }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  const sectionIndex = counsellingStages.findIndex((stage) => stage.key === currentSection);
  const percent = currentSection === "review" ? 100 : Math.round((Math.max(0, sectionIndex) / (counsellingStages.length - 1)) * 100);
  return <div className="mt-5 rounded-2xl border border-[#dce8e2] bg-white/80 p-3.5"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#397967]">Step {Math.max(1, sectionIndex + 1)} of 5</p><span className="text-xs font-semibold text-[#718079]">{percent}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e3ece7]"><div className="h-full rounded-full bg-[#2c947c] transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs leading-relaxed text-[#74817b]">{currentSection === "review" ? "Your answers are ready to review." : `${progress.current} of ${progress.total} core answers saved · ${completedSections.length} steps complete.`}</p></div>;
}

export function CounsellingJourneySidebar({ currentSection, completedSections, progress }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  return <aside className="hidden lg:block lg:w-[310px] lg:shrink-0" aria-label="Counselling journey progress"><div className="sticky top-0 min-h-[calc(100vh-4rem)] overflow-hidden border-r border-[#dce8e2] bg-[#f8fbf9] px-6 py-8"><p className="text-xl font-semibold tracking-[-.03em] text-[#183d33]">Your counselling journey</p><ProgressSummary currentSection={currentSection} completedSections={completedSections} progress={progress} /><StageList currentSection={currentSection} completedSections={completedSections} /><div className="mt-5 rounded-2xl border border-white bg-[#e7f3ec] p-4"><p className="text-sm font-semibold text-[#214f40]">You stay in control.</p><p className="mt-1 text-xs leading-relaxed text-[#537164]">This is your progress through the conversation, not a score. Change direction whenever you need.</p></div></div></aside>;
}

export function CounsellingJourneyMobile({ currentSection, completedSections, progress }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  const current = counsellingStages.find((stage) => stage.key === currentSection) ?? counsellingStages[0];
  return <details className="mb-5 overflow-hidden rounded-2xl border border-[#dce8e2] bg-[#f8fbf9] lg:hidden"><summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5"><span><span className="block text-[11px] font-bold uppercase tracking-[.14em] text-[#397967]">Counselling · Step {counsellingStages.findIndex((stage) => stage.key === current.key) + 1} of 5</span><span className="mt-1 block text-sm font-semibold text-[#203f34]">{current.label}</span></span><span className="grid h-8 w-8 place-items-center rounded-full border border-[#dce8e2] bg-white text-[#397967]"><ChevronDown aria-hidden className="h-4 w-4" /></span></summary><div className="border-t border-[#dce8e2] px-2 pb-2"><ProgressSummary currentSection={currentSection} completedSections={completedSections} progress={progress} /><StageList currentSection={currentSection} completedSections={completedSections} mobile /></div></details>;
}

export function CounsellingJourneyShell({ children, currentSection, completedSections, progress }: { children: ReactNode; currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  const [journey, setJourney] = useState<JourneyState>({ currentSection, completedSections, progress });
  return <JourneyContext.Provider value={{ journey, setJourney }}><header className="cb-counselling-header"><Logo /><span className="hidden text-right text-xs leading-relaxed text-ink-400 sm:block">Your space to think<br /><span className="text-ink-300">One step at a time</span></span></header><div className="flex min-w-0"><CounsellingJourneySidebar {...journey} /><div className="min-w-0 flex-1"><div className="cb-container pt-4 lg:hidden"><CounsellingJourneyMobile {...journey} /></div>{children}</div></div></JourneyContext.Provider>;
}
