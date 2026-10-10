import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { CounsellingJourneyMap, CounsellingStartHeader } from "@/components/counselling-start-shell";
import { CurrentPositionForm } from "@/components/current-position-form";
import { isStageDetail, type Stage } from "@/data/counselling";
import { getSessionState, startSession } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Where are you right now?" };

type PositionParams = { error?: string };

export default async function CurrentPositionPage({ searchParams }: { searchParams: Promise<PositionParams> }) {
  const params = await searchParams;
  let savedState = null;
  try {
    savedState = await getSessionState();
  } catch {
    // The page remains usable without a database connection; saving will show an error.
  }

  async function submitPosition(formData: FormData) {
    "use server";
    const rawStage = String(formData.get("stage") ?? "");
    const rawDetail = String(formData.get("stageDetail") ?? "");
    const intent = String(formData.get("intent") ?? "continue");
    if (!["class10", "class12"].includes(rawStage) || !isStageDetail(rawDetail)) {
      redirect("/start/current-position?error=choose-options");
    }
    try {
      await startSession(rawStage as Stage, rawDetail);
    } catch {
      redirect("/start/current-position?error=unavailable");
    }
    if (intent === "save") redirect("/start?counsellingSaved=1");
    redirect(rawStage === "class10" ? "/counselling?first=stream_intent" : "/counselling");
  }

  const error = params.error === "choose-options"
    ? "Choose your stage and current situation to continue."
    : params.error === "unavailable"
      ? "We couldn’t save your starting point just now. Your earlier answers are safe. Please try again."
      : null;

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#fbfaf8] text-[#20272b]">
      <CounsellingStartHeader
        rightControl={
          <button
            type="submit"
            form="current-position-form"
            name="intent"
            value="save"
            aria-label="Save and return later"
            className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-1 text-xs font-medium text-[#47796d] transition hover:bg-[#f0f6f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397c6e] focus-visible:ring-offset-2 sm:gap-3 sm:px-3 sm:text-sm"
          >
            <Bookmark aria-hidden="true" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={1.8} />
            <span>Save and return later</span>
          </button>
        }
      />

      <main className="mx-auto grid w-full max-w-[1472px] gap-7 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[386px_minmax(0,1fr)] lg:gap-12 lg:px-11 lg:py-10">
        <CounsellingJourneyMap activeStep={0} variant="position" />

        <section className="min-w-0 pt-1 lg:pt-0" aria-labelledby="position-title">
          <span className="inline-flex rounded-full bg-[#eaf3ed] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#39796c]">
            Step 1 of 5
          </span>
          <h1 id="position-title" className="mt-5 text-[clamp(2.25rem,4.2vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#20272b]">
            Where are you right now?
          </h1>
          <p className="mt-3 max-w-[72ch] text-base leading-relaxed text-[#707575] sm:text-lg">
            This helps us ask questions that make sense for your situation. You can change this later.
          </p>

          {error && (
            <p role="alert" className="mt-5 rounded-xl border border-[#e7c9be] bg-[#fff4ef] px-4 py-3 text-sm font-medium text-[#8b4431]">
              {error}
            </p>
          )}

          <div className="mt-7 sm:mt-8">
            <CurrentPositionForm
              initialStage={savedState?.stage ?? null}
              initialStageDetail={savedState?.stageDetail ?? null}
              submitAction={submitPosition}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
