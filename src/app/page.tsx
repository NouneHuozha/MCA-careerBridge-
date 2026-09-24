import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  CircleHelp,
  GraduationCap,
  Map,
  MessageCircle,
  Search,
  WalletCards,
} from "lucide-react";
import { Eyebrow, SectionHeading, accentSurface } from "@/components/ui";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";

const startingPoints = [
  {
    icon: CircleHelp,
    accent: "mint" as const,
    title: "I’m not sure yet",
    text: "Start with a few calm questions about your interests, strengths and goals.",
    href: "/start",
    action: "Begin with guidance",
  },
  {
    icon: Compass,
    accent: "lavender" as const,
    title: "I have an area in mind",
    text: "Explore careers and pathways without needing to commit to one answer.",
    href: "/explore",
    action: "Explore possibilities",
  },
  {
    icon: Search,
    accent: "butter" as const,
    title: "I need something specific",
    text: "Go straight to courses, colleges, exams, scholarships or opportunities.",
    href: "/courses",
    action: "Find a route",
  },
];

const platformLinks = [
  { href: "/explore", label: "Career areas", detail: "See what the work is like", icon: Compass, accent: "mint" as const },
  { href: "/pathways", label: "Pathways", detail: "Compare ways to get there", icon: Map, accent: "lavender" as const },
  { href: "/courses", label: "Courses", detail: "Degrees, diplomas and trades", icon: GraduationCap, accent: "butter" as const },
  { href: "/institutions", label: "Schools and colleges", detail: "Find places to study", icon: Building2, accent: "sky" as const },
  { href: "/exams", label: "Entrance exams", detail: "Know what comes next", icon: BookOpen, accent: "peach" as const },
  { href: "/scholarships", label: "Scholarships", detail: "Look into study support", icon: WalletCards, accent: "mint" as const },
];

const steps = [
  { number: "01", title: "Understand yourself", text: "Start with what you enjoy, what comes naturally and what matters to you." },
  { number: "02", title: "Explore what fits", text: "Look at real career fields, routes, courses and places to study." },
  { number: "03", title: "Take one next step", text: "Save, compare, ask a question or make a small plan when you are ready." },
];

