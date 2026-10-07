import Link from "next/link";
import { redirect } from "next/navigation";
import { Binoculars, ClipboardList, RefreshCw } from "lucide-react";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Look around before choosing · CareerBridge" };

const orientationSteps = [
  {
    title: "Look around",
    description: "See what each possibility involves.",
    Icon: Binoculars,
  },
  {
    title: "Open what interests you",
    description: "Explore one direction without committing to it.",
    Icon: ClipboardList,
  },
  {
    title: "Return or switch later",
    description: "Your saved work stays with each direction.",
    Icon: RefreshCw,
  },
];

function QuietLandscape() {
  return <svg aria-hidden="true" viewBox="0 0 1600 130" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[92px] w-full sm:h-[118px]">
    <path fill="#eaf6f0" d="M0 68 110 35l77 29 103-46 91 45 102-36 91 26 90-48 92 40 108-34 92 34 91-40 98 40 106-33 96 42 79-26 94 31v45H0Z" />
    <path fill="#d7eee4" d="m0 84 118-26 107 37 106-46 106 47 108-30 103 32 107-47 107 41 96-29 105 34 109-45 104 43 105-36 109 36v35H0Z" />
    <path fill="#c2e5d8" d="M0 103c111-26 186-28 282-7 97 20 170 12 256-12 74-21 155-19 240 2 103 26 199 30 296 5 98-25 191-26 286-2 96 24 167 25 240 6v35H0Z" />
    <path d="M1212 111h196m-177 0a22 22 0 0 1 44 0m18 0a22 22 0 0 1 44 0m18 0a22 22 0 0 1 44 0" fill="none" stroke="#76b69f" strokeWidth="7" />
    <g fill="#4f9a81">
      <path d="m75 118 17-42 17 42Zm10-26 7-20 8 20Zm-2 26h17v7H83Z" />
      <path d="m1460 118 17-44 18 44Zm10-28 7-20 8 20Zm-2 28h17v7h-17Z" />
      <path d="m1507 119 13-34 14 34Zm8-22 5-16 6 16Zm-2 22h13v6h-13Z" />
    </g>
    <g fill="#83bca5">
      <path d="m128 119 13-33 14 33Zm8-21 5-16 6 16Zm-2 21h13v6h-13Z" />
      <path d="m1402 119 13-33 14 33Zm8-21 5-16 6 16Zm-2 21h13v6h-13Z" />
    </g>
  </svg>;
}

export default async function OrientationPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  return <main className="relative isolate flex min-h-[calc(100dvh-140px)] flex-col overflow-hidden px-5 pb-32 pt-8 sm:px-8 sm:pt-10 lg:min-h-[calc(100dvh-140px)] lg:justify-center lg:pb-36 lg:pt-8">
    <section className="relative z-10 mx-auto w-full max-w-[1060px] text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#286b61] sm:text-xs">You do not have to choose yet</p>
      <h1 className="mx-auto mt-4 max-w-[1000px] font-serif text-[clamp(2.15rem,4.2vw,3.45rem)] leading-[1.08] tracking-[-.04em] text-[#15223a]">You can look around before choosing a direction.</h1>
      <p className="mx-auto mt-4 max-w-[790px] font-serif text-[clamp(1.05rem,1.8vw,1.35rem)] leading-[1.4] text-[#626a7d]">We’ll help you compare a few possibilities at a time. You can open more than one, save what interests you, and come back whenever you’re ready.</p>

      <div className="mt-7 grid gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-8">
        {orientationSteps.map(({ title, description, Icon }) => <article key={title} className="flex min-h-[186px] flex-col items-center justify-center rounded-xl border border-[#e8e4dc] bg-[#fffefa]/95 px-5 py-5 shadow-[0_5px_24px_-24px_rgba(40,69,60,.6)] sm:min-h-[196px] sm:px-4">
          <span aria-hidden className="grid h-[76px] w-[76px] place-items-center rounded-full bg-[#e8f2ed] text-[#12625a]"><Icon className="h-10 w-10" strokeWidth={1.8} /></span>
          <h2 className="mt-3.5 font-serif text-[1.28rem] leading-tight text-[#15223a]">{title}</h2>
          <p className="mt-2 max-w-[225px] font-serif text-[1.03rem] leading-[1.35] text-[#626a7d]">{description}</p>
        </article>)}
      </div>

      <Link href="/guidance/compare?type=field&returnTo=%2Fguidance%2Fnot-sure" className="mx-auto mt-6 inline-flex min-h-[58px] w-full max-w-[445px] items-center justify-center rounded-xl bg-[#075a58] px-6 py-4 font-serif text-[1.13rem] font-semibold text-white shadow-[0_5px_15px_-10px_#163c35] transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286b61]">See a few directions side by side</Link>
      <div className="mt-3 flex flex-col items-center justify-center gap-2 font-serif text-[1rem] text-[#35675b] sm:flex-row sm:gap-5">
        <Link href="/guidance/review" className="min-h-10 inline-flex items-center underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Review what we understood</Link>
        <span aria-hidden className="hidden h-5 w-px bg-[#c9d8cf] sm:block" />
        <Link href="/guidance" className="min-h-10 inline-flex items-center underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Save and come back later</Link>
      </div>
      <p className="mx-auto mt-2 max-w-[390px] border-t border-[#ece9e1] pt-3 font-serif text-[15px] text-[#77786f]">Nothing here is a final answer.</p>
    </section>
    <QuietLandscape />
  </main>;
}
