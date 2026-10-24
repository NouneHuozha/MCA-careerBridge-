import { redirect } from "next/navigation";
import { getField } from "@/services/catalog";
import { FACTOR_LABELS, scoreField } from "@/recommendation/engine";
import { getSessionState } from "@/services/profile";
import { DirectionFieldGuide } from "@/components/guidance/direction-field-guide";

export const dynamic = "force-dynamic";
export const metadata = { title: "Direction overview" };

const imageForField: Record<string, string> = {
  technology: "/images/field-technology.png",
  engineering: "/images/field-engineering.png",
  healthcare: "/images/field-healthcare.png",
  business: "/images/field-business.png",
};

export default async function DirectionOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [state, field] = await Promise.all([getSessionState(), getField(slug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field) redirect("/guidance/possibilities");

  const suggestion = scoreField(field, state.snapshot);

  return <DirectionFieldGuide field={{
    slug: field.slug,
    name: field.name,
    tagline: field.tagline ?? null,
    overview: field.overview,
    imageSrc: imageForField[field.slug] ?? "/images/possibilities-landscape.png",
    connections: suggestion.reasons.slice(0, 3).map((reason) => ({ label: FACTOR_LABELS[reason.factor], detail: reason.detail })),
    whatPeopleDo: field.whatPeopleDo ?? [],
    usefulSubjects: field.usefulSubjects ?? [],
    skills: field.skills ?? [],
    pros: field.pros ?? [],
    challenges: field.challenges ?? [],
    alternatives: field.alternatives ?? [],
  }} />;
}
