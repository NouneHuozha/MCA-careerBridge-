import { CounsellingExperience } from "@/components/counselling-experience";
import { CounsellingJourneyShell, type CounsellingStageKey } from "@/components/counselling-journey";
import { getSessionState, emptySnapshot, progressFor } from "@/services/profile";
import { findQuestion } from "@/data/counselling";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counselling" };

function stepForEditKey(key?: string): CounsellingStageKey {
  if (!key) return "where";
  if (["stream_intent", "stream_current"].includes(key)) return "where";
  if (["subjects_enjoy", "interests"].includes(key)) return "interests";
  if (["strengths", "work_style"].includes(key)) return "strengths";
  if (["goals", "values", "location_pref", "budget"].includes(key)) return "priorities";
  if (findQuestion(key)) return "review";
  return "review";
}

function stepForState(state: Awaited<ReturnType<typeof getSessionState>>): CounsellingStageKey {
  if (!state || !state.stageDetail) return "where";
  const answered = state.snapshot.answeredKeys;
  const streamKey = state.stage === "class10" ? "stream_intent" : "stream_current";
  if (!answered.includes(streamKey)) return "where";
  if (!["subjects_enjoy", "interests"].every((key) => answered.includes(key))) return "interests";
  if (!answered.includes("strengths")) return "strengths";
  if (!["goals", "values", "location_pref"].every((key) => answered.includes(key))) return "priorities";
  return "review";
}

export default async function CounsellingPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const session = await getSessionState();
  const state = session ? {
    started: true,
    stage: session.stage,
    stageDetail: session.stageDetail,
    status: session.status,
    snapshot: session.snapshot,
    answers: session.answers,
    progress: progressFor(session.stage, session.snapshot.answeredKeys),
    completed: session.status === "completed",
  } : {
    started: false as const,
    stage: "class10" as const,
    stageDetail: null,
    status: "in_progress",
    snapshot: emptySnapshot("class10"),
    answers: {} as Record<string, { values: string[]; text: string | null }>,
    progress: { answered: 0, total: 0 },
    completed: false,
  };
  const currentSection = params.edit ? stepForEditKey(params.edit) : stepForState(session);
  const focusKey = params.edit && findQuestion(params.edit) ? params.edit : undefined;
  return <CounsellingJourneyShell currentSection={currentSection} completedSections={[]} progress={{ current: state.progress.answered, total: state.progress.total }}>
    <CounsellingExperience initial={state} focusKey={focusKey} />
  </CounsellingJourneyShell>;
}
