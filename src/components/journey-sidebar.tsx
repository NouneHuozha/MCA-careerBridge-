import Link from "next/link";
import type { ReactNode } from "react";
import { Check, Circle } from "lucide-react";

type JourneyStep = { label: string; detail: string; href: string };
const steps: JourneyStep[] = [
  { label: "About you", detail: "Start here", href: "/start" },
  { label: "Your interests", detail: "Notice what pulls you", href: "/counselling?edit=interests" },
  { label: "Your strengths", detail: "See what you bring", href: "/counselling?edit=strengths" },
  { label: "Summary", detail: "Review your answers", href: "/profile" },
  { label: "Your possibilities", detail: "Next", href: "/explore" },
  { label: "Next steps", detail: "Coming soon", href: "/action-plan" },
];

export function JourneySidebar({ current = 0 }: { current?: number }) {
  return (
    <aside className="hidden lg:block lg:w-[245px] lg:shrink-0" aria-label="Your journey progress">
      <div className="sticky top-24 min-h-[calc(100vh-7rem)] overflow-hidden rounded-none border-r border-sky-200 bg-[#eaf4fb] px-6 py-8">
        <p className="text-xl font-semibold tracking-[-.03em] text-forest-900">Your journey</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">Explore. Learn. Build your tomorrow.</p>
        <ol className="mt-8">
          {steps.map((step, index) => {
            const done = index < current;
            const active = index === current;
            return (
              <li key={step.label} className="relative flex min-h-[74px] gap-3">
                {index < steps.length - 1 && <span aria-hidden className={`absolute left-[15px] top-8 h-[58px] w-px ${index < current ? "bg-[#46b7a1]" : "bg-[#b7d7df]"}`} />}
                <span className={`relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${done ? "border-[#46b7a1] bg-[#46b7a1] text-white" : active ? "border-[#7256df] bg-[#7256df] text-white" : "border-[#a9b8c6] bg-[#f1f5f7] text-transparent"}`}>
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : active ? <span className="h-2 w-2 rounded-full bg-white" /> : <Circle className="h-3 w-3 text-[#a9b8c6]" />}
                </span>
                <Link href={step.href} className={`-mt-0.5 block rounded-lg px-2 py-1 ${active ? "bg-[#e8e5ff] text-[#5b43be]" : "text-ink-800 hover:bg-white/70"}`} aria-current={active ? "step" : undefined}>
                  <span className="block text-sm font-semibold">{index + 1}. {step.label}</span>
                  <span className="mt-1 block text-xs text-ink-500">{active ? "You are here" : done ? "Completed" : step.detail}</span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="relative mt-10 -mx-6 min-h-[170px] overflow-hidden bg-[#a9d5bd] px-6 py-8">
          <div aria-hidden className="absolute -bottom-10 -left-5 h-32 w-56 rounded-[50%] bg-[#8bc2a5]" />
          <div aria-hidden className="absolute bottom-0 right-3 h-24 w-20 rounded-t-[80%] bg-[#5d987b]" />
          <p className="relative max-w-[150px] font-serif text-xl italic leading-tight text-forest-900">Same roots.<br />Brighter tomorrows.</p>
          <p className="relative mt-5 text-xs font-semibold text-forest-800">For the students of Nagaland</p>
        </div>
      </div>
    </aside>
  );
}

export function JourneyMobile({ current = 0 }: { current?: number }) {
  return <div className="mb-5 overflow-x-auto rounded-2xl border border-sky-200 bg-[#eaf4fb] p-3 lg:hidden"><div className="flex min-w-max items-center gap-2">{steps.map((step, index) => <Link key={step.label} href={step.href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${index === current ? "bg-[#e8e5ff] text-[#5b43be]" : "bg-white/70 text-ink-600"}`}><span className={`grid h-6 w-6 place-items-center rounded-full ${index < current ? "bg-[#46b7a1] text-white" : index === current ? "bg-[#7256df] text-white" : "bg-white text-ink-400"}`}>{index < current ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>{step.label}</Link>)}</div></div>;
}

export const journeySteps = steps;

const detailSteps: JourneyStep[] = [
  { label: "Student stage", detail: "Class 10 · Nagaland", href: "/start" },
  { label: "Personal profile", detail: "Who you are", href: "/profile" },
  { label: "Interests & strengths", detail: "What drives you", href: "/counselling?edit=interests" },
  { label: "Goals & constraints", detail: "What matters to you", href: "/counselling?edit=goals" },
  { label: "Summary", detail: "Your personalised report", href: "/profile" },
];

export function DetailJourneySidebar({ current = 4 }: { current?: number }) {
  return <aside className="hidden lg:block lg:w-[245px] lg:shrink-0" aria-label="Your journey progress"><div className="sticky top-24 min-h-[calc(100vh-7rem)] overflow-hidden rounded-none border-r border-sky-200 bg-[#eaf4fb] px-6 py-8"><p className="text-xl font-semibold tracking-[-.03em] text-forest-900">Your journey</p><ol className="mt-8">{detailSteps.map((step, index) => { const done = index < current; const active = index === current; return <li key={step.label} className="relative flex min-h-[82px] gap-3">{index < detailSteps.length - 1 && <span aria-hidden className={`absolute left-[15px] top-8 h-[66px] w-px ${index < current ? "bg-[#7caee9]" : "bg-[#c4d7e8]"}`} />}<span className={`relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm ${active ? "border-[#2877df] bg-[#2877df] text-white" : done ? "border-[#6a9cdf] bg-[#edf5ff] text-[#4f7fbe]" : "border-[#cad9e7] bg-white text-ink-500"}`}>{index + 1}</span><Link href={step.href} className={`-mt-0.5 block rounded-lg px-2 py-1 ${active ? "bg-white/70 text-ink-900" : "text-ink-800 hover:bg-white/70"}`} aria-current={active ? "step" : undefined}><span className="block text-sm font-semibold">{step.label}</span><span className="mt-1 block text-xs text-ink-500">{step.detail}</span></Link></li>; })}</ol><div className="relative mt-14 -mx-6 min-h-[220px] overflow-hidden bg-[#cbdff2] px-8 py-8"><div aria-hidden className="absolute -bottom-20 -left-10 h-40 w-72 rounded-[50%] bg-[#9fbedb]" /><div aria-hidden className="absolute bottom-0 right-5 h-28 w-24 rounded-t-[80%] bg-[#7fa3c3]" /><p className="relative max-w-[170px] text-base leading-relaxed text-[#46627a]">Greater futures<br />for a stronger Nagaland</p></div></div></aside>;
}

export function DetailJourneyShell({ children, current = 4 }: { children: ReactNode; current?: number }) {
  return <div className="flex min-w-0"><DetailJourneySidebar current={current} /><div className="min-w-0 flex-1">{children}</div></div>;
}

export function JourneyShell({ children, current = 0 }: { children: ReactNode; current?: number }) {
  return <div className="flex min-w-0"><JourneySidebar current={current} /><div className="min-w-0 flex-1"><div className="cb-container py-5 lg:hidden"><JourneyMobile current={current} /></div>{children}</div></div>;
}
