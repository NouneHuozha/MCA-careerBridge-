import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, GraduationCap, MapPin, Navigation, ShieldCheck } from "lucide-react";
import { InstitutionMap } from "@/components/institution-map";
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
import { getAdmissionInfo, getCourses, getInstitution, getInstitutionLinks, getInstitutionSources, getInstitutions } from "@/services/catalog";
import { mapSearchUrl } from "@/maps";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return { title: (await getInstitution((await params).code))?.name ?? "Institution" };
}

export default async function InstitutionPage({ params }: { params: Promise<{ code: string }> }) {
  const institution = await getInstitution((await params).code);
  if (!institution) notFound();

  const [links, sources, admissions, allCourses, nearby] = await Promise.all([
    getInstitutionLinks(institution.code),
    getInstitutionSources(institution.code),
    getAdmissionInfo(institution.code),
    getCourses({}),
    getInstitutions({ district: institution.district }),
  ]);
  const offered = links.flatMap((link) => {
    const course = allCourses.find((item) => item.slug === link.courseSlug);
    return course ? [{ ...course, seatsNote: link.seatsNote, feeNote: link.feeNote }] : [];
  });
  const admission = admissions[0];
  const point = institution.latitude != null && institution.longitude != null
    ? { latitude: institution.latitude, longitude: institution.longitude }
    : null;
  const mapHref = mapSearchUrl(`${institution.name} ${institution.district} Nagaland`);
  const districtName = institution.city ? `${institution.city}, ${institution.district}` : institution.district;

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: "Institutions", href: "/institutions" },
        { label: institution.name },
      ]} />

      <LibraryDetailIntro
        variant="institution"
        title={institution.name}
        titleClassName="max-w-[24ch] text-[clamp(1.75rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-.055em] text-[#17201b]"
        description={institution.about ?? `${institution.name} is listed in ${institution.district}, Nagaland. Review the connected course and admission information, then confirm current details with the institution.`}
        facts={
          <>
            <span>{institution.type.replace(/_/g, " ")}</span>
            <span>{institution.ownership.replace(/_/g, " ")}</span>
            <span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4 text-[#6f887b]" />{districtName}</span>
          </>
        }
        actions={
          <>
            <SaveButton itemType="institution" itemRef={institution.code} label={institution.name} tone="forest" />
            {institution.officialWebsite && (
              <a href={institution.officialWebsite} target="_blank" rel="noreferrer" className="cb-button cb-button-primary px-5 py-2.5 text-sm">
                <ArrowRight aria-hidden="true" className="h-4 w-4 -rotate-45" /> Official website
              </a>
            )}
            <a href={mapHref} target="_blank" rel="noreferrer" className="cb-button cb-button-secondary px-5 py-2.5 text-sm">
              <Navigation aria-hidden="true" className="h-4 w-4" /> Directions
            </a>
          </>
        }
        aside={
          <aside className="bg-[#09332a] p-6 text-white sm:p-7">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-white">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#f2cf78]" /> Catalogue record
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#e3ece7]">
              This status describes the information in CareerBridge. It does not rate the institution.
            </p>
            <div className="mt-4"><VerificationBadge status={institution.verificationStatus} lastVerifiedAt={institution.lastVerifiedAt} /></div>
            {institution.lastVerifiedAt && (
              <p className="mt-3 text-sm text-[#e3ece7]">
                Last checked: {new Date(institution.lastVerifiedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            )}
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)]">
        <div className="space-y-12">
          <LibrarySection id="courses" title="Courses linked in the catalogue" intro="A listing here does not confirm that a course is currently offered or accepting applications.">
            {offered.length ? offered.map((course) => (
              <LibraryRecordLink
                key={course.slug}
                href={`/courses/${course.slug}`}
                title={course.name}
                detail={[course.level.replace(/_/g, " "), course.durationLabel, course.feeNote].filter(Boolean).join(" · ")}
                action="View course"
              />
            )) : <p className="text-sm text-[#52635a]">No courses are linked to this institution in the current catalogue.</p>}
            <Link href={`/courses?institution=${institution.code}`} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
              Browse courses <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </LibrarySection>

          <LibrarySection id="admissions" title="Admission information" intro="Admission schedules and requirements can change each cycle. Use the linked official source to confirm what applies now.">
            {admission ? (
              <div className="space-y-7">
                <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <div><dt className="font-semibold">Admission cycle</dt><dd className="mt-1 text-sm text-[#405349]">{admission.cycleLabel || "Not currently listed"}</dd></div>
                  <div><dt className="font-semibold">Application window</dt><dd className="mt-1 text-sm text-[#405349]">{admission.applicationWindow || "Not currently confirmed"}</dd></div>
                  <div><dt className="font-semibold">Application fee</dt><dd className="mt-1 text-sm text-[#405349]">{admission.applicationFeeNote || "Not currently listed"}</dd></div>
                  <div><dt className="font-semibold">Course fees</dt><dd className="mt-1 text-sm text-[#405349]">{admission.courseFeeNote || admission.feesNote || "Not currently listed"}</dd></div>
                </dl>
                {admission.importantDates?.length ? (
                  <div>
                    <h3 className="text-lg font-semibold">Important dates</h3>
                    <dl className="mt-3 space-y-3">
                      {admission.importantDates.map((date) => (
                        <div key={`${date.label}-${date.value}`} className="grid gap-1 bg-[#edf1ee] px-4 py-3 sm:grid-cols-[minmax(130px,.35fr)_1fr]">
                          <dt className="font-semibold">{date.label}</dt>
                          <dd className="text-sm text-[#405349]">{date.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
                {admission.process?.length ? (
                  <div>
                    <h3 className="text-lg font-semibold">Process notes</h3>
                    <ul className="mt-3 space-y-3 text-sm leading-relaxed text-[#405349]">
                      {admission.process.map((step) => <li key={step}>{step}</li>)}
                    </ul>
                  </div>
                ) : null}
                <VerificationBadge status={admission.verificationStatus} lastVerifiedAt={admission.lastVerifiedAt} />
                <LibrarySourceLink href={admission.sourceUrl}>{admission.sourceTitle || "Admission information source"}</LibrarySourceLink>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-[#52635a]">No admission-cycle information is currently listed. Check the institution’s official website for current notices.</p>
            )}
          </LibrarySection>

          <LibrarySection title="Sources">
            {sources.length ? sources.map((source) => (
              <div key={source.id} className="flex flex-wrap items-center justify-between gap-3 bg-[#edf1ee] px-4 py-4">
                <div>
                  <p className="font-semibold text-[#17201b]">{source.title || source.sourceType.replace(/_/g, " ")}</p>
                  <p className="mt-1 text-sm text-[#52635a]">Source status: {source.status.replace(/_/g, " ")}</p>
                </div>
                <LibrarySourceLink href={source.url}>Open source</LibrarySourceLink>
              </div>
            )) : (
              <div className="space-y-3">
                <p className="text-sm text-[#52635a]">No source records are attached to this institution entry yet.</p>
                <LibrarySourceLink href={institution.sourceUrl}>Institution source</LibrarySourceLink>
              </div>
            )}
          </LibrarySection>
        </div>

        <aside className="space-y-12">
          <LibrarySection title="Location" intro={`${districtName}, ${institution.state}, ${institution.country}`}>
            <div className="overflow-hidden bg-[#dde4df]">
              <InstitutionMap pins={nearby} origin={point} originLabel={point ? "This institution" : null} />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#405349]">
              {institution.city ? `City or town: ${institution.city}` : "A city or town is not listed for this institution."}
            </p>
          </LibrarySection>

          <LibrarySection title="Institution details">
            <dl className="space-y-5">
              <div><dt className="font-semibold">Type</dt><dd className="mt-1 text-sm capitalize text-[#405349]">{institution.type.replace(/_/g, " ")}</dd></div>
              <div><dt className="font-semibold">Ownership</dt><dd className="mt-1 text-sm capitalize text-[#405349]">{institution.ownership.replace(/_/g, " ")}</dd></div>
              <div><dt className="font-semibold">Study levels</dt><dd className="mt-1 text-sm text-[#405349]">{institution.studyLevels?.length ? institution.studyLevels.join(", ") : "Not currently listed"}</dd></div>
              <div><dt className="font-semibold">Hostel availability</dt><dd className="mt-1 text-sm text-[#405349]">{institution.hostelAvailable.replace(/_/g, " ")}</dd></div>
              <div><dt className="font-semibold">Fee range</dt><dd className="mt-1 text-sm text-[#405349]">{institution.feeRangeNote || "Not currently listed"}</dd></div>
            </dl>
          </LibrarySection>

          {institution.studyLevels?.length ? (
            <LibrarySection title="Explore by study level">
              <Link href="/courses" className="inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
                Browse course options <GraduationCap aria-hidden="true" className="h-4 w-4" />
              </Link>
            </LibrarySection>
          ) : null}
        </aside>
      </div>

      <div className="mt-14">
        <ReportCatalogueIssue entityType="institution" entityRef={institution.code} entityName={institution.name} sourceUrl={institution.sourceUrl ?? institution.officialWebsite} />
      </div>
    </LibraryDetailFrame>
  );
}
