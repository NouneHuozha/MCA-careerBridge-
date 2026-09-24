import { redirect } from "next/navigation";
import { CounsellingExperience } from "@/components/counselling-experience";
import { CounsellingJourneyShell, counsellingStages, type CounsellingStageKey } from "@/components/counselling-journey";
import { findQuestion, questionsForStage, SECTIONS, type CounsellingQuestion } from "@/data/counselling";
import { getSessionState, nextQuestion, progressFor } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counselling" };

const sectionStage: Record<CounsellingQuestion["section"], CounsellingStageKey> = {
  academics: "about",
  interests: "interests",
  strengths: "strengths",
  goals: "goals",
  practical: "practical",
};

export default async function CounsellingPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const state = await getSessionState();
  if (!state) redirect("/start");
  const requested = params.edit ? findQuestion(params.edit) : null;
  const focus = requested && (!requested.stages || requested.stages.includes(state.stage)) ? requested : null;
  const question = focus ?? nextQuestion(state.stage, state.snapshot.answeredKeys);
  const currentSection: CounsellingStageKey = question ? sectionStage[question.section] : "reflection";
  const coreQuestions = questionsForStage(state.stage);
  const completedSections = counsellingStages.filter((stage) => stage.key !== currentSection && stage.key !== "reflection" && coreQuestions.filter((item) => sectionStage[item.section] === stage.key).every((item) => state.snapshot.answeredKeys.includes(item.key))).map((stage) => stage.key);
  const progress = progressFor(state.stage, state.snapshot.answeredKeys);
  const questionProgress = { current: progress.answered, total: progress.total };
  return <CounsellingJourneyShell currentSection={currentSection} completedSections={completedSections} progress={questionProgress}><main className="cb-container cb-page cb-counselling-page">
    <CounsellingExperience key={params.edit ?? String(state.sessionId)} focusKey={focus?.key} initial={{ started: true, stage: state.stage, stageDetail: state.stageDetail, snapshot: state.snapshot, answers: state.answers, question, progress, sections: SECTIONS, completed: state.status === "completed" || !question }} />
  </main></CounsellingJourneyShell>;
}
