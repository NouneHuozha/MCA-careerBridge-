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
import { EmptyState, Eyebrow } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { getCareers, getCourses, getFields, getInstitutions, getPathways } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare" };

type Row = { label: string; icon: typeof Clock3; tone: "mint" | "lavender" | "sky" | "butter"; values: (string | null)[] };

type JourneyStep = { title: string; detail: string; state: "done" | "current" | "next" };

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

const journey: JourneyStep[] = [
  { title: "Understand yourself", detail: "Who you are", state: "done" },
  { title: "Explore possibilities", detail: "Discover what fits you", state: "done" },
  { title: "Find a route", detail: "Look at pathways", state: "done" },
  { title: "Compare options", detail: "See choices side by side", state: "current" },
  { title: "Make a plan", detail: "Turn your choice into action", state: "next" },
];

function JourneyRail() {
  return (
    <aside className="hidden min-h-[calc(100dvh-5rem)] w-[244px] shrink-0 border-r border-[#e2eaf0] bg-[#f5f9fd] px-7 py-10 lg:block">
      <p className="text-[15px] font-semibold text-ink-900">Your journey</p>
      <ol className="mt-8">
        {journey.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pb-7 last:pb-0">
            {index < journey.length - 1 ? <span aria-hidden className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-px ${step.state === "next" ? "bg-ink-200" : "bg-[#6fc4aa]"}`} /> : null}
            <span aria-hidden className={`relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${step.state === "done" ? "border-[#28a17a] bg-[#28a17a] text-white" : step.state === "current" ? "border-[#2877df] bg-white text-[#2877df] shadow-[inset_0_0_0_4px_#e9f2ff]" : "border-ink-400 bg-transparent text-transparent"}`}>
              {step.state === "done" ? <CheckCircle2 className="h-4 w-4" /> : step.state === "current" ? <span className="h-2 w-2 rounded-full bg-[#2877df]" /> : null}
            </span>
            <span className={`-mt-0.5 rounded-xl px-0.5 text-sm ${step.state === "current" ? "font-semibold text-ink-900" : "text-ink-700"}`}>
              <span className="block">{step.title}</span>
              <span className="mt-0.5 block text-[12px] font-normal text-ink-500">{step.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="relative mt-20 flex h-40 items-end justify-center overflow-hidden rounded-3xl bg-[#edf7f3]">
        <div className="absolute bottom-5 left-6 h-20 w-20 rounded-full bg-[#d8efe7]" />
        <div className="absolute bottom-8 right-5 h-12 w-12 rounded-full bg-[#e2f1f6]" />
        <GraduationCap aria-hidden className="relative mb-8 h-16 w-16 text-forest-700" />
      </div>
    </aside>
  );
}

function Verification({ text = "Not verified" }: { text?: string }) {
  return <span className="mt-2 inline-flex items-center gap-1.5 rounded bg-white/70 px-2 py-0.5 text-[11px] text-ink-500"><span>{text}</span><Info aria-hidden className="h-3 w-3" /></span>;
}

function OptionHeader({ name, description, index }: { name: string; description: string; index: number }) {
  return (
    <div className={`flex min-h-[106px] items-center gap-4 px-5 py-4 ${index === 0 ? "bg-[#eff7ff]" : "bg-[#f5f2ff]"}`}>
      <div className="hidden h-16 w-20 shrink-0 items-center justify-center rounded-xl bg-white/65 text-forest-700 sm:flex">
        {index === 0 ? <BookOpen className="h-9 w-9" /> : <GraduationCap className="h-9 w-9" />}
      </div>
      <div className="min-w-0">
        <h2 className="text-[17px] font-semibold text-ink-900">{name}</h2>
        <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{description}</p>
        <Verification />
      </div>
    </div>
  );
}

function ComparisonTable({ headers, headerDescriptions, rows }: { headers: string[]; headerDescriptions: string[]; rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe7ee] bg-white shadow-[0_12px_35px_-30px_#284b6250]">
      <div className="grid grid-cols-1 border-b border-[#dfe7ee] sm:grid-cols-[minmax(150px,1.15fr)_minmax(0,2fr)_minmax(0,2fr)]">
        <div className="hidden bg-white sm:block" />
        {headers.map((header, index) => <OptionHeader key={header} name={header} description={headerDescriptions[index]} index={index} />)}
      </div>
      {rows.map((row, rowIndex) => {
        const surface = row.tone === "mint" ? "bg-[#effaf7]" : row.tone === "lavender" ? "bg-[#f7f4ff]" : row.tone === "sky" ? "bg-[#f1f7fc]" : "bg-[#fff9ed]";
        return (
          <div key={row.label} className="grid grid-cols-1 border-b border-[#dfe7ee] last:border-b-0 sm:grid-cols-[minmax(150px,1.15fr)_minmax(0,2fr)_minmax(0,2fr)]">
            <div className="flex items-center gap-3 border-b border-[#dfe7ee] bg-white px-5 py-4 text-[13px] font-semibold text-ink-700 sm:border-b-0">
              <row.icon aria-hidden className="h-6 w-6 shrink-0 text-ink-700" strokeWidth={1.7} />
              <span>{row.label}</span>
            </div>
            {row.values.map((value, index) => (
              <div key={`${row.label}-${index}`} className={`min-h-[78px] border-b border-[#dfe7ee] px-5 py-4 text-[13px] leading-[1.45] text-ink-700 last:border-b-0 sm:border-b-0 sm:border-l ${surface}`}>
                <span className="mb-1 block font-medium text-ink-800 sm:hidden">{headers[index]}</span>
                <span>{value?.trim() || "Currently unavailable"}</span>
                <Verification />
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

  return (
    <div className={ready ? "w-full" : "cb-container cb-page"}>
      {ready ? (
        <div className="flex min-w-0 flex-col lg:flex-row">
          <JourneyRail />
          <main className="min-w-0 flex-1 px-[clamp(1.1rem,3vw,3.5rem)] py-8 lg:py-10">
            <div className="mx-auto max-w-[1200px]">
              <div className="max-w-3xl">
                <Eyebrow>Compare options</Eyebrow>
                <h1 className="mt-3 text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-tight">{type === "field" ? "Compare two possibilities." : "See two choices side by side."}</h1>
                <p className="mt-2 text-[15px] text-ink-500">{type === "field" ? "Compare the kind of work, useful subjects and things to consider for each direction." : "There is no best option — look at what each one makes possible."}</p>
              </div>
              <Reveal>
                <section className="mt-5" aria-label="Comparison">
                  <ComparisonTable headers={headers} headerDescriptions={headerDescriptions} rows={rows} />
                  <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-[#eaf8f4] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c8f1e5] text-forest-700"><MessageCircle className="h-5 w-5" /></span>
                      <div><h2 className="text-[15px] font-semibold text-ink-900">Still unsure? Ask Mentor.</h2><p className="text-[12px] text-ink-600">Get personalised guidance based on your goals, interests and background.</p></div>
                    </div>
                    <Link href="/mentor" className="cb-button cb-button-primary shrink-0 px-4 py-2.5 text-sm">Talk to Mentor <ArrowRight className="h-4 w-4" /></Link>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <Link href={`/start?keep=${encodeURIComponent(selected[0] ?? "")}`} className="cb-button cb-button-primary px-5 py-2.5 text-sm">Keep {headers[0]} <ArrowRight className="h-4 w-4" /></Link>
                    <Link href={`/start?keep=${encodeURIComponent(selected[1] ?? "")}`} className="cb-button cb-button-secondary px-5 py-2.5 text-sm">Keep {headers[1]} <ArrowRight className="h-4 w-4" /></Link>
                    <Link href={`/compare?type=${type}`} className="inline-flex items-center px-2 py-2 text-sm font-medium text-[#2877df] hover:underline">Remove comparison</Link>
                  </div>
                </section>
              </Reveal>
            </div>
          </main>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2"><Eyebrow className="animate-rise">Compare</Eyebrow><Scale aria-hidden className="h-3.5 w-3.5 text-forest-500" /></div>
          <h1 className="animate-rise delay-1 mt-4 text-[clamp(1.9rem,4.2vw,2.6rem)] font-semibold">{type === "field" ? "Compare two possibilities." : "Two options, side by side"}</h1>
          <p className="animate-rise delay-2 mt-3 max-w-lg text-[15px] text-ink-500">{type === "field" ? "Compare the kind of work, useful subjects and things to consider for each direction." : "Similar-sounding choices often differ in duration, cost and what they keep open afterwards."}</p>
          <div className="animate-rise delay-3 mt-8 inline-flex flex-wrap gap-1 rounded-full border border-ink-200 bg-white p-1">{kinds.map((kind) => <Link key={kind.value} href={`/compare?type=${kind.value}`} className={`rounded-full px-4 py-2 text-[13px] transition-colors ${type === kind.value ? "bg-forest-700 text-white" : "text-ink-600 hover:text-ink-900"}`}>{kind.label}</Link>)}</div>
          <form action="/compare" className="animate-rise delay-4 mt-6 grid items-end gap-3 rounded-2xl border border-forest-200 bg-mint/45 p-5 sm:grid-cols-[1fr_auto_1fr_auto]"><input type="hidden" name="type" value={type} />{(["a", "b"] as const).map((slot, index) => <div key={slot} className={index === 1 ? "sm:col-start-3 sm:row-start-1" : "sm:row-start-1"}><label htmlFor={`slot-${slot}`} className="mb-1.5 block text-[12px] font-medium text-ink-500">Option {index + 1}</label><select id={`slot-${slot}`} name={slot} defaultValue={selected[index] ?? ""} className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-forest-400"><option value="">Choose…</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>)}<span aria-hidden className="hidden h-11 w-11 shrink-0 place-items-center self-end rounded-full border border-ink-200 bg-white text-ink-400 sm:col-start-2 sm:row-start-1 sm:grid"><ArrowLeftRight className="h-4 w-4" /></span><button type="submit" className="cb-button cb-button-primary px-6 py-3 text-sm sm:col-start-4 sm:row-start-1">Compare</button></form>
          <div className="mt-10 max-w-3xl space-y-5"><EmptyState icon={<Scale className="h-4 w-4" />} title="Pick two to begin" description="Choose any two options above, or start from a common comparison below." />{pairs.length ? <div className="flex flex-wrap gap-2">{pairs.map((pair) => <Link key={pair.label} href={`/compare?type=${type}&a=${pair.a}&b=${pair.b}`} className="group inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[13px] text-ink-700 transition-all hover:-translate-y-0.5 hover:border-forest-300">{pair.label}<ArrowRight className="h-3.5 w-3.5" /></Link>)}</div> : null}</div>
        </>
      )}
    </div>
  );
}
