import { getCourses, getFields } from "@/services/catalog";
import CoursesPageClient from "./page-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore courses" };

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; field?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const [allCourses, fields] = await Promise.all([getCourses(), getFields()]);
  const courses = allCourses.filter((course) => {
    const matchesQuery = !query || `${course.name} ${(course.careerDirections ?? []).join(" ")}`.toLocaleLowerCase().includes(query);
    return matchesQuery && (!params.level || course.level === params.level) && (!params.field || course.fieldSlug === params.field);
  });

  return <CoursesPageClient initialCourses={courses} initialFields={fields} initialParams={params} />;
}