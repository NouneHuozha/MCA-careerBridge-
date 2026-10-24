import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, FileText, GraduationCap, ShieldCheck } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { ReportCatalogueIssue } from "@/components/report-catalogue-issue";
import { VerificationBadge } from "@/components/ui";
import {
  LibraryBreadcrumbs,
  LibraryDetailFrame,
  LibraryDetailIntro,
  LibrarySection,
  LibrarySourceLink,
} from "@/components/library-detail";
import { getExam } from "@/services/catalog";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return { title: (await getExam((await params).slug))?.shortName ?? "Entrance exam" };
}

const dateFields = [
  ["Application period", "applicationPeriod"],
  ["Exam date", "examDate"],
  ["Correction window", "correctionWindow"],
  ["Result date", "resultDate"],
] as const;

export default async function ExamPage({ params }: { params: Promise<{ slug: string }> }) {
  const exam = await getExam((await params).slug);
  if (!exam) notFound();

  const stageLabel = exam.levelStage === "after_class10"
    ? "After Class 10"
    : exam.levelStage === "after_class12"
      ? "After Class 12"
      : null;
  const cycleDates = dateFields.filter(([, key]) => exam[key]);
  const documents = Object.entries(exam.documentStatus ?? {});
  const requiredDocuments = (exam.documents ?? []).filter((document) => !exam.documentStatus?.[document]);

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: "Exams", href: "/exams" },
        { label: exam.shortName ?? exam.name },
      ]} />

      <LibraryDetailIntro
        variant="exam"
        title={exam.shortName ?? exam.name}
        titleClassName="max-w-[24ch] text-[clamp(1.75rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-.055em] text-[#17201b]"
        description={`${exam.shortName ? `${exam.shortName} is an entrance examination. ` : "This entrance examination "}Review its eligibility and cycle details, then confirm current requirements in the official notification.`}
        facts={
          <>
            {exam.shortName && exam.shortName !== exam.name && <span className="basis-full text-base">Official name: {exam.name}</span>}
            {stageLabel && <span>{stageLabel}</span>}
            {exam.conductingBody && <span>Conducted by {exam.conductingBody}</span>}
            {exam.cycleLabel && <span>Cycle: {exam.cycleLabel}</span>}
          </>
        }
        actions={
          <>
            <SaveButton itemType="exam" itemRef={exam.slug} label={exam.shortName ?? exam.name} tone="forest" />
            {exam.officialWebsite && (
              <LibrarySourceLink href={exam.officialWebsite}>Official examination website</LibrarySourceLink>
            )}
            <Link href="/courses" className="cb-button cb-button-secondary px-5 py-2.5 text-sm">
              <GraduationCap className="h-4 w-4" /> Browse courses
            </Link>
          </>
        }
        aside={
          <aside className="bg-[#09332a] p-6 text-white sm:p-7">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-white">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#f2cf78]" /> Check the current notice
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#e3ece7]">
              Dates and eligibility can change each cycle. Confirm the latest notification before planning an application.
            </p>
            <div className="mt-5"><VerificationBadge status={exam.verificationStatus} lastVerifiedAt={exam.lastVerifiedAt} /></div>
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(250px,.62fr)]">
        <div className="space-y-12">
          <LibrarySection id="eligibility" title="Who may apply">
            <dl className="grid gap-7 sm:grid-cols-2">
              <div><dt className="font-semibold text-[#17201b]">Eligibility</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{exam.eligibility || "Eligibility details are not currently listed. Check the official notification."}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Academic conditions</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{exam.minimumAcademicCondition || "Academic conditions are not currently confirmed."}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Required subjects</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{exam.requiredSubjects?.length ? exam.requiredSubjects.join(", ") : "No subject requirements are listed."}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Age and attempts</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{exam.ageAttemptNotes || "Age limits or attempt rules are not currently listed."}</dd></div>
            </dl>
            {exam.appliesTo?.length ? <div className="mt-8">
              <h3 className="font-semibold">Programmes listed</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#405349]">{exam.appliesTo.map((item) => <li key={item}>{item}</li>)}</ul>
            </div> : null}
          </LibrarySection>

          <LibrarySection id="dates" title="Dates and application cycle" intro="Treat these dates as catalogue notes, not as a live application calendar. Confirm every date with the conducting body.">
            <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-[#17201b]"><CalendarDays aria-hidden="true" className="h-5 w-5 text-[#6f887b]" />{exam.cycleLabel || "Cycle not currently recorded"}</div>
            {cycleDates.length ? (
              <dl className="space-y-0">
                {cycleDates.map(([label, key]) => <div key={key} className="grid gap-1 bg-[#dde4df] px-4 py-4 sm:grid-cols-[minmax(140px,.35fr)_1fr]"><dt className="font-semibold">{label}</dt><dd className="text-sm leading-relaxed text-[#405349]">{exam[key]}</dd></div>)}
              </dl>
            ) : <p className="text-sm leading-relaxed text-[#52635a]">No cycle dates are currently recorded for this exam. Check the official notification for current dates.</p>}
          </LibrarySection>

          <LibrarySection id="documents" title="Application documents">
            {documents.length || requiredDocuments.length ? (
              <ul className="space-y-0">
                {documents.map(([label, status]) => (
                  <li key={label} className="grid gap-2 bg-[#edf1ee] px-4 py-3 text-sm sm:grid-cols-[1fr_auto]">
                    <span>{label}</span>
                    <span className="font-semibold text-[#405349]">{status === "required" ? "Required" : "Not confirmed"}</span>
                  </li>
                ))}
                {requiredDocuments.map((label) => <li key={label} className="bg-[#edf1ee] px-4 py-3 text-sm">{label} <span className="font-semibold text-[#405349]">— listed; status not confirmed</span></li>)}
              </ul>
            ) : <p className="text-sm text-[#52635a]">A document list is not currently available for this entry.</p>}
            {(documents.length || requiredDocuments.length) ? <p className="mt-4 text-sm leading-relaxed text-[#52635a]">Document lists can change by cycle. An unconfirmed item should not be treated as optional.</p> : null}
          </LibrarySection>

          {exam.preparation?.length ? (
            <LibrarySection title="Preparation notes">
              <ol className="space-y-4">
                {exam.preparation.map((item, index) => <li key={item} className="flex gap-4 bg-[#dde4df] px-4 py-4"><span className="font-semibold text-[#09332a]">{index + 1}</span><span className="text-sm leading-relaxed text-[#263a30]">{item}</span></li>)}
              </ol>
            </LibrarySection>
          ) : null}
        </div>

        <aside className="space-y-12">
          <LibrarySection title="Programmes and courses">
            {exam.appliesTo?.length ? (
              <>
                <ul className="space-y-3 text-sm leading-relaxed text-[#405349]">
                  {exam.appliesTo.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <Link href="/courses" className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
                  Browse course listings <GraduationCap aria-hidden="true" className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <Link href="/courses" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
                Browse course listings <GraduationCap aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
          </LibrarySection>
          <LibrarySection title="Official source">
            <LibrarySourceLink href={exam.officialWebsite}>Open the official website</LibrarySourceLink>
            {!exam.officialWebsite && <p className="mt-3 text-sm leading-relaxed text-[#52635a]">No official website is recorded here. Search for the current notice from the conducting body.</p>}
          </LibrarySection>
        </aside>
      </div>

      <div className="mt-14">
        <ReportCatalogueIssue entityType="entrance_exam" entityRef={exam.slug} entityName={exam.shortName ?? exam.name} sourceUrl={exam.officialWebsite} />
      </div>
      <p className="mt-6 flex items-start gap-3 bg-[#dde4df] px-5 py-4 text-sm leading-relaxed text-[#263a30]">
        <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#09332a]" />
        Exam dates, fees and eligibility can change each cycle. Confirm current details on the official notification before applying.
      </p>
    </LibraryDetailFrame>
  );
}
