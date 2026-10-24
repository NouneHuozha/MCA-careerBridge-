import { redirect } from "next/navigation";
import { findQuestion } from "@/data/counselling";
import { getSessionState, labelFor } from "@/services/profile";
import { ProfileConfirmed } from "@/components/guidance/profile-confirmed";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your starting picture is confirmed" };

const stageLabels = { class10: "Class 10", class12: "Class 12" } as const;
const stageDetails: Record<string, string> = {
  studying: "currently studying",
  completed: "course completed",
  awaiting_results: "results available",
  deciding: "taking some time to decide what comes next",
};

const preferenceLabels: Record<string, string> = {
  "home-district": "prefer staying near my district",
  "within-nagaland": "prefer studying within Nagaland",
  "outside-open": "open to studying outside Nagaland",
  "with-people": "working closely with people",
  independent: "working mostly on my own",
  "hands-on": "learning by doing",
  outdoors: "outdoors and moving around",
  mixed: "a mix of activities",
  low: "keeping costs manageable",
  moderate: "keeping costs manageable",
  flexible: "fees are not the main constraint",
  unsure: "still learning what fees may be manageable",
  yes: "scholarship information may help",
  maybe: "keeping scholarship information in view",
  no: "scholarships are not a priority right now",
};

function labelsFor(
  state: NonNullable<Awaited<ReturnType<typeof getSessionState>>>,
  key: string,
  kind: "subject" | "interest" | "strength" | "goal" | "value"
) {
  const question = findQuestion(key);
  return (state.answers[key]?.values ?? []).map(
    (value) =>
      question?.options?.find((option) => option.value === value)?.label ?? labelFor(kind, value)
  );
}

export default async function ProfileConfirmationPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const snapshot = state.snapshot;
  const stage = stageLabels[state.stage];
  const stageDetail = stageDetails[state.stageDetail ?? ""];
  const subjects = labelsFor(state, "subjects_enjoy", "subject");
  const interests = labelsFor(state, "interests", "interest");
  const strengths = labelsFor(state, "strengths", "strength");
  const goals = labelsFor(state, "goals", "goal");
  const values = labelsFor(state, "values", "value");

  const location =
    snapshot.locationPref && snapshot.locationPref !== "not-sure"
      ? preferenceLabels[snapshot.locationPref]
      : null;

  const financial =
    snapshot.scholarshipNeed && snapshot.scholarshipNeed !== "no"
      ? preferenceLabels[snapshot.scholarshipNeed]
      : snapshot.budget
        ? preferenceLabels[snapshot.budget]
        : null;

  const dossier = {
    stage,
    stageDetail,
    signals: [...subjects, ...interests, ...strengths].slice(0, 6),
    priorities: [...goals, ...values].slice(0, 4),
    location,
    financial,
  };

  return (
    <main id="main">
      <ProfileConfirmed dossier={dossier} nextHref="/guidance/possibilities" />
    </main>
  );
}
