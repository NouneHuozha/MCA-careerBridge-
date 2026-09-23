import Link from "next/link";
import { ArrowLeftRight, Scale } from "lucide-react";
import { ArrowGlyph, Badge, Callout, EmptyState, Eyebrow, accentSurface } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { getCareers, getCourses, getInstitutions, getPathways } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare" };

type Row = { label: string; values: (string | null)[] };

const kinds = [
  { value: "course", label: "Courses" },
  { value: "career", label: "Careers" },
  { value: "institution", label: "Institutions" },
  { value: "pathway", label: "Pathways" },
];

const suggestedPairs: Record<string, { a: string; b: string; label: string }[]> = {
  course: [
    { a: "bca", b: "bsc-computer-science", label: "BCA vs B.Sc Computer Science" },
    { a: "diploma-civil-engineering", b: "btech-civil", label: "Diploma vs B.Tech Civil" },
    { a: "gnm-nursing", b: "bsc-nursing", label: "GNM vs B.Sc Nursing" },
  ],
  pathway: [{ a: "class10-polytechnic-diploma", b: "class10-science-stream", label: "Polytechnic vs Science stream" }],
  career: [{ a: "software-developer", b: "data-analyst", label: "Developer vs Data analyst" }],
  institution: [],
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; items?: string; a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const type = kinds.some((k) => k.value === params.type) ? params.type! : "course";
  const fromPair = [params.a, params.b].filter((v): v is string => Boolean(v));
  const selected = (fromPair.length ? fromPair : (params.items ?? "").split(",").filter(Boolean)).slice(0, 2);

  const [courses, careers, institutions, pathways] = await Promise.all([
    getCourses({}),
    getCareers(),
    getInstitutions({}),
    getPathways({}),
  ]);

  const options =
    type === "course"
      ? courses.map((c) => ({ value: c.slug, label: c.name }))
      : type === "career"
        ? careers.map((c) => ({ value: c.slug, label: c.title }))
        : type === "institution"
          ? institutions.map((i) => ({ value: i.code, label: i.name }))
          : pathways.map((p) => ({ value: p.slug, label: p.title }));

  let headers: string[] = [];
  let rows: Row[] = [];

  if (type === "course") {
    const chosen = selected.map((slug) => courses.find((c) => c.slug === slug)).filter((c) => c !== undefined);
    headers = chosen.map((c) => c.name);
    rows = [
      { label: "Level", values: chosen.map((c) => c.level.replace(/_/g, " ")) },
      { label: "Duration", values: chosen.map((c) => c.durationLabel ?? null) },
      { label: "Eligibility", values: chosen.map((c) => c.eligibility) },
      { label: "Entrance", values: chosen.map((c) => c.entranceRequirement ?? null) },
      { label: "Subjects", values: chosen.map((c) => (c.relevantSubjects ?? []).join(", ")) },
      { label: "Leads to", values: chosen.map((c) => (c.careerDirections ?? []).join(", ")) },
      { label: "Further study", values: chosen.map((c) => (c.furtherStudy ?? []).join(", ")) },
      { label: "Fees", values: chosen.map((c) => c.feeNote ?? null) },
    ];
  } else if (type === "career") {
    const chosen = selected.map((slug) => careers.find((c) => c.slug === slug)).filter((c) => c !== undefined);
    headers = chosen.map((c) => c.title);
    rows = [
      { label: "In short", values: chosen.map((c) => c.summary) },
      { label: "Entry education", values: chosen.map((c) => c.entryEducation ?? null) },
      { label: "Subjects", values: chosen.map((c) => (c.subjects ?? []).join(", ")) },
      { label: "Other routes in", values: chosen.map((c) => (c.alternativeRoutes ?? []).join(" · ")) },
      { label: "Challenges", values: chosen.map((c) => (c.challenges ?? []).join(" · ")) },
      { label: "Where people work", values: chosen.map((c) => (c.workContexts ?? []).join(", ")) },
    ];
  } else if (type === "institution") {
    const chosen = selected.map((code) => institutions.find((i) => i.code === code)).filter((i) => i !== undefined);
    headers = chosen.map((i) => i.name);
    rows = [
      { label: "District", values: chosen.map((i) => i.district) },
      { label: "Type", values: chosen.map((i) => i.type) },
      { label: "Ownership", values: chosen.map((i) => i.ownership) },
      { label: "Study levels", values: chosen.map((i) => (i.studyLevels ?? []).join(", ")) },
      { label: "Hostel", values: chosen.map((i) => (i.hostelAvailable === "unknown" ? null : i.hostelAvailable)) },
      { label: "Fees", values: chosen.map((i) => i.feeRangeNote ?? null) },
      { label: "Verification", values: chosen.map((i) => i.verificationStatus.replace(/_/g, " ")) },
    ];
  } else {
    const chosen = selected.map((slug) => pathways.find((p) => p.slug === slug)).filter((p) => p !== undefined);
    headers = chosen.map((p) => p.title);
    rows = [
      { label: "Starts after", values: chosen.map((p) => (p.entryStage === "class10" ? "Class 10" : "Class 12")) },
      { label: "Route type", values: chosen.map((p) => p.routeType) },
      { label: "Duration", values: chosen.map((p) => p.typicalDuration ?? null) },
      { label: "In short", values: chosen.map((p) => p.description) },
      { label: "Exams involved", values: chosen.map((p) => (p.examSlugs ?? []).join(", ") || null) },
    ];
  }

  const ready = headers.length >= 2;
  const pairs = suggestedPairs[type] ?? [];

  return (
    <div className="cb-container cb-page">
      <div className="flex items-center gap-2">
        <Eyebrow className="animate-rise">Compare</Eyebrow>
        <Scale aria-hidden className="h-3.5 w-3.5 text-forest-500" />
      </div>
      <h1 className="animate-rise delay-1 mt-4 text-[clamp(1.9rem,4.2vw,2.6rem)] font-semibold">
        Two options, side by side
      </h1>
      <p className="animate-rise delay-2 mt-3 max-w-lg text-[15px] text-ink-500">
        Similar-sounding choices often differ in duration, cost and what they keep open afterwards.
      </p>

      {/* ------------------------------------------------ kind switcher */}
      <div className="animate-rise delay-3 mt-8 inline-flex flex-wrap gap-1 rounded-full border border-ink-200 bg-white p-1">
        {kinds.map((kind) => (
          <Link
            key={kind.value}
            href={`/compare?type=${kind.value}`}
            className={`rounded-full px-4 py-2 text-[13px] transition-colors ${
              type === kind.value ? "bg-forest-700 text-white" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            {kind.label}
          </Link>
        ))}
      </div>

      {/* ------------------------------------------------------ pickers */}
      <form action="/compare" className="animate-rise delay-4 mt-6 grid items-end gap-3 rounded-2xl border border-forest-200 bg-mint/45 p-5 sm:grid-cols-[1fr_auto_1fr_auto]">
        <input type="hidden" name="type" value={type} />
        {(["a", "b"] as const).map((slot, index) => (
          <div key={slot} className={index === 1 ? "sm:col-start-3 sm:row-start-1" : "sm:row-start-1"}>
            <label htmlFor={`slot-${slot}`} className="mb-1.5 block text-[12px] font-medium text-ink-500">
              Option {index + 1}
            </label>
            <select
              id={`slot-${slot}`}
              name={slot}
              defaultValue={selected[index] ?? ""}
              className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-forest-400"
            >
              <option value="">Choose…</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <span
          aria-hidden
          className="hidden h-11 w-11 shrink-0 place-items-center self-end rounded-full border border-ink-200 bg-white text-ink-400 sm:col-start-2 sm:row-start-1 sm:grid"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </span>
        <button
          type="submit"
          className="cb-button cb-button-primary px-6 py-3 text-sm sm:col-start-4 sm:row-start-1"
        >
          Compare
        </button>
      </form>

      {/* ------------------------------------------------------ results */}
      {ready ? (
        <Reveal>
          <section className="mt-10" aria-label="Comparison">
            {/* Column headers */}
            <div className="grid gap-3 sm:grid-cols-2">
              {headers.map((header, index) => (
                <div
                  key={header}
                  className="rounded-2xl border border-ink-100 bg-white p-5"
                >
                  <span
                    aria-hidden
                    className={`mb-3 block h-1.5 w-10 rounded-full ${index === 0 ? accentSurface.mint : accentSurface.lavender}`}
                  />
                  <p className="text-[15px] font-semibold text-ink-900">{header}</p>
                  <Badge className="mt-2">Option {index + 1}</Badge>
                </div>
              ))}
            </div>

            {/* Attribute rows — readable on mobile, aligned on desktop */}
            <dl className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-100 bg-white">
              {rows.map((row, rowIndex) => (
                <div key={row.label} className="sm:grid sm:grid-cols-[9rem_1fr_1fr]">
                  <dt className="bg-canvas/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-400 sm:bg-transparent sm:py-4">
                    {row.label}
                  </dt>
                  {row.values.map((value, index) => (
                    <dd
                      key={index}
                      style={{ animationDelay: `${rowIndex * 40}ms` }}
                      className="animate-fade border-t border-ink-100 px-5 py-3 text-sm leading-relaxed text-ink-600 sm:border-t-0 sm:border-l sm:py-4"
                    >
                      <span className="mb-1 block text-[11px] font-medium text-ink-400 sm:hidden">{headers[index]}</span>
                      {value && value.trim() ? value : <span className="text-ink-300">Not available</span>}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>

            <Callout tone="forest" title="This is a comparison, not a verdict">
              <p className="mt-2">
                Neither option is &ldquo;better&rdquo;. Look at which trade-offs you can live with — then talk it through
                with the mentor if you&apos;re torn.
              </p>
            </Callout>
          </section>
        </Reveal>
      ) : (
        <div className="mt-10 max-w-3xl space-y-5">
          <EmptyState
            icon={<Scale className="h-4 w-4" />}
            title="Pick two to begin"
            description="Choose any two options above, or start from a common comparison below."
          />
          {pairs.length ? (
            <div className="flex flex-wrap gap-2">
              {pairs.map((pair) => (
                <Link
                  key={pair.label}
                  href={`/compare?type=${type}&a=${pair.a}&b=${pair.b}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2.5 text-[13px] text-ink-700 transition-all hover:-translate-y-0.5 hover:border-forest-300"
                >
                  {pair.label}
                  <ArrowGlyph className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
