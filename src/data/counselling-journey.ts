export type CounsellingStageKey = "where" | "interests" | "strengths" | "priorities" | "review";

export type CounsellingStage = {
  key: CounsellingStageKey;
  label: string;
  detail: string;
  editKey?: string;
};

export const counsellingStages: CounsellingStage[] = [
  { key: "where", label: "Where you are now", detail: "Your stage and study context", editKey: "stream_intent" },
  { key: "interests", label: "What interests you", detail: "Subjects and things that pull you", editKey: "subjects_enjoy" },
  { key: "strengths", label: "What you bring", detail: "Strengths and working style", editKey: "strengths" },
  { key: "priorities", label: "What matters to you", detail: "Goals, values and practical needs", editKey: "goals" },
  { key: "review", label: "What we understood", detail: "Review, edit or add details" },
];
