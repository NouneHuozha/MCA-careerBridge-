import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2, MapPin, Search } from "lucide-react";
import { LibraryReveal } from "@/components/library-motion";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore places to study" };

export default async function InstitutionsPage({ searchParams }: { searchParams: Promise<{ q?: string; district?: string; type?: string }> }) {
  const params = await searchParams;
  const allInstitutions = await getInstitutions();
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const institutions = allInstitutions.filter((institution) =>
    (!query || `${institution.name} ${institution.city ?? ""} ${institution.district}`.toLocaleLowerCase().includes(query)) &&
    (!params.district || institution.district === params.district) &&
    (!params.type || institution.type === params.type),
  );
  const districts = [...new Set(allInstitutions.map((item) => item.district))].sort();
  const types = [...new Set(allInstitutions.map((item) => item.type))].sort();
  const districtCounts = new Map(districts.map((district) => [district, allInstitutions.filter((item) => item.district === district).length]));

  return (
    <div className="min-h-svh bg-[#f7f8f5]">
      <header className="bg-[#e6eeea]">
        <div className="mx-auto grid min-h-[500px] min-w-0 w-full gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[580px] lg:grid-cols-[1fr_.7fr] lg:items-end lg:px-[clamp(3rem,7vw,8rem)] lg:py-16">
          <div className="flex min-w-0 flex-col justify-between">
            <Link href="/explore" className="inline-flex min-h-10 w-fit items-center gap-2 text-sm font-semibold text-[#36544a] transition-colors hover:text-[#09332a]"><ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" /> Explore the library</Link>
            <div className="py-12">
              <LibraryReveal><p className="mb-5 flex items-center gap-2 text-base font-semibold text-[#547065]"><Building2 aria-hidden="true" className="h-5 w-5" /> Places to study</p><h1 className="max-w-[15ch] text-[clamp(3rem,7.6vw,7.8rem)] font-semibold leading-[.9] tracking-[-.075em] text-[#17201b]">Places to learn.</h1></LibraryReveal>
              <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-[#263a30] sm:text-xl">Explore institutions by district and type. Open a profile for its recorded details and linked courses.</p>
            </div>
            <p className="text-base font-semibold text-[#36544a]">{institutions.length} places listed in the directory</p>
          </div>
          <div className="min-w-0 bg-[#d6eaf4] p-5 sm:p-7 lg:mb-4 lg:p-9">
            <p className="flex items-center gap-2 text-sm font-semibold text-[#2e607b]"><MapPin aria-hidden="true" className="h-4 w-4" /> Nagaland directory</p>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-.04em] text-[#17201b] sm:text-3xl">Browse by district</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {districts.slice(0, 8).map((district) => <Link key={district} href={`/institutions?district=${encodeURIComponent(district)}`} className={`inline-flex min-h-10 items-center gap-2 px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-[#09332a] hover:text-white ${params.district === district ? "bg-[#09332a] text-white" : "bg-[#f7f8f5] text-[#17201b]"}`}>{district}<span className="text-xs opacity-70">{districtCounts.get(district)}</span></Link>)}
              {districts.length > 8 && <span className="inline-flex min-h-10 items-center px-3 text-sm font-medium text-[#36544a]">and {districts.length - 8} more</span>}
            </div>
            <p className="mt-6 text-base leading-relaxed text-[#34463c]">Listings do not confirm current admissions or course availability. Verify details directly with the institution.</p>
          </div>
        </div>
      </header>
      <main className="min-w-0 w-full px-5 pb-24 pt-12 sm:px-8 lg:px-[clamp(3rem,7vw,8rem)] lg:pt-20">
        <form action="/institutions" className="grid gap-4 bg-[#09332a] p-5 text-white sm:grid-cols-[minmax(0,1.3fr)_1fr_1fr_auto] sm:items-end sm:p-7">
          <div className="sm:col-span-4 lg:col-span-1"><label htmlFor="institution-query" className="text-sm font-semibold text-[#d5ded8]">Search directory</label><div className="mt-2 flex min-h-12 items-center gap-3 bg-[#f7f8f5] px-3 text-[#17201b]"><Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#6f887b]" /><input id="institution-query" type="search" name="q" defaultValue={params.q} placeholder="Name or district" className="min-w-0 flex-1 bg-transparent py-2 text-base text-[#17201b] outline-none placeholder:text-[#6a7c72]" /></div></div>
          <div className="grid gap-2"><label htmlFor="institution-district" className="text-sm font-semibold text-[#d5ded8]">District</label><select id="institution-district" name="district" defaultValue={params.district ?? ""} className="min-h-12 min-w-0 bg-[#f7f8f5] px-3 text-base text-[#17201b] outline-none focus-visible:ring-2 focus-visible:ring-[#f2cf78]"><option value="">All districts</option>{districts.map((district) => <option key={district} value={district}>{district}</option>)}</select></div>
          <div className="grid gap-2"><label htmlFor="institution-type" className="text-sm font-semibold text-[#d5ded8]">Type</label><select id="institution-type" name="type" defaultValue={params.type ?? ""} className="min-h-12 min-w-0 bg-[#f7f8f5] px-3 text-base text-[#17201b] outline-none focus-visible:ring-2 focus-visible:ring-[#f2cf78]"><option value="">All types</option>{types.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</select></div>
          <div className="flex flex-wrap gap-3"><button type="submit" className="min-h-12 bg-[#f2cf78] px-5 text-base font-semibold text-[#17201b] transition-colors hover:bg-[#e8bc50]">Find places</button>{(params.district || params.type || params.q) && <Link href="/institutions" className="inline-flex min-h-11 items-center text-sm font-semibold text-[#d5ded8] underline underline-offset-4">Clear</Link>}</div>
        </form>
        <section className="mt-16 min-w-0 sm:mt-20" aria-label="Institutions">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold text-[#6f887b]">{params.district ?? "Nagaland directory"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.045em] text-[#17201b] sm:text-4xl">{params.district ? `Places in ${params.district}` : "A directory of places to learn"}</h2><p className="mt-3 text-base text-[#405349]">Choose a listing to see its recorded details and related courses.</p></div>
            <p className="text-base font-medium text-[#36544a]">{institutions.length} results</p>
          </div>
          {institutions.length ? (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {institutions.map((institution, index) => (
                <li key={institution.code} style={{ contentVisibility: "auto", containIntrinsicSize: "auto 290px" }}>
                  <LibraryReveal delay={Math.min(index * 40, 240)}>
                    <Link href={`/institutions/${institution.code}`} className={`group flex min-h-[250px] flex-col justify-between p-5 transition-transform duration-300 hover:-translate-y-1 sm:min-h-[290px] sm:p-7 ${index % 4 === 0 ? "bg-[#e6eeea]" : index % 4 === 1 ? "bg-[#fdf3d3]" : index % 4 === 2 ? "bg-[#d6eaf4]" : "bg-[#f9e2d2]"}`}>
                      <span>
                        <span className="flex items-center justify-between gap-3 text-sm font-semibold text-[#36544a]"><span>{institution.type.replaceAll("_", " ")} · {institution.ownership}</span><span className="grid h-9 w-9 place-items-center rounded-full bg-[#09332a] text-white transition-transform group-hover:rotate-45"><Building2 aria-hidden="true" className="h-4 w-4" /></span></span>
                        <span className="mt-7 block max-w-[34ch] text-2xl font-semibold leading-tight tracking-[-.04em] text-[#17201b] group-hover:text-[#126048] sm:text-3xl">{institution.name}</span>
                      </span>
                      <span className="mt-8 flex items-end justify-between gap-3">
                        <span className="text-base text-[#263a30]">{institution.city ? `${institution.city}, ` : ""}{institution.district} district</span>
                        <span className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#09332a]">View details <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                      </span>
                    </Link>
                  </LibraryReveal>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-[#e6eeea] p-7 sm:p-10"><h3 className="text-2xl font-semibold text-[#17201b]">No institutions match those filters</h3><p className="mt-3 text-base leading-relaxed text-[#34463c]">Try another district or type, or clear the filters to browse every listing.</p><Link href="/institutions" className="mt-6 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[#09332a] underline underline-offset-4">Show all institutions <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
          )}
        </section>
      </main>
    </div>
  );
}
