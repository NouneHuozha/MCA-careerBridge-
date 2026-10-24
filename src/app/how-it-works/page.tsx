import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass, Search } from "lucide-react";
import { LibraryReveal } from "@/components/library-motion";

export const metadata = { title: "How the Explore Library works" };

const stages = [
  {
    title: "Browse a subject",
    body: "Start with a career area, or go directly to careers, pathways, courses, institutions, exams, scholarships or opportunities.",
    links: [
      { label: "Explore career areas", href: "/explore" },
      { label: "Browse the catalogue", href: "/careers" },
    ],
    icon: Compass,
  },
  {
    title: "Follow what interests you",
    body: "Detail pages connect related catalogue entries, so you can move from a career idea to routes, courses, exams and institutions.",
    links: [
      { label: "Study pathways", href: "/pathways" },
      { label: "Courses", href: "/courses" },
    ],
    icon: BookOpen,
  },
  {
    title: "Check the current source",
    body: "Use the record’s status and source links as a guide. Confirm dates, costs, eligibility and availability with the provider before acting.",
    links: [
      { label: "Entrance exams", href: "/exams" },
      { label: "Scholarships", href: "/scholarships" },
    ],
    icon: Check,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="cb-container mx-auto max-w-[1440px] pb-16 pt-10 sm:pb-24 sm:pt-16">
      <header className="grid gap-8 pb-12 sm:pb-16 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.5fr)] lg:items-end">
        <div className="min-w-0">
          <h1 className="max-w-[13ch] text-[clamp(2.25rem,8vw,7.5rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#17201b]">
            Follow your curiosity.
          </h1>
          <p className="mt-7 max-w-[62ch] text-lg leading-relaxed text-[#34463c] sm:text-xl">
            The Explore Library is for general browsing. You can read, follow links and compare options without completing a profile or choosing a career first.
          </p>
        </div>
        <form action="/explore" className="min-w-0 bg-[#dde4df] p-5 sm:p-6">
          <label htmlFor="library-search" className="flex items-center gap-2 text-sm font-semibold text-[#17201b]">
            <Search aria-hidden="true" className="h-4 w-4 text-[#09332a]" /> Search the library
          </label>
          <div className="mt-3 flex gap-2">
            <input id="library-search" name="q" type="search" placeholder="Try a subject or course" className="min-h-12 min-w-0 flex-1 border border-[#9aada3] bg-white px-3 text-sm text-[#17201b] placeholder:text-[#52635a] focus:border-[#09332a]" />
            <button type="submit" className="cb-button cb-button-primary min-h-12 px-4 text-sm">Search</button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#405349]">Or start from a catalogue below.</p>
        </form>
      </header>

      <section aria-label="How browsing works" className="space-y-3">
        {stages.map(({ title, body, links, icon: Icon }) => (
          <LibraryReveal key={title}>
            <article className="grid gap-5 bg-[#dde4df] p-5 sm:p-8 lg:grid-cols-[minmax(200px,.55fr)_1fr_minmax(190px,.55fr)] lg:items-start">
              <h2 className="flex items-start gap-3 text-2xl font-semibold leading-tight tracking-[-.04em] text-[#17201b] sm:text-3xl">
                <Icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#6f887b]" />
                {title}
              </h2>
              <p className="max-w-[65ch] text-base leading-relaxed text-[#405349]">{body}</p>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline decoration-[#6f887b] underline-offset-4 hover:decoration-[#09332a]">
                      {link.label}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          </LibraryReveal>
        ))}
      </section>

      <section className="mt-14 grid gap-8 bg-[#09332a] p-6 text-white sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h2 className="max-w-[20ch] text-2xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-3xl">There is no required order, and no single correct route.</h2>
          <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-[#e3ece7]">
            The library is a starting point. Entries can be incomplete or out of date, so confirm important details with official providers.
          </p>
        </div>
        <Link href="/explore" className="cb-button inline-flex min-h-12 items-center justify-center gap-2 bg-[#f2cf78] px-5 py-3 text-sm font-semibold text-[#17201b] transition hover:bg-[#e8bc50]">
          Open Explore <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>

      <p className="mt-7 text-sm leading-relaxed text-[#52635a]">
        Personal counselling and saved guidance are separate from general browsing. Choose them only when you want personalized support.
      </p>
    </div>
  );
}
