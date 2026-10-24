import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowRight, BookOpen, Clock3, Code2, GraduationCap, MapPin, Route, Wrench } from "lucide-react";
import { getField, getPathways } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { RoutesExplorer, type RouteCardData } from "@/components/guidance/routes-explorer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Routes to explore" };

function stageLabel(stage: string, detail?: string | null) {
  const label = stage === "class10" ? "Class 10" : "Class 12";
  const detailLabels: Record<string, string> = { studying: "currently studying", completed: "results available", awaiting_results: "awaiting results", deciding: "taking some time to decide" };
  return `${label}${detail && detailLabels[detail] ? ` · ${detailLabels[detail]}` : ""}`;
}

function routeTypeLabel(type: string) {
  if (type === "academic") return "Academic route";
  if (type === "diploma") return "Diploma route";
  if (type === "vocational") return "Skill-first route";
  return "Professional route";
}

function routeName(slug: string, title: string, type: string) {
  if (slug === "class10-science-stream") return "Engineering or technical degree";
  if (slug === "class10-polytechnic-diploma") return "Computing-focused diploma route";
  if (slug === "class10-iti-trade") return "ITI trade training";
  if (title.includes("B.Tech Computer Science")) return "Engineering or technical degree";
  if (title.includes("BCA")) return "Computing-focused degree";
  if (type === "diploma") return "Technical diploma";
  if (type === "vocational") return "Applied skill route";
  return title.split("→").slice(-1)[0]?.replace(/\s*→.*/, "").trim() || title;
}

function routeDescription(slug: string, title: string, description: string, type: string) {
  if (slug === "class10-science-stream") return "A longer academic route that keeps computing, engineering, and science-based degree options open after Class 12.";
  if (slug === "class10-polytechnic-diploma") return "A practical technical route with hands-on training, specific tools, and the possibility of work or further study sooner.";
  if (slug === "class10-iti-trade") return "A shorter practical route focused on specific skills, apprenticeship, and entering work or further study sooner.";
  if (title.includes("B.Tech Computer Science")) return "A longer degree route that may include mathematics, computing, engineering concepts, and deeper technical study.";
  if (title.includes("BCA")) return "A degree route centred on software, applications, information systems, or computer science, with different course structures.";
  if (type === "diploma" || type === "vocational") return "A more practical route that may focus on hands-on training, specific tools, and entering work or further study sooner.";
  return description;
}

function understandNext(slug: string, title: string, type: string) {
  if (slug === "class10-science-stream") return "subjects, stream choices, and later course options.";
  if (slug === "class10-polytechnic-diploma") return "duration, technical specialisations, and progression options.";
  if (slug === "class10-iti-trade") return "trade options, apprenticeship, and local availability.";
  if (title.includes("B.Tech Computer Science")) return "subjects, entrance routes, and course options.";
  if (title.includes("BCA")) return "course differences, entry requirements, and outcomes.";
  if (type === "diploma" || type === "vocational") return "duration, progression options, and local availability.";
  return "the study style, requirements, and progression options.";
}

function studyStyleLabel(routeType: string) {
  if (routeType === "vocational") return "Hands-on, occupation-focused training";
  if (routeType === "diploma") return "Technical study with applied training";
  if (routeType === "academic") return "Subject-focused classroom and project study";
  return "Structured study and professional preparation";
}

function routeProgression(route: { slug: string; title: string; steps: { label: string; detail: string }[] | null }) {
  const onward = route.steps?.slice(1).map((step) => step.label) ?? [];
  return onward.join(" · ") || route.title.split("→").at(-1)?.trim() || "Further study or work";
}

export default async function RoutesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [state, field] = await Promise.all([getSessionState(), getField(slug)]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field) redirect("/guidance/possibilities");

  const directPathways = await getPathways({ stage: state.stage, fieldSlug: slug });
  const pathways = directPathways.length || slug !== "technology" || state.stage !== "class10"
    ? directPathways
    : (await getPathways({ stage: "class10" })).filter((route) =>
        ["class10-science-stream", "class10-polytechnic-diploma", "class10-iti-trade"].includes(route.slug),
      );
  const routeCards = pathways.slice(0, 6);
  const displayStage = stageLabel(state.stage, state.stageDetail);

  const routes: RouteCardData[] = routeCards.map((route) => ({
    slug: route.slug,
    name: routeName(route.slug, route.title, route.routeType),
    description: routeDescription(route.slug, route.title, route.description, route.routeType),
    routeType: route.routeType,
    routeTypeLabel: routeTypeLabel(route.routeType),
    duration: route.typicalDuration,
    studyStyle: studyStyleLabel(route.routeType),
    progression: routeProgression(route),
    understandNext: understandNext(route.slug, route.title, route.routeType),
    href: `/guidance/direction/${encodeURIComponent(field.slug)}/routes/${encodeURIComponent(route.slug)}`,
    compareHref: `/guidance/compare?type=pathway&field=${encodeURIComponent(field.slug)}&items=${encodeURIComponent(route.slug)}&returnTo=${encodeURIComponent(`/guidance/direction/${field.slug}/routes/${route.slug}`)}`,
  }));

  return (
    <main id="main">
      <RoutesExplorer
        fieldName={field.name}
        fieldSlug={field.slug}
        displayStage={displayStage}
        routes={routes}
      />
    </main>
  );
}
