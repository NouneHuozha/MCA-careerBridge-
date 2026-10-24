import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Building2, BriefcaseBusiness, GraduationCap, Lightbulb, Route } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import {
  LibraryBreadcrumbs,
  LibraryDetailFrame,
  LibraryDetailIntro,
  LibraryRecordLink,
  LibrarySection,
} from "@/components/library-detail";
import { LibraryReveal } from "@/components/library-motion";
import {
  getCareer,
  getCareerSkills,
  getCareers,
  getCourses,
  getExams,
  getField,
  getInstitutionsForCourse,
  getPathways,
} from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await getCareer((await params).slug))?.title ?? "Career" };
}

export default async function CareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const career = await getCareer((await params).slug);
  if (!career) notFound();

  const [field, skills, courses, exams, allPaths, relatedCareers] = await Promise.all([
    getField(career.fieldSlug),
    getCareerSkills(career.slug),
    getCourses({ slugs: career.courseSlugs ?? [] }),
    getExams({ slugs: career.examSlugs ?? [] }),
    getPathways({}),
    getCareers(career.fieldSlug),
  ]);
  const paths = allPaths.filter((path) => (career.pathwaySlugs ?? []).includes(path.slug));
  const related = relatedCareers.filter(
    (item) => item.slug !== career.slug && (career.relatedCareers ?? []).includes(item.slug),
  );
  const linkedInstitutions = await Promise.all(courses.map((course) => getInstitutionsForCourse(course.slug)));
  const institutions = [...new Map(linkedInstitutions.flat().map((item) => [item.code, item])).values()];
  const skillItems = skills.length ? skills.map((item) => item.skill) : field?.skills ?? [];

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: "Careers", href: "/careers" },
        { label: career.title },
      ]} />

      <LibraryDetailIntro
        variant="career"
        title={career.title}
        description={career.summary}
        facts={
          <>
            {field && <span>Career area: <Link className="font-semibold underline underline-offset-4" href={`/explore/${field.slug}`}>{field.name}</Link></span>}
            {career.entryEducation && <span>Education: {career.entryEducation}</span>}
          </>
        }
        actions={
              <SaveButton itemType="career" itemRef={career.slug} label={career.title} tone="forest" />
        }
        aside={
          <aside className="bg-[#09332a] p-6 text-white sm:p-7">
            <h2 className="text-xl font-semibold leading-tight tracking-[-.03em] text-white">A closer look at the work</h2>
            <p className="mt-4 text-base leading-relaxed text-[#e3ece7]">
              Careers can vary by employer, training and experience. Use this overview to explore the work, then check the routes connected to it.
            </p>
            {career.workContexts?.length ? (
              <ul className="mt-5 space-y-2 text-base text-white">
                {career.workContexts.slice(0, 4).map((context) => <li key={context}>{context}</li>)}
              </ul>
            ) : null}
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(250px,.62fr)]">
        <div className="space-y-12">
          <LibrarySection
            title="What the work can involve"
            intro="Day-to-day responsibilities differ across roles and workplaces. These examples describe the catalogue entry, not a guarantee of a specific job."
          >
            {career.whatItInvolves?.length ? (
              <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {career.whatItInvolves.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed text-[#263a30]">
                    <BriefcaseBusiness aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#6f887b]" />
                    {item}
                  </li>
                ))}
              </ul>
            ) : <p className="text-[#52635a]">A task description has not been added to this catalogue entry yet.</p>}
          </LibrarySection>

          <LibrarySection title="Subjects and skills to explore">
            <div className="grid gap-10 sm:grid-cols-2">
              <div>
                <h3 className="flex items-center gap-3 text-lg font-semibold text-[#17201b]">
                  <BookOpen aria-hidden="true" className="h-5 w-5 text-[#6f887b]" /> Helpful subjects
                </h3>
                {career.subjects?.length ? (
                  <ul className="mt-4 space-y-3">
                    {career.subjects.map((subject) => <li key={subject} className="bg-[#dde4df] px-4 py-3 text-base text-[#17201b]">{subject}</li>)}
                  </ul>
                ) : <p className="mt-4 text-base text-[#52635a]">No subject notes are listed yet.</p>}
              </div>
              <div>
                <h3 className="flex items-center gap-3 text-lg font-semibold text-[#17201b]">
                  <Lightbulb aria-hidden="true" className="h-5 w-5 text-[#6f887b]" /> Skills to build
                </h3>
                {skillItems.length ? (
                  <ul className="mt-4 space-y-3">
                    {skillItems.map((skill) => <li key={skill} className="bg-[#edf1ee] px-4 py-3 text-base leading-relaxed text-[#263a30]">{skill}</li>)}
                  </ul>
                ) : <p className="mt-4 text-base text-[#52635a]">No skills are listed for this entry yet.</p>}
              </div>
            </div>
            {skills.some((item) => item.howToBuild) && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#17201b]">Ways to practise</h3>
                <ul className="mt-3 space-y-3">
                  {skills.filter((item) => item.howToBuild).map((item) => (
                    <li key={item.id} className="grid gap-1 bg-[#f0f3f1] px-4 py-3 sm:grid-cols-[minmax(150px,.35fr)_1fr]">
                      <span className="text-base font-medium text-[#17201b]">{item.skill}</span>
                      <span className="text-base leading-relaxed text-[#405349]">{item.howToBuild}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </LibrarySection>

          <LibrarySection
            title="Routes and study options"
            intro="There can be more than one way to work towards a role. Compare the linked routes and course details before deciding."
          >
            {paths.length ? paths.map((path) => (
              <LibraryRecordLink key={path.slug} href={`/pathways/${path.slug}`} title={path.title} detail={path.typicalDuration} action="View pathway" />
            )            ) : <p className="text-base text-[#52635a]">No pathways are linked to this career entry yet.</p>}
            {courses.length > 0 && <div className="mt-8">
              <h3 className="text-lg font-semibold text-[#17201b]">Related courses</h3>
              {courses.map((course) => <LibraryRecordLink key={course.slug} href={`/courses/${course.slug}`} title={course.name} detail={course.durationLabel} action="View course" />)}
            </div>}
          </LibrarySection>
        </div>

        <aside className="space-y-12">
          <LibrarySection title="Questions worth asking">
            {career.questionsToConsider?.length ? (
              <ul className="space-y-4">
                {career.questionsToConsider.map((question) => <li key={question} className="border-l-4 border-[#6f887b] pl-4 text-base leading-relaxed text-[#263a30]">{question}</li>)}
              </ul>
            ) : <p className="text-base text-[#52635a]">No reflection prompts are listed for this career yet.</p>}
            {career.challenges?.length ? <div className="mt-8">
              <h3 className="text-lg font-semibold">Things to consider</h3>
              <ul className="mt-3 space-y-3 text-base leading-relaxed text-[#405349]">
                {career.challenges.map((challenge) => <li key={challenge}>{challenge}</li>)}
              </ul>
            </div> : null}
            {career.alternativeRoutes?.length ? <div className="mt-8">
              <h3 className="text-lg font-semibold">Alternative routes</h3>
              <ul className="mt-3 space-y-3 text-base leading-relaxed text-[#405349]">
                {career.alternativeRoutes.map((route) => <li key={route}>{route}</li>)}
              </ul>
            </div> : null}
          </LibrarySection>

          {related.length > 0 && (
            <LibrarySection title="Related careers" intro="Compare related roles to see how their work and routes may differ.">
              {related.map((item) => (
                <LibraryRecordLink key={item.slug} href={`/careers/${item.slug}`} title={item.title} detail={item.summary} action="Explore career" />
              ))}
              {related[0] && (
                <Link href={`/compare?type=career&a=${career.slug}&b=${related[0].slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
                  Compare these careers <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}
            </LibrarySection>
          )}

          {exams.length > 0 && (
            <LibrarySection title="Entrance exams to research">
              {exams.map((exam) => <LibraryRecordLink key={exam.slug} href={`/exams/${exam.slug}`} title={exam.shortName ?? exam.name} detail={exam.conductingBody} action="View exam" />)}
            </LibrarySection>
          )}

          {institutions.length > 0 && (
            <LibrarySection title="Institutions connected to related courses">
              {institutions.slice(0, 6).map((institution) => (
                <LibraryRecordLink key={institution.code} href={`/institutions/${institution.code}`} title={institution.name} detail={institution.district} action="View institution" />
              ))}
              {institutions.length > 6 && (
                <Link href="/institutions" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
                  Browse all institutions <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}
            </LibrarySection>
          )}
        </aside>
      </div>

      <LibraryReveal className="mt-14 bg-[#dde4df] p-5 sm:p-7">
        <p className="max-w-[55ch] text-base leading-relaxed text-[#263a30]">Career descriptions are general information for exploration. They do not promise a job, salary or admission outcome. Confirm course and entry details with the relevant institution.</p>
      </LibraryReveal>
    </LibraryDetailFrame>
  );
}
