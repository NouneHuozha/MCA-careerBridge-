import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Clock3,
  FileText,
  GitFork,
  GraduationCap,
  Leaf,
  Map,
  Sprout,
  BriefcaseBusiness,
  WalletCards,
} from "lucide-react";
import { Eyebrow, accentSurface } from "@/components/ui";
import { getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";

const libraryLinks = [
  { href: "/explore", label: "Career areas", detail: "See what the work is like", icon: BriefcaseBusiness },
  { href: "/pathways", label: "Routes and pathways", detail: "Compare ways to get there", icon: Map },
  { href: "/courses", label: "Courses", detail: "Degrees, diplomas, and trades", icon: BookOpen },
  { href: "/institutions", label: "Institutions", detail: "Find places to study", icon: Building2 },
  { href: "/exams", label: "Entrance exams", detail: "Know what comes next", icon: FileText },
  { href: "/scholarships", label: "Scholarships", detail: "Look into study support", icon: GraduationCap },
];

const steps = [
  { number: "1", title: "Describe where you are", text: "Share your interests, strengths, goals, and practical priorities.", icon: Sprout },
  { number: "2", title: "Explore possibilities", text: "Compare directions, routes, courses, and institutions without ranking them.", icon: Compass },
  { number: "3", title: "Keep moving at your pace", text: "Save explorations, check requirements, and return to change your mind.", icon: GitFork },
];

export default async function HomePage() {
  const fields = await getFields();

  return <main className="bg-[#fbfaf6]">
    <section className="relative isolate min-h-[620px] overflow-visible bg-[#123f34] text-white lg:min-h-[650px]">
      <Image src="/images/SunlitModernLibraryStudyWorkspace.png" alt="A sunlit library study space with books and a laptop" fill priority sizes="100vw" className="absolute inset-0 -z-20 object-cover object-center" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,52,43,.98)_0%,rgba(8,52,43,.93)_27%,rgba(8,52,43,.62)_48%,rgba(8,52,43,.08)_75%),linear-gradient(0deg,rgba(8,52,43,.35),transparent_45%)]" />
      <div className="cb-container relative flex min-h-[620px] flex-col justify-center pb-36 pt-16 lg:min-h-[650px] lg:pb-40">
        <div className="max-w-[650px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[.15em] text-white/90 backdrop-blur-sm"><span className="h-2 w-2 rounded-full bg-[#edc96d]" />For students in Nagaland</div>
          <h1 className="mt-7 max-w-[11ch] font-serif text-[clamp(3.3rem,7vw,6.4rem)] font-semibold leading-[.94] tracking-[-.055em] text-white">Your next step starts with you.</h1>
          <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-white/85 sm:text-lg">CareerBridge helps you understand what interests you, explore real possibilities, and find a next step that feels right to you.</p>
        </div>
      </div>
      <div className="cb-container absolute inset-x-0 bottom-0 translate-y-[38%] sm:translate-y-[40%] lg:translate-y-[35%]">
        <div className="grid gap-3 rounded-[1.65rem] border border-white/80 bg-[#fffefa] p-3 shadow-[0_22px_70px_-30px_rgba(8,39,31,.45)] sm:grid-cols-2 sm:gap-4 sm:p-4">
          <Link href="/start" className="group flex min-h-[190px] items-center gap-4 rounded-[1.2rem] border border-[#e5e4dc] bg-[#f7f7f2] p-5 transition hover:border-[#7da792] hover:bg-[#f1f6ef] sm:gap-6 sm:p-7">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e4f0e8] text-[#145543] sm:h-20 sm:w-20"><Compass aria-hidden className="h-8 w-8 sm:h-9 sm:w-9" /></span>
            <span className="min-w-0"><span className="block font-serif text-[1.45rem] font-semibold leading-tight tracking-[-.035em] text-[#172c25] sm:text-[1.7rem]">I’m not sure yet</span><span className="mt-1 block max-w-[34ch] text-sm leading-relaxed text-[#66716b] sm:text-base">Answer a few calm questions and create a starting picture you can edit later.</span><span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f2cf78] px-5 text-sm font-semibold text-[#263b2e] transition group-hover:bg-[#ebc45e]">Begin counselling<ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></span>
          </Link>
          <Link href="/explore" className="group flex min-h-[190px] items-center gap-4 rounded-[1.2rem] border border-[#e5e4dc] bg-white p-5 transition hover:border-[#7da792] hover:bg-[#fbfdf9] sm:gap-6 sm:p-7">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e4f0e8] text-[#145543] sm:h-20 sm:w-20"><BookOpen aria-hidden className="h-8 w-8 sm:h-9 sm:w-9" /></span>
            <span className="min-w-0"><span className="block font-serif text-[1.45rem] font-semibold leading-tight tracking-[-.035em] text-[#172c25] sm:text-[1.7rem]">I already have something in mind</span><span className="mt-1 block max-w-[34ch] text-sm leading-relaxed text-[#66716b] sm:text-base">Browse career areas, routes, courses, institutions, exams, and scholarships.</span><span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f2cf78] px-5 text-sm font-semibold text-[#263b2e] transition group-hover:bg-[#ebc45e]">Explore on your own<ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span></span>
          </Link>
        </div>
      </div>
    </section>

    <section className="cb-container pb-10 pt-36 sm:pt-40 lg:pt-36" aria-label="A supportive way to explore">
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 border-b border-[#dddcd4] pb-8 text-sm text-[#59665e] sm:gap-x-9">
        <span className="inline-flex items-center gap-2"><Leaf aria-hidden className="h-5 w-5 text-[#145543]" />No right answer required</span><span aria-hidden className="hidden h-5 w-px bg-[#cccfc6] sm:block" />
        <span className="inline-flex items-center gap-2"><Clock3 aria-hidden className="h-5 w-5 text-[#145543]" />Go at your own pace</span><span aria-hidden className="hidden h-5 w-px bg-[#cccfc6] sm:block" />
        <span className="inline-flex items-center gap-2"><GitFork aria-hidden className="h-5 w-5 text-[#145543]" />Change direction later</span>
      </div>
    </section>

    <section className="cb-container pb-16 pt-10 sm:pb-20" aria-labelledby="how-title">
      <div className="max-w-3xl"><Eyebrow>A calmer way forward</Eyebrow><h2 id="how-title" className="mt-2 font-serif text-[clamp(2.6rem,5vw,4.3rem)] font-semibold leading-[1.02] tracking-[-.055em] text-[#102d26]">Guide, don’t decide.</h2><p className="mt-3 max-w-2xl text-base leading-relaxed text-[#4c5b53] sm:text-lg">The best choice is one you understand. CareerBridge gives you context, options, and room to think before you take the next step.</p></div>
      <div className="mt-9 grid gap-3 md:grid-cols-3">{steps.map((step) => <article key={step.number} className="relative rounded-[1.25rem] border border-[#d9d9d0] bg-[#fffefa] p-5 pt-7 sm:p-6 sm:pt-8"><span className="absolute -top-4 left-6 grid h-9 w-9 place-items-center rounded-full bg-[#145543] text-sm font-bold text-white">{step.number}</span><div className="flex items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e7f1e9] text-[#145543]"><step.icon aria-hidden className="h-8 w-8" /></span><div><h3 className="font-serif text-xl font-semibold leading-tight text-[#18372e]">{step.title}</h3><p className="mt-1.5 text-sm leading-relaxed text-[#657069]">{step.text}</p></div></div></article>)}</div>
    </section>

    <section className="cb-container pb-20 sm:pb-24" aria-labelledby="library-title">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><Eyebrow>Browse at your own pace</Eyebrow><h2 id="library-title" className="mt-2 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-.045em] text-[#102d26]">Explore Library</h2><p className="mt-1 text-[#657069]">Browse general information even before you complete counselling.</p></div><Link href="/explore" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#145543] hover:text-[#0b382e]">Explore all<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
      <div className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{libraryLinks.map((item, index) => <Link href={item.href} key={item.href} className="group flex min-h-[82px] items-center gap-4 rounded-xl border border-[#ddded6] bg-[#fffefa] px-4 py-3 transition hover:-translate-y-0.5 hover:border-[#8eae9b] hover:shadow-[0_10px_26px_-20px_rgba(17,66,50,.45)]"><span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${accentSurface[["mint", "lavender", "butter", "sky", "peach", "mint"][index] as keyof typeof accentSurface]}`}><item.icon aria-hidden className="h-6 w-6" /></span><span className="min-w-0"><span className="block font-serif text-lg font-semibold text-[#18372e]">{item.label}</span><span className="block text-sm text-[#68736d]">{item.detail}</span></span><ArrowRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-[#145543] transition-transform group-hover:translate-x-1" /></Link>)}</div>
      {fields.length > 0 && <div className="mt-8 border-t border-[#deded6] pt-6"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#4d6e5b]">Start with an area that interests you</p><div className="mt-3 flex flex-wrap gap-2">{fields.slice(0, 6).map((field) => <Link href={`/explore/${field.slug}`} key={field.slug} className="rounded-full border border-[#d8dfd6] bg-white px-4 py-2 text-sm font-medium text-[#345448] transition hover:border-[#8eae9b] hover:bg-[#edf5ee]">{field.name}<span className="sr-only"> explore career area</span></Link>)}</div></div>}
    </section>
  </main>;
}
