import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  FileText,
  GraduationCap,
  Leaf,
  Clock3,
  GitFork,
  MapPin,
  Sprout,
  Signpost,
  BriefcaseBusiness,
} from "lucide-react";
import { Eyebrow, accentSurface } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { ScrollDepth } from "@/components/scroll-depth";

export const dynamic = "force-dynamic";

const libraryLinks = [
  { href: "/explore", label: "Career areas", detail: "See what the work is like", icon: BriefcaseBusiness, accent: "mint" as const },
  { href: "/pathways", label: "Routes and pathways", detail: "Compare ways to get there", icon: MapPin, accent: "lavender" as const },
  { href: "/courses", label: "Courses", detail: "Degrees, diplomas, and trades", icon: BookOpen, accent: "mint" as const },
  { href: "/institutions", label: "Institutions", detail: "Find places to study", icon: Building2, accent: "mint" as const },
  { href: "/exams", label: "Entrance exams", detail: "Know what comes next", icon: FileText, accent: "mint" as const },
  { href: "/scholarships", label: "Scholarships", detail: "Look into study support", icon: GraduationCap, accent: "mint" as const },
];

const steps = [
  { number: "1", title: "Describe where you are", text: "Share your interests, strengths, goals, and practical priorities.", icon: Sprout },
  { number: "2", title: "Explore possibilities", text: "Compare directions, routes, courses, and institutions without ranking them.", icon: Compass },
  { number: "3", title: "Keep moving at your pace", text: "Save explorations, check requirements, and return to change your mind.", icon: Signpost },
];

