import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { findQuestion } from "@/data/counselling";
import { getSessionState, labelFor } from "@/services/profile";
import { ProfileCorrection } from "@/components/guidance/profile-correction";
import { ReviewDossier, type DossierItem } from "@/components/guidance/review-dossier";
import { ReviewHero } from "@/components/guidance/review-hero";

export const dynamic = "force-dynamic";
export const metadata = { title: "Check what we understood about you — CareerBridge" };

type ReviewItem = { label: string; value: string; editSection?: string };
type SessionState = NonNullable<Awaited<ReturnType<typeof getSessionState>>>;

const stageLabels = { class10: "Class 10", class12: "Class 12" } as const;
const stageDetails: Record<string, string> = {
  studying: "Currently studying",
  completed: "Course completed",
  awaiting_results: "Waiting for results",
  deciding: "Still deciding",
};

const preferenceLabels: Record<string, string> = {
  "home-district": "Near home",
  "within-nagaland": "Within Nagaland",
  "outside-open": "Open to studying outside Nagaland",
  "with-people": "Working closely with people",
  independent: "Working mostly on my own",
  "hands-on": "Hands-on, practical work",
  outdoors: "Outdoors and moving around",
  mixed: "A mix, with variety",
  government: "Government institutions",
  private: "Private institutions",
  either: "Either government or private institutions",
  low: "Lower-fee options would be helpful",
  moderate: "Moderate fees may be possible",
  flexible: "Fees are not the main constraint",
  unsure: "Not sure about course fees yet",
  "prefer-not": "Prefer not to answer",
  yes: "Scholarship information would help",
  maybe: "Keeping scholarship information in view",
  no: "Scholarships are not a priority right now",
};

function labelsFor(
  state: SessionState,
  key: string,
  kind?: "subject" | "interest" | "strength" | "goal" | "value"
) {
  const values = state.answers[key]?.values ?? [];
  const question = findQuestion(key);
  const streamLabels: Record<string, string> = {
    "science-pcm": "Science with Mathematics",
    "science-pcb": "Science with Biology",
    "science-pcmb": "Science with Mathematics and Biology",
  };
  if (key === "stream_current")
    return values.map(
      (value) =>
        streamLabels[value] ??
        question?.options?.find((option) => option.value === value)?.label ??
        value.replace(/-/g, " ")
    );
  return values.map((value) =>
    value === "not-sure"
      ? "Not sure yet"
      : value === "other" && kind === "interest"
        ? "Something else"
        : question?.options?.find((option) => option.value === value)?.label ??
          (kind ? labelFor(kind, value) : preferenceLabels[value] ?? value.replace(/-/g, " "))
  );
}

function joinValues(values: string[], fallback: string) {
  return values.length ? values.join(", ") : fallback;
}

function editProfileHref(section?: string) {
  const anchor =
    section === "Where you are now"
      ? "#edit-where"
      : section === "What you enjoy and bring"
        ? "#edit-enjoy"
        : section === "What you bring"
          ? "#edit-bring"
          : section === "What matters to you"
            ? "#edit-matters"
            : section === "Practical considerations"
              ? "#edit-practical"
              : "";
  return `/guidance/review?mode=correct${anchor}`;
}

