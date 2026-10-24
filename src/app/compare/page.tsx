import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Info,
  MapPin,
  MessageCircle,
  Scale,
  WalletCards,
} from "lucide-react";
import { EmptyState } from "@/components/ui";
import { getCareers, getCourses, getFields, getInstitutions, getPathways } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare" };

type Row = { label: string; icon: typeof Clock3; tone: "mint" | "lavender" | "sky" | "butter"; values: (string | null)[] };

const kinds = [
  { value: "field", label: "Possibilities" },
  { value: "course", label: "Courses" },
  { value: "career", label: "Careers" },
  { value: "institution", label: "Institutions" },
  { value: "pathway", label: "Pathways" },
];

const suggestedPairs: Record<string, { a: string; b: string; label: string }[]> = {
  field: [
    { a: "technology", b: "healthcare", label: "Technology vs Healthcare" },
    { a: "engineering", b: "business", label: "Engineering vs Business" },
  ],
  course: [
    { a: "bca", b: "bsc-computer-science", label: "BCA vs B.Sc Computer Science" },
    { a: "diploma-civil-engineering", b: "btech-civil", label: "Diploma vs B.Tech Civil" },
    { a: "gnm-nursing", b: "bsc-nursing", label: "GNM vs B.Sc Nursing" },
  ],
  pathway: [{ a: "class10-polytechnic-diploma", b: "class10-science-stream", label: "Polytechnic vs Science stream" }],
  career: [{ a: "software-developer", b: "data-analyst", label: "Developer vs Data analyst" }],
  institution: [],
};

function CatalogueNote() {
  return <span className="mt-2 inline-flex text-xs text-[#52635a]">Catalogue entry</span>;
}

function OptionHeader({ name, description, index }: { name: string; description: string; index: number }) {
  return (
    <div className={`flex min-h-[106px] items-center gap-4 px-5 py-4 ${index === 0 ? "bg-[#dde4df]" : "bg-[#edf1ee]"}`}>
      <div className="hidden h-16 w-20 shrink-0 items-center justify-center bg-white/65 text-forest-700 sm:flex">
        {index === 0 ? <BookOpen className="h-9 w-9" /> : <GraduationCap className="h-9 w-9" />}
      </div>
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold text-ink-900">{name}</h2>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{description}</p>
        <CatalogueNote />
      </div>
    </div>
  );
}

