import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, ArrowRight, BookOpen, BriefcaseBusiness, Building2, GraduationCap, Map, Search, Sparkles } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getCareers, getFields, searchEverything } from "@/services/catalog";
import kohima from "../../assets/kohima-city.jpg";
import kohimaWelcome from "../../assets/way-o-kohima-nagaland-india.jpg";
import culturalHall from "../../assets/capital-cultural-hall.jpg";
import dzukouValley from "../../assets/breathtaking-beauty-of-dzukou-valley-in-manipur.jpg";

export const metadata = { title: "Explore careers and study options" };

const discovery = [
  { href: "/careers", label: "Careers", text: "Explore what different kinds of work involve.", icon: BriefcaseBusiness },
  { href: "/pathways", label: "Study routes", text: "See more than one way to continue learning.", icon: Map },
  { href: "/courses", label: "Courses", text: "Compare streams, diplomas, degrees and trades.", icon: GraduationCap },
  { href: "/institutions", label: "Places to study", text: "Browse schools, colleges and institutes.", icon: Building2 },
  { href: "/exams", label: "Entrance exams", text: "Understand tests and find official notices.", icon: BookOpen },
  { href: "/scholarships", label: "Scholarships", text: "Explore funding schemes and what to verify.", icon: Sparkles },
];

const tones = ["bg-[#dce9e4] text-[#123c30]", "bg-[#e7e4d7] text-[#424530]", "bg-[#d8e6e7] text-[#194b4c]", "bg-[#e9dfd0] text-[#664425]"];

