import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, FileCheck2, HeartHandshake, Lightbulb, LockKeyhole, MapPin, Route, ShieldCheck, UserRound } from "lucide-react";
import { ButtonLink, Eyebrow } from "@/components/ui";

export const metadata = { title: "About" };

const railItems = [
  { label: "Start here", detail: "Begin your journey", href: "/start", icon: Compass },
  { label: "Tell us about you", detail: "Your interests and strengths", href: "/start", icon: UserRound },
  { label: "See possibilities", detail: "Careers and pathways", href: "/explore", icon: Route },
  { label: "Make a plan", detail: "Your next steps", href: "/action-plan", icon: FileCheck2 },
];

const promises = [
  { title: "Built for curious students", text: "Ask questions, explore paths, and discover what fits you. No pressure, just progress.", icon: Lightbulb, tone: "bg-[#edf8f4] text-[#1f8068]" },
  { title: "Information with sources", text: "We show key information with official sources so you can trust what you see.", icon: ShieldCheck, tone: "bg-[#f1edff] text-[#7054b2]" },
  { title: "Your choice stays yours", text: "We guide and inform—you decide what’s right for your future.", icon: UserRound, tone: "bg-[#eaf8f2] text-[#1b8068]" },
];

const beliefs = [
  { title: "Guide, don’t decide", text: "We give you the right information, not orders.", icon: HeartHandshake },
  { title: "Start where you are", text: "Every small step today moves you forward.", icon: MapPin },
  { title: "Keep options open", text: "Many paths can lead to a meaningful future.", icon: Route },
  { title: "Check official sources", text: "We link to trusted, official websites you can verify.", icon: FileCheck2 },
];

export default function AboutPage() {
  return <div className="min-h-screen bg-white lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="hidden border-r border-[#dce9f5] bg-[#eff6ff] lg:flex lg:min-h-[calc(100vh-5rem)] lg:flex-col lg:justify-between lg:p-7 xl:p-9">
      <div><Image src="/images/logo.png" alt="CareerBridge Nagaland" width={210} height={74} className="h-auto w-[185px]" /><p className="mt-5 max-w-[150px] text-sm leading-relaxed text-[#46627a]">Explore today.<br />A brighter tomorrow.</p><nav aria-label="About page journey" className="mt-16 space-y-4">{railItems.map(({ label, detail, href, icon: Icon }) => <Link key={label} href={href} className="group flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/70"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#315776] shadow-sm group-hover:text-forest-700"><Icon className="h-5 w-5" /></span><span><span className="block text-sm font-semibold text-[#183b59]">{label}</span><span className="mt-1 block text-xs text-[#6b7e8e]">{detail}</span></span></Link>)}</nav></div>
      <div><div className="relative -mx-9 mb-6 h-32 overflow-hidden bg-[#dcecf7]"><Image src="/images/nagaland-hills.jpg" alt="Nagaland landscape" fill className="object-cover opacity-80" sizes="250px" /></div><p className="text-sm leading-relaxed text-[#46627a]">For Nagaland’s<br />tomorrow.</p><p className="mt-5 text-[11px] text-[#7890a2]">Students&nbsp; · &nbsp;Communities&nbsp; · &nbsp;Opportunities</p></div>
    </aside>

    <main className="min-w-0 overflow-hidden">
      <section className="cb-container relative pb-8 pt-12 sm:pb-10 sm:pt-16"><div aria-hidden className="pointer-events-none absolute -right-16 top-6 h-72 w-72 rounded-full bg-[#eef6ff] blur-3xl" /><div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]"><div><Eyebrow>About CareerBridge</Eyebrow><div className="mt-3 h-0.5 w-16 bg-[#287559]" /><h1 className="mt-7 max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-[#073c32] sm:text-6xl">For students building<br className="hidden sm:block" /> their own direction.</h1><p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">CareerBridge helps students in Nagaland explore education and career possibilities with clearer information.</p></div><div className="relative min-h-[280px] overflow-hidden rounded-[45%_45%_38%_38%] bg-[#eaf5ff] sm:min-h-[380px]"><Image src="/images/nagaland-hills.jpg" alt="A bright landscape representing futures in Nagaland" fill className="object-cover scale-110" sizes="(min-width: 1024px) 45vw, 100vw" /><div className="absolute inset-0 bg-gradient-to-t from-[#d9ecf5]/20 to-transparent" /></div></div>
        <div className="relative -mt-4 grid gap-4 md:grid-cols-3 lg:-mt-2">{promises.map(({ title, text, icon: Icon, tone }) => <article key={title} className="relative rounded-2xl border border-ink-100 bg-white p-6 shadow-[0_12px_30px_-25px_#234e4255]"><div className={`grid h-12 w-12 place-items-center rounded-full ${tone}`}><Icon className="h-6 w-6" /></div><h2 className="mt-5 max-w-[12ch] text-xl font-semibold leading-tight text-[#123f38]">{title}</h2><div className="mt-3 h-0.5 w-10 bg-[#b9d8cc]" /><p className="mt-4 text-sm leading-relaxed text-ink-600">{text}</p></article>)}</div>
      </section>

      <section className="cb-container pb-10 pt-3 sm:pb-14"><Eyebrow>What we believe</Eyebrow><div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{beliefs.map(({ title, text, icon: Icon }) => <article key={title} className="flex gap-3 border-b border-[#e4ece9] pb-5 xl:border-b-0 xl:border-r xl:pr-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eaf7f2] text-[#287559]"><Icon className="h-5 w-5" /></span><div><h2 className="font-semibold text-[#123f38]">{title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p></div></article>)}</div><div className="mt-9 flex flex-wrap items-center gap-5"><ButtonLink href="/start" size="lg">Start exploring <ArrowRight className="h-4 w-4" /></ButtonLink><Link href="/how-it-works" className="cb-source text-base">How it works <ArrowRight className="h-4 w-4" /></Link></div></section>

      <section className="cb-container pb-12 sm:pb-16"><div className="grid gap-5 rounded-2xl border border-[#dceee8] bg-[#f5fbf9] p-5 sm:grid-cols-[1.1fr_0.9fr] sm:p-7"><div className="flex gap-4 sm:border-r sm:border-[#c9ddd8] sm:pr-7"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-forest-700 shadow-sm"><ShieldCheck className="h-6 w-6" /></span><div><h2 className="font-semibold text-[#123f38]">Your privacy. Our promise.</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">Your information stays private and secure. We never share it without your consent.</p></div></div><div className="flex gap-4 sm:pl-2"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-forest-700 shadow-sm"><LockKeyhole className="h-6 w-6" /></span><div><h2 className="font-semibold text-[#123f38]">Information verified from official sources</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">Time-sensitive details are labelled and linked so you can check them yourself.</p></div></div></div><div className="mt-8 grid gap-5 md:grid-cols-2"><article className="rounded-2xl border border-ink-200 bg-white p-6"><div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-forest-700" /><h2 className="font-semibold text-[#123f38]">What CareerBridge is not</h2></div><p className="mt-3 text-sm leading-relaxed text-ink-500">It is not a prediction system, admission agent, or promise of a seat. It does not rank students or publish facts it cannot source.</p></article><article className="rounded-2xl border border-ink-200 bg-white p-6"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-forest-700" /><h2 className="font-semibold text-[#123f38]">Different backgrounds. One shared future.</h2></div><p className="mt-3 text-sm leading-relaxed text-ink-500">CareerBridge starts in Nagaland and presents degree, diploma, vocational and trade routes as legitimate options.</p></article></div></section>
    </main>
  </div>;
}
