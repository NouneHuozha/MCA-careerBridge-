import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Building2, Check, ExternalLink, Info, MapPin, ShieldCheck } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourse, getField, getInstitution, getInstitutionSources, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Map and directions" };

const VERIFIED_STATES = new Set(["verified", "current"]);
const OFFICIAL_SOURCE_TYPES = new Set(["official_api", "official_site", "govt_portal", "official_pdf"]);

function secureHttpsUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: Date | null | undefined) {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(value) : null;
}

function mapEmbedUrl(latitude: number, longitude: number) {
  const params = new URLSearchParams({
    bbox: `${longitude - 0.009},${latitude - 0.006},${longitude + 0.009},${latitude + 0.006}`,
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

export default async function InstitutionMapAndDirectionsPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string; code: string }> }) {
  const [{ slug, pathwaySlug, courseSlug, code }, state] = await Promise.all([params, getSessionState()]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const [field, route, course, institution] = await Promise.all([
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
    getInstitution(code),
  ]);
  if (!field || !route || !course || !route.courseSlugs?.includes(course.slug) || !institution) notFound();

  const sources = await getInstitutionSources(institution.code);
  const locationSource = sources.find((source) => {
    const sourceStatus = source.status.toLowerCase();
    const sourceType = source.sourceType.toLowerCase();
    const locationScope = `${source.title ?? ""} ${source.sourceType}`;
    return VERIFIED_STATES.has(sourceStatus)
      && OFFICIAL_SOURCE_TYPES.has(sourceType)
      && /location|campus|address|coordinates|map/i.test(locationScope)
      && Boolean(secureHttpsUrl(source.url));
  });
  const latitude = institution.latitude;
  const longitude = institution.longitude;
  const verifiedCoordinates = (
    typeof latitude === "number"
    && Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && typeof longitude === "number"
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180
  )
    ? { latitude, longitude }
    : null;
  const recordVerified = VERIFIED_STATES.has(institution.verificationStatus.toLowerCase());
  const verifiedAt = locationSource?.retrievedAt ?? institution.lastVerifiedAt;
  const canShowMap = institution.datasetLabel !== "sample-dataset-v1"
    && recordVerified
    && Boolean(verifiedCoordinates)
    && Boolean(locationSource)
    && Boolean(verifiedAt);

  const detailHref = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}/institutions/${encodeURIComponent(institution.code)}`;
  const compareHref = `/guidance/compare?type=institution&a=${encodeURIComponent(institution.code)}&course=${encodeURIComponent(courseSlug)}&field=${encodeURIComponent(slug)}&returnTo=${encodeURIComponent(detailHref)}`;
  const verifiedSourceUrl = secureHttpsUrl(locationSource?.url);
  const linkedOfficialSource = verifiedSourceUrl
    ?? secureHttpsUrl(institution.officialWebsite)
    ?? secureHttpsUrl(institution.sourceUrl);
  const directionsHref = canShowMap && verifiedCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${verifiedCoordinates.latitude},${verifiedCoordinates.longitude}`)}`
    : null;
  const verifiedDateLabel = formatDate(locationSource?.retrievedAt ?? institution.lastVerifiedAt);

  return <main className="min-h-[calc(100dvh-134px)] bg-[#fcfcfa] px-5 pb-10 pt-6 text-[#26312c] sm:px-8 lg:px-12">
    <section className="mx-auto max-w-[1440px]">
      <h1 className="font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-.045em] text-[#102c43]">Map and directions</h1>
      <p className="mt-2 max-w-3xl font-serif text-lg leading-relaxed text-[#52645c]">Find the location of this institution and open directions from your current location.</p>

      <section aria-label="Selected institution" className="mt-5 flex flex-wrap items-center gap-4">
        <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#e7f1ed] text-[#075b55]"><Building2 className="h-9 w-9" strokeWidth={1.5} /></span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#738078]">Selected institution</p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#173344]">{institution.name}</h2>
          <p className="mt-1 text-sm text-[#68746d]">{[institution.city, institution.district].filter((value, index, values) => Boolean(value) && values.indexOf(value) === index).join(", ")}</p>
        </div>
        {canShowMap ? <span className="ml-0 inline-flex items-center gap-2 rounded-full bg-[#e2f1e9] px-4 py-2 text-sm font-semibold text-[#286b61] sm:ml-auto"><Check aria-hidden className="h-4 w-4" />Coordinates verified</span> : <span className="ml-0 inline-flex items-center gap-2 rounded-full bg-[#fff2d9] px-4 py-2 text-sm font-semibold text-[#806315] sm:ml-auto"><Info aria-hidden className="h-4 w-4" />Location needs verification</span>}
      </section>

      {canShowMap && verifiedCoordinates && directionsHref && locationSource && verifiedSourceUrl ? <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.82fr)]">
        <section aria-label="Verified institution map" className="overflow-hidden rounded-xl border border-[#dfe5df] bg-white p-2">
          <iframe title={`OpenStreetMap showing the verified location of ${institution.name}`} src={mapEmbedUrl(verifiedCoordinates.latitude, verifiedCoordinates.longitude)} loading="lazy" className="h-[420px] w-full rounded-lg border-0 sm:h-[480px]" referrerPolicy="no-referrer-when-downgrade" />
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 text-xs text-[#68746d]"><span>Map marker shown for verified institution coordinates.</span><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-2">© OpenStreetMap contributors</a></div>
        </section>

        <aside aria-labelledby="get-there-title" className="rounded-xl border border-[#dfe5df] bg-white p-6">
          <h2 id="get-there-title" className="font-serif text-3xl font-semibold text-[#173344]">Get there</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#64736a]">Open this verified location in your maps app to get directions from your current location.</p>
          <a href={directionsHref} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-lg bg-[#075a58] px-4 font-serif text-base font-semibold text-white transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Open directions<ArrowRight aria-hidden className="h-5 w-5" /></a>
          <a href={verifiedSourceUrl} target="_blank" rel="noreferrer" className="mt-2 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[#a9c2b5] bg-white px-4 font-serif text-base font-semibold text-[#285c53] hover:bg-[#f2f7f3]">Open official source<ExternalLink aria-hidden className="h-4 w-4" /></a>
          <div className="mt-4 rounded-lg bg-[#e9f5ef] p-4 text-[#285c53]"><div className="flex items-start gap-3"><ShieldCheck aria-hidden className="mt-0.5 h-6 w-6 shrink-0" /><div><h3 className="font-semibold">Verified official source</h3><p className="mt-1 text-sm leading-relaxed">{locationSource.title ?? "Official location source"}. Coordinates checked for this record.</p><p className="mt-1 text-xs">{verifiedDateLabel ? `Last checked: ${verifiedDateLabel}` : "Check date not recorded."}</p></div></div></div>
          <div className="mt-3 divide-y divide-[#e8ece8] border-y border-[#e8ece8]"><div className="flex min-h-12 items-center justify-between gap-3"><span className="text-sm font-medium text-[#315e53]">Save institution</span><SaveButton itemType="institution" itemRef={institution.code} label={institution.name} saveText="Save" savedText="Saved" className="[&>button]:min-h-9 [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-2 [&>button]:text-sm [&>button]:text-[#315e53]" /></div><Link href={compareHref} className="flex min-h-12 items-center justify-between gap-3 text-sm font-medium text-[#315e53] hover:text-[#174d42]">Compare institutions<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#68746d]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Travel time and route details are provided by the maps service when you open directions.</p>
        </aside>
      </div> : <section aria-labelledby="location-unavailable-title" className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.82fr)]">
        <div className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-[#cbd8ce] bg-[#f2f6f2] p-8 text-center sm:min-h-[480px]">
          <div className="max-w-xl"><span aria-hidden className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-[#789187]"><MapPin className="h-8 w-8" /></span><h2 id="location-unavailable-title" className="mt-5 font-serif text-2xl font-semibold text-[#173344]">No verified map location yet</h2><p className="mt-3 text-sm leading-relaxed text-[#64736a]">A pin and directions will appear only after this institution’s coordinates are checked against a current official location source. We are not showing approximate town-level coordinates as an institution address.</p></div>
        </div>
        <aside className="rounded-xl border border-[#dfe5df] bg-white p-6">
          <h2 className="font-serif text-2xl font-semibold text-[#173344]">Location status</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#64736a]">This record does not yet have the verified coordinates and location-specific official source needed for a reliable map.</p>
          <div className="mt-4 rounded-lg bg-[#fff4de] p-4 text-sm leading-relaxed text-[#735a20]"><div className="flex items-start gap-3"><Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0" /><p className="m-0">No pin, travel time, or route is being shown. Missing information does not mean the institution is unavailable.</p></div></div>
          {linkedOfficialSource ? <a href={linkedOfficialSource} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[#a9c2b5] px-4 text-sm font-semibold text-[#285c53] hover:bg-[#f2f7f3]">Visit listed institution source to check location<ExternalLink aria-hidden className="h-4 w-4 shrink-0" /></a> : <p className="mt-4 text-sm text-[#68746d]">No official source is connected for this institution.</p>}
          <Link href={compareHref} className="mt-4 flex min-h-11 items-center justify-between gap-3 border-t border-[#e8ece8] pt-3 text-sm font-medium text-[#315e53] hover:text-[#174d42]">Compare institutions<ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </aside>
      </section>}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#edf4ef] px-4 py-3 text-xs leading-relaxed text-[#5e7067]">
        <span>{canShowMap && locationSource ? `Location source: ${locationSource.title ?? "verified official institution source"}.` : "Location source: awaiting an official location record."}</span>
        <span>Information is for guidance only. Always refer to the official source.</span>
      </footer>
    </section>
  </main>;
}
