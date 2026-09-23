import Image from "next/image";
import Link from "next/link";
import { Building2, CheckCircle2, ChevronDown, Filter, GraduationCap, Info, MapPin, Navigation, Search } from "lucide-react";
import { ArrowGlyph, Badge, Callout, EmptyState, Eyebrow, FilterDisclosure } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { InstitutionMap } from "@/components/institution-map";
import { catalogFilters, getCourses, getDistricts, getFields, getInstitutions } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { districtCentre, distanceLabel, mapSearchUrl } from "@/maps";

export const dynamic = "force-dynamic";
export const metadata = { title: "Institutions in Nagaland" };

const typeLabels: Record<string, string> = { university: "University", college: "College", institute: "Institute", polytechnic: "Polytechnic", iti: "ITI" };
const ownershipTone = { government: "green", central: "forest", private: "lavender", autonomous: "amber" } as const;

const journey = [
  { title: "Understand yourself", detail: "Completed", state: "done" },
  { title: "Explore possibilities", detail: "Completed", state: "done" },
  { title: "Find a route", detail: "Completed", state: "done" },
  { title: "Find a place to study", detail: "Colleges, ITIs and more", state: "current" },
  { title: "Make a plan", detail: "Shortlist and decide", state: "next" },
] as const;

function JourneyRail() {
  return (
    <aside className="hidden min-h-[calc(100dvh-5rem)] w-[258px] shrink-0 border-r border-[#dfeae5] bg-[#f1f8f6] px-7 py-9 lg:block">
      <p className="text-[17px] font-semibold text-ink-900">Your journey</p>
      <p className="mt-1 text-[12px] text-ink-500">Step by step to your brighter tomorrow</p>
      <ol className="mt-8">
        {journey.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
            {index < journey.length - 1 ? <span aria-hidden className={`absolute left-[12px] top-7 h-[calc(100%-10px)] w-px ${step.state === "next" ? "bg-ink-200" : "bg-[#6bb69b]"}`} /> : null}
            <span aria-hidden className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 ${step.state === "done" ? "border-[#2d9d75] bg-[#2d9d75] text-white" : step.state === "current" ? "border-[#2d9d75] bg-[#2d9d75] text-white" : "border-ink-300 bg-transparent text-ink-400"}`}>
              {step.state === "done" ? <CheckCircle2 className="h-4 w-4" /> : step.state === "current" ? <span className="text-xs font-bold">4</span> : <span className="text-xs font-semibold">5</span>}
            </span>
            <span className={`-mt-0.5 rounded-xl px-2 py-1 text-sm ${step.state === "current" ? "border border-[#cbe7dc] bg-[#e2f3ed] font-semibold text-forest-800" : "text-ink-700"}`}>
              <span className="block">{step.title}</span><span className="mt-0.5 block text-[12px] font-normal text-ink-500">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="relative mt-12 h-56 overflow-hidden rounded-3xl bg-[#d8eee9]">
        <Image src="/images/possibilities-landscape.png" alt="A path towards new possibilities" fill sizes="260px" className="object-cover object-[58%_70%] opacity-80" />
        <div className="absolute inset-x-4 bottom-6 rounded-lg bg-[#237a68e8] px-3 py-2 text-xs text-white shadow-lg">Different routes.<br />A brighter you.</div>
      </div>
    </aside>
  );
}

function FilterChip({ icon: Icon, label, value, href }: { icon: typeof MapPin; label: string; value?: string; href?: string }) {
  const content = <><Icon aria-hidden className="h-4 w-4 text-forest-700" /><span>{value || label}</span>{!value && <ChevronDown aria-hidden className="ml-1 h-3.5 w-3.5 text-ink-400" />}</>;
  return href ? <Link href={href} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${value ? "border-forest-500 bg-forest-700 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-forest-300"}`}>{content}</Link> : <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:border-forest-300">{content}</button>;
}

export default async function InstitutionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [fields, courses, state] = await Promise.all([getFields(), getCourses({}), getSessionState()]);
  const institutions = await getInstitutions({ q: params.q, district: params.district, type: params.type, ownership: params.ownership, level: params.level, fieldSlug: params.field, courseSlug: params.course });
  const originDistrict = params.near ?? params.district ?? state?.snapshot.district ?? null;
  const origin = districtCentre(originDistrict);
  const districts = getDistricts();
  const activeFilters = ["district", "type", "ownership", "level", "field", "course"].filter((key) => params[key]).length;

  return (
    <div className="w-full">
      <div className="flex min-w-0 flex-col lg:flex-row">
        <JourneyRail />
        <main className="min-w-0 flex-1 px-[clamp(1.1rem,3vw,3.5rem)] py-7 lg:py-8">
          <div className="mx-auto max-w-[1260px]">
            <section className="relative overflow-hidden rounded-2xl border border-[#d9e8e6] bg-[#f3fbf9] px-5 py-7 sm:px-8 sm:py-8">
              <Image src="/images/possibilities-landscape.png" alt="" fill sizes="100vw" className="object-cover object-[45%_45%] opacity-25" />
              <div className="relative z-10 max-w-2xl">
                <Eyebrow>Places to study</Eyebrow>
                <h1 className="mt-3 text-[clamp(2.1rem,4vw,3.2rem)] font-semibold leading-[1.05]">Where could you study this?</h1>
                <p className="mt-3 text-[16px] text-ink-600">Start near you, then widen the search if you want.</p>
              </div>
              <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                <FilterChip icon={MapPin} label="Near me" value={originDistrict ?? undefined} href={originDistrict ? `/institutions?near=${encodeURIComponent(originDistrict)}` : "/institutions"} />
                <FilterChip icon={Building2} label="District" value={params.district} />
                <FilterChip icon={GraduationCap} label="Government" value={params.ownership === "government" ? "Government" : undefined} />
                <FilterChip icon={CheckCircle2} label="Hostel available" value={undefined} />
                <FilterChip icon={Building2} label="Course" value={params.course ? courses.find((course) => course.slug === params.course)?.name : undefined} />
              </div>
            </section>

            <div className="mt-4"><FilterDisclosure label="More filters" count={activeFilters} defaultOpen={activeFilters > 1}><AdvancedFilters params={params} fields={fields} courses={courses} districts={districts} /></FilterDisclosure></div>

            <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(400px,.98fr)_minmax(0,1.12fr)]">
              <div className="order-2 min-w-0 xl:sticky xl:top-24 xl:order-1 xl:self-start">
                <InstitutionMap pins={institutions.map((institution) => ({ code: institution.code, name: institution.name, district: institution.district, latitude: institution.latitude, longitude: institution.longitude }))} origin={origin} originLabel={originDistrict} />
                <form action="/institutions" className="mt-4 rounded-2xl border border-ink-100 bg-white p-4">
                  <p className="text-sm font-semibold text-ink-900">Measure distance from</p><p className="mt-1 text-[12px] text-ink-400">A district is enough — never your address.</p>
                  <div className="mt-3 flex gap-2"><select aria-label="Measure distance from district" name="near" defaultValue={originDistrict ?? ""} className="min-w-0 flex-1 rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-forest-400"><option value="">Not set</option>{districts.map((district) => <option key={district} value={district}>{district}</option>)}</select><button type="submit" className="cb-button cb-button-primary px-4 py-2.5 text-sm">Update</button></div>
                  {Object.entries(params).filter(([key, value]) => value && key !== "near").map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
                </form>
              </div>

              <section className="order-1 min-w-0 xl:order-2" aria-label="Institutions list">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-ink-500"><span className="font-semibold text-ink-900">{institutions.length}</span> institution{institutions.length === 1 ? "" : "s"}{originDistrict ? ` · near ${originDistrict}` : ""}</p><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-800"><Info className="h-3.5 w-3.5" />Confirm course availability from the official source.</span></div>
                <ul className="mt-3 space-y-3">
                  {institutions.map((institution, index) => {
                    const point = institution.latitude != null && institution.longitude != null ? { latitude: institution.latitude, longitude: institution.longitude } : null;
                    const distance = distanceLabel(origin, point);
                    return <Reveal key={institution.code} delay={Math.min(index * 45, 260)} as="li"><article className="cb-lift rounded-2xl border border-ink-100 bg-white p-3.5 sm:p-4"><div className="flex gap-4"><div className="relative hidden h-[118px] w-[174px] shrink-0 overflow-hidden rounded-xl bg-[#eaf4ef] sm:block"><Image src="/images/students-campus.jpg" alt="" fill sizes="174px" className="object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`/institutions/${institution.code}`} className="block truncate text-[17px] font-semibold text-ink-900 hover:text-forest-700">{institution.name}</Link><p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-500"><MapPin className="h-3.5 w-3.5" />{institution.city ?? institution.district}, {institution.district}</p></div><Badge tone="green" className="shrink-0"><CheckCircle2 className="h-3.5 w-3.5" />{institution.verificationStatus === "verified" ? "Verified" : "Check source"}</Badge></div><div className="mt-3 flex flex-wrap gap-1.5"><Badge tone={ownershipTone[institution.ownership as keyof typeof ownershipTone] ?? "neutral"}>{institution.ownership}</Badge><Badge>{typeLabels[institution.type] ?? institution.type}</Badge></div><p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-ink-500">{institution.fieldSlugs?.length ? `${institution.fieldSlugs.join(", ")} programmes and study options.` : "Explore programmes, campus support and study options."}</p><div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3"><span className="text-[11px] text-ink-400">{distance ?? "Distance not set"}</span><span className="flex flex-wrap gap-2"><Link href={`/institutions/${institution.code}`} className="cb-button cb-button-primary px-3.5 py-2 text-xs">View details<ArrowGlyph className="h-3.5 w-3.5" /></Link><a href={mapSearchUrl(`${institution.name} ${institution.district} Nagaland`)} target="_blank" rel="noreferrer noopener" className="cb-button cb-button-secondary px-3.5 py-2 text-xs"><Navigation className="h-3.5 w-3.5" />View on map</a></span></div></div></div></article></Reveal>;
                  })}
                </ul>
                {!institutions.length ? <div className="mt-4"><EmptyState icon={<Building2 className="h-4 w-4" />} title="Nothing matches those filters" description="Try a wider district or clear the course filter." /></div> : null}
              </section>
            </div>
            <Callout tone="amber" title="Sample catalogue"><p>Names and districts still need verification. No fees or dates are stored — we don&apos;t invent them.</p></Callout>
          </div>
        </main>
      </div>
    </div>
  );
}

