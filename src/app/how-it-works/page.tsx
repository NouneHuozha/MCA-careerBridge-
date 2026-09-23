import Image from "next/image";
import { BulletList, ButtonLink, Callout, Card, SectionHeading } from "@/components/ui";

export const metadata = { title: "How it works" };

const steps = [
  {
    n: "01",
    title: "Tell us about yourself",
    detail: "A short guided conversation about your subjects, interests, strengths, goals and practical situation. No marks required, no ranking, no test.",
  },
  {
    n: "02",
    title: "Explore possibilities",
    detail: "We surface fields and pathways that connect to what you told us — including routes students often overlook, like diplomas and trades.",
  },
  {
    n: "03",
    title: "Understand your options",
    detail: "Each field and career page explains the work, the subjects that help, the education routes, and honest challenges.",
  },
  {
    n: "04",
    title: "Compare and challenge",
    detail: "Ask 'Why this?', 'Why not?' and 'What if?'. Reject anything. Change your answers and watch the suggestions change with them.",
  },
  {
    n: "05",
    title: "Plan your next step",
    detail: "Courses, institutions, admission requirements, scholarships and skills — with sources and verification status attached.",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <section className="border-b border-ink-100 bg-white">
        <div className="cb-container grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="How CareerBridge guides you"
              description="Your future doesn't have to be figured out all at once. We help you move from uncertainty to your next informed step."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/start">Start exploring</ButtonLink>
              <ButtonLink href="/explore" variant="secondary">
                Browse without answering
              </ButtonLink>
            </div>
          </div>
 <div className="relative h-60 overflow-hidden rounded-2xl border border-ink-100 lg:h-62">
  <Image
    src="/images/nagaland-hills.jpg"
    alt=""
    fill
    className="object-cover"
    sizes="(min-width: 1024px) 45vw, 100vw"
  />
</div>
        </div>
      </section>

      <div className="cb-container py-14">
        <ol className="space-y-4">
          {steps.map((step) => (
            <li key={step.n} className="cb-card flex flex-col gap-3 p-6 sm:flex-row sm:items-start">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-forest-50 text-sm font-semibold text-forest-700">
                {step.n}
              </span>
              <div>
                <h2 className="text-base font-semibold text-ink-900">{step.title}</h2>
                <p className="mt-1 text-sm text-ink-500">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">How suggestions are formed</h2>
            <p className="mt-2 text-sm text-ink-500">
              We compare what you told us with the characteristics of each field and pathway — interests, subjects you
              enjoy, strengths, goals, values and practical constraints. Every suggestion carries the specific reasons
              behind it.
            </p>
            <div className="mt-3">
              <BulletList
                items={[
                  "No percentages, no match scores, no probability of success",
                  "No ranking of students against each other",
                  "Reasons are shown separately by factor so you can judge them",
                  "You can reject a suggestion without giving a reason",
                ]}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-ink-900">How facts are handled</h2>
            <p className="mt-2 text-sm text-ink-500">
              Guidance content is written by CareerBridge. Time-sensitive facts — fees, dates, eligibility cut-offs,
              scholarship deadlines — are shown only with a source and a verification date.
            </p>
            <div className="mt-3">
              <BulletList
                items={[
                  "Source priority: official API → official website → government portal → official notice → trusted secondary source",
                  "Unverified information is labelled, never dressed up as current",
                  "If we cannot verify something, we say so and link you to the official source",
                  "The AI mentor answers from retrieved sources, not from memory",
                ]}
              />
            </div>
          </Card>
        </div>

        <div className="mt-8 max-w-3xl">
          <Callout tone="forest" title="Real guidance. Better decisions.">
            <p>
              CareerBridge is a mentor, not an oracle. It helps you understand your options and the trade-offs between
              them. The decision — and it is a decision you are allowed to change — stays with you.
            </p>
          </Callout>
        </div>
      </div>
    </div>
  );
}
