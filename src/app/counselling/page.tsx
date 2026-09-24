import { redirect } from "next/navigation";
import { CounsellingExperience } from "@/components/counselling-experience";
import { DetailJourneyShell } from "@/components/journey-sidebar";
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
  return <DetailJourneyShell current={1} artwork="/images/home-journey-reference.png"><main className="cb-container cb-page">
    <CounsellingExperience key={params.edit ?? String(state.sessionId)} focusKey={focus?.key} initial={{ started: true, stage: state.stage, stageDetail: state.stageDetail, snapshot: state.snapshot, answers: state.answers, question, progress: progressFor(state.stage, state.snapshot.answeredKeys), sections: SECTIONS, completed: state.status === "completed" || !question }} />
  </main></DetailJourneyShell>;
}
