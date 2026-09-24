import { redirect } from "next/navigation";
import { getExplorationState, getSessionState } from "@/services/profile";
export const dynamic = "force-dynamic";
export default async function MyJourneyPage() { const selected = await getExplorationState(); const state = await getSessionState(); if (selected) redirect(`/my-journey/direction/${selected.directionSlug}`); if (state?.status === "completed") redirect("/reflection"); redirect("/start"); }
