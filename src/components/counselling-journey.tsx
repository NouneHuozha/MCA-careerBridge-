import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Circle, LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

export type CounsellingStageKey = "about" | "interests" | "strengths" | "goals" | "practical" | "reflection";

type CounsellingStage = {
  key: CounsellingStageKey;
  label: string;
  detail: string;
  editKey?: string;
};

export const counsellingStages: CounsellingStage[] = [
  { key: "about", label: "About you", detail: "Subjects and study stage", editKey: "subjects_enjoy" },
  { key: "interests", label: "What interests you", detail: "Notice what pulls you", editKey: "interests" },
  { key: "strengths", label: "What you bring", detail: "Strengths and working style", editKey: "strengths" },
  { key: "goals", label: "What matters to you", detail: "Goals and career values", editKey: "goals" },
  { key: "practical", label: "Practical realities", detail: "Location and course fees", editKey: "location_pref" },
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
        <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${done ? "border-[#46b7a1] bg-[#46b7a1] text-white" : active ? "border-[#7256df] bg-[#7256df] text-white" : "border-[#b7c8d3] bg-[#f4f8fa] text-[#9aabb7]"}`}>
          {done ? <Check className="h-4 w-4" strokeWidth={3} /> : active ? <span className="h-2 w-2 rounded-full bg-white" /> : <Circle className="h-3 w-3" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-semibold ${active ? "text-[#5b43be]" : done ? "text-ink-800" : "text-ink-500"}`}>{stage.label}</span>
          <span className="mt-1 block text-xs leading-relaxed text-ink-500">{active ? "You are here" : done ? "Completed · Edit answers" : index === currentIndex + 1 ? "Up next" : stage.detail}</span>
        </span>
        {!done && !active && <LockKeyhole aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-[#a6b6c0]" />}
      </>;
      return <li key={stage.key} className={`relative flex gap-3 ${mobile ? "rounded-xl px-2 py-2" : "min-h-[78px]"} ${active ? "bg-[#e8e5ff]" : ""}`}>
        {!mobile && index < counsellingStages.length - 1 && <span aria-hidden className={`absolute left-[15px] top-8 h-[62px] w-px ${index < currentIndex || done ? "bg-[#46b7a1]" : "bg-[#c7d9e2]"}`} />}
        {available ? <Link href={`/counselling?edit=${stage.editKey}`} className="flex min-w-0 flex-1 gap-3 rounded-xl px-2 py-1 hover:bg-white/70">{content}</Link> : <span className="flex min-w-0 flex-1 gap-3 rounded-xl px-2 py-1" aria-current={active ? "step" : undefined} aria-disabled={!active ? "true" : undefined}>{content}</span>}
      </li>;
    })}
  </ol>;
}

export function CounsellingJourneySidebar({ currentSection, completedSections }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[] }) {
  const current = counsellingStages.find((stage) => stage.key === currentSection) ?? counsellingStages[0];
  const currentIndex = counsellingStages.findIndex((stage) => stage.key === currentSection);
  return <aside className="hidden lg:block lg:w-[255px] lg:shrink-0" aria-label="Counselling journey progress">
    <div className="sticky top-24 min-h-[calc(100vh-7rem)] overflow-hidden border-r border-sky-200 bg-[#eaf4fb] px-6 py-8">
      <p className="text-xl font-semibold tracking-[-.03em] text-forest-900">Your journey</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">A short conversation about you.</p>
      <div className="mt-5 rounded-xl border border-sky-200 bg-white/65 px-3 py-2.5"><p className="text-xs font-bold uppercase tracking-[.14em] text-sky-ink">{current.key === "reflection" ? "Next step" : `Section ${Math.min(currentIndex + 1, 5)} of 5`}</p><p className="mt-1 text-sm font-semibold text-ink-800">{current.label}</p></div>
      <StageList currentSection={currentSection} completedSections={completedSections} />
      <div className="mt-7 rounded-2xl border border-white/80 bg-[#d9eee2] p-4"><p className="text-sm font-semibold text-forest-900">No right answer needed.</p><p className="mt-1 text-xs leading-relaxed text-forest-800">You can change an answer later or choose “Not sure yet”.</p></div>
    </div>
  </aside>;
}

export function CounsellingJourneyMobile({ currentSection, completedSections }: { currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[] }) {
  const current = counsellingStages.find((stage) => stage.key === currentSection) ?? counsellingStages[0];
  const currentIndex = counsellingStages.findIndex((stage) => stage.key === currentSection);
  return <details className="mb-5 overflow-hidden rounded-2xl border border-sky-200 bg-[#eaf4fb] lg:hidden">
    <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5"><span><span className="block text-[11px] font-bold uppercase tracking-[.14em] text-sky-ink">{current.key === "reflection" ? "Next step" : `Section ${Math.min(currentIndex + 1, 5)} of 5`}</span><span className="mt-1 block text-sm font-semibold text-ink-900">{current.label}</span></span><span className="grid h-8 w-8 place-items-center rounded-full border border-sky-200 bg-white text-sky-ink"><ChevronDown aria-hidden className="h-4 w-4" /></span></summary>
    <div className="border-t border-sky-200"><StageList currentSection={currentSection} completedSections={completedSections} mobile /></div>
  </details>;
}

export function CounsellingJourneyShell({ children, currentSection, completedSections }: { children: ReactNode; currentSection: CounsellingStageKey; completedSections: CounsellingStageKey[] }) {
  return <><header className="cb-counselling-header"><Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-forest-800"><ArrowLeft aria-hidden className="h-4 w-4" />Save &amp; see my starting points</Link><span className="text-base font-semibold tracking-[-.03em] text-forest-900">CareerBridge</span><span className="w-28 text-right text-xs text-ink-400 sm:w-36">Your space to think</span></header><div className="flex min-w-0"><CounsellingJourneySidebar currentSection={currentSection} completedSections={completedSections} /><div className="min-w-0 flex-1"><div className="cb-container pt-4 lg:hidden"><CounsellingJourneyMobile currentSection={currentSection} completedSections={completedSections} /></div>{children}</div></div></>;
}
