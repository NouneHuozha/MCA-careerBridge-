import Link from "next/link";
import { ArrowRight, Bookmark, Info, LockKeyhole, Sprout, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = { title: "Your counselling journey" };

const journeySteps = [
  "Where you are now",
  "What interests you",
  "What you bring",
  "What matters to you",
  "What we understood",
];

const reassurances = [
  {
    title: "You can be unsure",
    detail: "There are no perfect answers.",
    icon: Sprout,
  },
  {
    title: "You stay in control",
    detail: "You can edit or change direction later.",
    icon: UserRound,
  },
  {
    title: "We ask only what helps",
    detail: "We do not need your exact address or family income.",
    icon: LockKeyhole,
  },
];

function SaveForLaterLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Save and return later"
      className={`inline-flex min-h-11 items-center justify-center gap-3 rounded-lg text-sm font-medium text-[#47796d] transition hover:bg-[#f0f6f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397c6e] focus-visible:ring-offset-2 ${className}`}
      title="Return to CareerBridge home. You have not entered any answers yet."
    >
      <Bookmark aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.8} />
      <span>Save and return later</span>
    </Link>
  );
}

export default function StartPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#fbfaf8] text-[#20272b]">
      <header className="flex min-h-[72px] items-center justify-between border-b border-[#e9e8e4] bg-white px-5 sm:px-8 lg:px-16">
        <Logo size="md" />
        <SaveForLaterLink className="px-2 sm:px-3" />
      </header>

      <main className="mx-auto grid w-full max-w-[1428px] gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(300px,486px)_minmax(0,1fr)] lg:gap-16 lg:px-0 lg:py-12">
        <aside
          aria-label="Counselling journey progress"
          className="self-start rounded-xl border border-[#e7e6e2] bg-white px-6 py-6 sm:px-9 sm:py-8 lg:min-h-[680px] lg:px-9 lg:py-9"
        >
          <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-[23px]">Your counselling journey</h2>
          <ol className="mt-6 sm:mt-7" aria-label="Five steps in your counselling journey">
            {journeySteps.map((step, index) => {
              const active = index === 0;
              return (
                <li key={step} className="relative flex min-h-[72px] items-start gap-5 last:min-h-0 sm:gap-7">
                  {index < journeySteps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[17px] top-[49px] h-[25px] border-l border-dashed border-[#c9d2ce] sm:left-[18px]"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative z-10 grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full border text-sm font-semibold ${active ? "border-[#397e70] bg-[#397e70] text-white" : "border-[#e1e2de] bg-white text-[#4c5354]"}`}
                  >
                    {index + 1}
                  </span>
                  <span
                    aria-current={active ? "step" : undefined}
                    className={`pt-[7px] text-[15px] sm:text-base ${active ? "font-semibold text-[#1e2729]" : "text-[#666b6c]"}`}
                  >
                    {step}
                    {active && <span className="sr-only"> — current step</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 border-t border-[#e8e8e4] pt-5 sm:mt-7 sm:pt-6">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-[#787d7c]">
              <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#858b89]" strokeWidth={1.8} />
              <span>This is your progress through the conversation, not a score.</span>
            </p>
          </div>
        </aside>

        <section className="min-w-0 self-center py-1 lg:py-0" aria-labelledby="orientation-title">
          <p className="text-base font-semibold text-[#477c70]">A short conversation about you</p>
          <h1
            id="orientation-title"
            className="mt-4 max-w-[24ch] text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-[1.09] tracking-[-0.045em] text-[#20272b]"
          >
            Let’s find a useful starting point.
          </h1>
          <p className="mt-5 max-w-[67ch] text-base leading-[1.55] text-[#606667] sm:text-lg">
            Your answers help CareerBridge show possibilities that are more relevant to you. They do not decide your future, rank you, or lock you into a path.
          </p>

          <ul className="mt-7 space-y-4" aria-label="A few things to know">
            {reassurances.map(({ title, detail, icon: Icon }) => (
              <li key={title} className="flex min-h-[106px] items-center gap-5 rounded-xl border border-[#e9e8e4] bg-white px-5 py-4 sm:px-6">
                <span aria-hidden="true" className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[#f1f5f2] text-[#477c70]">
                  <Icon className="h-7 w-7" strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block text-base font-semibold text-[#252c2e] sm:text-lg">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-[#737777] sm:text-base">{detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-8">
            <Link
              href="/start/current-position"
              className="group inline-flex min-h-[62px] items-center justify-center gap-4 rounded-xl bg-[#397e70] px-7 text-base font-semibold text-white transition hover:bg-[#2f6d61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2 sm:min-w-[270px]"
            >
              Start counselling
              <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <SaveForLaterLink className="justify-start px-2 sm:justify-center" />
          </div>
        </section>
      </main>
    </div>
  );
}
