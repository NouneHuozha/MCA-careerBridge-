import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Leaf, Save, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export const JOURNEY_STEPS = [
  { key: "reflection", label: "What we heard", detail: "Your starting point" },
  { key: "direction", label: "Choose a direction", detail: "What to explore first" },
  { key: "understand", label: "Understand it", detail: "Learn the basics" },
  { key: "routes", label: "Compare routes", detail: "Different ways forward" },
  { key: "courses", label: "Explore courses", detail: "Build a shortlist" },
  { key: "institutions", label: "Find institutions", detail: "Where you could study" },
  { key: "practical", label: "Practical details", detail: "Check before acting" },
  { key: "plan", label: "Your next steps", detail: "Keep moving gently" },
] as const;

type StepKey = (typeof JOURNEY_STEPS)[number]["key"];

export function JourneyShell({ children, current, direction }: { children: ReactNode; current: StepKey; direction?: string }) {
  const index = JOURNEY_STEPS.findIndex((step) => step.key === current);
  const previous = index > 0 ? JOURNEY_STEPS[index - 1] : null;
  return <div className="min-h-screen bg-[#f8fbfd] text-[#16382e]">
    <header className="border-b border-[#dce6e8] bg-white">
      <div className="flex min-h-[70px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Logo />
        <div className="hidden items-center gap-6 text-sm text-[#557067] md:flex"><span>Explore today. A brighter tomorrow.</span>{direction && <span className="border-l border-[#dce6e8] pl-6 font-semibold text-[#1d634b]">Exploring {direction}</span>}</div>
        <div className="flex items-center gap-3"><Link href="/explore" className="hidden text-sm font-semibold text-[#557067] underline decoration-[#b6c6c0] underline-offset-4 sm:inline">Free Explore</Link><Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-[#dce6e8] bg-white px-3 py-2 text-xs font-semibold text-[#557067] transition hover:border-[#72aa91]"><Save className="h-4 w-4" />Save and return</Link></div>
      </div>
      <div className="border-t border-[#edf1f1] bg-[#fbfdfd] px-5 py-3 lg:hidden"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[.13em] text-[#28775f]">Step {index + 1} of {JOURNEY_STEPS.length}</span><span className="text-sm font-semibold text-[#16382e]">{JOURNEY_STEPS[index]?.label}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#dfe9eb]"><div className="h-full rounded-full bg-[#765bdd] transition-all duration-300" style={{ width: `${((index + 1) / JOURNEY_STEPS.length) * 100}%` }} /></div></div>
    </header>
    <div className="grid lg:grid-cols-[255px_minmax(0,1fr)]">
      <aside className="hidden min-h-[calc(100vh-70px)] border-r border-[#dce6e8] bg-[#eaf3fa] lg:flex lg:flex-col lg:justify-between lg:px-6 lg:py-9"><div><p className="text-[1.25rem] font-semibold tracking-[-.03em] text-[#123f38]">Your journey</p><p className="mt-1 text-sm leading-relaxed text-[#6d817d]">Explore. Learn. Build your tomorrow.</p><ol className="mt-8 space-y-1" aria-label="Journey progress">{JOURNEY_STEPS.map((step, stepIndex) => { const done = stepIndex < index; const active = step.key === current; return <li key={step.key}><Link href={step.key === "reflection" ? "/reflection" : step.key === "direction" ? "/my-journey/direction" : `/my-journey/${step.key}`} className={`group flex items-start gap-3 rounded-xl px-2 py-2.5 transition ${active ? "bg-[#e8e1f8]" : "hover:bg-white/60"}`}><span className="relative flex h-9 w-7 shrink-0 justify-center"><span className={`z-10 grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold ${done ? "border-[#2a9c7c] bg-[#2a9c7c] text-white" : active ? "border-[#765bdd] bg-[#765bdd] text-white" : "border-[#c7d6db] bg-[#f8fbfd] text-[#83959a]"}`}>{done ? <Check className="h-3.5 w-3.5" /> : stepIndex + 1}</span>{stepIndex < JOURNEY_STEPS.length - 1 && <span aria-hidden className={`absolute left-1/2 top-7 h-7 w-px -translate-x-1/2 ${done ? "bg-[#54b392]" : "bg-[#c7d6db]"}`} />}</span><span className="min-w-0 pt-0.5"><span className={`block text-sm font-semibold ${active ? "text-[#5c45b7]" : done ? "text-[#275f50]" : "text-[#526b68]"}`}>{step.label}</span><span className="mt-0.5 block text-xs text-[#809391]">{active ? "You are here" : done ? "Completed" : step.detail}</span></span></Link></li> })}</ol></div><div className="relative -mx-6 mt-8 overflow-hidden px-6 pb-1 pt-16"><Image src="/images/nagaland-hills.jpg" alt="" fill className="object-cover object-center opacity-40" /><div className="absolute inset-0 bg-gradient-to-t from-[#bad8c7] via-[#dcecf4]/80 to-transparent" /><div className="relative"><p className="text-sm font-semibold text-[#24584b]">Same roots. Brighter tomorrow.</p><p className="mt-1 text-xs text-[#52766a]">For the students of Nagaland</p></div></div></aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">{previous && <Link href={previous.key === "reflection" ? "/reflection" : previous.key === "direction" ? "/my-journey/direction" : `/my-journey/${previous.key}`} className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[#557067] underline decoration-[#b6c6c0] underline-offset-4"><ArrowLeft className="h-4 w-4" />Back to {previous.label.toLowerCase()}</Link>}{children}</main>
    </div>
  </div>;
}

export function JourneyIntro({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) { return <header className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#765bdd]">{eyebrow}</p><h1 className="mt-3 max-w-4xl text-[clamp(2.25rem,5vw,4.8rem)] font-semibold leading-[1.02] tracking-[-.065em] text-[#092b25]">{title}</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#60766e]">{description}</p>{children}</header>; }

export function StoryBanner({ image = "/images/possibilities-landscape.png", kicker = "Many paths. A brighter you.", text = "Your next step can start small.", tone = "mint" }: { image?: string; kicker?: string; text?: string; tone?: "mint" | "blue" | "lavender" }) { const bg = tone === "blue" ? "bg-[#e8f4fb]" : tone === "lavender" ? "bg-[#f0edff]" : "bg-[#e9f8f1]"; return <div className={`relative mt-8 min-h-[205px] overflow-hidden rounded-[1.6rem] ${bg}`}><div className="absolute inset-y-0 right-0 w-[58%] sm:w-[52%]"><Image src={image} alt="" fill sizes="600px" className="object-cover object-center" /></div><div className="relative z-10 max-w-[48%] p-6 sm:p-8"><p className="text-xl font-semibold leading-tight text-[#123f38] sm:text-2xl">{kicker}</p><span className="mt-3 block h-0.5 w-10 bg-[#3fa786]" /><p className="mt-3 text-sm leading-relaxed text-[#527067]">{text}</p></div></div>; }

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="cb-button cb-button-primary min-h-[52px] rounded-xl px-6">{children}<ArrowRight className="h-4 w-4" /></Link>; }
export function QuietLink({ href, children }: { href: string; children: ReactNode }) { return <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#246f5a] underline decoration-[#9bcdb9] underline-offset-4">{children}<ChevronRight className="h-4 w-4" /></Link>; }
export function SourceNote({ children = "Catalogue details may change. Check the official source before applying." }: { children?: ReactNode }) { return <p className="text-xs leading-relaxed text-[#82928e]">{children}</p>; }

export function SoftCard({ children, tone = "white", className = "" }: { children: ReactNode; tone?: "white" | "mint" | "lavender" | "blue" | "butter"; className?: string }) { const tones = { white: "border-[#dce7e5] bg-white", mint: "border-[#cfe8dc] bg-[#effaf5]", lavender: "border-[#ded6f6] bg-[#f8f5ff]", blue: "border-[#d5e7f3] bg-[#eff7ff]", butter: "border-[#f0d99a] bg-[#fffaf0]" }; return <section className={`rounded-[1.5rem] border p-6 shadow-[0_16px_40px_-35px_rgba(18,63,56,.6)] sm:p-8 ${tones[tone]} ${className}`}>{children}</section>; }

export function DetailPill({ icon = <Sparkles className="h-4 w-4" />, children }: { icon?: ReactNode; children: ReactNode }) { return <span className="inline-flex items-center gap-2 rounded-full border border-[#dce7e5] bg-white px-3 py-1.5 text-xs font-semibold text-[#4e6d63]">{icon}{children}</span>; }
