"use client";

import Link from "next/link";
import { Check, ChevronDown, Circle, LockKeyhole } from "lucide-react";
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { Logo } from "@/components/logo";

export type CounsellingStageKey = "about" | "interests" | "strengths" | "goals" | "practical" | "reflection";
type CounsellingStage = { key: CounsellingStageKey; label: string; detail: string; editKey?: string };
type QuestionProgress = { current: number; total: number };
type JourneyState = { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress };
type JourneyContextValue = { journey: JourneyState; setJourney: Dispatch<SetStateAction<JourneyState>> };
const JourneyContext = createContext<JourneyContextValue | null>(null);

export function useCounsellingJourney() {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useCounsellingJourney must be used inside CounsellingJourneyShell");
  return context;
}

export const counsellingStages: CounsellingStage[] = [
  { key: "about", label: "About you", detail: "Your study stage and subjects", editKey: "subjects_enjoy" },
  { key: "interests", label: "What interests you", detail: "What naturally pulls you", editKey: "interests" },
  { key: "strengths", label: "What you bring", detail: "Strengths and working style", editKey: "strengths" },
  { key: "goals", label: "What matters to you", detail: "Goals and career values", editKey: "goals" },
  { key: "practical", label: "Practical realities", detail: "Location, fees and access", editKey: "location_pref" },
  { key: "reflection", label: "Your reflection", detail: "Review your answers" },
];

function StageList({ currentSection, completedSections, mobile = false }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; mobile?: boolean }) {
  const currentIndex = counsellingStages.findIndex((stage) => stage.key === currentSection);
  return <ol className={mobile ? "grid gap-1 p-2" : "mt-8"}>
    {counsellingStages.map((stage, index) => {
      const done = completedSections.includes(stage.key);
      const active = stage.key === currentSection;
      const available = done && Boolean(stage.editKey);
      const content = <>
        <span className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors ${done ? "border-[#36a989] bg-[#36a989] text-white" : active ? "border-[#7355d6] bg-[#7355d6] text-white shadow-[0_0_0_5px_#e8e5ff]" : "border-[#b9cbd6] bg-[#f7fbfd] text-[#98aab6]"}`}>
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : active ? <span className="h-2.5 w-2.5 rounded-full bg-white" /> : <Circle className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-semibold ${active ? "text-[#5b43be]" : done ? "text-ink-800" : "text-ink-500"}`}>{stage.label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-ink-500">{active ? (stage.key === "reflection" ? "Ready to review" : "In progress · You are here") : done ? "Completed · Edit answers" : index === currentIndex + 1 ? "Up next" : stage.detail}</span>
        </span>
        {!done && !active && <LockKeyhole aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-[#a6b6c0]" />}
      </>;
      return <li key={stage.key} className={`relative flex gap-3 ${mobile ? "rounded-xl px-2 py-2" : "min-h-[76px]"} ${active ? "rounded-xl bg-[#e8e5ff]" : ""}`}>
        {!mobile && index < counsellingStages.length - 1 && <span aria-hidden className={`absolute left-[17px] top-9 h-[58px] w-px ${index < currentIndex || done ? "bg-[#46b7a1]" : "bg-[#c7d9e2]"}`} />}
        {available ? <Link href={`/counselling?edit=${stage.editKey}`} className="flex min-w-0 flex-1 gap-3 rounded-xl px-2 py-2 hover:bg-white/70">{content}</Link> : <span className="flex min-w-0 flex-1 gap-3 rounded-xl px-2 py-2" aria-current={active ? "step" : undefined} aria-disabled={!active ? "true" : undefined}>{content}</span>}
      </li>;
    })}
  </ol>;
}

function ProgressSummary({ currentSection, completedSections, progress }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  const sectionIndex = ["about", "interests", "strengths", "goals", "practical"].indexOf(currentSection) + 1;
  const percent = currentSection === "reflection" ? 100 : Math.round((progress.current / Math.max(1, progress.total)) * 100);
  const label = currentSection === "reflection" ? "Reflection ready" : `Section ${Math.max(1, sectionIndex)} of 5`;
  return <div className="mt-6 rounded-2xl border border-[#cfe2ef] bg-white/75 p-3.5"><div className="flex items-center justify-between gap-3"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#38718e]">{label}</p><span className="text-xs font-semibold text-ink-400">{percent}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dfeaf1]"><div className="h-full rounded-full bg-[#36a989] transition-all" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs leading-relaxed text-ink-500">{currentSection === "reflection" ? "Your answers are ready to review." : `${progress.current} of ${progress.total} questions answered · ${completedSections.length} of 5 sections completed.`}</p></div>;
}

export function CounsellingJourneySidebar({ currentSection, completedSections, progress }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  return <aside className="hidden lg:block lg:w-[285px] lg:shrink-0" aria-label="Counselling journey progress"><div className="sticky top-0 min-h-[calc(100vh-4rem)] overflow-hidden border-r border-[#cfe2ef] bg-[#eaf4fb] px-6 py-8"><p className="text-xl font-semibold tracking-[-.03em] text-forest-900">Your journey</p><p className="mt-2 max-w-[205px] text-sm leading-relaxed text-ink-500">A short conversation about you, not a test.</p><ProgressSummary currentSection={currentSection} completedSections={completedSections} progress={progress} /><StageList currentSection={currentSection} completedSections={completedSections} /><div className="mt-5 rounded-2xl border border-white/80 bg-[#d9eee2] p-4"><p className="text-sm font-semibold text-forest-900">You stay in control.</p><p className="mt-1 text-xs leading-relaxed text-forest-800">Your answers are starting points. Change direction whenever you need.</p></div></div></aside>;
}

export function CounsellingJourneyMobile({ currentSection, completedSections, progress }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  const current = counsellingStages.find((stage) => stage.key === currentSection) ?? counsellingStages[0];
  return <details className="mb-5 overflow-hidden rounded-2xl border border-[#cfe2ef] bg-[#eaf4fb] lg:hidden"><summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5"><span><span className="block text-[11px] font-bold uppercase tracking-[.14em] text-[#38718e]">{current.key === "reflection" ? "Reflection ready" : "Your progress"}</span><span className="mt-1 block text-sm font-semibold text-ink-900">{current.label}</span></span><span className="grid h-8 w-8 place-items-center rounded-full border border-[#cfe2ef] bg-white text-sky-ink"><ChevronDown aria-hidden className="h-4 w-4" /></span></summary><div className="border-t border-[#cfe2ef] px-2 pb-2"><ProgressSummary currentSection={currentSection} completedSections={completedSections} progress={progress} /><StageList currentSection={currentSection} completedSections={completedSections} mobile /></div></details>;
}

export function CounsellingJourneyShell({ children, currentSection, completedSections, progress }: { children: ReactNode; currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[]; progress: QuestionProgress }) {
  const [journey, setJourney] = useState<JourneyState>({ currentSection, completedSections, progress });
  return <JourneyContext.Provider value={{ journey, setJourney }}><header className="cb-counselling-header"><Logo /><span className="hidden text-right text-xs leading-relaxed text-ink-400 sm:block">Your space to think<br /><span className="text-ink-300">One step at a time</span></span></header><div className="flex min-w-0"><CounsellingJourneySidebar {...journey} /><div className="min-w-0 flex-1"><div className="cb-container pt-4 lg:hidden"><CounsellingJourneyMobile {...journey} /></div>{children}</div></div></JourneyContext.Provider>;
}