function AdvancedFilters({ params, fields, courses, districts }: { params: Record<string, string | undefined>; fields: Awaited<ReturnType<typeof getFields>>; courses: Awaited<ReturnType<typeof getCourses>>; districts: string[] }) {
  return <form action="/institutions" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{params.q ? <input type="hidden" name="q" value={params.q} /> : null}{[{ name: "district", label: "District", options: districts.map((district) => ({ value: district, label: district })) }, { name: "type", label: "Type", options: catalogFilters.institutionTypes.map((type) => ({ value: type, label: typeLabels[type] ?? type })) }, { name: "ownership", label: "Government / private", options: catalogFilters.ownerships.map((ownership) => ({ value: ownership, label: ownership[0].toUpperCase() + ownership.slice(1) })) }, { name: "level", label: "Study level", options: catalogFilters.levels.map((level) => ({ value: level, label: level.replace(/_/g, " ") })) }, { name: "field", label: "Field", options: fields.map((field) => ({ value: field.slug, label: field.name })) }, { name: "course", label: "Course", options: courses.map((course) => ({ value: course.slug, label: course.name })) }].map((control) => <div key={control.name}><label htmlFor={control.name} className="mb-1.5 block text-[12px] font-medium text-ink-500">{control.label}</label><select id={control.name} name={control.name} defaultValue={params[control.name] ?? ""} className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest-400"><option value="">Any</option>{control.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>)}<div className="flex items-end gap-3 sm:col-span-2 lg:col-span-4"><button type="submit" className="inline-flex items-center gap-2 rounded-full bg-forest-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-800"><Filter className="h-3.5 w-3.5" />Apply</button><Link href="/institutions" className="text-sm text-ink-400 underline-offset-4 hover:text-ink-700 hover:underline">Clear all</Link></div></form>;
}