export default async function ExploreLibraryHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const [fields, careers] = await Promise.all([getFields(), getCareers()]);
  const results = query ? await searchEverything(query, 18) : [];

  return (
    <div className="overflow-hidden bg-[#f7f8f5]">
      <section className="relative isolate overflow-hidden bg-[#09332a] text-[#f7f8f5]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <svg viewBox="0 0 760 560" fill="none" className="absolute -right-24 top-4 hidden h-[34rem] w-[47rem] opacity-75 lg:block">
            <path d="M88 520C105 422 195 415 242 330C289 245 245 184 341 154C438 124 491 180 547 108C603 36 645 48 710 12" stroke="#6F887B" strokeWidth="2" />
            <path d="M88 520C161 484 207 437 306 433C405 429 451 376 477 307C503 238 566 246 618 197C670 148 714 139 755 145" stroke="#F2CF78" strokeWidth="2" />
            <path d="M88 520C126 376 274 370 344 298C414 226 386 169 476 111C566 53 652 74 732 26" stroke="#DDE4DF" strokeWidth="1.5" />
            {[[88,520],[242,330],[341,154],[477,307],[618,197],[710,12]].map(([cx,cy], i) => <circle key={i} cx={cx} cy={cy} r={i === 0 ? 7 : 5} fill={i % 2 ? "#F2CF78" : "#DDE4DF"} />)}
          </svg>
        </div>
        <div className="relative mx-auto flex min-h-[530px] max-w-[1440px] flex-col justify-between px-5 pb-9 pt-12 sm:px-8 sm:pt-16 lg:min-h-[620px] lg:px-12 lg:pb-12">
          <div className="max-w-[840px]">
            <h1 className="max-w-[10ch] text-[clamp(3.1rem,8.7vw,8rem)] font-semibold leading-[.9] tracking-[-.07em] text-[#f7f8f5]"><span>Explore</span><br />what&apos;s next.</h1>
            <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-[#d5ded8] sm:text-lg">Browse careers, study routes and opportunities across Nagaland. Explore freely; this library does not make personal recommendations.</p>
          </div>
          <div className="mt-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <form action="/explore" role="search" className="w-full max-w-[660px]">
              <label htmlFor="explore-query" className="sr-only">Search careers, courses and study options</label>
              <div className="flex min-h-[60px] items-center gap-3 rounded-full border border-white/35 bg-[#f7f8f5] px-4 text-[#17201b] transition-colors focus-within:border-[#f2cf78] focus-within:ring-2 focus-within:ring-[#f2cf78]/50 sm:px-5">
                <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#6f887b]" />
                <input id="explore-query" type="search" name="q" defaultValue={query} placeholder="Search careers, courses, exams…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#6f887b]" />
                <button type="submit" className="min-h-11 rounded-full bg-[#f2cf78] px-5 text-sm font-bold text-[#17201b] transition-colors hover:bg-[#e8bc50] active:bg-[#c9a020]">Search</button>
              </div>
            </form>
            <Link href="#directions" className="group inline-flex min-h-12 items-center gap-3 text-sm font-semibold text-[#f7f8f5]">
              Browse by interest
              <span className="grid h-10 w-10 place-items-center rounded-full border border-white/35 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"><ArrowDownRight aria-hidden="true" className="h-5 w-5" /></span>
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className="h-1 origin-left bg-[#f2cf78] motion-safe:animate-rise" />
      </section>

      {query ? (
        <section aria-live="polite" className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl font-semibold tracking-tight text-[#17201b]">Search results</h2><p className="mt-1 text-base text-[#17201b]">{results.length} result{results.length === 1 ? "" : "s"} for “{query}”</p></div>
            <Link href="/explore" className="text-sm font-semibold text-[#09332a] underline underline-offset-4">Clear search</Link>
          </div>
          {results.length ? (
            <ul className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result, index) => <li key={`${result.type}-${result.href}`}><Reveal delay={index * 35}><Link href={result.href} className="group flex min-h-[88px] items-start justify-between gap-4 py-4"><span><span className="block text-base font-semibold text-[#17201b] group-hover:text-[#126048]">{result.title}</span><span className="mt-1 block text-base text-[#17201b]">{result.subtitle}</span></span><span className="mt-1 shrink-0 text-sm font-semibold capitalize text-[#17201b]">{result.type}</span></Link></Reveal></li>)}
            </ul>
          ) : (
            <div className="mt-5 bg-[#e9eeea] p-6"><h3 className="text-lg font-semibold text-[#17201b]">No matches in this catalogue yet</h3><p className="mt-2 max-w-xl text-base leading-relaxed text-[#17201b]">Try a broader term such as a subject, qualification or area of work. No result here does not mean an option is unavailable elsewhere.</p></div>
          )}
        </section>
      ) : null}

      <main id="directions" className="mx-auto max-w-[1440px] px-5 pb-20 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
          <Reveal>
            <div className="max-w-[450px]">
              <h2 className="max-w-[12ch] text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[.98] tracking-[-.055em] text-[#17201b]">Choose a first direction.</h2>
              <p className="mt-5 text-base leading-relaxed text-[#17201b]">Get a feel for an area, discover the work it can lead to, and follow the connections that interest you.</p>
              <div className="mt-8 flex items-center gap-3 text-base text-[#17201b]"><Sparkles aria-hidden="true" className="h-5 w-5 shrink-0 text-[#866714]" />General information for everyone, not a personal recommendation.</div>
            </div>
          </Reveal>
          <div className="grid gap-x-8 sm:grid-cols-2">
            {fields.slice(0, 4).map((field, index) => <Reveal key={field.slug} delay={index * 70}><Link href={`/explore/${field.slug}`} className={`group relative flex min-h-[220px] flex-col justify-between overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[260px] ${tones[index % tones.length]} ${index === 0 ? "sm:col-span-2 sm:min-h-[300px]" : ""}`}><span className="relative max-w-[17ch] text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{field.name}</span><span className="relative flex items-center justify-between gap-5 pt-4 text-base font-medium"><span className="max-w-[38ch] text-current">{field.tagline ?? "Discover careers, courses and ways to learn more."}</span><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 transition-transform group-hover:rotate-[-45deg]"><ArrowRight aria-hidden="true" className="h-4 w-4" /></span></span></Link></Reveal>)}
          </div>
        </div>

        <section className="mt-24 bg-[#e6eeea] px-5 py-10 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6"><div className="max-w-xl"><h2 className="text-3xl font-semibold tracking-tight text-[#17201b]">Choose a way in</h2><p className="mt-2 text-base leading-relaxed text-[#17201b]">Move from a broad idea to useful details, or start with the information you already have in mind.</p></div><p className="text-base text-[#17201b]">{fields.length} areas · {careers.length} career profiles in this prototype catalogue</p></div>
          <div className="mt-6 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {discovery.map(({ href, label, text, icon: Icon }, index) => <Reveal key={href} delay={index * 45}><Link href={href} className="group flex min-h-[130px] items-start gap-4 py-5 transition-transform hover:translate-x-1"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d4e2db] text-[#09332a] transition-transform group-hover:rotate-[-8deg]"><Icon aria-hidden="true" className="h-5 w-5" /></span><span className="flex-1"><span className="block text-lg font-semibold text-[#17201b]">{label}</span><span className="mt-1 block text-base leading-relaxed text-[#17201b]">{text}</span></span><ArrowRight aria-hidden="true" className="mt-1 h-4 w-4 text-[#36544a] transition-transform group-hover:translate-x-1" /></Link></Reveal>)}
          </div>
        </section>

        <section className="mt-24 grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-start">
          <div className="max-w-[360px]">
            <h2 className="text-3xl font-semibold tracking-tight text-[#17201b]">Grounded in Nagaland.</h2>
            <p className="mt-3 text-base leading-relaxed text-[#17201b]">These photographs show places in the region, not schools or services affiliated with CareerBridge.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="sm:col-span-2">
              <Image src={kohima} alt="Hillside homes across Kohima city" sizes="(max-width: 640px) 100vw, 75vw" className="h-64 w-full object-cover sm:h-[370px]" />
              <figcaption className="mt-2 text-sm leading-relaxed text-[#17201b]">Kohima City by PP Yoonus, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">CC BY-SA 3.0</a> via <a href="https://commons.wikimedia.org/wiki/File:Kohima_City.jpeg" target="_blank" rel="noreferrer" className="underline underline-offset-2">Wikimedia Commons</a>.</figcaption>
            </figure>
            <figure>
              <Image src={kohimaWelcome} alt="A forested road passes beneath a welcome gate near Kohima" sizes="(max-width: 640px) 100vw, 37vw" className="h-48 w-full object-cover sm:h-56" />
              <figcaption className="mt-2 text-sm leading-relaxed text-[#17201b]">“Way o Kohima, Nagaland India” by Jackpluto, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">CC BY-SA 3.0</a> via <a href="https://commons.wikimedia.org/w/index.php?curid=15417422" target="_blank" rel="noreferrer" className="underline underline-offset-2">Wikimedia Commons</a>.</figcaption>
            </figure>
            <figure>
              <Image src={culturalHall} alt="Capital Cultural Hall illuminated at night in Kohima" sizes="(max-width: 640px) 100vw, 37vw" className="h-48 w-full object-cover sm:h-56" />
              <figcaption className="mt-2 text-sm leading-relaxed text-[#17201b]">Capital Cultural Hall by The Anonymous Earthling, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">CC BY-SA 4.0</a> via <a href="https://commons.wikimedia.org/wiki/File:Capital_Cultural_Hall.jpg" target="_blank" rel="noreferrer" className="underline underline-offset-2">Wikimedia Commons</a>.</figcaption>
            </figure>
            <figure className="sm:col-span-2">
              <Image src={dzukouValley} alt="Green hills in Dzukou Valley on the Manipur–Nagaland border" sizes="(max-width: 640px) 100vw, 75vw" className="h-52 w-full object-cover sm:h-72" />
              <figcaption className="mt-2 text-sm leading-relaxed text-[#17201b]">“Breathtaking beauty of Dzukou Valley” by Samudra Bikash Hazarika and UnpetitproleX, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer" className="underline underline-offset-2">CC BY-SA 4.0</a> via <a href="https://commons.wikimedia.org/wiki/File:Breathtaking_beauty_of_Dzukou_Valley_in_Manipur-Nagaland_border_(edit).jpg" target="_blank" rel="noreferrer" className="underline underline-offset-2">Wikimedia Commons</a>.</figcaption>
            </figure>
          </div>
        </section>

        <section className="mt-24 grid gap-6 bg-[#e9eeea] px-6 py-8 sm:grid-cols-[1fr_auto] sm:items-center sm:px-9">
          <div><h2 className="text-2xl font-semibold tracking-tight text-[#17201b]">Want to talk it through?</h2><p className="mt-2 max-w-[60ch] text-base leading-relaxed text-[#17201b]">Browsing is open and general. If you would like a more personal conversation, counselling is a separate choice.</p></div>
          <Link href="/start" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#09332a] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#126048]">Learn about counselling <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </section>
      </main>
    </div>
  );
}
