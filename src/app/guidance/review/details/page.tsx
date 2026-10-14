import { redirect } from "next/navigation";
import { OptionalDetailsContent } from "@/components/guidance/optional-details-content";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Add anything else that may help" };

export default async function OptionalDetailsPage() {
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  return <OptionalDetailsContent answers={state.answers} answered={state.snapshot.answeredKeys.length} />;
}
