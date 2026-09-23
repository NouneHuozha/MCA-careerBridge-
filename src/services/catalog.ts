import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  admissionInformation,
  careerFields,
  careerSkills,
  careers,
  courses,
  entranceExams,
  institutionCourses,
  institutionSources,
  institutions,
  opportunities,
  pathways,
  scholarships,
} from "@/db/schema";
import { CAREER_SEEDS, CAREER_SKILL_SEEDS, FIELD_SEEDS } from "@/data/fields";
import { COURSE_SEEDS, EXAM_SEEDS, OPPORTUNITY_SEEDS, PATHWAY_SEEDS, SCHOLARSHIP_SEEDS } from "@/data/learning";
import { INSTITUTION_COURSE_SEEDS, INSTITUTION_SEEDS, NAGALAND_DISTRICTS } from "@/data/institutions";

export type Field = typeof careerFields.$inferSelect;
export type Career = typeof careers.$inferSelect;
export type CareerSkill = typeof careerSkills.$inferSelect;
export type Pathway = typeof pathways.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Institution = typeof institutions.$inferSelect;
export type InstitutionCourse = typeof institutionCourses.$inferSelect;
export type InstitutionSource = typeof institutionSources.$inferSelect;
export type AdmissionInfo = typeof admissionInformation.$inferSelect;
export type Exam = typeof entranceExams.$inferSelect;
export type Scholarship = typeof scholarships.$inferSelect;
export type Opportunity = typeof opportunities.$inferSelect;

/** Static seed rows are shaped like DB rows; ids/timestamps are synthesised. */
function asRows<T>(seeds: unknown[]): T[] {
  return seeds.map((seed, index) => ({
    id: -(index + 1),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...(seed as object),
  })) as T[];
}

async function query<T>(run: () => Promise<T[]>, fallback: () => T[]): Promise<T[]> {
  try {
    await ensureSeeded();
    const rows = await run();
    return rows.length ? rows : fallback();
  } catch (error) {
    console.error("[careerbridge] catalog query failed, using bundled content", error);
    return fallback();
  }
}

/* ----------------------------- fields & careers ---------------------------- */

export async function getFields(): Promise<Field[]> {
  return query<Field>(
    () => db.select().from(careerFields).orderBy(asc(careerFields.orderIndex)),
    () => asRows<Field>(FIELD_SEEDS),
  );
}

export async function getField(slug: string): Promise<Field | null> {
  const rows = await query<Field>(
    () => db.select().from(careerFields).where(eq(careerFields.slug, slug)).limit(1),
    () => asRows<Field>(FIELD_SEEDS.filter((f) => f.slug === slug)),
  );
  return rows[0] ?? null;
}

export async function getCareers(fieldSlug?: string): Promise<Career[]> {
  return query<Career>(
    () =>
      fieldSlug
        ? db.select().from(careers).where(eq(careers.fieldSlug, fieldSlug)).orderBy(asc(careers.title))
        : db.select().from(careers).orderBy(asc(careers.title)),
    () => asRows<Career>(fieldSlug ? CAREER_SEEDS.filter((c) => c.fieldSlug === fieldSlug) : CAREER_SEEDS),
  );
}

export async function getCareer(slug: string): Promise<Career | null> {
  const rows = await query<Career>(
    () => db.select().from(careers).where(eq(careers.slug, slug)).limit(1),
    () => asRows<Career>(CAREER_SEEDS.filter((c) => c.slug === slug)),
  );
  return rows[0] ?? null;
}

export async function getCareerSkills(careerSlug: string): Promise<CareerSkill[]> {
  return query<CareerSkill>(
    () => db.select().from(careerSkills).where(eq(careerSkills.careerSlug, careerSlug)),
    () => asRows<CareerSkill>(CAREER_SKILL_SEEDS.filter((s) => s.careerSlug === careerSlug)),
  );
}

/* --------------------------------- pathways -------------------------------- */