function ComparisonTable({ headers, headerDescriptions, rows }: { headers: string[]; headerDescriptions: string[]; rows: Row[] }) {
  return (
    <div className="overflow-hidden bg-white">
      <div className="grid grid-cols-1 bg-[#dde4df] sm:grid-cols-[minmax(150px,1.15fr)_minmax(0,2fr)_minmax(0,2fr)]">
        <div className="hidden bg-white sm:block" />
        {headers.map((header, index) => <OptionHeader key={header} name={header} description={headerDescriptions[index]} index={index} />)}
      </div>
      {rows.map((row) => {
        const surface = row.tone === "mint" ? "bg-[#edf1ee]" : row.tone === "lavender" ? "bg-[#f2f4f1]" : row.tone === "sky" ? "bg-[#dde4df]" : "bg-[#fdf3d3]";
        return (
          <div key={row.label} className="grid grid-cols-1 bg-white sm:grid-cols-[minmax(150px,1.15fr)_minmax(0,2fr)_minmax(0,2fr)]">
            <div className="flex items-center gap-3 bg-[#f7f8f5] px-5 py-4 text-sm font-semibold text-ink-700">
              <row.icon aria-hidden className="h-6 w-6 shrink-0 text-ink-700" strokeWidth={1.7} />
              <span>{row.label}</span>
            </div>
            {row.values.map((value, index) => (
              <div key={`${row.label}-${index}`} className={`min-h-[78px] px-5 py-4 text-sm leading-relaxed text-ink-700 ${surface}`}>
                <span className="mb-1 block font-medium text-ink-800 sm:hidden">{headers[index]}</span>
                <span>{value?.trim() || "Currently unavailable"}</span>
                <CatalogueNote />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ type?: string; items?: string; a?: string; b?: string }> }) {
  const params = await searchParams;
  const type = kinds.some((kind) => kind.value === params.type) ? params.type! : "course";
  const fromPair = [params.a, params.b].filter((value): value is string => Boolean(value));
  const selected = (fromPair.length ? fromPair : (params.items ?? "").split(",").filter(Boolean)).slice(0, 2);

  const [courses, careers, institutions, pathways, fields] = await Promise.all([getCourses({}), getCareers(), getInstitutions({}), getPathways({}), getFields()]);
  const options = type === "field" ? fields.map((field) => ({ value: field.slug, label: field.name })) : type === "course" ? courses.map((course) => ({ value: course.slug, label: course.name })) : type === "career" ? careers.map((career) => ({ value: career.slug, label: career.title })) : type === "institution" ? institutions.map((institution) => ({ value: institution.code, label: institution.name })) : pathways.map((pathway) => ({ value: pathway.slug, label: pathway.title }));

  let headers: string[] = [];
  let headerDescriptions: string[] = [];
  let rows: Row[] = [];

  if (type === "field") {
    const chosen = selected.map((slug) => fields.find((field) => field.slug === slug)).filter((field): field is (typeof fields)[number] => Boolean(field));
    headers = chosen.map((field) => field.name);
    headerDescriptions = chosen.map((field) => field.tagline ?? "Possibility to explore");
    rows = [
      { label: "In a nutshell", icon: BookOpen, tone: "sky", values: chosen.map((field) => field.overview) },
      { label: "What people may do", icon: MessageCircle, tone: "mint", values: chosen.map((field) => (field.whatPeopleDo ?? []).slice(0, 3).join(" ") || null) },
      { label: "Useful subjects", icon: GraduationCap, tone: "lavender", values: chosen.map((field) => (field.usefulSubjects ?? []).slice(0, 5).join(", ") || null) },
      { label: "Things to consider", icon: Info, tone: "butter", values: chosen.map((field) => (field.challenges ?? []).slice(0, 2).join(" ") || null) },
    ];
  } else if (type === "course") {
    const chosen = selected.map((slug) => courses.find((course) => course.slug === slug)).filter((course): course is (typeof courses)[number] => Boolean(course));
    headers = chosen.map((course) => course.name);
    headerDescriptions = chosen.map((course) => course.level.replace(/_/g, " "));
    rows = [
      { label: "Study length", icon: Clock3, tone: "sky", values: chosen.map((course) => [course.durationLabel, course.durationLabel ? "Full-time study" : null].filter(Boolean).join(" · ") || null) },
      { label: "Entry requirements", icon: GraduationCap, tone: "lavender", values: chosen.map((course) => course.eligibility) },
      { label: "What you learn", icon: BookOpen, tone: "mint", values: chosen.map((course) => (course.relevantSubjects ?? []).join(", ") || null) },
      { label: "Possible next steps", icon: BarChart3, tone: "lavender", values: chosen.map((course) => [...(course.careerDirections ?? []), ...(course.furtherStudy ?? [])].join(", ") || null) },
      { label: "Fees and support", icon: WalletCards, tone: "butter", values: chosen.map((course) => course.feeNote ?? null) },
      { label: "Where you can study", icon: MapPin, tone: "sky", values: chosen.map(() => "Offered by colleges and institutions across India") },
    ];
  } else if (type === "career") {
    const chosen = selected.map((slug) => careers.find((career) => career.slug === slug)).filter((career): career is (typeof careers)[number] => Boolean(career));
    headers = chosen.map((career) => career.title); headerDescriptions = chosen.map(() => "Career direction");
    rows = [
      { label: "In short", icon: BookOpen, tone: "sky", values: chosen.map((career) => career.summary) },
      { label: "Entry requirements", icon: GraduationCap, tone: "lavender", values: chosen.map((career) => career.entryEducation ?? null) },
      { label: "What you learn", icon: BookOpen, tone: "mint", values: chosen.map((career) => (career.subjects ?? []).join(", ") || null) },
      { label: "Possible next steps", icon: BarChart3, tone: "lavender", values: chosen.map((career) => (career.alternativeRoutes ?? []).join(", ") || null) },
      { label: "Where you can work", icon: MapPin, tone: "butter", values: chosen.map((career) => (career.workContexts ?? []).join(", ") || null) },
    ];
  } else if (type === "institution") {
    const chosen = selected.map((code) => institutions.find((institution) => institution.code === code)).filter((institution): institution is (typeof institutions)[number] => Boolean(institution));
    headers = chosen.map((institution) => institution.name); headerDescriptions = chosen.map((institution) => `${institution.type} · ${institution.district}`);
    rows = [
      { label: "Study levels", icon: GraduationCap, tone: "sky", values: chosen.map((institution) => (institution.studyLevels ?? []).join(", ")) },
      { label: "Institution type", icon: BookOpen, tone: "lavender", values: chosen.map((institution) => institution.type) },
      { label: "What you can study", icon: CheckCircle2, tone: "mint", values: chosen.map((institution) => (institution.fieldSlugs ?? []).join(", ") || null) },
      { label: "Where it is", icon: MapPin, tone: "butter", values: chosen.map((institution) => `${institution.city ?? institution.district}, ${institution.district}`) },
      { label: "Fees and support", icon: WalletCards, tone: "sky", values: chosen.map((institution) => institution.feeRangeNote ?? null) },
    ];
  } else {
    const chosen = selected.map((slug) => pathways.find((pathway) => pathway.slug === slug)).filter((pathway): pathway is (typeof pathways)[number] => Boolean(pathway));
    headers = chosen.map((pathway) => pathway.title); headerDescriptions = chosen.map((pathway) => pathway.entryStage === "class10" ? "Pathway from Class 10" : "Pathway from Class 12");
    rows = [
      { label: "Starts after", icon: GraduationCap, tone: "sky", values: chosen.map((pathway) => pathway.entryStage === "class10" ? "Class 10" : "Class 12") },
      { label: "Route type", icon: Scale, tone: "lavender", values: chosen.map((pathway) => pathway.routeType) },
      { label: "What you learn", icon: BookOpen, tone: "mint", values: chosen.map((pathway) => pathway.description) },
      { label: "Possible next steps", icon: BarChart3, tone: "butter", values: chosen.map((pathway) => (pathway.examSlugs ?? []).join(", ") || null) },
    ];
  }

  const ready = headers.length >= 2;
  const pairs = suggestedPairs[type] ?? [];
  const detailHref = (value: string) => {
    if (type === "field") return `/explore/${value}`;
    if (type === "career") return `/careers/${value}`;
    if (type === "institution") return `/institutions/${value}`;
    if (type === "pathway") return `/pathways/${value}`;
    return `/courses/${value}`;
  };

  return (
    <div className="cb-container cb-page mx-auto max-w-[1440px]">
      {ready ? (
        <div className="min-w-0">
          <div className="max-w-3xl">
            <h1 className="text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[.96] tracking-[-.055em] text-[#17201b]">
              {type === "field" ? "Compare possibilities" : "Compare two options"}
            </h1>
            <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[#405349]">
              {type === "field" ? "Look at the kind of work, useful subjects and considerations for each area." : "Use the details as a starting point. There is no single best choice for everyone."}
            </p>
          </div>
          <section className="mt-9" aria-label="Comparison">
            <ComparisonTable headers={headers} headerDescriptions={headerDescriptions} rows={rows} />
            <div className="mt-7 grid gap-4 bg-[#dde4df] p-5 sm:grid-cols-2 sm:p-7">
              {headers.map((header, index) => (
                <Link
                  key={header}
                  href={detailHref(selected[index] ?? "")}
                  className="group flex min-h-14 items-center gap-3 bg-white px-4 py-3 font-semibold text-[#09332a] transition-colors hover:bg-[#f7f8f5]"
                >
                  <span className="min-w-0 flex-1">Read about {header}</span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
              <Link href={`/compare?type=${type}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#09332a] underline underline-offset-4 sm:col-span-2">
                Change the options <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-5 max-w-[70ch] text-sm leading-relaxed text-[#52635a]">
              This comparison uses catalogue information and may not include every factor. Check the latest official details with course providers and institutions.
            </p>
          </section>
        </div>
      ) : (
        <>
          <h1 className="text-[clamp(2.4rem,5vw,5rem)] font-semibold leading-[.96] tracking-[-.055em] text-[#17201b]">{type === "field" ? "Compare possibilities" : "Compare two options"}</h1>
          <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-[#405349]">{type === "field" ? "Look at the kind of work, useful subjects and considerations for each area." : "Similar choices can differ in duration, cost and what they make possible. Choose two to compare."}</p>
          <nav aria-label="What to compare" className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
            {kinds.map((kind) => <Link key={kind.value} aria-current={type === kind.value ? "page" : undefined} href={`/compare?type=${kind.value}`} className={`min-h-11 py-2 text-sm underline-offset-4 hover:underline ${type === kind.value ? "font-semibold text-[#09332a] underline" : "text-[#52635a]"}`}>{kind.label}</Link>)}
          </nav>
          <form action="/compare" className="mt-7 grid items-end gap-5 bg-[#dde4df] p-5 sm:grid-cols-[1fr_auto_1fr_auto] sm:p-7">
            <input type="hidden" name="type" value={type} />
            {(["a", "b"] as const).map((slot, index) => (
              <div key={slot} className={index === 1 ? "sm:col-start-3 sm:row-start-1" : "sm:row-start-1"}>
                <label htmlFor={`slot-${slot}`} className="mb-2 block text-sm font-semibold text-[#17201b]">Option {index + 1}</label>
                <select id={`slot-${slot}`} name={slot} defaultValue={selected[index] ?? ""} className="min-h-12 w-full border border-[#9aada3] bg-white px-3.5 py-3 text-sm text-[#17201b] focus:border-[#09332a]">
                  <option value="">Choose an option</option>
                  {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
            ))}
            <span aria-hidden className="hidden h-11 w-11 shrink-0 place-items-center self-end text-[#52635a] sm:col-start-2 sm:row-start-1"><ArrowLeftRight className="h-5 w-5" /></span>
            <button type="submit" className="cb-button cb-button-primary px-6 py-3 text-sm sm:col-start-4 sm:row-start-1">Compare</button>
          </form>
          <div className="mt-10 max-w-3xl space-y-5">
            <EmptyState icon={<Scale className="h-4 w-4" />} title="Choose two options to begin" description="Select two entries above, or use a common comparison below." />
            {pairs.length ? <div className="flex flex-wrap gap-3">{pairs.map((pair) => <Link key={pair.label} href={`/compare?type=${type}&a=${pair.a}&b=${pair.b}`} className="inline-flex min-h-11 items-center gap-2 bg-[#edf1ee] px-4 py-3 text-sm font-semibold text-[#09332a] transition-colors hover:bg-[#dde4df]">{pair.label}<ArrowRight className="h-4 w-4" /></Link>)}</div> : null}
          </div>
        </>
      )}
    </div>
  );
}
