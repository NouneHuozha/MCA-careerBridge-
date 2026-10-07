import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, GitCompareArrows, Info } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { getCareers, getCourses, getFields, getInstitutions, getPathways } from "@/services/catalog";
import { getExplorationState, getSessionState } from "@/services/profile";
import { SaveGuidanceComparison } from "./save-comparison";

export const dynamic = "force-dynamic";
export const metadata = { title: "Compare options · My Guidance" };

type CompareKind = "field" | "course" | "career" | "institution" | "pathway";
type Fact = { label: string; value: string };
type Choice = { value: string; label: string; description: string; facts: Fact[] };

const kinds: { value: CompareKind; label: string }[] = [
  { value: "field", label: "Possibilities" },
  { value: "pathway", label: "Routes" },
  { value: "course", label: "Courses" },
  { value: "institution", label: "Institutions" },
  { value: "career", label: "Careers" },
];

function asText(value: unknown) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim()).join(", ");
  return typeof value === "string" ? value.trim() : "";
}

function makeChoice(value: string, label: string, description: string, values: [string, unknown][]): Choice {
  return {
    value,
    label,
    description,
    facts: values.map(([factLabel, factValue]) => ({ label: factLabel, value: asText(factValue) || "Not listed" })),
  };
}

function safeGuidanceReturn(value: string | undefined) {
  if (!value || !value.startsWith("/guidance/") || value.startsWith("//") || /[?#\\]/.test(value) || value.split("/").includes("..")) {
    return "/guidance";
  }
  return value;
}

function queryFor(kind: CompareKind, returnTo: string, field?: string, course?: string) {
  const params = new URLSearchParams({ type: kind, returnTo });
  if (field) params.set("field", field);
  if (course) params.set("course", course);
  return `/guidance/compare?${params.toString()}`;
}

export default async function GuidanceComparePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const state = await getSessionState();
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const validKind = kinds.some((kind) => kind.value === params.type);
  const kind: CompareKind = validKind ? params.type as CompareKind : "course";
  const [active, user, fields, careers, courses, pathways, institutions] = await Promise.all([
    getExplorationState(),
    getCurrentUser(),
    getFields(),
    getCareers(),
    getCourses({ fieldSlug: params.field || undefined }),
    getPathways({ fieldSlug: params.field || undefined, stage: state.stage }),
    getInstitutions({ courseSlug: params.course || undefined }),
  ]);
  const fieldScope = params.field || active?.directionSlug || "";

  const choices: Choice[] = kind === "field"
    ? fields.map((field) => makeChoice(field.slug, field.name, field.tagline ?? "Possibility to explore", [
        ["In a nutshell", field.overview],
        ["What people may do", field.whatPeopleDo],
        ["Useful subjects", field.usefulSubjects],
        ["Things to consider", field.challenges],
      ]))
    : kind === "course"
      ? courses.map((course) => makeChoice(course.slug, course.name, course.level.replace(/_/g, " "), [
          ["Study length", course.durationLabel],
          ["Entry requirements", course.eligibility],
          ["What you learn", course.relevantSubjects],
          ["Possible next steps", [...(course.careerDirections ?? []), ...(course.furtherStudy ?? [])]],
          ["Fees and support", course.feeNote],
        ]))
      : kind === "career"
        ? careers.map((career) => makeChoice(career.slug, career.title, "Career direction", [
            ["In short", career.summary],
            ["Entry requirements", career.entryEducation],
            ["Useful subjects", career.subjects],
            ["Possible next steps", career.alternativeRoutes],
            ["Where people may work", career.workContexts],
          ]))
        : kind === "institution"
          ? institutions.map((institution) => makeChoice(institution.code, institution.name, `${institution.type} · ${institution.district}`, [
              ["Study levels", institution.studyLevels],
              ["Institution type", institution.type],
              ["Fields of study", institution.fieldSlugs],
              ["Location", `${institution.city ?? institution.district}, ${institution.district}`],
              ["Fees and support", institution.feeRangeNote],
            ]))
          : pathways.map((pathway) => makeChoice(pathway.slug, pathway.title, pathway.entryStage === "class10" ? "Route from Class 10" : "Route from Class 12", [
              ["Starts after", pathway.entryStage === "class10" ? "Class 10" : "Class 12"],
              ["Route type", pathway.routeType],
              ["What this route involves", pathway.description],
              ["Possible next steps", pathway.examSlugs],
            ]));

  const initialItems = (params.items ?? "").split(",").filter(Boolean);
  const selectedRefs = [params.a ?? initialItems[0], params.b ?? initialItems[1]].filter((value): value is string => Boolean(value));
  const selectedChoices = selectedRefs
    .map((ref) => choices.find((choice) => choice.value === ref))
    .filter((choice): choice is Choice => Boolean(choice));
  const ready = selectedChoices.length === 2 && selectedChoices[0].value !== selectedChoices[1].value;
  const returnTo = safeGuidanceReturn(params.returnTo);
  const returnHref = returnTo === "/guidance" && params.returnTo ? "/guidance" : returnTo;
  const allFactLabels = [...new Set(selectedChoices.flatMap((choice) => choice.facts.map((fact) => fact.label)))];
  const signInHref = `/sign-in?next=${encodeURIComponent(`/guidance/compare?type=${kind}&a=${encodeURIComponent(selectedRefs[0] ?? "")}&b=${encodeURIComponent(selectedRefs[1] ?? "")}&returnTo=${encodeURIComponent(returnTo)}`)}`;

  return <main className="min-h-[calc(100dvh-76px)] bg-[#fcfcfa] px-5 pb-10 pt-6 text-[#26312c] sm:px-8 lg:px-12">
    <section className="mx-auto max-w-[1120px]">
      <Link href={returnHref} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#a6c5b8] underline-offset-4"><ArrowLeft aria-hidden className="h-4 w-4" />Back to your exploration</Link>
      <header className="mt-4 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[.14em] text-[#68786d]">My Guidance · Compare</p>
        <h1 className="mt-2 font-serif text-[clamp(2.1rem,4vw,3.3rem)] leading-tight tracking-[-.035em] text-[#173344]">Compare options in your exploration</h1>
        <p className="mt-2 text-base leading-relaxed text-[#68756d]">Look at the information side by side. This is a comparison, not a recommendation, and it does not restart counselling.</p>
      </header>

      <section className="mt-5 rounded-xl border border-[#dfe8df] bg-white p-4 sm:p-5" aria-label="Choose options to compare">
        <div className="flex flex-wrap items-center gap-2">
          {kinds.map((entry) => <Link key={entry.value} href={queryFor(entry.value, returnTo, fieldScope || undefined, params.course)} aria-current={entry.value === kind ? "page" : undefined} className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium transition ${entry.value === kind ? "bg-[#dcefe3] text-[#205b4d]" : "border border-[#dfe5df] bg-white text-[#58675e] hover:bg-[#f2f7f3]"}`}>{entry.label}</Link>)}
        </div>
        <form action="/guidance/compare" method="get" className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="type" value={kind} />
          <input type="hidden" name="returnTo" value={returnTo} />
          {fieldScope ? <input type="hidden" name="field" value={fieldScope} /> : null}
          {params.course ? <input type="hidden" name="course" value={params.course} /> : null}
          <label className="text-sm font-medium text-[#4b5d53]">Option 1<select name="a" defaultValue={selectedChoices[0]?.value ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border border-[#cfdcd3] bg-white px-3 text-sm text-[#243b32] outline-none focus:border-[#286b61] focus:ring-2 focus:ring-[#d8ebe1]"><option value="">Choose an option</option>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select></label>
          <label className="text-sm font-medium text-[#4b5d53]">Option 2<select name="b" defaultValue={selectedChoices[1]?.value ?? ""} className="mt-1 block min-h-11 w-full rounded-lg border border-[#cfdcd3] bg-white px-3 text-sm text-[#243b32] outline-none focus:border-[#286b61] focus:ring-2 focus:ring-[#d8ebe1]"><option value="">Choose another option</option>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select></label>
          <button type="submit" className="inline-flex min-h-11 self-end items-center justify-center gap-2 rounded-lg bg-[#075a58] px-5 text-sm font-semibold text-white transition hover:bg-[#064a49]">Compare <ArrowRight aria-hidden className="h-4 w-4" /></button>
        </form>
      </section>

      {ready ? <section className="mt-5 overflow-hidden rounded-xl border border-[#dfe5df] bg-white" aria-label="Side-by-side comparison">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e9e4] bg-[#f4f8f4] px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e2f0e8] text-[#286b61]"><GitCompareArrows aria-hidden className="h-5 w-5" /></span><div><h2 className="font-serif text-xl text-[#173344]">Side-by-side comparison</h2><p className="text-sm text-[#68756d]">Only information in the current catalogue is shown.</p></div></div><SaveGuidanceComparison kind={kind} itemRefs={selectedChoices.map((choice) => choice.value)} signedIn={Boolean(user)} signInHref={signInHref} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(140px,.8fr)_repeat(2,minmax(0,1fr))]">
          <div className="hidden bg-[#f8faf7] sm:block" />
          {selectedChoices.map((choice) => <div key={choice.value} className="border-b border-[#e4e9e4] bg-[#edf5ef] px-5 py-4 sm:border-l"><h3 className="font-serif text-lg font-semibold text-[#173344]">{choice.label}</h3><p className="mt-1 text-sm text-[#68756d]">{choice.description}</p></div>)}
          {allFactLabels.map((label) => <div key={label} className="contents"><div className="border-b border-[#e4e9e4] bg-[#f8faf7] px-5 py-4 text-sm font-semibold text-[#355a4e]">{label}</div>{selectedChoices.map((choice) => <div key={`${choice.value}-${label}`} className="min-h-16 border-b border-[#e4e9e4] px-5 py-4 text-sm leading-relaxed text-[#4e5c54] sm:border-l">{choice.facts.find((fact) => fact.label === label)?.value ?? "Not listed"}</div>)}</div>)}
        </div>
      </section> : <div className="mt-5 flex items-start gap-3 rounded-lg border border-[#e3e9e4] bg-[#f5f8f4] px-4 py-4 text-sm leading-relaxed text-[#607068]"><Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#47766c]" /><p className="m-0">Choose two different options above to compare them here. You’ll stay in My Guidance and can return to the page you came from.</p></div>}
    </section>
  </main>;
}