export async function getPathways(filter: { stage?: string; fieldSlug?: string } = {}): Promise<Pathway[]> {
  const rows = await query<Pathway>(
    () => db.select().from(pathways).orderBy(asc(pathways.entryStage), asc(pathways.title)),
    () => asRows<Pathway>(PATHWAY_SEEDS),
  );
  return rows.filter(
    (p) =>
      (!filter.stage || p.entryStage === filter.stage) && (!filter.fieldSlug || p.fieldSlug === filter.fieldSlug),
  );
}

export async function getPathway(slug: string): Promise<Pathway | null> {
  const rows = await query<Pathway>(
    () => db.select().from(pathways).where(eq(pathways.slug, slug)).limit(1),
    () => asRows<Pathway>(PATHWAY_SEEDS.filter((p) => p.slug === slug)),
  );
  return rows[0] ?? null;
}

/* --------------------------------- courses --------------------------------- */

export async function getCourses(filter: { fieldSlug?: string; level?: string; slugs?: string[] } = {}): Promise<Course[]> {
  const rows = await query<Course>(
    () => db.select().from(courses).orderBy(asc(courses.name)),
    () => asRows<Course>(COURSE_SEEDS),
  );
  return rows.filter(
    (c) =>
      (!filter.fieldSlug || c.fieldSlug === filter.fieldSlug) &&
      (!filter.level || c.level === filter.level) &&
      (!filter.slugs || filter.slugs.includes(c.slug)),
  );
}

export async function getCourse(slug: string): Promise<Course | null> {
  const rows = await query<Course>(
    () => db.select().from(courses).where(eq(courses.slug, slug)).limit(1),
    () => asRows<Course>(COURSE_SEEDS.filter((c) => c.slug === slug)),
  );
  return rows[0] ?? null;
}

/* ------------------------------- institutions ------------------------------ */

export type InstitutionFilter = {
  q?: string;
  district?: string;
  type?: string;
  ownership?: string;
  level?: string;
  fieldSlug?: string;
  courseSlug?: string;
  hostel?: string;
};

export async function getInstitutions(filter: InstitutionFilter = {}): Promise<Institution[]> {
  const rows = await query<Institution>(
    () => db.select().from(institutions).orderBy(asc(institutions.name)),
    () => asRows<Institution>(INSTITUTION_SEEDS),
  );

  let courseFiltered: Set<string> | null = null;
  if (filter.courseSlug) {
    const links = await getInstitutionLinksForCourse(filter.courseSlug);
    courseFiltered = new Set(links.map((l) => l.institutionCode));
  }

  const q = filter.q?.trim().toLowerCase();
  return rows.filter((inst) => {
    if (filter.district && inst.district !== filter.district) return false;
    if (filter.type && inst.type !== filter.type) return false;
    if (filter.ownership && inst.ownership !== filter.ownership) return false;
    if (filter.level && !(inst.studyLevels ?? []).includes(filter.level)) return false;
    if (filter.fieldSlug && !(inst.fieldSlugs ?? []).includes(filter.fieldSlug)) return false;
    if (filter.hostel && inst.hostelAvailable !== filter.hostel) return false;
    if (courseFiltered && !courseFiltered.has(inst.code)) return false;
    if (q) {
      const haystack = `${inst.name} ${inst.district} ${inst.city ?? ""} ${inst.type} ${inst.ownership}`.toLowerCase();
      if (!fuzzyIncludes(haystack, q)) return false;
    }
    return true;
  });
}

export async function getInstitution(code: string): Promise<Institution | null> {
  const rows = await query<Institution>(
    () => db.select().from(institutions).where(eq(institutions.code, code)).limit(1),
    () => asRows<Institution>(INSTITUTION_SEEDS.filter((i) => i.code === code)),
  );
  return rows[0] ?? null;
}

export async function getInstitutionLinks(code: string): Promise<InstitutionCourse[]> {
  return query<InstitutionCourse>(
    () => db.select().from(institutionCourses).where(eq(institutionCourses.institutionCode, code)),
    () => asRows<InstitutionCourse>(INSTITUTION_COURSE_SEEDS.filter((l) => l.institutionCode === code)),
  );
}

