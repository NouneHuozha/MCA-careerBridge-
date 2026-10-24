import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, Building2, Scale } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { ReportCatalogueIssue } from "@/components/report-catalogue-issue";
import { VerificationBadge } from "@/components/ui";
import {
  LibraryBreadcrumbs,
  LibraryDetailFrame,
  LibraryDetailIntro,
  LibraryRecordLink,
  LibrarySection,
  LibrarySourceLink,
} from "@/components/library-detail";
import { getCourse, getExams, getField, getInstitutionsForCourse } from "@/services/catalog";
import { levelLabelSafe } from "@/components/course-helpers";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await getCourse((await params).slug))?.name ?? "Course" };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const course = await getCourse((await params).slug);
  if (!course) notFound();

  const [institutions, exams, field] = await Promise.all([
    getInstitutionsForCourse(course.slug),
    getExams({ slugs: course.examSlugs ?? [] }),
    course.fieldSlug ? getField(course.fieldSlug) : Promise.resolve(null),
  ]);
  const requirements = [course.eligibility, course.entranceRequirement].filter((value): value is string => Boolean(value));
  const verificationDate = course.lastVerifiedAt
    ? new Date(course.lastVerifiedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: "Courses", href: "/courses" },
        { label: course.name },
      ]} />

      <LibraryDetailIntro
        variant="course"
        title={course.name}
        titleClassName="max-w-[24ch] text-[clamp(1.75rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-.055em] text-[#17201b]"
        description={field
          ? `${course.name} is listed in the ${field.name} area. Use the details below to explore its subjects, entry notes and connected institutions.`
          : "Explore the subjects, entry notes and institutions connected to this course catalogue entry."}
        facts={
          <>
            <span>{levelLabelSafe(course.level)}</span>
            {course.durationLabel && <span>{course.durationLabel}</span>}
            {field && <Link href={`/explore/${field.slug}`} className="font-semibold underline underline-offset-4">{field.name}</Link>}
          </>
        }
        actions={
          <>
            <SaveButton itemType="course" itemRef={course.slug} label={course.name} tone="forest" />
            <a href="#institutions" className="cb-button cb-button-primary px-5 py-2.5 text-sm">
              <Building2 className="h-4 w-4" /> Find institutions
            </a>
            <Link href={`/compare?type=course&a=${course.slug}`} className="cb-button cb-button-secondary px-5 py-2.5 text-sm">
              <Scale className="h-4 w-4" /> Compare courses
            </Link>
          </>
        }
        aside={
          <aside className="bg-[#dde4df] p-6 sm:p-7">
            <h2 className="text-xl font-semibold tracking-[-.03em]">Course record</h2>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold">Catalogue status</p>
                <VerificationBadge status={course.verificationStatus} lastVerifiedAt={course.lastVerifiedAt} />
              </div>
              {verificationDate && <p className="text-sm text-[#405349]">Last checked: {verificationDate}</p>}
              {course.sourceUrl ? (
                <LibrarySourceLink href={course.sourceUrl}>Open listed source</LibrarySourceLink>
              ) : <p className="text-sm text-[#52635a]">A source link is not currently recorded.</p>}
            </div>
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(250px,.62fr)]">
        <div className="space-y-12">
          <LibrarySection title="What you may study" intro="Subjects listed for this course entry are shown below. The exact curriculum is set by the institution.">
            {course.relevantSubjects?.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.relevantSubjects.map((subject) => <li key={subject} className="bg-[#dde4df] px-4 py-4 text-base text-[#17201b]">{subject}</li>)}
              </ul>
            ) : <p className="text-sm text-[#52635a]">A subject list is not available for this course entry yet.</p>}
          </LibrarySection>

          <LibrarySection title="Entry requirements" intro="Requirements may vary by institution and admission cycle. Confirm the current rules before applying.">
            {requirements.length ? (
              <ul className="space-y-4">
                {requirements.map((item) => <li key={item} className="max-w-[70ch] bg-[#edf1ee] px-5 py-4 text-base leading-relaxed text-[#263a30]">{item}</li>)}
              </ul>
            ) : <p className="text-sm text-[#52635a]">Entry requirements are not currently listed.</p>}
          </LibrarySection>

          <LibrarySection id="institutions" title="Institutions linked in the catalogue" intro="A listed link does not confirm current course availability. Check the institution’s latest prospectus or admission notice.">
            {institutions.length ? institutions.map((institution) => (
              <LibraryRecordLink key={institution.code} href={`/institutions/${institution.code}`} title={institution.name} detail={`${institution.city ? `${institution.city}, ` : ""}${institution.district}`} action="View institution" />
            )) : <p className="text-sm text-[#52635a]">No institutions are linked to this course in the current catalogue.</p>}
          </LibrarySection>
        </div>

        <aside className="space-y-12">
          <LibrarySection title="Where it may lead">
            {course.careerDirections?.length ? (
              <ul className="space-y-3 text-sm leading-relaxed text-[#263a30]">
                {course.careerDirections.map((direction) => <li key={direction} className="bg-[#f0f3f1] px-4 py-3">{direction}</li>)}
              </ul>
            ) : <p className="text-sm text-[#52635a]">No career directions are listed for this course yet.</p>}
            {course.furtherStudy?.length ? <div className="mt-7">
              <h3 className="text-lg font-semibold">Further study</h3>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#405349]">
                {course.furtherStudy.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div> : null}
            {field && <Link href={`/careers?field=${field.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
              Browse careers in {field.name} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>}
          </LibrarySection>

          <LibrarySection title="Entrance exams">
            {exams.length ? exams.map((exam) => (
              <LibraryRecordLink key={exam.slug} href={`/exams/${exam.slug}`} title={exam.shortName ?? exam.name} detail={exam.conductingBody} action="View exam" />
            )) : <p className="text-sm text-[#52635a]">No entrance exams are linked to this course entry.</p>}
          </LibrarySection>

          <LibrarySection title="Fees and support">
            <dl className="space-y-6">
              <div>
                <dt className="font-semibold text-[#17201b]">Fee note</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#405349]">{course.feeNote || "Fees are not currently listed for this course entry. Check with the institution."}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#17201b]">Scholarship note</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[#405349]">{course.scholarshipNote || "No scholarship information is currently attached to this entry."}</dd>
              </div>
            </dl>
            <Link href="/scholarships" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
              Browse scholarships <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </LibrarySection>
        </aside>
      </div>

      <div className="mt-14">
        <ReportCatalogueIssue entityType="course" entityRef={course.slug} entityName={course.name} sourceUrl={course.sourceUrl} />
      </div>
      <p className="mt-6 flex items-start gap-3 bg-[#dde4df] px-5 py-4 text-sm leading-relaxed text-[#263a30]">
        <BookOpen aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#09332a]" />
        Course details are a starting point. Confirm current admissions, subjects and costs with the institution before making decisions.
      </p>
    </LibraryDetailFrame>
  );
}
