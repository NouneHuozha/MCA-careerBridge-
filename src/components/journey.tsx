import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Compass, Leaf, Save } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export const JOURNEY_STEPS = [
  { key: "reflection", label: "Reflection" },
  { key: "direction", label: "Choose a direction" },
  { key: "understand", label: "Understand it" },
  { key: "routes", label: "Compare routes" },
  { key: "courses", label: "Explore courses" },
  { key: "institutions", label: "Find institutions" },
  { key: "practical", label: "Practical details" },
  { key: "plan", label: "Your plan" },
] as const;

export function JourneyShell({ children, current, direction }: { children: ReactNode; current: string; direction?: string }) {
  const index = JOURNEY_STEPS.findIndex((step) => step.key === current);
  const previous = index > 0 ? JOURNEY_STEPS[index - 1] : null;
  return <div className="min-h-[calc(100dvh-4rem)] bg-[#fbfcfa]">
    <header className="border-b border-[#dce9e4] bg-white/90 backdrop-blur">
      <div className="cb-container flex min-h-[76px] items-center justify-between gap-4">
        <Link href="/" aria-label="CareerBridge home"><Logo /></Link>
        <div className="hidden items-center gap-4 text-sm md:flex"><span className="font-semibold text-[#123f38]">My journey</span>{direction && <span className="rounded-full bg-[#effaf5] px-3 py-1 text-xs font-semibold text-[#28775f]">Exploring {direction}</span>}<Link href="/explore" className="text-ink-500 underline decoration-ink-300 underline-offset-4">Free Explore</Link></div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500"><Save className="h-4 w-4" />Save and return</Link>
      </div>
    </header>
    <div className="cb-container flex gap-8 py-7 lg:py-10">
      <aside className="hidden w-[220px] shrink-0 lg:block"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#28775f]">Your journey</p><ol className="mt-6 space-y-3" aria-label="Journey progress">{JOURNEY_STEPS.map((step, stepIndex) => { const done = stepIndex < index; const active = step.key === current; return <li key={step.key}><div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${active ? "bg-[#effaf5] text-[#155b4d]" : "text-ink-400"}`}><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-bold ${done ? "border-[#287d65] bg-[#287d65] text-white" : active ? "border-[#287d65] bg-white text-[#287d65]" : "border-ink-200 bg-white"}`}>{done ? <Check className="h-3.5 w-3.5" /> : stepIndex + 1}</span><span className="text-sm font-semibold">{step.label}</span></div></li> })}</ol><div className="mt-8 rounded-2xl border border-[#d2e2f4] bg-[#eff7ff] p-4"><Leaf className="h-5 w-5 text-[#2877df]" /><p className="mt-3 text-sm font-semibold text-[#194b71]">You can change your mind.</p><p className="mt-1 text-xs leading-relaxed text-ink-500">This is a starting point, not a final answer.</p></div></aside>
      <main className="min-w-0 flex-1">{previous && <Link href={previous.key === "reflection" ? "/reflection" : `/my-journey/${previous.key}`} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-500 underline decoration-ink-300 underline-offset-4"><ArrowLeft className="h-4 w-4" />Back to {previous.label.toLowerCase()}</Link>}{children}</main>
    </div>
  </div>;
}

export function JourneyIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="max-w-3xl"><p className="cb-eyebrow">{eyebrow}</p><h1 className="mt-3 text-[clamp(2.25rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-.06em] text-[#092b25]">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-600">{description}</p>{children}</header>;
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="cb-button cb-button-primary min-h-[52px] px-6">{children}<ArrowRight className="h-4 w-4" /></Link>; }
export function ChoiceCard({ title, text, href, tone = "mint", children }: { title: string; text: string; href: string; tone?: "mint" | "lavender" | "butter"; children?: ReactNode }) { const bg = tone === "lavender" ? "bg-[#f8f5ff] border-[#d9cef5]" : tone === "butter" ? "bg-[#fffaf0] border-[#f0d99a]" : "bg-[#f1fbf6] border-[#cfe8dc]"; return <Link href={href} className={`group rounded-[1.5rem] border-2 p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_35px_-28px_rgba(16,56,42,.6)] ${bg}`}><div className="flex items-start justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#287d65]">{children ?? <Compass className="h-6 w-6" />}</span><ArrowRight className="h-5 w-5 text-[#287d65] transition-transform group-hover:translate-x-1" /></div><h2 className="mt-7 text-xl font-semibold text-[#092b25]">{title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-600">{text}</p></Link>; }

export function SourceNote({ children = "Catalogue details may change. Check the official source before applying." }: { children?: ReactNode }) { return <p className="text-xs leading-relaxed text-ink-400">{children}</p>; }
