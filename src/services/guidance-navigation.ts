import {
  getCourse,
  getField,
  getInstitution,
  getInstitutionLinks,
  getPathway,
  getPathways,
} from "@/services/catalog";

const directionHref = (slug: string) => `/guidance/direction/${encodeURIComponent(slug)}`;
const pathwayHref = (fieldSlug: string, pathwaySlug: string) =>
  `${directionHref(fieldSlug)}/routes/${encodeURIComponent(pathwaySlug)}`;

async function courseHref(courseSlug: string, preferredField?: string | null) {
  const course = await getCourse(courseSlug);
  const fieldSlug = preferredField || course?.fieldSlug;
  if (!fieldSlug) return "/guidance/explorations";

  const routes = await getPathways({ fieldSlug });
  const route = routes.find((candidate) => candidate.courseSlugs?.includes(courseSlug));
  if (!route) return `${directionHref(fieldSlug)}/routes`;
  return `${pathwayHref(fieldSlug, route.slug)}/courses/${encodeURIComponent(courseSlug)}`;
}

export async function guidanceHrefForItem(itemType: string, itemRef: string, activeDirection?: string | null) {
  if (itemType === "field") {
    return (await getField(itemRef)) ? directionHref(itemRef) : "/guidance/explorations";
  }

  if (itemType === "pathway") {
    const route = await getPathway(itemRef);
    const fieldSlug = route?.fieldSlug || activeDirection;
    return route && fieldSlug ? pathwayHref(fieldSlug, route.slug) : "/guidance/explorations";
  }

  if (itemType === "course") return courseHref(itemRef, activeDirection);

  if (itemType === "institution") {
    const institution = await getInstitution(itemRef);
    const links = await getInstitutionLinks(itemRef);
    for (const link of links) {
      const course = await getCourse(link.courseSlug);
      const fieldSlug = activeDirection || course?.fieldSlug || institution?.fieldSlugs?.[0];
      if (!course || !fieldSlug) continue;
      const routes = await getPathways({ fieldSlug });
      const route = routes.find((candidate) => candidate.courseSlugs?.includes(course.slug));
      if (route) {
        return `${pathwayHref(fieldSlug, route.slug)}/courses/${encodeURIComponent(course.slug)}/institutions/${encodeURIComponent(itemRef)}`;
      }
    }
    return activeDirection ? `${directionHref(activeDirection)}/routes` : "/guidance/explorations";
  }

  if (itemType === "career") {
    return activeDirection ? directionHref(activeDirection) : "/guidance/possibilities";
  }

  if (["exam", "scholarship", "opportunity"].includes(itemType)) {
    const fieldSlug = activeDirection || "technology";
    const routes = await getPathways({ fieldSlug });
    const route = routes.find((candidate) => candidate.courseSlugs?.includes("bca"))
      ?? routes.find((candidate) => candidate.courseSlugs?.length);
    const courseSlug = route?.courseSlugs?.[0];
    if (route && courseSlug) {
      return `${pathwayHref(fieldSlug, route.slug)}/courses/${encodeURIComponent(courseSlug)}/exams-scholarships`;
    }
    return `${directionHref(fieldSlug)}/routes`;
  }

  return "/guidance/explorations";
}
