import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Bookmark, Building2, ChevronDown, Compass, Flag, GraduationCap, History, Map, MapPin, Route } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";
import type { Stage } from "@/data/counselling";

const steps = [
  { href: "/reflection", label: "My starting point", icon: Compass },
  { href: "/my-journey/direction", label: "Possibility map", icon: Map },
  { href: "/my-journey/routes", label: "Routes", icon: Route },
  { href: "/my-journey/courses", label: "Courses", icon: GraduationCap },
  { href: "/my-journey/institutions", label: "Institutions", icon: Building2 },
  { href: "/my-journey/practical", label: "Practical details", icon: BookOpen },
  { href: "/my-journey/plan", label: "My plan", icon: Flag },
];

export function stageLabel(stage: Stage) {
  return stage === "class10" ? "Class 10" : "Class 12";
}

function initials(name: string | null, email: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "Guest";
  return source.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function StepLinks() {
  return <ol className="space-y-1.5">{steps.map(({ href, label, icon: Icon }, index) => <li key={href}>
    <Link href={href} aria-current={index === 0 ? "page" : undefined} className={`flex min-h-[46px] items-center gap-3 rounded-xl px-3 text-sm transition ${index === 0 ? "bg-[#eae6fa] font-semibold text-[#293954]" : "text-[#344a44] hover:bg-white/75"}`}>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${index === 0 ? "text-[#644cc8]" : "text-[#536a62]"}`}><Icon aria-hidden className="h-5 w-5" strokeWidth={1.8} /></span>{label}
    </Link>
  </li>)}</ol>;
}

export function StartingPointShell({ children, stage, studentName, studentEmail, signedIn }: {
  children: ReactNode; stage: Stage; studentName: string | null; studentEmail: string | null; signedIn: boolean;
}) {
  const stageName = stageLabel(stage);
  return <div className="min-h-screen bg-[#fbfcfd] text-[#18342d]">
    <header className="sticky top-0 z-40 border-b border-[#dfe5e7] bg-white">
      <div className="flex min-h-[70px] items-center gap-5 px-4 sm:px-7 lg:px-8">
        <div className="shrink-0 [&_a]:gap-2 [&_img]:h-9 [&_img]:w-9 [&_img]:rounded-lg [&_img]:object-contain [&_span]:text-[19px]"><Logo /></div>
        <span aria-hidden className="hidden h-8 w-px bg-[#e5e9eb] md:block" />
        <p className="hidden min-w-0 flex-1 truncate text-sm text-[#52635e] md:block">Explore today. A brighter tomorrow.</p>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-4">
          <Link href="/my-journey/plan" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[#33453f] transition hover:bg-[#f5f7f8] sm:px-3" aria-label="Open your journey plan"><History aria-hidden className="h-5 w-5" /><span className="hidden sm:inline">History</span></Link>
          <span aria-hidden className="hidden h-8 w-px bg-[#e5e9eb] sm:block" />
          <Link href="/" title="Your progress is saved as you go. Return to the homepage." className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[#33453f] transition hover:bg-[#f5f7f8] sm:px-3"><Bookmark aria-hidden className="h-5 w-5" /><span className="hidden sm:inline">Save and return</span></Link>
          <span aria-hidden className="hidden h-8 w-px bg-[#e5e9eb] sm:block" />
          <details className="group relative">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-1.5 transition hover:bg-[#f5f7f8] sm:gap-3 sm:px-2">
              <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8f4ef] text-sm font-medium text-[#23493d]">{initials(studentName, studentEmail)}</span>
              <span className="hidden min-w-0 text-left sm:block"><span className="block max-w-28 truncate text-sm font-medium text-[#273c35]">{signedIn ? studentName?.trim().split(/\s+/)[0] || "Student" : "Guest"}</span><span className="block text-xs text-[#6d7d78]">{stageName} · early exploration</span></span>
              <ChevronDown aria-hidden className="h-4 w-4 text-[#536660] transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-xl border border-[#dfe7e4] bg-white p-2 shadow-lg shadow-[#18342d]/10"><p className="px-3 py-2 text-xs text-[#71817c]">{signedIn ? studentEmail : "Your progress is saved on this device."}</p><Link href={signedIn ? "/profile" : "/sign-in"} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#29483d] hover:bg-[#f3f8f5]">{signedIn ? "Review my profile" : "Sign in to keep progress"}</Link></div>
          </details>
        </div>
      </div>
    </header>
    <div className="grid min-h-[calc(100vh-70px)] lg:grid-cols-[304px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#dfe5e7] bg-[#f0f5fb] px-5 py-9 lg:flex lg:flex-col">
        <div><h2 className="text-[19px] font-semibold tracking-[-.025em] text-[#183c32]">Your exploration</h2><p className="mt-1 text-sm text-[#687874]">Find what fits. Plan for your next step.</p></div>
        <nav aria-label="Journey sections" className="mt-8"><StepLinks /></nav>
        <div className="mt-8 rounded-2xl border border-[#d8e4ee] bg-[#e7f1fb] p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d6e9fa] text-[#2877c8]"><Compass aria-hidden className="h-4 w-4" /></span><h3 className="mt-3 text-sm font-semibold text-[#2c5272]">You’re on the right path</h3><p className="mt-1 text-xs leading-relaxed text-[#617c91]">Keep exploring at your own pace. Small steps lead to clarity.</p><Link href="/how-it-works" className="mt-3 inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-[#286fae] underline decoration-[#94b9d7] underline-offset-4">How exploration works<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></div>
        <div className="mt-auto flex items-center gap-3 border-t border-[#d8e3e8] pt-6 text-[#40564f]"><MapPin aria-hidden className="h-5 w-5 shrink-0" /><span><span className="block text-sm font-medium">Nagaland</span><span className="block text-xs text-[#71817c]">{stageName}</span></span><ChevronDown aria-hidden className="ml-auto h-4 w-4" /></div>
      </aside>
      <main className="min-w-0">
        <div className="border-b border-[#e5eaec] bg-[#f7f9fa] px-4 py-3 lg:hidden"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#24473d]">My starting point</p><span className="text-xs text-[#71817c]">{stageName} · early exploration</span></div><nav aria-label="Journey sections" className="mt-2 flex gap-2 overflow-x-auto pb-1">{steps.map(({ href, label }, index) => <Link key={href} href={href} aria-current={index === 0 ? "page" : undefined} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${index === 0 ? "border-[#c9bee9] bg-[#eeeafd] text-[#5845a2]" : "border-[#dce5e5] bg-white text-[#536660]"}`}>{label}</Link>)}</nav></div>
        <div className="px-4 py-6 sm:px-7 lg:px-8 lg:py-7 xl:px-10">{children}</div>
      </main>
    </div>
  </div>;
}

