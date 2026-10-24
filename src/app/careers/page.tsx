import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Compass,
  Cpu,
  FlaskConical,
  Hammer,
  Heart,
  Leaf,
  Map as MapIcon,
  Mic,
  Palette,
  Scale,
  Search,
  Shield,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { LibraryReveal } from "@/components/library-motion";
import { getAllCareerSkills, getCareers, getFields } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Explore careers",
  description: "Explore career profiles, the skills they draw on, and study routes connected to each role.",
};

type CareersPageProps = {
  searchParams: Promise<{ q?: string; field?: string }>;
};

const fieldIcons: Record<string, LucideIcon> = {
  cpu: Cpu,
  wrench: Wrench,
  heart: Heart,
  briefcase: BriefcaseBusiness,
  shield: Shield,
  book: BookOpen,
  flask: FlaskConical,
  palette: Palette,
  mic: Mic,
  leaf: Leaf,
  scale: Scale,
  map: MapIcon,
  users: Users,
  hammer: Hammer,
};

export default async function CareersPage({ searchParams }: CareersPageProps) {
  const params = await searchParams;
  const searchTerm = params.q?.trim() ?? "";
  const normalizedQuery = searchTerm.toLocaleLowerCase();
  const [allCareers, fields, allSkills] = await Promise.all([
    getCareers(),
    getFields(),
    getAllCareerSkills(),
  ]);
  const fieldBySlug = new Map(fields.map((field) => [field.slug, field]));
  const skillsByCareer = new Map<string, string[]>();
  const careerCounts = new Map<string, number>();

  for (const skill of allSkills) {
    const careerSkills = skillsByCareer.get(skill.careerSlug) ?? [];
    careerSkills.push(skill.skill);
    skillsByCareer.set(skill.careerSlug, careerSkills);
  }

  for (const career of allCareers) {
    careerCounts.set(career.fieldSlug, (careerCounts.get(career.fieldSlug) ?? 0) + 1);
  }

  const careers = allCareers.filter((career) => {
    const matchesField = !params.field || career.fieldSlug === params.field;
    const careerSkills = skillsByCareer.get(career.slug) ?? [];
    const matchesQuery =
      !normalizedQuery ||
      `${career.title} ${career.summary} ${careerSkills.join(" ")}`
        .toLocaleLowerCase()
        .includes(normalizedQuery);

    return matchesField && matchesQuery;
  });

  const activeField = params.field ? fieldBySlug.get(params.field) : undefined;
  const querySuffix = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : "";
  const allCareersHref = searchTerm ? `/careers?q=${encodeURIComponent(searchTerm)}` : "/careers";
  const careerGroups = fields
    .map((field) => ({
      field,
      careers: careers.filter((career) => career.fieldSlug === field.slug),
    }))
    .filter((group) => group.careers.length > 0);

  return (
    <div className="min-w-0 bg-[#f7f8f5]">
      <header className="bg-[#09332a] text-white">
        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,.8fr)] lg:items-center lg:gap-16 lg:px-[clamp(3rem,7vw,8rem)] lg:py-16">
          <div className="flex min-w-0 flex-col items-start">
            <div className="max-w-4xl">
              <LibraryReveal>
                <h1 className="max-w-[18ch] text-[clamp(3.25rem,6.4vw,5.75rem)] font-semibold leading-[.96] tracking-[-.045em] text-white">
                  Explore careers.
                </h1>
              </LibraryReveal>
              <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-[#e0e9e4] sm:text-lg">
                See what different roles involve, the skills they draw on, and the study routes
                connected to them.
              </p>
            </div>
            <a
              href="#career-fields"
              className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 text-base font-semibold text-[#f2cf78] transition-colors hover:text-white"
            >
              Browse fields
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>

          <div className="min-w-0 lg:justify-self-end lg:w-full lg:max-w-[38rem]">
            <h2 className="max-w-[22ch] text-2xl font-semibold leading-tight tracking-[-.03em] text-white sm:text-3xl">
              Start with a role or a skill.
            </h2>
            <p className="mt-3 max-w-[44ch] text-base leading-relaxed text-[#e0e9e4]">
              Search the profiles, then follow the fields that catch your interest.
            </p>
            <form action="/careers" method="get" role="search" className="mt-7">
              {params.field && <input type="hidden" name="field" value={params.field} />}
              <label htmlFor="career-query" className="sr-only">
                Search career profiles by role, summary, or skill
              </label>
              <div className="flex min-h-[62px] min-w-0 items-center gap-3 rounded-full bg-[#f7f8f5] p-2 pl-5 transition-shadow focus-within:ring-2 focus-within:ring-[#f2cf78]">
                <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#36544a]" />
                <input
                  id="career-query"
                  type="search"
                  name="q"
                  defaultValue={searchTerm}
                  placeholder="Try a role or skill"
                  className="min-w-0 flex-1 bg-transparent py-2 text-base text-[#17201b] outline-none placeholder:text-[#52665b]"
                />
                <button
                  type="submit"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#09332a] px-4 text-base font-semibold text-white transition-colors hover:bg-[#126048] active:scale-[.98] sm:px-6"
                >
                  Search
                </button>
              </div>
            </form>
            <p className="mt-4 text-base font-medium text-[#f2cf78]">
              {allCareers.length} profiles <span aria-hidden="true">·</span> {fields.length} fields
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid min-w-0 w-full max-w-[1800px] grid-cols-1 gap-8 px-5 pb-24 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(15rem,0.28fr)_minmax(0,1fr)] lg:gap-[clamp(2.5rem,6vw,7rem)] lg:px-[clamp(3rem,7vw,8rem)] lg:pt-16">
        <aside
          id="career-fields"
          className="-mx-5 min-w-0 sticky top-0 z-20 bg-[#f7f8f5] px-5 py-3 sm:-mx-8 sm:px-8 lg:sticky lg:top-4 lg:mx-0 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain lg:pb-4 lg:pl-0 lg:pr-2 lg:pt-2"
          style={{ scrollbarColor: "#6f887b transparent", scrollbarWidth: "thin" }}
        >
          <h2 className="text-xl font-semibold tracking-[-.03em] text-[#17201b] lg:text-2xl">
            Browse a field
          </h2>
          <p className="mt-2 hidden max-w-[34ch] text-base leading-relaxed text-[#263a30] lg:block">
            Follow the subjects and kinds of work that interest you.
          </p>
          <nav aria-label="Career fields" className="mt-5">
            <ul className="flex min-w-0 gap-2 overflow-x-auto overscroll-x-contain pb-2 lg:grid lg:grid-cols-1 lg:gap-x-0">
              <li className="shrink-0">
                <Link
                  href={allCareersHref}
                  aria-current={!activeField ? "page" : undefined}
                  className={`group flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09332a] lg:rounded-none lg:px-1 lg:text-base ${
                    !activeField
                      ? "bg-[#09332a] text-white lg:bg-transparent lg:text-[#09332a]"
                      : "bg-[#dde4df] text-[#34463c] hover:bg-[#cbd8d1] hover:text-[#09332a] lg:bg-transparent lg:hover:bg-transparent"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2 leading-snug">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${!activeField ? "bg-[#f2cf78]" : "bg-transparent group-hover:bg-[#6f887b] lg:bg-transparent"}`} />
                    All careers
                  </span>
                  <span className={`shrink-0 tabular-nums ${!activeField ? "text-[#f2cf78] lg:text-[#6f887b]" : "text-[#6f887b]"}`}>
                    {allCareers.length}
                  </span>
                </Link>
              </li>
              {fields.map((field) => {
                const isActive = activeField?.slug === field.slug;

                return (
                  <li key={field.slug} className="shrink-0">
                    <Link
                      href={`/careers?field=${encodeURIComponent(field.slug)}${querySuffix}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex min-h-11 shrink-0 items-center justify-between gap-3 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09332a] lg:rounded-none lg:px-1 lg:text-base ${
                        isActive
                          ? "bg-[#09332a] text-white lg:bg-transparent lg:text-[#09332a]"
                          : "bg-[#dde4df] text-[#34463c] hover:bg-[#cbd8d1] hover:text-[#09332a] lg:bg-transparent lg:hover:bg-transparent"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2 leading-snug">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-[#f2cf78]" : "bg-transparent group-hover:bg-[#6f887b] lg:bg-transparent"}`} />
                        {field.name}
                      </span>
                      <span className={`shrink-0 tabular-nums ${isActive ? "text-[#f2cf78] lg:text-[#6f887b]" : "text-[#6f887b]"}`}>
                        {careerCounts.get(field.slug) ?? 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <p className="mt-6 hidden max-w-[34ch] text-base leading-relaxed text-[#263a30] lg:block">
            Career profiles are a starting point. Confirm current entry requirements and training
            details with the relevant provider.
          </p>
        </aside>

        <section aria-labelledby="career-results-title" className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-3">
            <div>
              <h2
                id="career-results-title"
                className="max-w-[24ch] text-3xl font-semibold leading-tight tracking-[-.035em] text-[#17201b] sm:text-4xl"
              >
                {activeField ? `Explore ${activeField.name}` : "Where could your interests lead?"}
              </h2>
            </div>
            <p className="flex items-baseline gap-2 text-base font-medium text-[#263a30]">
              <span className="text-2xl font-semibold tabular-nums text-[#09332a]">
                {careers.length}
              </span>
              {careers.length === 1 ? "profile" : "profiles"}
            </p>
          </div>

          {(searchTerm || activeField) && (
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
              {searchTerm && (
                <p className="text-[#263a30]">
                  Results for <span className="font-semibold text-[#17201b]">“{searchTerm}”</span>
                </p>
              )}
              <Link
                href={allCareersHref}
                className="min-h-11 content-center font-semibold text-[#09332a] underline decoration-[#6f887b] underline-offset-4 transition-colors hover:text-[#126048]"
              >
                {activeField ? "Clear field filter" : "Clear search"}
              </Link>
            </div>
          )}

          {careers.length > 0 ? (
            <div className="mt-8">
              {careerGroups.map(({ field, careers: fieldCareers }, fieldIndex) => {
                const FieldIcon = fieldIcons[field.icon ?? ""] ?? Compass;
                const isSingleCareer = fieldCareers.length === 1;
                const isEditorialLayout = fieldIndex % 2 === 0;

                return (
                  <section
                    key={field.slug}
                    id={`career-field-${field.slug}`}
                    aria-labelledby={`career-field-title-${field.slug}`}
                    className={`scroll-mt-8 py-9 first:pt-0 sm:py-11 ${
                      isEditorialLayout ? "" : "rounded-[2rem] bg-[#edf2ef] px-5 sm:px-7"
                    }`}
                  >
                    <div
                      className={`grid min-w-0 gap-6 ${
                        isEditorialLayout
                          ? "lg:grid-cols-12 lg:items-start lg:gap-8"
                          : "lg:grid-cols-1"
                      }`}
                    >
                      <LibraryReveal
                        className={isEditorialLayout ? "min-w-0 lg:col-span-4" : "min-w-0"}
                      >
                        <header className="flex min-w-0 items-start gap-4 sm:gap-5">
                          <FieldIcon
                            aria-hidden="true"
                            className="mt-1 h-9 w-9 shrink-0 text-[#6f887b] sm:h-11 sm:w-11"
                            strokeWidth={1.5}
                          />
                          <div className="min-w-0">
                            <h3
                              id={`career-field-title-${field.slug}`}
                              className="text-2xl font-semibold leading-tight tracking-[-.03em] text-[#09332a] sm:text-3xl"
                            >
                              {field.name}
                            </h3>
                            {field.tagline && (
                              <p className="mt-2 max-w-[38ch] text-base leading-relaxed text-[#34463c]">
                                {field.tagline}
                              </p>
                            )}
                          </div>
                        </header>
                      </LibraryReveal>

                      <ul
                        className={`grid min-w-0 grid-cols-1 gap-3 ${
                          isEditorialLayout
                            ? "lg:col-span-8 lg:grid-cols-1"
                            : "sm:grid-cols-2 lg:grid-cols-12"
                        }`}
                      >
                        {fieldCareers.map((career, careerIndex) => {
                          const skills = skillsByCareer.get(career.slug)?.slice(0, 2) ?? [];
                          const entryEducation = career.entryEducation?.trim();
                          const href = `/careers/${career.slug}`;
                          const isLeadRole = !isEditorialLayout && careerIndex === 0;
                          const roleLayout =
                            isEditorialLayout
                              ? ""
                              : isSingleCareer
                                ? "lg:col-span-12"
                              : careerIndex === 0
                                ? "lg:col-span-7"
                                : "lg:col-span-5";

                          return (
                            <li key={career.slug} className={`min-w-0 ${roleLayout}`} style={!isSingleCareer ? { contentVisibility: "auto", containIntrinsicSize: "auto 210px" } : undefined}>
                              <LibraryReveal delay={Math.min(careerIndex * 0.045, 0.18)}>
                                <details
                                  className={`group min-w-0 transition-colors ${
                                    isLeadRole
                                      ? "rounded-[2rem_2rem_.5rem_2rem] bg-[#09332a] text-white"
                                      : isEditorialLayout
                                        ? careerIndex % 2 === 0
                                          ? "rounded-[2rem_.65rem_2rem_2rem] bg-white open:bg-[#dde4df]"
                                          : "rounded-[.65rem_2rem_2rem_2rem] bg-[#e7ede9] open:bg-[#dce6e0]"
                                        : careerIndex % 2 === 0
                                          ? "rounded-[.75rem_2rem_2rem_2rem] bg-white"
                                          : "rounded-[2rem_.75rem_2rem_2rem] bg-[#dde4df]"
                                  }`}
                                  open={isSingleCareer}
                                >
                                  <summary
                                    className={`flex min-h-full cursor-pointer list-none items-start justify-between gap-4 rounded-[inherit] p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f887b] sm:p-6 ${
                                      isLeadRole
                                        ? "hover:bg-[#12483c]"
                                        : isEditorialLayout
                                          ? "hover:bg-[#edf2ef] group-open:bg-[#dde4df]"
                                          : "hover:bg-[#e8eeea]"
                                    } [&::-webkit-details-marker]:hidden`}
                                  >
                                    <div className="min-w-0">
                                      <h4
                                        className={`text-xl font-semibold leading-tight tracking-[-.03em] transition-colors sm:text-[1.375rem] ${
                                          isLeadRole
                                            ? "text-white group-hover:text-[#f2cf78]"
                                            : "text-[#17201b] group-hover:text-[#126048]"
                                        }`}
                                      >
                                        {career.title}
                                      </h4>
                                      <p
                                        className={`mt-3 text-base leading-relaxed ${
                                          isLeadRole ? "text-[#e0e9e4]" : "text-[#263a30]"
                                        }`}
                                      >
                                        {career.summary}
                                      </p>
                                      <span
                                        className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${
                                          isLeadRole ? "text-[#f2cf78]" : "text-[#09332a]"
                                        }`}
                                      >
                                        <span className="group-open:hidden">See skills and study starting points</span>
                                        <span className="hidden group-open:inline">Hide details</span>
                                      </span>
                                    </div>
                                    <ChevronDown
                                      aria-hidden="true"
                                      className={`mt-1 h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180 ${
                                        isLeadRole ? "text-[#f2cf78]" : "text-[#09332a]"
                                      }`}
                                    />
                                  </summary>

                                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                                    <dl className="grid gap-5 sm:grid-cols-2">
                                      {skills.length > 0 && (
                                        <div className="min-w-0">
                                          <dt
                                            className={`text-sm font-semibold ${
                                              isLeadRole ? "text-[#f2cf78]" : "text-[#09332a]"
                                            }`}
                                          >
                                            Skills to explore
                                          </dt>
                                          <dd className="mt-2 flex flex-wrap gap-2">
                                            {skills.map((skill) => (
                                              <span
                                                key={skill}
                                                className={`rounded-full px-3 py-1.5 text-sm ${
                                                  isLeadRole
                                                    ? "bg-[#1c5043] text-white"
                                                    : "bg-[#f7f8f5] text-[#17201b]"
                                                }`}
                                              >
                                                {skill}
                                              </span>
                                            ))}
                                          </dd>
                                        </div>
                                      )}
                                      {entryEducation && (
                                        <div className="min-w-0">
                                          <dt
                                            className={`text-sm font-semibold ${
                                              isLeadRole ? "text-[#f2cf78]" : "text-[#09332a]"
                                            }`}
                                          >
                                            Study usually begins with
                                          </dt>
                                          <dd
                                            className={`mt-2 text-base leading-relaxed ${
                                              isLeadRole ? "text-[#e0e9e4]" : "text-[#263a30]"
                                            }`}
                                          >
                                            {entryEducation}
                                          </dd>
                                        </div>
                                      )}
                                    </dl>
                                    <Link
                                      href={href}
                                      aria-label={`Explore ${career.title} in ${field.name}`}
                                      className={`mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09332a] ${
                                        isLeadRole
                                          ? "bg-[#f2cf78] text-[#09332a] hover:bg-white"
                                          : "bg-[#09332a] text-white hover:bg-[#126048]"
                                      }`}
                                    >
                                      Explore profile
                                      <ArrowRight
                                        aria-hidden="true"
                                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                      />
                                    </Link>
                                  </div>
                                </details>
                              </LibraryReveal>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div role="status" className="mt-8 bg-[#e6eeea] p-6 sm:p-9">
              <h3 className="text-2xl font-semibold tracking-[-.03em] text-[#17201b]">
                No careers match this search yet.
              </h3>
              <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-[#263a30]">
                Try a broader role or skill, or clear the filters to browse every career profile.
              </p>
              <Link
                href="/careers"
                className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[#09332a] underline decoration-[#6f887b] underline-offset-4 transition-colors hover:text-[#126048]"
              >
                Browse all careers
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
