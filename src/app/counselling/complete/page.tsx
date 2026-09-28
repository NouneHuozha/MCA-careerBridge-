import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PostCounsellingHeader } from "@/components/post-counselling-header";
import { questionsForStage } from "@/data/counselling";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your answers are ready to review" };

function TransitionIllustration() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 520 320"
      className="mx-auto block h-auto w-full max-w-[430px]"
    >
      <ellipse cx="265" cy="256" rx="174" ry="35" fill="#e9e8db" opacity=".58" />
      <path d="M115 205c-27-25-36-54-31-83 27 14 45 40 43 69 12-34 34-50 59-57-4 29-22 55-53 70 32-13 59-11 82 1-21 19-51 27-86 19" fill="#4d7668" opacity=".86" />
      <path d="M127 218c-15-31-26-61-37-92m36 80 39-53m-49 31 45-6" fill="none" stroke="#315f53" strokeLinecap="round" strokeWidth="3" />
      <g transform="rotate(5 273 169)">
        <rect x="167" y="61" width="207" height="214" rx="9" fill="#687e74" />
        <rect x="149" y="54" width="207" height="214" rx="9" fill="#eee5d4" />
      </g>
      <g transform="rotate(-4 285 157)">
        <rect x="194" y="43" width="207" height="220" rx="9" fill="#d5c8b4" opacity=".72" />
        <rect x="180" y="35" width="207" height="220" rx="9" fill="#fffdf6" stroke="#e4dfd2" strokeWidth="2" />
        <path d="M222 83h117M222 95h80" stroke="#b5b8a9" strokeLinecap="round" strokeWidth="4" />
        <circle cx="228" cy="130" r="6" fill="#6e8c7c" />
        <path d="M247 128h99m-99 11h74" stroke="#c2c4b8" strokeLinecap="round" strokeWidth="4" />
        <circle cx="228" cy="171" r="6" fill="#6e8c7c" />
        <path d="M247 169h103m-103 11h64" stroke="#c2c4b8" strokeLinecap="round" strokeWidth="4" />
        <circle cx="228" cy="212" r="6" fill="#6e8c7c" />
        <path d="M247 210h88" stroke="#c2c4b8" strokeLinecap="round" strokeWidth="4" />
      </g>
      <path d="M394 101c31 7 52 25 62 53-26 4-49-4-65-24 8 25 3 48-10 66-15-22-18-49-6-78" fill="#aab7a0" opacity=".48" />
    </svg>
  );
}

export default async function CounsellingCompletePage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const lastAnsweredQuestion = questionsForStage(state.stage)
    .filter((question) => state.snapshot.answeredKeys.includes(question.key))
    .at(-1);
  const editHref = lastAnsweredQuestion
    ? `/counselling?edit=${encodeURIComponent(lastAnsweredQuestion.key)}&returnTo=%2Fcounselling%2Fcomplete`
    : "/counselling";

  return (
    <div className="min-h-screen bg-[#fbfaf4] text-[#243b32]">
      <PostCounsellingHeader />
      <div className="px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:pt-[4.25rem]">
        <section aria-labelledby="completion-title" className="mx-auto flex max-w-[900px] flex-col items-center text-center">
          <h1
            id="completion-title"
            className="max-w-full font-serif text-[clamp(2.25rem,5vw,3.8rem)] leading-[1.08] tracking-[-.045em] text-[#202522]"
          >
            We’ve finished getting to know you
          </h1>
          <p className="mt-4 max-w-[720px] font-serif text-[clamp(1.1rem,2vw,1.45rem)] leading-[1.42] text-[#454740]">
            Before we explore possible directions, let’s look at what you shared and make sure we understood you correctly.
          </p>
          <p className="mt-4 text-sm text-[#74766d] sm:text-base">
            This is a starting point, not a final judgement.
          </p>

          <div className="mt-5 w-full" aria-hidden="true">
            <TransitionIllustration />
          </div>

          <div className="mt-2 flex w-full max-w-[430px] flex-col items-center">
            <Link
              href="/reflection"
              className="inline-flex min-h-[58px] w-full items-center justify-center gap-2 rounded-xl bg-[#286b61] px-6 py-4 text-center font-serif text-[1.15rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#1f5b53] focus-visible:outline-offset-4"
            >
              Review what we understood
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href={editHref}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-[15px] font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42]"
            >
              I need to change something first
            </Link>
          </div>

          <div className="mt-7 w-full max-w-[500px] border-t border-[#e5e2d8] pt-5">
            <p className="font-serif text-[15px] text-[#77786f]">You can change your answers later.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
