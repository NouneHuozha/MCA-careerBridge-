import Link from "next/link";
import { Building2, Filter, MapPin, Navigation, Search } from "lucide-react";
import { ArrowGlyph, Badge, Callout, FilterDisclosure, EmptyState, Eyebrow, SourceLink } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { InstitutionMap } from "@/components/institution-map";
import { catalogFilters, getCourses, getDistricts, getFields, getInstitutions } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { districtCentre, distanceLabel, mapSearchUrl } from "@/maps";

export const dynamic = "force-dynamic";
export const metadata = { title: "Institutions in Nagaland" };

const typeLabels: Record<string, string> = {
  university: "University",
  college: "College",
  institute: "Institute",
  polytechnic: "Polytechnic",
  iti: "ITI",
};

const ownershipTone = {
  government: "green",
  central: "forest",
  private: "lavender",
  autonomous: "amber",
} as const;

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [fields, courses, state] = await Promise.all([getFields(), getCourses({}), getSessionState()]);

  const institutions = await getInstitutions({
    q: params.q,
    district: params.district,
    type: params.type,
    ownership: params.ownership,
    level: params.level,
    fieldSlug: params.field,
    courseSlug: params.course,
  });

  const originDistrict = params.near ?? params.district ?? state?.snapshot.district ?? null;
  const origin = districtCentre(originDistrict);
  const districts = getDistricts();
  const activeFilters = ["district", "type", "ownership", "level", "field", "course"].filter((k) => params[k]).length;

  return (
    <div className="cb-container cb-page">
      {/* ------------------------------------------------------ header */}
      <div className="flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-sky-ink/20 bg-sky/35 p-6 sm:p-8">
        <div className="max-w-lg">
          <Eyebrow className="animate-rise">Nagaland</Eyebrow>
          <h1 className="animate-rise delay-1 mt-4 text-[clamp(1.9rem,4.2vw,2.6rem)] font-semibold">
            Find where you could study
          </h1>
          <p className="animate-rise delay-2 mt-3 text-[15px] text-ink-500">
            Colleges, polytechnics and ITIs across {districts.length} districts.
          </p>
        </div>

        <form action="/institutions" className="animate-rise delay-3 w-full max-w-sm">
          <label htmlFor="q" className="sr-only">
            Search institutions
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              id="q"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search institutions…"
              className="w-full rounded-full border border-ink-200 bg-white py-3 pl-11 pr-24 text-sm outline-none transition-colors focus:border-forest-400"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-forest-700 px-4 py-2 text-[13px] font-medium text-white hover:bg-forest-800"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ------------------------------- quick district chips (primary) */}
      <div className="animate-rise delay-4 mt-8 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/institutions"
          className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors ${
            !params.district ? "border-forest-500 bg-forest-600 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-forest-300"
          }`}
        >
          All districts
        </Link>
        {districts.map((district) => (
          <Link
            key={district}
            href={`/institutions?district=${encodeURIComponent(district)}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition-colors ${
              params.district === district
                ? "border-forest-500 bg-forest-600 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:border-forest-300"
            }`}
          >
            {district}
          </Link>
        ))}
      </div>

      {/* ------------------------ advanced filters, hidden until asked */}
      <div className="mt-4">
        <FilterDisclosure label="More filters" count={activeFilters} defaultOpen={activeFilters > 1}>
          <form action="/institutions" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
            {[
              { name: "district", label: "District", options: districts.map((d) => ({ value: d, label: d })) },
              {
                name: "type",
                label: "Type",
                options: catalogFilters.institutionTypes.map((t) => ({ value: t, label: typeLabels[t] ?? t })),
              },
              {
                name: "ownership",
                label: "Government / private",
                options: catalogFilters.ownerships.map((o) => ({ value: o, label: o[0].toUpperCase() + o.slice(1) })),
              },
              {
                name: "level",
                label: "Study level",
                options: catalogFilters.levels.map((l) => ({ value: l, label: l.replace(/_/g, " ") })),
              },
              { name: "field", label: "Field", options: fields.map((f) => ({ value: f.slug, label: f.name })) },
              { name: "course", label: "Course", options: courses.map((c) => ({ value: c.slug, label: c.name })) },
            ].map((control) => (
              <div key={control.name}>
                <label htmlFor={control.name} className="mb-1.5 block text-[12px] font-medium text-ink-500">
                  {control.label}
                </label>
                <select
                  id={control.name}
                  name={control.name}
                  defaultValue={params[control.name] ?? ""}
                  className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400"
                >
                  <option value="">Any</option>
                  {control.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-800"
              >
                <Filter aria-hidden className="h-3.5 w-3.5" />
                Apply
              </button>
              <Link href="/institutions" className="text-sm text-ink-400 underline-offset-4 hover:text-ink-700 hover:underline">
                Clear all
              </Link>
            </div>
          </form>
        </FilterDisclosure>
      </div>

      {/* -------------------------------------------------- results/map */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <p className="text-sm text-ink-500">
            <span className="font-semibold text-ink-900">{institutions.length}</span> institution
            {institutions.length === 1 ? "" : "s"}
            {originDistrict ? ` · distance from ${originDistrict}` : ""}
          </p>

          <ul className="mt-4 space-y-3">
            {institutions.map((institution, index) => {
              const point =
                institution.latitude != null && institution.longitude != null
                  ? { latitude: institution.latitude, longitude: institution.longitude }
                  : null;
              const distance = distanceLabel(origin, point);
              return (
                <Reveal key={institution.code} delay={Math.min(index * 40, 320)} as="li">
                  <article className="cb-lift group rounded-2xl border border-ink-100 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/institutions/${institution.code}`}
                          className="text-[15px] font-semibold text-ink-900 transition-colors group-hover:text-forest-700"
                        >
                          {institution.name}
                        </Link>
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-ink-500">
                          <MapPin aria-hidden className="h-3.5 w-3.5" />
                          {institution.city ?? institution.district}, {institution.district}
                        </p>
                      </div>
                      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas-deep text-ink-500">
                        <Building2 className="h-[18px] w-[18px]" strokeWidth={1.7} />
                      </span>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      <Badge tone="forest">{typeLabels[institution.type] ?? institution.type}</Badge>
                      <Badge tone={ownershipTone[institution.ownership as keyof typeof ownershipTone] ?? "neutral"}>
                        {institution.ownership}
                      </Badge>
                      {(institution.studyLevels ?? []).slice(0, 2).map((level) => (
                        <Badge key={level}>{level.replace(/_/g, " ")}</Badge>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3.5">
                      <span className="text-[12px] text-ink-400">{distance ?? "Set a district to see distance"}</span>
                      <span className="flex items-center gap-3">
                        <a
                          href={mapSearchUrl(`${institution.name} ${institution.district} Nagaland`)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="cb-button cb-button-secondary px-3 py-2 text-xs"
                        >
                          <Navigation aria-hidden className="h-3.5 w-3.5" />
                          Directions
                        </a>
                        <Link
                          href={`/institutions/${institution.code}`}
                          className="cb-button cb-button-primary px-4 py-2 text-sm"
                        >
                          View institution
                          <ArrowGlyph className="h-3.5 w-3.5" />
                        </Link>
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </ul>

          {!institutions.length ? (
            <div className="mt-4">
              <EmptyState
                icon={<Building2 className="h-4 w-4" />}
                title="Nothing matches those filters"
                description="Try a wider district or clear the course filter."
              />
            </div>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <InstitutionMap
            pins={institutions.map((i) => ({
              code: i.code,
              name: i.name,
              district: i.district,
              latitude: i.latitude,
              longitude: i.longitude,
            }))}
            origin={origin}
            originLabel={originDistrict}
          />

          <form action="/institutions" className="rounded-2xl border border-ink-100 bg-white p-5">
            <p className="text-sm font-semibold text-ink-900">Measure distance from</p>
            <p className="mt-1 text-[12px] text-ink-400">A district is enough — never your address.</p>
            <select
              aria-label="Measure distance from district"
              name="near"
              defaultValue={originDistrict ?? ""}
              className="mt-3 w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-forest-400"
            >
              <option value="">Not set</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {Object.entries(params)
              .filter(([key, value]) => value && key !== "near")
              .map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
            <button
              type="submit"
              className="cb-button cb-button-primary mt-3 w-full px-4 py-2.5 text-sm"
            >
              Update
            </button>
          </form>

          <Callout tone="amber" title="Sample catalogue">
            <p>Names and districts still need verification. No fees or dates are stored — we don&apos;t invent them.</p>
          </Callout>
        </aside>
      </div>
    </div>
  );
}
