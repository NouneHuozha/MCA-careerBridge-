import Link from "next/link";
import { ArrowRight, Bookmark, LockKeyhole, Sprout, UserRound } from "lucide-react";
import { CounsellingJourneyMap, CounsellingStartHeader } from "@/components/counselling-start-shell";

type StartParams = { counsellingSaved?: string };

export const metadata = { title: "Your counselling journey" };

const reassurances = [
  { title: "You can be unsure", detail: "There are no perfect answers.", icon: Sprout },
  { title: "You stay in control", detail: "You can edit or change direction later.", icon: UserRound },
  { title: "We ask only what helps", detail: "We do not need your exact address or family income.", icon: LockKeyhole },
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

export default async function StartPage({ searchParams }: { searchParams: Promise<StartParams> }) {
  const params = await searchParams;
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#fbfaf8] text-[#20272b]">
      <CounsellingStartHeader rightControl={<SaveForLaterLink className="px-2 sm:px-3" />} />
      <main className="mx-auto grid w-full max-w-[1428px] gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(300px,486px)_minmax(0,1fr)] lg:gap-16 lg:px-0 lg:py-12">
        <CounsellingJourneyMap activeStep={0} variant="orientation" />
        <section className="min-w-0 self-center py-1 lg:py-0" aria-labelledby="orientation-title">
          {params.counsellingSaved === "1" && (
            <p role="status" className="mb-5 rounded-xl border border-[#cfe4d8] bg-[#edf7f0] px-4 py-3 text-sm font-medium text-[#286b61]">
              Your counselling progress has been saved. You can return whenever you’re ready.
            </p>
          )}
          <p className="text-base font-semibold text-[#477c70]">A short conversation about you</p>
          <h1 id="orientation-title" className="mt-4 max-w-[24ch] text-[clamp(2.25rem,4vw,3.25rem)] font-semibold leading-[1.09] tracking-[-0.045em] text-[#20272b]">
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