export default function HomePage() {
  return <div className="bg-[#fbfaf6] text-[#18352d]">
    <section className="relative isolate min-h-[710px] overflow-visible bg-[#123f34] text-white lg:min-h-[760px]">
      <ScrollDepth><Image src="/images/SunlitModernLibraryStudyWorkspace.png" alt="A sunlit library study space with books and a laptop" fill priority sizes="100vw" className="object-cover object-center" /></ScrollDepth>
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,52,43,.97)_0%,rgba(8,52,43,.91)_30%,rgba(8,52,43,.62)_49%,rgba(8,52,43,.05)_77%),linear-gradient(0deg,rgba(8,52,43,.20),transparent_42%)]" />
      <div className="cb-container relative flex min-h-[710px] flex-col justify-center pb-36 pt-32 lg:min-h-[760px] lg:pb-40">
        <div className="max-w-[620px]">
          <h1 className="max-w-[10ch] font-serif text-[clamp(3.4rem,7vw,6.2rem)] font-semibold leading-[.94] tracking-[-.055em] text-white">Your next step starts with you.</h1>
          <p className="mt-6 max-w-[47ch] text-base leading-relaxed text-white/90 sm:text-lg">CareerBridge helps you understand what interests you, explore real possibilities, and find a next step that feels right to you.</p>
        </div>
      </div>
      <div className="cb-container relative z-10 -mt-20 translate-y-0 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:translate-y-[34%]">
        <div className="grid gap-4 rounded-[1.55rem] border border-white/80 bg-[#fffefa] p-4 shadow-[0_18px_55px_-30px_rgba(8,39,31,.42)] lg:grid-cols-2 lg:gap-5 lg:p-5">
          <article className="flex min-h-[210px] items-center gap-5 rounded-[1.15rem] border border-[#e3e2d9] bg-[#f7f7f2] p-6 sm:gap-7 sm:p-8">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e4f0e8] text-[#145543] sm:h-20 sm:w-20"><Compass aria-hidden className="h-8 w-8 sm:h-9 sm:w-9" /></span>
            <span className="min-w-0"><span className="block font-serif text-[1.4rem] font-semibold leading-tight tracking-[-.035em] text-[#172c25] sm:text-[1.65rem]">I’m not sure yet</span><span className="mt-1 block max-w-[34ch] text-sm leading-relaxed text-[#69736d] sm:text-base">Answer a few calm questions and create a starting picture you can edit later.</span><Link href="/start" className="group/button mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f2cf78] px-5 text-sm font-semibold text-[#263b2e] transition hover:bg-[#ebc45e]">Begin counselling<ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover/button:translate-x-1" /></Link></span>
          </article>
          <article className="flex min-h-[210px] items-center gap-5 rounded-[1.15rem] border border-[#e3e2d9] bg-white p-6 sm:gap-7 sm:p-8">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e4f0e8] text-[#145543] sm:h-20 sm:w-20"><BookOpen aria-hidden className="h-8 w-8 sm:h-9 sm:w-9" /></span>
            <span className="min-w-0"><span className="block font-serif text-[1.4rem] font-semibold leading-tight tracking-[-.035em] text-[#172c25] sm:text-[1.65rem]">I already have something in mind</span><span className="mt-1 block max-w-[34ch] text-sm leading-relaxed text-[#69736d] sm:text-base">Browse career areas, routes, courses, institutions, exams, and scholarships.</span><Link href="/explore" className="group/button mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f2cf78] px-5 text-sm font-semibold text-[#263b2e] transition hover:bg-[#ebc45e]">Explore on your own<ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover/button:translate-x-1" /></Link></span>
          </article>
        </div>
      </div>
    </section>

    <Reveal repeat><section className="cb-container pb-8 pt-40 sm:pt-44 lg:pt-40" aria-label="A supportive way to explore">
      <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-4 border-b border-[#dddcd4] pb-9 text-sm text-[#59665e] sm:gap-x-12">
        <span className="inline-flex items-center gap-2"><Leaf aria-hidden className="h-5 w-5 text-[#145543]" />No right answer required</span><span aria-hidden className="hidden h-5 w-px bg-[#cccfc6] sm:block" />
        <span className="inline-flex items-center gap-2"><Clock3 aria-hidden className="h-5 w-5 text-[#145543]" />Go at your own pace</span><span aria-hidden className="hidden h-5 w-px bg-[#cccfc6] sm:block" />
        <span className="inline-flex items-center gap-2"><GitFork aria-hidden className="h-5 w-5 text-[#145543]" />Change direction later</span>
      </div>
    </section></Reveal>

    <Reveal repeat><section className="cb-container pb-16 pt-12 sm:pb-20 sm:pt-16" aria-labelledby="how-title">
      <div className="max-w-3xl"><Eyebrow>A calmer way forward</Eyebrow><h2 id="how-title" className="mt-3 font-serif text-[clamp(2.8rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-.055em] text-[#102d26]">Guide, don’t decide.</h2><p className="mt-5 max-w-2xl text-base leading-relaxed text-[#354b40] sm:text-lg">The best choice is one you understand. CareerBridge gives you context, options, and room to think before you take the next step.</p></div>
      <div className="relative mt-14">
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-[42px] w-full md:block" viewBox="0 0 1200 42" preserveAspectRatio="none">
          <path d="M8 22 H376 C390 22 392 39 408 39 C424 39 426 22 442 22 H758 C774 22 776 39 792 39 C808 39 810 22 826 22 H1192" fill="none" stroke="#24614f" strokeWidth="1.6" />
          <path d="M8 22 V28 M1192 22 V28" fill="none" stroke="#24614f" strokeWidth="1.6" />
        </svg>
        <div className="grid gap-5 md:grid-cols-3 md:gap-0">{steps.map((step, index) => <article key={step.number} className={`relative min-h-[190px] border border-[#dddcd4] bg-transparent px-6 pb-7 pt-9 sm:px-8 md:border-t-0 md:pt-[2.4rem] ${index === 0 ? "md:rounded-bl-[1rem] md:rounded-tl-[1rem]" : "md:border-l-0"} ${index === steps.length - 1 ? "md:rounded-br-[1rem] md:rounded-tr-[1rem]" : ""}`}>
          <span className="absolute left-[13%] top-[-1rem] z-20 grid h-10 w-10 place-items-center rounded-full bg-[#145543] text-base font-semibold text-white md:left-[13%] md:top-[2px]">{step.number}</span>
          <div className="flex items-center gap-5 md:pt-0"><span className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full bg-[#e7f1e9] text-[#145543]"><step.icon aria-hidden className="h-9 w-9" /></span><div><h3 className="font-serif text-xl font-semibold leading-tight tracking-[-.03em] text-[#18372e]">{step.title}</h3><p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-[#646e68]">{step.text}</p></div></div>
        </article>)}</div>
      </div>
    </section></Reveal>

    <Reveal repeat><section className="cb-container pb-12 pt-4 sm:pb-14" aria-labelledby="library-title">
      <div><h2 id="library-title" className="font-serif text-[clamp(2rem,3.6vw,2.8rem)] font-semibold tracking-[-.045em] text-[#102d26]">Explore Library</h2><p className="mt-1 text-[#606b65]">Browse general information even before you complete counselling.</p></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{libraryLinks.map((item) => <Link href={item.href} key={item.href} className="group flex min-h-[94px] items-center gap-5 rounded-xl border border-[#ddded6] bg-transparent px-5 py-4 transition hover:border-[#8eae9b] hover:bg-white/60"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${accentSurface[item.accent]}`}><item.icon aria-hidden className="h-6 w-6" /></span><span className="min-w-0"><span className="block font-serif text-lg font-semibold text-[#18372e]">{item.label}</span><span className="block text-sm text-[#68736d]">{item.detail}</span></span><ArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-[#145543] transition-transform group-hover:translate-x-1" /></Link>)}</div>
    </section></Reveal>
  </div>;
}