export default async function HomePage() {
  const fields = await getFields();

  return <div className="overflow-hidden">
    <section className="relative border-b border-forest-200/70 bg-[#f1f7f2]">
      <div aria-hidden className="absolute -left-40 top-10 h-[28rem] w-[28rem] rounded-full bg-mint/80 blur-3xl" />
      <div aria-hidden className="absolute right-[-12rem] top-[-12rem] h-[34rem] w-[34rem] rounded-full bg-[#dcecf7] blur-3xl" />
      <div className="cb-container relative grid min-h-[650px] items-center gap-12 py-14 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-2 lg:py-20">
        <div className="relative z-10 max-w-2xl">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[.14em] text-forest-700"><span className="h-2 w-2 rounded-full bg-[#46b7a1]" />For students in Nagaland</div>
          <h1 className="animate-rise delay-1 mt-7 max-w-[10ch] text-[clamp(3.2rem,6vw,6.6rem)] font-semibold leading-[.95] tracking-[-.07em] text-forest-900">Your next step starts with you.</h1>
          <p className="animate-rise delay-2 mt-7 max-w-[48ch] text-lg leading-relaxed text-ink-600 sm:text-xl">CareerBridge helps you understand yourself, explore real possibilities and find a route that feels right — without telling you what to choose.</p>
          <div className="animate-rise delay-3 mt-9 flex flex-wrap items-center gap-3">
            <Link href="/start" className="cb-button cb-button-primary min-h-[54px] px-6 text-base">Start with a few questions<ArrowRight aria-hidden className="h-5 w-5" /></Link>
            <Link href="/explore" className="cb-button border border-forest-300 bg-white/80 px-5 text-forest-800 hover:bg-white">Explore on your own</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-forest-500" />No right answer required</span><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#7256df]" />Go at your own pace</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[860px] lg:-mr-24 lg:scale-[1.08]">
          <div aria-hidden className="absolute left-[16%] top-[10%] h-[68%] w-[68%] rounded-[45%] bg-[#b7dcca]" />
          <div aria-hidden className="absolute bottom-[9%] right-[1%] h-28 w-28 rounded-full bg-[#f6dfa5] blur-sm" />
          <Image src="/images/home-journey-reference.png" alt="Student exploring different education and career paths" width={1671} height={941} priority className="relative z-10 w-full object-contain drop-shadow-[0_26px_30px_rgba(25,73,51,.13)]" />
          <div className="animate-float absolute bottom-[12%] left-[3%] z-20 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-xl shadow-forest-900/10 sm:p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-lavender text-lavender-ink"><Map aria-hidden className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[.12em] text-forest-700">Your route</p><p className="text-sm font-semibold text-ink-900">Can change as you learn</p></div></div></div>
        </div>
      </div>
      <div className="cb-container relative pb-8"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-forest-200/80 bg-white/70 px-4 py-3 text-sm text-ink-600"><span className="font-semibold text-forest-800">Explore with context</span><br />Not just a list of job titles.</div><div className="rounded-2xl border border-forest-200/80 bg-white/70 px-4 py-3 text-sm text-ink-600"><span className="font-semibold text-forest-800">Compare your options</span><br />See different ways forward.</div><div className="rounded-2xl border border-forest-200/80 bg-white/70 px-4 py-3 text-sm text-ink-600"><span className="font-semibold text-forest-800">Choose your next move</span><br />Small steps count too.</div></div></div>
    </section>

    <section className="cb-container py-20 sm:py-24" aria-labelledby="starting-point-title">
      <div className="flex flex-wrap items-end justify-between gap-6"><div><Eyebrow>There is no wrong place to begin</Eyebrow><h2 id="starting-point-title" className="mt-3 max-w-[18ch] text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-tight tracking-[-.05em]">Choose the kind of help you need today.</h2></div><p className="max-w-sm text-sm leading-relaxed text-ink-500">You can return, change direction and explore at your own pace. Career choices are not a one-question decision.</p></div>
      <div className="mt-10 grid gap-4 lg:grid-cols-3">{startingPoints.map((point, index) => <Link href={point.href} key={point.title} className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-ink-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-forest-300 hover:shadow-[0_20px_45px_-28px_rgba(16,56,42,.45)]"><div className={`grid h-12 w-12 place-items-center rounded-2xl ${accentSurface[point.accent]}`}><point.icon aria-hidden className="h-6 w-6" /></div><div className="mt-8"><p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-ink-400">0{index + 1}</p><h3 className="text-xl font-semibold text-ink-900">{point.title}</h3><p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-ink-500">{point.text}</p></div><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest-700">{point.action}<ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div>
    </section>

    <section className="bg-[#173f31] text-white" aria-labelledby="how-title"><div className="cb-container grid gap-12 py-20 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:py-24"><div><Eyebrow className="text-[#9be1bd]">A calmer way forward</Eyebrow><h2 id="how-title" className="mt-4 max-w-[12ch] text-[clamp(2.3rem,4vw,4rem)] font-semibold leading-[1.02] tracking-[-.06em] text-white">Guide, don’t decide.</h2><p className="mt-5 max-w-[42ch] text-base leading-relaxed text-[#c3d9cd]">The best choice is one you understand. CareerBridge gives you context, options and room to think before you take the next step.</p><Link href="/how-it-works" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#b7f0cf] underline decoration-[#5da681] underline-offset-4">See how CareerBridge works<ArrowRight aria-hidden className="h-4 w-4" /></Link></div><div className="grid gap-3 sm:grid-cols-3">{steps.map((step) => <div key={step.number} className="rounded-[1.4rem] border border-white/15 bg-white/[.07] p-5"><span className="text-sm font-bold text-[#9be1bd]">{step.number}</span><h3 className="mt-12 text-lg font-semibold text-white">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#c3d9cd]">{step.text}</p></div>)}</div></div></section>

    <section className="cb-container py-20 sm:py-24" aria-labelledby="explore-title"><div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading eyebrow="A whole platform, in one place" title="Explore what could come next." description="Start with a question, a place, a course or a career field. Follow the thread that feels useful." /><Link href="/explore" className="cb-button cb-button-secondary shrink-0">Browse everything<ArrowRight aria-hidden className="h-4 w-4" /></Link></div><div id="explore-title" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{platformLinks.map((item) => <Link href={item.href} key={item.href} className="group flex items-center gap-4 rounded-2xl border border-ink-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-forest-300 hover:bg-forest-50"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accentSurface[item.accent]}`}><item.icon aria-hidden className="h-5 w-5" /></span><span className="min-w-0"><span className="block font-semibold text-ink-900">{item.label}</span><span className="mt-1 block text-sm text-ink-500">{item.detail}</span></span><ArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-forest-600 transition-transform group-hover:translate-x-1" /></Link>)}</div></section>

    <section className="cb-container pb-20" aria-labelledby="fields-title"><div className="relative overflow-hidden rounded-[2rem] bg-[#eaf4fb] p-7 sm:p-10 lg:p-12"><div className="relative z-10 max-w-xl"><Eyebrow>Curious about a direction?</Eyebrow><h2 id="fields-title" className="mt-3 max-w-[15ch] text-[clamp(2rem,4vw,3.3rem)] font-semibold leading-tight tracking-[-.05em]">Begin with what catches your attention.</h2><p className="mt-4 max-w-[45ch] text-sm leading-relaxed text-ink-600">You do not need to know the job title. An interest, a subject or a question is enough to start exploring.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/explore" className="cb-button cb-button-primary">See all career areas<ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href="/mentor" className="cb-button border border-sky-ink/30 bg-white/75 text-sky-ink hover:bg-white"><MessageCircle aria-hidden className="h-4 w-4" />Ask Mentor</Link></div></div><Image src="/images/possibilities-landscape.png" alt="Illustration of different possibilities across the hills of Nagaland" width={1200} height={560} className="absolute bottom-0 right-[-4%] w-[54%] max-w-[680px] min-w-[330px] opacity-85 mix-blend-multiply" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{fields.slice(0, 6).map((field) => <Link href={`/explore/${field.slug}`} key={field.slug} className="cb-link-row group"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${accentSurface[fieldVisual(field.slug).accent]}`}><FieldIcon slug={field.slug} /></span><span className="text-sm font-semibold text-ink-800">{field.name}</span><ArrowRight aria-hidden className="link-arrow" /></Link>)}</div></section>
  </div>;
}
