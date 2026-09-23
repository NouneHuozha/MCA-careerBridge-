import { redirect } from "next/navigation";
import { CounsellingExperience } from "@/components/counselling-experience";
import { findQuestion, questionsForStage, SECTIONS } from "@/data/counselling";
import { getSessionState, nextQuestion, progressFor } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counselling" };

export default async function CounsellingPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const state = await getSessionState();
  if (!state) redirect("/start");
  const requested = params.edit ? findQuestion(params.edit) : null;
  const focus = requested && (!requested.stages || requested.stages.includes(state.stage)) ? requested : null;
  const question = focus ?? nextQuestion(state.stage, state.snapshot.answeredKeys);
  return <div className="cb-container cb-page">
    <header className="mx-auto mb-6 max-w-3xl"><p className="cb-eyebrow">Getting to know you</p><h1 className="mt-2 text-[clamp(2rem,4vw,3rem)] font-semibold">{focus ? "Make it sound like you." : "Let’s start with you."}</h1><p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-600">A few simple questions will help us show possibilities that may be worth exploring. You can skip anything and change your answers later.</p></header>
    <CounsellingExperience key={params.edit ?? String(state.sessionId)} focusKey={focus?.key} initial={{ started: true, stage: state.stage, stageDetail: state.stageDetail, snapshot: state.snapshot, answers: state.answers, question, progress: progressFor(state.stage, state.snapshot.answeredKeys), sections: SECTIONS, completed: state.status === "completed" || !question }} />
  </div>;
}
