import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, MapPin, Route, Scale } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import {
  LibraryBreadcrumbs,
  LibraryDetailFrame,
  LibraryDetailIntro,
  LibraryRecordLink,
  LibrarySection,
} from "@/components/library-detail";
import { LibraryReveal } from "@/components/library-motion";
import {
  getCareers,
  getCourses,
  getField,
  getInstitutions,
  getPathways,
} from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const field = await getField((await params).slug);
  return { title: field?.name ?? "Explore an area" };
}

export default async function FieldDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const field = await getField((await params).slug);
  if (!field) notFound();

  const [careers, courses, pathways, institutions] = await Promise.all([
    getCareers(field.slug),
    getCourses({ fieldSlug: field.slug }),
    getPathways({ fieldSlug: field.slug }),
    getInstitutions({ fieldSlug: field.slug }),
  ]);
  const exploreTags = [...new Set([
    ...(field.interestTags ?? []),
    ...(field.strengthTags ?? []),
    ...(field.goalTags ?? []),
  ])].slice(0, 8);

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: field.name },
      ]} />

      <LibraryDetailIntro
        title={field.name}
        description={field.tagline || field.overview}
        facts={
          <>
            <span>Career area</span>
            {exploreTags.map((tag) => <span key={tag}>{tag}</span>)}
          </>
        }
        actions={
          <>
            <Link href={`/careers?field=${field.slug}`} className="cb-button cb-button-primary px-5 py-2.5 text-sm">
              <BriefcaseBusiness className="h-4 w-4" /> Explore careers
            </Link>
            <Link href={`/compare?type=field&a=${field.slug}`} className="cb-button cb-button-secondary px-5 py-2.5 text-sm">
              <Scale className="h-4 w-4" /> Compare areas
            </Link>
          </>
        }
        aside={
          <aside className="bg-[#09332a] p-6 text-white sm:p-7">
            <h2 className="text-xl font-semibold text-white">An area to explore, not a decision</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#e3ece7]">
              There are many roles and study options within each area. Browse the examples below and check each course or institution for its current requirements.
            </p>
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(250px,.62fr)]">
        <div className="space-y-12">
          <LibrarySection title={`What is ${field.name}?`}>
            <p className="max-w-[70ch] text-lg leading-relaxed text-[#263a30]">{field.overview}</p>
            {field.whatPeopleDo?.length ? (
              <ul className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {field.whatPeopleDo.map((item) => <li key={item} className="flex gap-3 text-base leading-relaxed text-[#263a30]"><BriefcaseBusiness aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-[#6f887b]" />{item}</li>)}
              </ul>
            ) : null}
          </LibrarySection>

          <LibrarySection title="Careers in this area" intro="These are examples from the catalogue. Roles, qualifications and working environments vary.">
            {careers.length ? careers.map((career) => <LibraryRecordLink key={career.slug} href={`/careers/${career.slug}`} title={career.title} detail={career.summary} action="Explore career" />) : <p className="text-sm text-[#52635a]">No career entries are listed for this area yet.</p>}
          </LibrarySection>

          <LibrarySection title="Study routes and courses" intro="Explore linked routes and course entries separately; the exact choices available depend on the institution and admission cycle.">
            {pathways.length > 0 && <div>
              <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold"><Route aria-hidden="true" className="h-5 w-5 text-[#6f887b]" />Pathways</h3>
              {pathways.map((pathway) => <LibraryRecordLink key={pathway.slug} href={`/pathways/${pathway.slug}`} title={pathway.title} detail={pathway.typicalDuration} action="View pathway" />)}
            </div>}
            {courses.length > 0 && <div className="mt-8">
              <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold"><GraduationCap aria-hidden="true" className="h-5 w-5 text-[#6f887b]" />Courses</h3>
              {courses.map((course) => <LibraryRecordLink key={course.slug} href={`/courses/${course.slug}`} title={course.name} detail={[course.level.replace(/_/g, " "), course.durationLabel].filter(Boolean).join(" · ")} action="View course" />)}
            </div>}
            {!pathways.length && !courses.length && <p className="text-sm text-[#52635a]">No pathways or courses are linked to this area yet.</p>}
          </LibrarySection>
        </div>

        <aside className="space-y-12">
          {field.usefulSubjects?.length ? (
            <LibrarySection title="Subjects to explore">
              <ul className="space-y-3">
                {field.usefulSubjects.map((subject) => <li key={subject} className="bg-[#dde4df] px-4 py-3 text-sm text-[#17201b]">{subject}</li>)}
              </ul>
            </LibrarySection>
          ) : null}

          {field.skills?.length ? (
            <LibrarySection title="Skills people use">
              <ul className="space-y-3 text-sm leading-relaxed text-[#405349]">
                {field.skills.map((skill) => <li key={skill}>{skill}</li>)}
              </ul>
            </LibrarySection>
          ) : null}

          {field.pros?.length || field.challenges?.length ? (
            <LibrarySection title="Things to weigh up" intro="Every area can include different opportunities and constraints. Think about what matters to you and seek advice from trusted people.">
              {field.pros?.length ? <>
                <h3 className="font-semibold">Possibilities</h3>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#405349]">{field.pros.map((item) => <li key={item}>{item}</li>)}</ul>
              </> : null}
              {field.challenges?.length ? <>
                <h3 className="mt-7 font-semibold">Considerations</h3>
                <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#405349]">{field.challenges.map((item) => <li key={item}>{item}</li>)}</ul>
              </> : null}
            </LibrarySection>
          ) : null}

          {institutions.length > 0 && (
            <LibrarySection title="Institutions linked to this area">
              {institutions.slice(0, 8).map((institution) => (
                <LibraryRecordLink key={institution.code} href={`/institutions/${institution.code}`} title={institution.name} detail={institution.district} action="View institution" />
              ))}
              {institutions.length > 8 && <Link href={`/institutions?field=${field.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">Browse all <ArrowRight className="h-4 w-4" /></Link>}
            </LibrarySection>
          )}

          <LibrarySection title="Keep exploring">
            <div className="space-y-3">
              <ButtonLink href="/courses" variant="secondary" className="w-full justify-start"><BookOpen className="h-4 w-4" /> Browse courses</ButtonLink>
              <ButtonLink href="/institutions" variant="secondary" className="w-full justify-start"><MapPin className="h-4 w-4" /> Browse institutions</ButtonLink>
            </div>
          </LibrarySection>
        </aside>
      </div>

      <LibraryReveal className="mt-14 bg-[#dde4df] p-5 text-sm leading-relaxed text-[#263a30] sm:p-7">
        This area is for general exploration and is not a personalized recommendation. Learn about different options and verify current details with official providers.
      </LibraryReveal>
    </LibraryDetailFrame>
  );
}
