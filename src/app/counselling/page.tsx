import { redirect } from "next/navigation";
import { CounsellingExperience } from "@/components/counselling-experience";
import { Class10EducationPage, Class12EducationPage } from "@/components/education-selection-page";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages, type CounsellingStageKey } from "@/data/counselling-journey";
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

export default async function CounsellingPage({ searchParams }: { searchParams: Promise<{ edit?: string; returnTo?: string; first?: string }> }) {
  const params = await searchParams;
  const state = await getSessionState();
  if (!state) redirect("/start");
  const requested = params.edit ? findQuestion(params.edit) : null;
  const focus = requested && (!requested.stages || requested.stages.includes(state.stage)) ? requested : null;
  const firstEducationKey = state.stage === "class10" ? "stream_intent" : "stream_current";
  if (state.status === "completed" && !focus && params.first !== firstEducationKey) redirect("/guidance/complete");
  const streamIntentAnswered = state.snapshot.answeredKeys.includes("stream_intent");
  const streamCurrentAnswered = state.snapshot.answeredKeys.includes("stream_current");
  const showClass10Education = state.stage === "class10" && (
    focus?.key === "stream_intent" || params.first === "stream_intent" || (!params.edit && !streamIntentAnswered)
  );
  const showClass12Education = state.stage === "class12" && (
    focus?.key === "stream_current" || params.first === "stream_current" || (!params.edit && !streamCurrentAnswered)
  );
  if (showClass10Education) {
    return <Class10EducationPage
      sessionId={state.sessionId}
      initialAnswer={state.answers.stream_intent ?? null}
      editing={focus?.key === "stream_intent"}
      firstStep={params.first === "stream_intent"}
      returnTo={params.returnTo === "/guidance/review" ? params.returnTo : undefined}
    />;
  }
  if (showClass12Education) {
    return <Class12EducationPage
      sessionId={state.sessionId}
      initialAnswer={state.answers.stream_current ?? null}
      editing={focus?.key === "stream_current"}
      firstStep={params.first === "stream_current"}
      returnTo={params.returnTo === "/guidance/review" ? params.returnTo : undefined}
    />;
  }
  const question = focus ?? nextQuestion(state.stage, state.snapshot.answeredKeys);
  const currentSection: CounsellingStageKey = question ? sectionStage[question.section] : "reflection";
  const coreQuestions = questionsForStage(state.stage);
  const completedSections = counsellingStages.filter((stage) => stage.key !== currentSection && stage.key !== "reflection" && coreQuestions.filter((item) => sectionStage[item.section] === stage.key).every((item) => state.snapshot.answeredKeys.includes(item.key))).map((stage) => stage.key);
  const progress = progressFor(state.stage, state.snapshot.answeredKeys);
  const questionProgress = { current: progress.answered, total: progress.total };
  const returnTo = params.returnTo === "/guidance/review" || params.returnTo === "/counselling" ? params.returnTo : undefined;
  const shellVariant = question?.key === "subjects_enjoy" || question?.key === "interests" || question?.key === "strengths" || question?.key === "work_style" || question?.key === "goals" || question?.key === "values" ? "grouped" : "standard";
  return <CounsellingJourneyShell currentSection={currentSection} completedSections={completedSections} progress={questionProgress} variant={shellVariant}><main className={shellVariant === "grouped" ? "w-full min-w-0" : "cb-container cb-page cb-counselling-page"}>
    <CounsellingExperience key={params.edit ?? String(state.sessionId)} focusKey={focus?.key} returnTo={returnTo} initial={{ started: true, stage: state.stage, stageDetail: state.stageDetail, snapshot: state.snapshot, answers: state.answers, question, progress, sections: SECTIONS, completed: state.status === "completed" || !question }} />
  </main></CounsellingJourneyShell>;
}