export default async function ProfileReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const params = await searchParams;
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (params.mode === "correct")
    return (
      <ProfileCorrection
        stage={state.stage}
        stageDetail={state.stageDetail}
        answers={state.answers}
      />
    );

  const snapshot = state.snapshot;
  const streamKey = state.stage === "class10" ? "stream_intent" : "stream_current";
  const streamValues = labelsFor(state, streamKey);
  const streamAnswer = (state.answers[streamKey]?.values ?? []).includes("not-sure")
    ? "Not decided yet"
    : joinValues(streamValues, "Not decided yet");
  const subjectValues = labelsFor(state, "subjects_enjoy", "subject").filter(
    (v) => v.toLowerCase() !== "not sure yet"
  );
  const interestValues = labelsFor(state, "interests", "interest");
  const interestText = state.answers.interests?.text?.trim();
  const interestSummaryValues = interestValues.map((v) =>
    v === "Something else" && interestText ? `Something else: ${interestText}` : v
  );
  const strengthValues = labelsFor(state, "strengths", "strength");
  const goalValues = labelsFor(state, "goals", "goal");
  const careerValues = labelsFor(state, "values", "value");
  const workStyle =
    snapshot.workStyle
      ? preferenceLabels[snapshot.workStyle] ?? snapshot.workStyle.replace(/-/g, " ")
      : null;
  const location =
    snapshot.locationPref && snapshot.locationPref !== "not-sure"
      ? preferenceLabels[snapshot.locationPref] ?? snapshot.locationPref.replace(/-/g, " ")
      : null;
  const budget = snapshot.budget
    ? preferenceLabels[snapshot.budget] ?? snapshot.budget.replace(/-/g, " ")
    : null;
  const stage = stageLabels[state.stage];
  const stageDetail = stageDetails[state.stageDetail ?? ""] ?? null;

  const enjoyedItems: ReviewItem[] = [
    ...(subjectValues.length
      ? [{ label: "Subjects you enjoy", value: joinValues(subjectValues, "Not shared") }]
      : []),
    { label: "Interests & hobbies", value: joinValues(interestSummaryValues, "Not shared") },
    {
      label: "Personal strengths",
      value: joinValues(strengthValues, "Not shared"),
      editSection: "What you bring",
    },
    ...(workStyle
      ? [{ label: "Preferred work style", value: workStyle, editSection: "What you bring" }]
      : []),
  ];

  const mattersItems: ReviewItem[] = [
    { label: "Goals for the future", value: joinValues(goalValues, "Not shared") },
    { label: "Career & life values", value: joinValues(careerValues, "Not shared") },
    ...(location
      ? [{ label: "Study location", value: location, editSection: "Practical considerations" }]
      : []),
    ...(budget
      ? [{ label: "Cost preference", value: budget, editSection: "Practical considerations" }]
      : []),
  ];

  const chosenSignals = [
    ...strengthValues,
    ...interestValues.filter((v) => v !== "Something else"),
  ]
    .filter((v) => v.toLowerCase() !== "not sure yet")
    .slice(0, 3);

  const interpretation =
    chosenSignals.length > 0
      ? `${joinValues(chosenSignals.slice(0, 2), " and ")} stand out in your answers — clues to explore, not conclusions.`
      : "Some answers are still open. You can refine them as you learn more.";

  const anythingElse = state.answers.anything_else?.text?.trim() || null;
  const difficultSubjectText = state.answers.subjects_difficult?.text?.trim();
  const difficultSubjectValues = labelsFor(state, "subjects_difficult", "subject").map((v) =>
    v === "Something else" && difficultSubjectText ? `Something else: ${difficultSubjectText}` : v
  );
  const additionalDetails = [
    { label: "Subjects I find difficult", value: joinValues(difficultSubjectValues, "") },
    {
      label: "Something I enjoyed recently",
      value:
        state.answers.interest_story?.text?.trim() ||
        (state.answers.interest_story?.values.includes("not-sure") ? "Not sure yet" : ""),
    },
    { label: "Nearby district", value: joinValues(labelsFor(state, "home_district"), "") },
    {
      label: "Scholarship information",
      value: joinValues(labelsFor(state, "scholarship_need"), ""),
    },
    {
      label: "Institution preference",
      value: joinValues(labelsFor(state, "institution_pref"), ""),
    },
    { label: "Hostel requirement", value: joinValues(labelsFor(state, "hostel"), "") },
  ].filter((item) => Boolean(item.value));

  /* Count sections that have data for the hero stat badges */
  const sectionCount = [
    true, /* foundation always exists */
    enjoyedItems.length > 0,
    mattersItems.length > 0,
    additionalDetails.length > 0 || !!anythingElse,
  ].filter(Boolean).length;

  return (
    <main className="cb-rev-page" id="main">
      {/* ── Cinematic Hero Section ── */}
      <ReviewHero
        interpretation={interpretation}
        sectionCount={sectionCount}
      />

      {/* ── Architectural 4-Pillar Dossier ── */}
      <ReviewDossier
        foundation={{
          stage,
          stageDetail,
          stream: streamAnswer,
          editHref: editProfileHref("Where you are now"),
        }}
        enjoyed={{
          items: enjoyedItems.map((item) => ({
            label: item.label,
            value: item.value,
            editHref: editProfileHref(item.editSection ?? "What you enjoy and bring"),
          })),
          openNotes: [
            {
              label: "Specific jobs vs broad interests",
              note: "You don't have to pick a single job title today. We will compare broad fields and routes that connect to your activities.",
            },
            {
              label: "Practical balance",
              note: "Whether you lean toward hands-on practical work or academic study, both options will be presented fairly.",
            },
          ],
        }}
        matters={{
          items: mattersItems.map((item) => ({
            label: item.label,
            value: item.value,
            editHref: editProfileHref(item.editSection ?? "What matters to you"),
          })),
          openNotes: [
            {
              label: "Study location flexibility",
              note: location
                ? `You noted a preference: "${location}". Directions will highlight nearby institutions while keeping options open.`
                : "Location remains open — you will be able to compare colleges near home, across Nagaland, and beyond.",
            },
            {
              label: "Course fees & scholarship support",
              note: budget
                ? `Cost preference noted: "${budget}". Low-cost options and scholarship schemes will be highlighted.`
                : "Fee ranges, scholarship criteria, and hostel facilities will be verified directly from official notices.",
            },
          ],
        }}
        additional={additionalDetails}
        anythingElse={anythingElse}
      />

      {/* ── Grounded Action Footer ── */}
      <footer className="cb-rev-action-footer">
        <div className="cb-rev-footer-content">
          <div>
            <p className="cb-rev-footer-title">Reviewed everything?</p>
            <p className="cb-rev-footer-sub">
              Continue to confirmation when you&apos;re ready to lock in your starting point.
            </p>
          </div>

          <div className="cb-rev-footer-actions">
            <Link
              href="/guidance/review?mode=correct"
              className="cb-rev-footer-secondary"
            >
              Edit all answers
            </Link>

            <Link href="/guidance/confirm" className="cb-rev-footer-primary">
              <span>Continue to confirmation</span>
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.2} aria-hidden />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
