export type CounsellingStageKey = "about" | "interests" | "strengths" | "goals" | "practical" | "reflection";

export type CounsellingStage = {
  key: CounsellingStageKey;
  label: string;
  detail: string;
  editKey?: string;
};

export const counsellingStages: CounsellingStage[] = [
  { key: "about", label: "About you", detail: "Your study stage and subjects", editKey: "subjects_enjoy" },
  { key: "interests", label: "What interests you", detail: "What naturally pulls you", editKey: "interests" },
  { key: "strengths", label: "What you bring", detail: "Strengths and working style", editKey: "strengths" },
  { key: "goals", label: "What matters to you", detail: "Goals and career values", editKey: "goals" },
  { key: "practical", label: "Practical realities", detail: "Location, fees and access", editKey: "location_pref" },
  { key: "reflection", label: "Your reflection", detail: "Review your answers" },
];
