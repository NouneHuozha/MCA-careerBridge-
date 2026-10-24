import { PathwaysExplorer } from "@/components/pathways/pathways-explorer";
import { getCourses, getExams, getFields, getPathways } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore study routes" };

export default async function PathwaysPage({ searchParams }: { searchParams: Promise<{ stage?: string; field?: string }> }) {
  const params = await searchParams;
  const [pathways, fields, courses, exams] = await Promise.all([getPathways(), getFields(), getCourses(), getExams()]);
  const courseBySlug = new Map(courses.map((course) => [course.slug, course]));
  const examBySlug = new Map(exams.map((exam) => [exam.slug, exam]));
  return <PathwaysExplorer
    initialStage={params.stage}
    initialField={params.field?.trim()}
    fields={fields.map((field) => ({ slug: field.slug, name: field.name }))}
    pathways={pathways.map((pathway) => ({
      slug: pathway.slug,
      title: pathway.title,
      entryStage: pathway.entryStage,
      routeType: pathway.routeType,
      fieldSlug: pathway.fieldSlug,
      description: pathway.description,
      steps: pathway.steps ?? [],
      typicalDuration: pathway.typicalDuration,
      notes: pathway.notes,
      linkedCourses: (pathway.courseSlugs ?? []).flatMap((slug) => {
        const course = courseBySlug.get(slug);
        return course ? [{ href: `/courses/${course.slug}`, label: course.name }] : [];
      }),
      linkedExams: (pathway.examSlugs ?? []).flatMap((slug) => {
        const exam = examBySlug.get(slug);
        return exam ? [{ href: `/exams/${exam.slug}`, label: exam.shortName ?? exam.name }] : [];
      }),
    }))}
  />;
}