export async function getInstitutionLinksForCourse(courseSlug: string): Promise<InstitutionCourse[]> {
  return query<InstitutionCourse>(
    () => db.select().from(institutionCourses).where(eq(institutionCourses.courseSlug, courseSlug)),
    () => asRows<InstitutionCourse>(INSTITUTION_COURSE_SEEDS.filter((l) => l.courseSlug === courseSlug)),
  );
}

export async function getInstitutionsForCourse(courseSlug: string): Promise<Institution[]> {
  const links = await getInstitutionLinksForCourse(courseSlug);
  if (!links.length) return [];
  const codes = links.map((l) => l.institutionCode);
  const rows = await query<Institution>(
    () => db.select().from(institutions).where(inArray(institutions.code, codes)),
    () => asRows<Institution>(INSTITUTION_SEEDS.filter((i) => codes.includes(i.code))),
  );
  return rows;
}

export async function getInstitutionSources(code: string): Promise<InstitutionSource[]> {
  return query<InstitutionSource>(
    () => db.select().from(institutionSources).where(eq(institutionSources.institutionCode, code)),
    () => [],
  );
}

export async function getAdmissionInfo(code: string): Promise<AdmissionInfo[]> {
  return query<AdmissionInfo>(
    () => db.select().from(admissionInformation).where(eq(admissionInformation.institutionCode, code)),
    () => [],
  );
}

export function getDistricts(): string[] {
  return NAGALAND_DISTRICTS.slice().sort((a, b) => a.localeCompare(b));
}

/* ----------------------- exams, scholarships, skills ----------------------- */

export async function getExams(filter: { slugs?: string[] } = {}): Promise<Exam[]> {
  const rows = await query<Exam>(
    () => db.select().from(entranceExams).orderBy(asc(entranceExams.name)),
    () => asRows<Exam>(EXAM_SEEDS),
  );
  return filter.slugs ? rows.filter((e) => filter.slugs!.includes(e.slug)) : rows;
}

export async function getExam(slug: string): Promise<Exam | null> {
  const rows = await getExams();
  return rows.find((e) => e.slug === slug) ?? null;
}

export async function getScholarships(filter: { stage?: string } = {}): Promise<Scholarship[]> {
  const rows = await query<Scholarship>(
    () => db.select().from(scholarships).orderBy(asc(scholarships.name)),
    () => asRows<Scholarship>(SCHOLARSHIP_SEEDS),
  );
  return filter.stage ? rows.filter((s) => (s.appliesToStage ?? []).includes(filter.stage!)) : rows;
}

export async function getOpportunities(filter: { fieldSlug?: string; type?: string } = {}): Promise<Opportunity[]> {
  const rows = await query<Opportunity>(
    () => db.select().from(opportunities).orderBy(asc(opportunities.title)),
    () => asRows<Opportunity>(OPPORTUNITY_SEEDS),
  );
  return rows.filter(
    (o) =>
      (!filter.fieldSlug || (o.fieldSlugs ?? []).includes(filter.fieldSlug)) &&
      (!filter.type || o.type === filter.type),
  );
}

/* ---------------------------------- search --------------------------------- */

/** Tolerant matching: substring, token overlap, or small edit distance. */
export function fuzzyIncludes(haystack: string, needle: string): boolean {
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase().trim();
  if (!n) return true;
  if (h.includes(n)) return true;
  const words = n.split(/\s+/).filter(Boolean);
  if (words.length > 1) return words.every((w) => h.includes(w));
  return h.split(/[^a-z0-9]+/).some((token) => token.length > 3 && editDistance(token, n) <= (n.length > 6 ? 2 : 1));
}

export function editDistance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length];
}

export type SearchResult = {
  type: "field" | "career" | "course" | "institution" | "exam" | "scholarship" | "opportunity" | "pathway";
  title: string;
  subtitle: string;
  href: string;
};

