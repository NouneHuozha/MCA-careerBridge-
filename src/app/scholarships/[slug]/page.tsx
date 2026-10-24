import { notFound } from "next/navigation";
import { ArrowRight, FileCheck2 } from "lucide-react";
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
import { getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";

const stageNames: Record<string, string> = {
  class10: "Class 10",
  class12: "Class 11–12",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  certificate: "Certificate",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = (await getScholarships()).find((scholarship) => scholarship.slug === slug);
  return { title: item?.name ?? "Scholarship" };
}

export default async function ScholarshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scholarship = (await getScholarships()).find((item) => item.slug === slug);
  if (!scholarship) notFound();

  const stages = scholarship.appliesToStage ?? [];
  const titleWords = scholarship.name.split(/\s+/);
  const needsTitleContinuation = scholarship.name.length > 32;
  const displayTitle = needsTitleContinuation ? titleWords.slice(0, 3).join(" ") : scholarship.name;
  const titleContinuation = needsTitleContinuation ? titleWords.slice(3).join(" ") : "";
  const documents = (scholarship.documents ?? []).map((label) => ({
    label,
    status: scholarship.documentStatus?.[label] ?? "not_confirmed",
  }));
  const retrievedDate = scholarship.sourceRetrievedAt
    ? new Date(scholarship.sourceRetrievedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: "Scholarships", href: "/scholarships" },
        { label: scholarship.name },
      ]} />

      <LibraryDetailIntro
        variant="scholarship"
        title={displayTitle}
        titleClassName="max-w-[24ch] text-[clamp(1.75rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-.055em] text-[#17201b]"
        description={scholarship.eligibility || "Review the recorded eligibility, support and application notes. Confirm the current scheme details with its provider before applying."}
        facts={
          <>
            {titleContinuation && <span className="basis-full text-base">Continued: {titleContinuation}</span>}
            {scholarship.provider && <span>Provider: {scholarship.provider}</span>}
            {scholarship.category && <span>{scholarship.category}</span>}
            {stages.map((stage) => <span key={stage}>{stageNames[stage] ?? stage}</span>)}
          </>
        }
        actions={
          <>
            <SaveButton itemType="scholarship" itemRef={scholarship.slug} label={scholarship.name} tone="forest" />
            {scholarship.officialUrl && (
              <a href={scholarship.officialUrl} target="_blank" rel="noreferrer" className="cb-button cb-button-primary px-5 py-2.5 text-sm">
                Check official scheme <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
            <a href="#eligibility" className="cb-button cb-button-secondary px-5 py-2.5 text-sm">Review eligibility</a>
          </>
        }
        aside={
          <aside className="bg-[#09332a] p-6 text-white sm:p-7">
            <h2 className="text-xl font-semibold text-white">Scheme details can change</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#e3ece7]">
              Award amounts, deadlines and eligibility can vary by cycle. Verify the current notice with the provider before relying on these notes.
            </p>
            <div className="mt-5"><VerificationBadge status={scholarship.verificationStatus} lastVerifiedAt={scholarship.lastVerifiedAt} /></div>
            {scholarship.cycleLabel && <p className="mt-3 text-sm text-[#e3ece7]">Recorded cycle: {scholarship.cycleLabel}</p>}
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(250px,.62fr)]">
        <div className="space-y-12">
          <LibrarySection id="eligibility" title="Eligibility and conditions">
            <dl className="space-y-6">
              <div><dt className="font-semibold text-[#17201b]">Eligibility</dt><dd className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[#405349]">{scholarship.eligibility || "Eligibility details are not currently recorded. Check the official scheme notice."}</dd></div>
              {([
                ["Academic conditions", scholarship.academicConditions],
                ["Income or category conditions", scholarship.incomeCategoryConditions],
                ["Residency conditions", scholarship.residencyConditions],
                ["Other conditions", scholarship.otherConditions],
              ] as const).map(([label, value]) => value ? (
                <div key={label}><dt className="font-semibold text-[#17201b]">{label}</dt><dd className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[#405349]">{value}</dd></div>
              ) : null)}
              {!scholarship.eligibility && !scholarship.academicConditions && !scholarship.incomeCategoryConditions && !scholarship.residencyConditions && !scholarship.otherConditions && (
                <p className="text-sm text-[#52635a]">No eligibility conditions are recorded for this entry.</p>
              )}
            </dl>
          </LibrarySection>

          <LibrarySection title="Financial support">
            <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              {([
                ["Amount", scholarship.amountNote],
                ["Tuition support", scholarship.tuitionSupport],
                ["Maintenance support", scholarship.maintenanceSupport],
                ["Renewal", scholarship.renewalNote],
              ] as const).map(([label, value]) => (
                <div key={label}><dt className="font-semibold text-[#17201b]">{label}</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{value || "Not currently recorded. Check the provider’s current notice."}</dd></div>
              ))}
            </dl>
          </LibrarySection>

          <LibrarySection title="Documents">
            {documents.length ? (
              <ul className="space-y-0">
                {documents.map(({ label, status }) => (
                  <li key={label} className="grid gap-2 bg-[#edf1ee] px-4 py-3 text-sm sm:grid-cols-[1fr_auto]">
                    <span>{label}</span>
                    <span className="font-semibold text-[#405349]">
                      {status === "required" ? "Required" : status === "not_required" ? "Not required" : "Not confirmed"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-[#52635a]">A document list is not currently available for this scholarship.</p>}
            {documents.length > 0 && <p className="mt-4 text-sm leading-relaxed text-[#52635a]">A document marked “Not confirmed” may still be required. Check the current official notice.</p>}
          </LibrarySection>

          <LibrarySection title="Application timing">
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <div><dt className="font-semibold text-[#17201b]">Deadline note</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{scholarship.deadlineNote || "A current deadline is not recorded. Check the provider’s current notice."}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Cycle</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{scholarship.cycleLabel || "Not currently recorded"}</dd></div>
            </dl>
          </LibrarySection>
        </div>

        <aside className="space-y-12">
          <LibrarySection title="Source record">
            <div className="space-y-4">
              <VerificationBadge status={scholarship.verificationStatus} lastVerifiedAt={scholarship.lastVerifiedAt} />
              {scholarship.sourceTitle && <p className="text-sm text-[#405349]">Source: {scholarship.sourceTitle}</p>}
              {retrievedDate && <p className="text-sm text-[#52635a]">Retrieved: {retrievedDate}</p>}
              <LibrarySourceLink href={scholarship.officialUrl}>Official scheme page</LibrarySourceLink>
              {scholarship.sourceUrl && scholarship.sourceUrl !== scholarship.officialUrl && <LibrarySourceLink href={scholarship.sourceUrl}>Recorded source</LibrarySourceLink>}
              {!scholarship.officialUrl && !scholarship.sourceUrl && <p className="text-sm leading-relaxed text-[#52635a]">No source link is recorded for this entry. Search the provider’s official website for current details.</p>}
            </div>
          </LibrarySection>
          <LibrarySection title="Before applying">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-[#405349]">
              <FileCheck2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#6f887b]" />
              Confirm that the scheme is open, that you meet the current criteria and that you have the required documents.
            </p>
          </LibrarySection>
        </aside>
      </div>

      <div className="mt-14">
        <ReportCatalogueIssue entityType="scholarship" entityRef={scholarship.slug} entityName={scholarship.name} sourceUrl={scholarship.sourceUrl ?? scholarship.officialUrl} />
      </div>
    </LibraryDetailFrame>
  );
}
