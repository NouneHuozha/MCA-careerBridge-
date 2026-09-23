import Image from "next/image";
import { BulletList, ButtonLink, Callout, Card, SectionHeading } from "@/components/ui";
import { ValuesExplorer } from "./values-explorer";

export const metadata = { title: "About" };

const values = [
  { title: "Student first", detail: "Every screen is judged by one question: does this help the student make a better-informed decision?" },
  { title: "Trust and integrity", detail: "We show sources and verification dates, and we say plainly when we don't know." },
  { title: "Inclusivity", detail: "Diploma, vocational and trade routes are presented as legitimate, not as fallbacks." },
  { title: "Continuous learning", detail: "Guidance improves as data improves — and students can flag anything that looks wrong." },
];

const notList = [
  "It is not a career prediction system — it does not decide your future from your marks",
  "It is not an admission agent, and it never promises a seat",
  "It does not publish fees, deadlines or eligibility rules it cannot source",
  "It does not rank students or compare you against others",
];

const privacyList = [
  "We ask only for what guidance needs — no address, no income figures, no phone number",
  "Location is used at district or town level only",
  "Your answers are yours: edit or clear them at any time",
  "Everything you tell us is treated as student-provided information, never as verified fact",
];

export default function AboutPage() {
  return (
    <div>
      {/* Native <details> accordions need this bit of plain CSS for the chevron
          and to hide the browser's default marker — no JS, works everywhere. */}
      <style>{`
        .cb-accordion summary { list-style: none; }
        .cb-accordion summary::-webkit-details-marker { display: none; }
        .cb-accordion .cb-chevron { transition: transform 0.25s ease; }
        .cb-accordion[open] .cb-chevron { transform: rotate(180deg); }
      `}</style>

      <section className="border-b border-ink-100 bg-white">
        <div className="cb-container grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <SectionHeading
            eyebrow="About"
            title="About CareerBridge"
            description="We're here to help students in Nagaland explore, understand and plan their future with confidence — starting from where they actually are."
          />
          <div className="overflow-hidden rounded-2xl border border-ink-100">
            <Image
              src="/images/students-campus.jpg"
              alt="Students on a campus in Nagaland"
              width={900}
              height={600}
              className="h-60 w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
            />
          </div>
        </div>
      </section>

      <div className="cb-container py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Our mission</h2>
            <p className="mt-2 text-sm text-ink-500">
              To provide trusted, accessible and personalised career and education guidance for every student in
              Nagaland — regardless of district, school or background.
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">Our vision</h2>
            <p className="mt-2 text-sm text-ink-500">
              A future where every student can make informed choices and reach their full potential, having genuinely
              understood the options in front of them.
            </p>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-ink-900">What we stand for</h2>
          <p className="mt-1 text-sm text-ink-500">Select a value to read what it means in practice.</p>
          <div className="mt-4">
            <ValuesExplorer values={values} />
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <details className="cb-accordion">
              <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-6 text-base font-semibold text-ink-900 outline-none transition-colors duration-150 hover:bg-ink-100/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-900">
                What CareerBridge is not
                <svg
                  className="cb-chevron h-4 w-4 shrink-0 text-ink-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="border-t border-ink-100 px-6 pb-6 pt-4">
                <BulletList items={notList} />
              </div>
            </details>
          </Card>

          <Card className="overflow-hidden p-0">
            <details className="cb-accordion">
              <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-6 text-base font-semibold text-ink-900 outline-none transition-colors duration-150 hover:bg-ink-100/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink-900">
                Privacy for young people
                <svg
                  className="cb-chevron h-4 w-4 shrink-0 text-ink-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="border-t border-ink-100 px-6 pb-6 pt-4">
                <BulletList items={privacyList} />
              </div>
            </details>
          </Card>
        </div>

        <div className="mt-10 max-w-3xl">
          <Callout tone="forest" title="Different backgrounds. Different dreams. One shared future.">
            <p>
              CareerBridge V1 covers Nagaland. The data model already supports country → state → district → city, so
              other states can be added without rebuilding the platform.
            </p>
          </Callout>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/start">Start exploring</ButtonLink>
          <ButtonLink href="/admin" variant="secondary">
            Data &amp; verification status
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
