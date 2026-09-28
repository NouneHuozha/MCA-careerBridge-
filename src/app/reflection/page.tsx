import { redirect } from "next/navigation";
import { ProfileReviewExperience, type ProfileReviewCard } from "@/components/profile-review-experience";
import { findQuestion, optionalQuestionsForStage } from "@/data/counselling";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile Review" };

type ReviewState = NonNullable<Awaited<ReturnType<typeof getSessionState>>>;

function answerLabels(state: ReviewState, key: string): string[] {
  const answer = state.answers[key];
  if (!answer) return [];
  const question = findQuestion(key);
  const values = answer.values.map((value) => {
    if (value === "not-sure") return "Not sure yet";
    return question?.options?.find((option) => option.value === value)?.label ?? value.replace(/-/g, " ");
  });
  return [...values, ...(answer.text?.trim() ? [answer.text.trim()] : [])];
}

function answerLine(state: ReviewState, key: string, label: string): string | null {
  const values = answerLabels(state, key);
  if (!values.length) return null;
  const shown = values.slice(0, 3);
  const more = values.length > shown.length ? `, and ${values.length - shown.length} more` : "";
  return `${label}: ${shown.join(", ")}${more}`;
}

function answerLines(state: ReviewState, fields: [string, string][]): string[] {
  const lines = fields.map(([key, label]) => answerLine(state, key, label)).filter((value): value is string => Boolean(value));
  return lines.length ? lines : ["Not shared yet"];
}

function stageDetailLabel(value: string | null): string {
  if (value === "studying") return "Still studying";
  if (value === "completed") return "Completed";
  if (value === "awaiting_results") return "Waiting for results";
  return "Not shared yet";
}

function openPracticalDetails(state: ReviewState): string[] {
  const labels: Record<string, string> = {
    home_district: "Nearest district",
    scholarship_need: "Scholarships",
    institution_pref: "Institution preference",
    hostel: "Hostel needs",
  };
  return Object.entries(labels)
    .filter(([key]) => !state.snapshot.answeredKeys.includes(key) || state.answers[key]?.values.includes("not-sure"))
    .map(([, label]) => label);
}

function buildCards(state: ReviewState): ProfileReviewCard[] {
  const stageName = state.stage === "class10" ? "Class 10" : "Class 12";
  const openPractical = openPracticalDetails(state);
  const optionalOpen = optionalQuestionsForStage(state.stage).some((question) => !state.snapshot.answeredKeys.includes(question.key));
  const values = (key: string) => state.answers[key]?.values ?? [];
  const cards: ProfileReviewCard[] = [
    {
      id: "education",
      title: "Where you are now",
      icon: "education",
      youTold: [stageName, stageDetailLabel(state.stageDetail)],
      understood: "Your current education stage is part of the context for what comes next.",
      stillUnclear: state.stageDetail === "awaiting_results" ? "Your results are still awaited; you can revisit this when they arrive." : undefined,
      editHref: "/start?edit=profile&returnTo=%2Freflection",
    },
    {
      id: "enjoy",
      title: "What you enjoy and feel comfortable with",
      icon: "interests",
      youTold: answerLines(state, [
        ["subjects_enjoy", "Subjects you enjoy"],
        ["interests", "Interests"],
        ["strengths", "Things you feel good at"],
      ]),
      understood: "These are useful starting clues—not a fixed label, score, or recommendation.",
      stillUnclear: !state.snapshot.answeredKeys.includes("work_style") || values("work_style").includes("not-sure")
        ? "Your preferred day-to-day work style can stay open and be explored later."
        : undefined,
      editHref: "/counselling?edit=interests&returnTo=%2Freflection",
    },
    {
      id: "priorities",
      title: "What matters to you",
      icon: "priorities",
      youTold: answerLines(state, [
        ["goals", "Future interests"],
        ["values", "Career priorities"],
        ["budget", "Course fees"],
      ]),
      understood: "We’ll keep these priorities in view without turning them into a score or a decision.",
      stillUnclear: values("budget").includes("unsure") || values("budget").includes("not-sure")
        ? "A manageable course-fee range is still uncertain."
        : !state.snapshot.answeredKeys.includes("scholarship_need")
          ? "Whether scholarship information would be useful has not been shared yet; it is optional."
          : undefined,
      editHref: "/counselling?edit=goals&returnTo=%2Freflection",
    },
    {
      id: "practical",
      title: "What we are still learning",
      icon: "practical",
      youTold: answerLines(state, [
        ["location_pref", "Study location"],
        ["home_district", "Nearest district"],
        ["scholarship_need", "Scholarships"],
      ]),
      understood: "Practical details can be revisited as you learn more. Nothing here is a requirement to explore.",
      stillUnclear: openPractical.length
        ? `Still open (optional): ${openPractical.join(" · ")}.`
        : optionalOpen
          ? "Some optional context has not been shared yet; you can add it whenever useful."
          : "Your practical preferences can change later, too.",
      editHref: "/counselling?edit=location_pref&returnTo=%2Freflection",
    },
  ];
  return cards;
}

export default async function ReflectionPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  return <ProfileReviewExperience cards={buildCards(state)} editAllHref="/counselling?edit=subjects_enjoy&returnTo=%2Freflection" />;
}
