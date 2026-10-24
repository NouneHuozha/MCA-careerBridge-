import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, ExternalLink, Layers3, MapPin } from "lucide-react";
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
import { getFields, getOpportunities } from "@/services/catalog";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  learning: "Learning programme",
  project: "Project",
  internship: "Internship",
  competition: "Competition",
  certification: "Certification",
  entry_role: "Entry role",
};

const getFieldLabel = (slug: string, fields: Awaited<ReturnType<typeof getFields>>) =>
  fields.find((field) => field.slug === slug)?.name ?? slug.replaceAll("-", " ");

function getDisplayTitle(title: string) {
  const split = title.match(/^(.+?)\s*(?:\/|—|,)\s*(.+)$/);
  if (split) {
    const heading = split[1].trim();
    const continuation = split[2].trim();
    if (heading.length <= 10) {
      const words = continuation.split(/\s+/);
      return { heading: `${heading} / ${words.slice(0, 2).join(" ")}`, continuation: words.slice(2).join(" ") };
    }
    return { heading, continuation };
  }

  if (title.length > 38) {
    const words = title.split(/\s+/);
    return { heading: words.slice(0, 5).join(" "), continuation: words.slice(5).join(" ") };
  }

  return { heading: title, continuation: "" };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunity = (await getOpportunities()).find((item) => item.slug === slug);
  return { title: opportunity?.title ?? "Opportunity" };
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [opportunity, fields] = await Promise.all([
    getOpportunities().then((items) => items.find((item) => item.slug === slug) ?? null),
    getFields(),
  ]);
  if (!opportunity) notFound();

  const type = typeLabels[opportunity.type] ?? opportunity.type.replaceAll("_", " ");
  const displayTitle = getDisplayTitle(opportunity.title);
  const fieldLabels = (opportunity.fieldSlugs ?? []).map((field) => getFieldLabel(field, fields));
  const lastVerified = opportunity.lastVerifiedAt
    ? new Date(opportunity.lastVerifiedAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <LibraryDetailFrame>
      <LibraryBreadcrumbs items={[
        { label: "Explore", href: "/explore" },
        { label: "Opportunities", href: "/opportunities" },
        { label: opportunity.title },
      ]} />

      <LibraryDetailIntro
        variant="opportunity"
        title={displayTitle.heading}
        titleClassName="max-w-[24ch] text-[clamp(1.5rem,5vw,5.25rem)] font-semibold leading-[1] tracking-[-.055em] text-[#17201b]"
        description={opportunity.description || "Explore the provider and skill information recorded for this opportunity. Check current availability and terms directly with the provider."}
        facts={
          <>
            {displayTitle.continuation && <span className="basis-full text-base">Continued: {displayTitle.continuation}</span>}
            <span className="inline-flex items-center gap-2"><Layers3 aria-hidden="true" className="h-4 w-4 text-[#6f887b]" />{type}</span>
            {opportunity.provider && <span>Provider: {opportunity.provider}</span>}
            {opportunity.costNote && <span>Cost note: {opportunity.costNote}</span>}
          </>
        }
        actions={
          <>
            <SaveButton itemType="opportunity" itemRef={opportunity.slug} label={opportunity.title} tone="forest" />
            {opportunity.url && (
              <a href={opportunity.url} target="_blank" rel="noreferrer" className="cb-button cb-button-primary px-5 py-2.5 text-sm">
                Visit provider <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </>
        }
        aside={
          <aside className="bg-[#09332a] p-6 text-white sm:p-7">
            <h2 className="text-xl font-semibold text-white">Check the current details</h2>
            <p className="mt-4 text-sm leading-relaxed text-[#e3ece7]">
              Programme details, costs and availability can change. Confirm the latest information with the provider before taking part.
            </p>
            <div className="mt-5"><VerificationBadge status={opportunity.verificationStatus} lastVerifiedAt={opportunity.lastVerifiedAt} /></div>
            {lastVerified && <p className="mt-3 text-sm text-[#e3ece7]">Last checked: {lastVerified}</p>}
          </aside>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(250px,.62fr)]">
        <div className="space-y-12">
          <LibrarySection title="What the catalogue says">
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div><dt className="font-semibold text-[#17201b]">Opportunity type</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{type}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Provider</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{opportunity.provider || "Provider not currently recorded"}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Cost</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">{opportunity.costNote || "Cost information is not currently recorded. Check with the provider."}</dd></div>
              <div><dt className="font-semibold text-[#17201b]">Availability</dt><dd className="mt-2 text-sm leading-relaxed text-[#405349]">Confirm current availability with the provider.</dd></div>
            </dl>
          </LibrarySection>

          {opportunity.skillTags?.length ? (
            <LibrarySection title="Skills mentioned">
              <ul className="grid gap-3 sm:grid-cols-2">
                {opportunity.skillTags.map((skill) => <li key={skill} className="bg-[#dde4df] px-4 py-4 text-sm leading-relaxed text-[#17201b]">{skill}</li>)}
              </ul>
            </LibrarySection>
          ) : null}

          {fieldLabels.length ? (
            <LibrarySection title="Related areas">
              <ul className="space-y-0">
                {(opportunity.fieldSlugs ?? []).map((fieldSlug, index) => (
                  <li key={fieldSlug}>
                    <Link href={`/explore/${fieldSlug}`} className="flex min-h-14 items-center gap-3 bg-[#edf1ee] px-4 py-3 font-semibold text-[#17201b] transition hover:bg-[#dde4df]">
                      <MapPin aria-hidden="true" className="h-4 w-4 text-[#6f887b]" />{fieldLabels[index]}
                      <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 text-[#09332a]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </LibrarySection>
          ) : null}
        </div>

        <aside className="space-y-12">
          <LibrarySection title="Provider and source">
            <div className="space-y-4">
              <LibrarySourceLink href={opportunity.url}>Opportunity information</LibrarySourceLink>
              {opportunity.sourceUrl && opportunity.sourceUrl !== opportunity.url && <LibrarySourceLink href={opportunity.sourceUrl}>Recorded source</LibrarySourceLink>}
              {!opportunity.url && !opportunity.sourceUrl && (
                <p className="text-sm leading-relaxed text-[#52635a]">No provider link is recorded. Ask the provider or browse the catalogue for other opportunities.</p>
              )}
              <VerificationBadge status={opportunity.verificationStatus} lastVerifiedAt={opportunity.lastVerifiedAt} />
            </div>
          </LibrarySection>
          <LibrarySection title="Continue exploring">
            <p className="text-sm leading-relaxed text-[#405349]">Browse other learning and project listings, and check each provider’s information before signing up.</p>
            <Link href="/opportunities" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline underline-offset-4">
              Browse opportunities <BookOpen aria-hidden="true" className="h-4 w-4" />
            </Link>
          </LibrarySection>
        </aside>
      </div>

      <div className="mt-14">
        <ReportCatalogueIssue entityType="opportunity" entityRef={opportunity.slug} entityName={opportunity.title} sourceUrl={opportunity.sourceUrl ?? opportunity.url} />
      </div>
    </LibraryDetailFrame>
  );
}
