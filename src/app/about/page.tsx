import Link from "next/link";
import { ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react";
import { LibraryReveal } from "@/components/library-motion";

export const metadata = { title: "About CareerBridge" };

const libraryLinks = [
  { title: "Career areas", detail: "See what different fields involve and the kinds of work within them.", href: "/explore", action: "Explore areas" },
  { title: "Study routes", detail: "Read about different ways to continue after Class 10 or Class 12.", href: "/pathways", action: "Browse pathways" },
  { title: "Courses and places to study", detail: "Review catalogue entries and follow up with the institution.", href: "/courses", action: "Browse courses" },
  { title: "Exams and scholarships", detail: "Understand recorded requirements, then check the official notice.", href: "/exams", action: "Browse resources" },
];

export default function AboutPage() {
  return (
    <div className="cb-container mx-auto max-w-[1440px] pb-16 pt-10 sm:pb-24 sm:pt-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,.65fr)] lg:items-end">
        <div className="min-w-0">
          <h1 className="max-w-[12ch] text-[clamp(2.25rem,8vw,7.5rem)] font-semibold leading-[.9] tracking-[-.065em] text-[#17201b]">
            Explore before you decide.
          </h1>
          <p className="mt-7 max-w-[62ch] text-lg leading-relaxed text-[#34463c] sm:text-xl">
            CareerBridge is a general library for students in Nagaland to understand career areas, study routes and education options at their own pace.
          </p>
          <Link href="/explore" className="cb-button cb-button-primary mt-7 px-5 py-3 text-sm">
            Browse the Explore Library <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        <LibraryReveal className="bg-[#09332a] p-6 text-white sm:p-8">
          <Compass aria-hidden="true" className="h-7 w-7 text-[#f2cf78]" />
          <h2 className="mt-6 text-2xl font-semibold leading-tight tracking-[-.04em] text-white">A place to look around, without a prescribed answer.</h2>
          <p className="mt-4 text-sm leading-relaxed text-[#e3ece7]">
            Browse pages are not personalized recommendations. Counselling and My Guidance are separate experiences for students who choose to use them.
          </p>
        </LibraryReveal>
      </section>

      <section className="mt-20 grid gap-10 bg-[#dde4df] p-6 sm:p-9 lg:grid-cols-[.7fr_1.3fr]">
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-[#09332a]">What you can explore</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.045em]">Start with a question. Follow the connections.</h2>
        </div>
        <div className="space-y-2">
          {libraryLinks.map((item) => (
            <LibraryReveal key={item.title}>
              <Link href={item.href} className="group grid gap-3 bg-[#f7f8f5] p-4 transition-colors hover:bg-white sm:grid-cols-[minmax(180px,.55fr)_1fr_auto] sm:items-center sm:p-5">
                <span className="text-lg font-semibold text-[#17201b]">{item.title}</span>
                <span className="max-w-[55ch] text-sm leading-relaxed text-[#405349]">{item.detail}</span>
                <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#09332a]">
                  {item.action}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </LibraryReveal>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-10 bg-[#dde4df] p-6 sm:p-9 lg:grid-cols-[.7fr_1.3fr]">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-[#09332a]"><ShieldCheck aria-hidden="true" className="h-5 w-5" /> Read information with care</p>
          <h2 className="mt-4 max-w-[14ch] text-3xl font-semibold leading-tight tracking-[-.045em] text-[#17201b]">Useful information should show its limits.</h2>
        </div>
        <div className="space-y-5 text-base leading-relaxed text-[#263a30]">
          <p>CareerBridge is a prototype catalogue. Some entries may be incomplete, sample information, or not recently checked.</p>
          <p>Dates, fees, eligibility and availability can change. Follow the source links and confirm current details with the relevant school, college, exam body or scheme provider.</p>
          <p>CareerBridge helps you explore. It does not promise admission, a job or a particular outcome, and it does not make the decision for you.</p>
          <Link href="/how-it-works" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
            See how browsing works <BookOpen aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
