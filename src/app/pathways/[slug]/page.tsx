import { notFound } from "next/navigation";
import { PathwayRouteDetail, type RouteDetailData } from "@/components/pathways/pathway-route-detail";
import {
  getCareers,
  getCourses,
  getExams,
  getField,
  getInstitutionsForCourse,
  getPathway,
  getPathways,
} from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await getPathway((await params).slug))?.title ?? "Pathway" };
}

const routeTypeLabels: Record<string, string> = {
  academic: "Academic route",
  diploma: "Diploma route",
  vocational: "Vocational route",
  professional: "Professional route",
};

export default async function PathwayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const pathway = await getPathway((await params).slug);
  if (!pathway) notFound();

  const [courses, exams, field, allPathways] = await Promise.all([
    getCourses({ slugs: pathway.courseSlugs ?? [] }),
    getExams({ slugs: pathway.examSlugs ?? [] }),
    pathway.fieldSlug ? getField(pathway.fieldSlug) : Promise.resolve(null),
    getPathways({}),
  ]);
  const [careerList, institutionLists] = await Promise.all([
    field ? getCareers(field.slug) : Promise.resolve([]),
    Promise.all(courses.map((course) => getInstitutionsForCourse(course.slug))),
  ]);
  const institutions = [...new Map(institutionLists.flat().map((institution) => [institution.code, institution])).values()];
  const alternatives = allPathways.filter((item) => item.slug !== pathway.slug && item.entryStage === pathway.entryStage);
  const titleParts = pathway.title.split(/\s*→\s*/);
  const headline = titleParts.length > 1 ? titleParts[1] : pathway.title;
  const continuation = titleParts.slice(2).join(" → ");
  const stageLabel = pathway.entryStage === "class10" ? "After Class 10" : "After Class 12";

  const route: RouteDetailData = {
    slug: pathway.slug,
    title: pathway.title,
    headline,
    continuation: continuation || undefined,
    entryStage: pathway.entryStage === "class10" ? "class10" : "class12",
    stageLabel,
    routeLabel: routeTypeLabels[pathway.routeType] ?? "Study route",
    description: pathway.description,
    typicalDuration: pathway.typicalDuration,
    notes: pathway.notes,
    field: field ? { href: `/explore/${field.slug}`, label: field.name } : null,
    steps: pathway.steps ?? [],
    courses: courses.map((course) => ({ href: `/courses/${course.slug}`, label: course.name, detail: course.durationLabel })),
    exams: exams.map((exam) => ({ href: `/exams/${exam.slug}`, label: exam.shortName ?? exam.name, detail: exam.conductingBody })),
    institutions: institutions.slice(0, 8).map((institution) => ({ href: `/institutions/${institution.code}`, label: institution.name, detail: institution.district })),
    careers: careerList.slice(0, 6).map((career) => ({ href: `/careers/${career.slug}`, label: career.title, detail: career.summary })),
    alternatives: alternatives.map((item) => ({
      slug: item.slug,
      href: `/pathways/${item.slug}`,
      label: item.title,
      routeType: routeTypeLabels[item.routeType] ?? "Study route",
      duration: item.typicalDuration,
    })),
  };

  return <PathwayRouteDetail route={route} />;
}