export async function searchEverything(rawQuery: string, limit = 24): Promise<SearchResult[]> {
  const q = rawQuery.trim();
  if (!q) return [];
  const [fields, careerRows, courseRows, institutionRows, examRows, scholarshipRows, opportunityRows, pathwayRows] =
    await Promise.all([
      getFields(),
      getCareers(),
      getCourses(),
      getInstitutions(),
      getExams(),
      getScholarships(),
      getOpportunities(),
      getPathways(),
    ]);

  const results: SearchResult[] = [];
  const push = (ok: boolean, result: SearchResult) => {
    if (ok) results.push(result);
  };

  for (const f of fields)
    push(fuzzyIncludes(`${f.name} ${f.tagline ?? ""} ${(f.interestTags ?? []).join(" ")}`, q), {
      type: "field",
      title: f.name,
      subtitle: f.tagline ?? "Career field",
      href: `/explore/${f.slug}`,
    });
  for (const c of careerRows)
    push(fuzzyIncludes(`${c.title} ${c.summary}`, q), {
      type: "career",
      title: c.title,
      subtitle: c.summary,
      href: `/careers/${c.slug}`,
    });
  for (const c of courseRows)
    push(fuzzyIncludes(`${c.name} ${c.level} ${(c.careerDirections ?? []).join(" ")}`, q), {
      type: "course",
      title: c.name,
      subtitle: `${c.level.replace("_", " ")} · ${c.durationLabel ?? "duration varies"}`,
      href: `/courses/${c.slug}`,
    });
  for (const i of institutionRows)
    push(fuzzyIncludes(`${i.name} ${i.district} ${i.city ?? ""}`, q), {
      type: "institution",
      title: i.name,
      subtitle: `${i.city ?? i.district}, ${i.district} district`,
      href: `/institutions/${i.code}`,
    });
  for (const e of examRows)
    push(fuzzyIncludes(`${e.name} ${e.shortName ?? ""} ${(e.appliesTo ?? []).join(" ")}`, q), {
      type: "exam",
      title: e.shortName ? `${e.shortName} — ${e.name}` : e.name,
      subtitle: e.conductingBody ?? "Entrance examination",
      href: `/exams#${e.slug}`,
    });
  for (const s of scholarshipRows)
    push(fuzzyIncludes(`${s.name} ${s.provider ?? ""} ${s.category ?? ""}`, q), {
      type: "scholarship",
      title: s.name,
      subtitle: s.provider ?? "Scholarship",
      href: `/scholarships#${s.slug}`,
    });
  for (const o of opportunityRows)
    push(fuzzyIncludes(`${o.title} ${o.description ?? ""}`, q), {
      type: "opportunity",
      title: o.title,
      subtitle: o.provider ?? "Opportunity",
      href: `/opportunities#${o.slug}`,
    });
  for (const p of pathwayRows)
    push(fuzzyIncludes(`${p.title} ${p.description}`, q), {
      type: "pathway",
      title: p.title,
      subtitle: p.entryStage === "class10" ? "Pathway from Class 10" : "Pathway from Class 12",
      href: `/pathways/${p.slug}`,
    });

  return results.slice(0, limit);
}

export async function catalogCounts() {
  try {
    await ensureSeeded();
    const rows = await db.execute<{ institutions: string; courses: string; careers: string }>(sql`
      select
        (select count(*) from institutions)::text as institutions,
        (select count(*) from courses)::text as courses,
        (select count(*) from careers)::text as careers
    `);
    const row = rows.rows[0];
    return {
      institutions: Number(row?.institutions ?? INSTITUTION_SEEDS.length),
      courses: Number(row?.courses ?? COURSE_SEEDS.length),
      careers: Number(row?.careers ?? CAREER_SEEDS.length),
    };
  } catch {
    return { institutions: INSTITUTION_SEEDS.length, courses: COURSE_SEEDS.length, careers: CAREER_SEEDS.length };
  }
}

export const catalogFilters = {
  institutionTypes: ["university", "college", "institute", "polytechnic", "iti"],
  ownerships: ["government", "private", "autonomous", "central"],
  levels: ["higher_secondary", "certificate", "diploma", "undergraduate", "postgraduate"],
};

export function levelLabel(level: string) {
  return level
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export const _internal = { and };