export function ReflectionHero({ children }: { children: ReactNode }) {
  return <section className="relative mt-5 grid min-h-[176px] overflow-hidden rounded-xl border border-[#dfe9e8] bg-[#f2f8f7] sm:min-h-[190px] sm:grid-cols-[1.15fr_.85fr]"><div className="relative z-10 flex items-center px-5 py-5 sm:px-8 sm:py-7">{children}</div><div className="relative hidden min-h-[176px] sm:block"><Image src="/images/hero-student.png" alt="A student reflecting on their interests and next steps" fill priority sizes="(max-width: 1024px) 42vw, 34vw" className="object-cover object-[60%_42%]" /><div aria-hidden className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#f2f8f7] to-transparent" /></div></section>;
}

export function StageBadge({ stage }: { stage: Stage }) {
  return <span className="inline-flex rounded-lg bg-[#e6f3ed] px-3 py-1.5 text-xs font-medium text-[#3b7057]">{stageLabel(stage)} · early exploration</span>;
}

export function AnswerTag({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "blue" | "yellow" }) {
  const styles = { green: "bg-[#e7f4ed] text-[#3f7059]", blue: "bg-[#edf3fb] text-[#436e96]", yellow: "bg-[#fff6df] text-[#856e2b]" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[tone]}`}>{children}</span>;
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#087b5b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#05684e] focus-visible:outline-offset-3">{children}<ArrowRight aria-hidden className="h-4 w-4" /></Link>;
}

export function SecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cbd4d6] bg-white px-4 py-2.5 text-sm font-semibold text-[#334b43] transition hover:border-[#9daead] hover:bg-[#f7f9f9] focus-visible:outline-offset-3">{children}</Link>;
}

export function SummaryCard({ children }: { children: ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-[#e1e6e8] bg-white p-4 sm:p-5">{children}</section>;
}

export function OpenQuestionCard({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-[#e2e0ec] bg-[#f6f4fb] p-3.5">{children}</div>;
}

export function QuestionLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#6550be] underline decoration-[#c6bbee] underline-offset-4">{children}<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link>;
}

export function TagRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return <h2 className="flex items-center gap-2 text-sm font-semibold text-[#31463f]">{children}</h2>;
}

export function GuidanceTag({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-[#fff6df] px-2.5 py-1 text-[10px] font-medium text-[#856e2b]">{children}</span>;
}

export function OpenTag() {
  return <span className="rounded-full bg-[#f0edff] px-2.5 py-1 text-[10px] font-medium text-[#6550be]">Still to explore</span>;
}

export function SourceTag() {
  return <span className="rounded-full bg-[#e7f4ed] px-2.5 py-1 text-[10px] font-medium text-[#3f7059]">Based on your answers</span>;
}

export function ReflectionDisclosure({ children }: { children: ReactNode }) {
  return <details className="mt-4 rounded-xl border border-[#e1e6e8] bg-white"><summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-3 px-4 py-3 sm:px-5"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef5f2] text-[#3e6557]"><BookOpen aria-hidden className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#31463f]">Because you shared, we adjusted…</span><span className="block text-xs text-[#71817c]">We refined your suggestions to better match your answers and preferences.</span></span><ChevronDown aria-hidden className="h-4 w-4 text-[#536660]" /></summary><div className="border-t border-[#e8ecec] px-4 py-4 text-sm leading-relaxed text-[#64756f] sm:px-5">{children}</div></details>;
}
