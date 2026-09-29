import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
  Laptop,
  Leaf,
  Link2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourse, getField, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrance process details · BCA · CareerBridge" };

const opportunitySlug = "institution-entrance-process";
const opportunityTitle = "Institution or university entrance process";

const checks = [
  {
    title: "Current notice",
    description: "Read the latest official notice for this entrance process.",
    Icon: FileText,
  },
  {
    title: "Dates",
    description: "Look for the application, test, and result dates.",
    Icon: CalendarDays,
  },
  {
    title: "Eligible courses",
    description: "Confirm the BCA programmes covered, if applicable.",
    Icon: GraduationCap,
  },
  {
    title: "Application method",
    description: "Understand how to apply, including required documents.",
    Icon: Laptop,
  },
  {
    title: "Subjects",
    description: "Check the subjects, format, or topics, if mentioned.",
    Icon: BookOpen,
  },
  {
    title: "Official institution or exam source",
    description: "Always use the official source for complete and updated information.",
    Icon: ExternalLink,
  },
];

function AtAGlanceRow({ Icon, label, value }: { Icon: typeof GraduationCap; label: string; value: string }) {
  return <div className="flex items-center gap-3 border-t border-[#e7eee8] px-3 py-2.5 first:border-t-0">
    <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e5f3ed] text-[#176b5d]"><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
    <span className="min-w-0 flex-1 text-sm text-[#607067]">{label}</span>
    <span className="max-w-[58%] text-right font-serif text-sm text-[#263b34]">{value}</span>
  </div>;
}

function QuietLandscape() {
  return <svg aria-hidden="true" viewBox="0 0 1600 190" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] w-full sm:h-[165px]">
    <path fill="#e9f6ef" d="M0 104 110 70l94 30 112-48 106 45 116-37 100 37 118-52 116 41 101-31 111 36 111-49 116 39 113-31 86 28v112H0Z" />
    <path fill="#d4eee2" d="M0 130c126-40 216-26 305 3 96 31 189 14 275-15 100-34 196-19 297 13 116 38 208 24 302-2 107-30 206-14 302 13 52 15 92 19 119 9v39H0Z" />
    <path fill="#bde4d4" d="M0 155c130-31 215-27 320-4 114 25 205 21 310-7 101-27 196-23 304 2 105 25 216 27 321 2 127-30 225-13 345 20v22H0Z" />
    <path d="M1200 151h190m-170 0a21 21 0 0 1 42 0m18 0a21 21 0 0 1 42 0m18 0a21 21 0 0 1 42 0" fill="none" stroke="#73b79e" strokeWidth="7" />
    <g fill="#4f9a81"><path d="m74 160 17-42 17 42Zm10-25 7-20 8 20Zm-2 25h17v7H82Z" /><path d="m1460 160 17-44 18 44Zm10-28 7-20 8 20Zm-2 28h17v7h-17Z" /><path d="m1507 160 13-34 14 34Zm8-22 5-16 6 16Zm-2 22h13v6h-13Z" /></g>
    <g fill="#82bca5"><path d="m128 160 13-33 14 33Zm8-21 5-16 6 16Zm-2 21h13v6h-13Z" /><path d="m1402 160 13-33 14 33Zm8-21 5-16 6 16Zm-2 21h13v6h-13Z" /></g>
  </svg>;
}

export default async function EntranceProcessDetailPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string; opportunitySlug: string }> }) {
  const { slug, pathwaySlug, courseSlug, opportunitySlug: requestedOpportunity } = await params;
  const [state, field, pathway, course] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
  ]);

  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (
    slug !== "technology" ||
    pathwaySlug !== "class12-any-bca" ||
    courseSlug !== "bca" ||
    requestedOpportunity !== opportunitySlug ||
    !field ||
    !pathway ||
    pathway.fieldSlug !== field.slug ||
    !course ||
    course.slug !== "bca" ||
    !pathway.courseSlugs?.includes(course.slug)
  ) notFound();

  const returnHref = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}/exams-scholarships`;
  const studentStage = state.stage === "class10" ? "Class 10" : "Class 12";

  return <main className="relative isolate min-h-[calc(100dvh-134px)] overflow-hidden bg-[#fcfcfa] px-5 pb-32 pt-6 text-[#26312c] sm:px-8 sm:pt-8 lg:px-12 lg:pb-36">
    <section className="relative z-10 mx-auto max-w-[1500px]">
      <header className="mb-5">
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <h1 className="max-w-[900px] font-serif text-[clamp(2rem,4vw,3.35rem)] leading-[1.07] tracking-[-.04em] text-[#102c43]">{opportunityTitle}</h1>
          <span className="mt-1 inline-flex rounded-full border border-[#f0d79e] bg-[#fff1cf] px-3 py-1.5 font-serif text-sm text-[#675a38]">Example opportunity for design review only</span>
        </div>
        <p className="mt-2 font-serif text-[clamp(1.05rem,1.7vw,1.35rem)] leading-[1.35] text-[#596960]">An admission process that may apply to some BCA programmes.</p>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(330px,.98fr)]">
        <div className="space-y-4">
          <div role="note" className="flex items-center gap-3 rounded-xl border border-[#f0d79e] bg-[#fff2d2] px-4 py-3.5 text-[#4f4a35] sm:px-5">
            <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#c69127] font-serif text-lg font-bold text-white">!</span>
            <p className="font-serif text-[1rem] leading-snug">Seeing this opportunity does not mean you are eligible. Confirm the current rules with the official source.</p>
          </div>

          <section aria-labelledby="why-title" className="overflow-hidden rounded-xl border border-[#dce8df] bg-white/95 shadow-[0_6px_24px_-24px_rgba(40,69,60,.6)]">
            <div className="flex gap-4 bg-[#eff7f3] px-5 py-5 sm:px-6">
              <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#dff1e9] text-[#176b5d]"><FileText className="h-7 w-7" strokeWidth={1.7} /></span>
              <div><h2 id="why-title" className="font-serif text-[1.7rem] leading-tight text-[#173d4a]">Why it may matter</h2><p className="mt-2 max-w-[790px] font-serif text-[1.05rem] leading-relaxed text-[#596960]">Some institutions or programmes may use an entrance process for admission to BCA. The process, eligibility criteria, subjects, dates, and application method can vary across institutions. Always refer to the official source for the most accurate and up-to-date information.</p></div>
            </div>

            <div className="px-5 pb-4 pt-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e3f3eb] text-[#176b5d]"><CheckCircle2 className="h-6 w-6" strokeWidth={1.7} /></span>
                <div><h2 className="font-serif text-[1.6rem] leading-tight text-[#173d4a]">What to verify</h2><p className="mt-1 font-serif text-base text-[#637168]">Check the following details with the official source before you plan or apply.</p></div>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {checks.map(({ title, description, Icon }) => <article key={title} className="flex min-h-[72px] items-start gap-3 rounded-lg border border-[#e5ebe5] bg-[#fffefa] px-3 py-3">
                  <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f4ee] text-[#176b5d]"><Icon className="h-5 w-5" strokeWidth={1.7} /></span>
                  <div><h3 className="font-serif text-base leading-tight text-[#263b34]">{title}</h3><p className="mt-1 font-serif text-sm leading-snug text-[#66736b]">{description}</p></div>
                </article>)}
              </div>
              <div role="note" className="mt-3 flex items-start gap-2 rounded-lg bg-[#e8f6ef] px-4 py-3 font-serif text-sm leading-snug text-[#386c5b]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Dates, subjects, fees, and eligibility can change. Always refer to the official source.</div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section aria-labelledby="glance-title" className="rounded-xl border border-[#dce8df] bg-[#eff7f3] p-4 sm:p-5">
            <div className="flex items-center gap-3 px-1 pb-3"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#dff1e9] text-[#176b5d]"><BarChart3 className="h-6 w-6" /></span><div><h2 id="glance-title" className="font-serif text-[1.55rem] leading-tight text-[#173d4a]">At a glance</h2><p className="mt-1 font-serif text-sm text-[#68766e]">Key details about this opportunity.</p></div></div>
            <div className="overflow-hidden rounded-lg bg-white/85">
              <AtAGlanceRow Icon={GraduationCap} label="Course" value="BCA" />
              <AtAGlanceRow Icon={UserRound} label="Student stage" value={studentStage} />
              <AtAGlanceRow Icon={BarChart3} label="Relevance" value="May vary by institution" />
              <AtAGlanceRow Icon={ShieldCheck} label="Eligibility status" value="Not confirmed" />
              <AtAGlanceRow Icon={Link2} label="Source status" value="Official source not connected" />
            </div>
          </section>

          <section aria-labelledby="next-step-title" className="rounded-xl border border-[#dce8df] bg-[#eff7f3] p-4 sm:p-5">
            <div className="flex items-center gap-3 px-1"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#dff1e9] text-[#176b5d]"><Leaf className="h-6 w-6" /></span><div><h2 id="next-step-title" className="font-serif text-[1.55rem] leading-tight text-[#173d4a]">Next step</h2><p className="mt-1 font-serif text-sm text-[#68766e]">Check the official source for the latest information.</p></div></div>
            <button type="button" disabled className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#a9bdc4] px-4 font-serif text-sm text-white/95" aria-disabled="true"><ExternalLink aria-hidden className="h-4 w-4" />Official source not connected</button>
            <div className="mt-2 flex justify-center rounded-lg border border-[#70a99a] bg-white px-3 py-2.5"><SaveButton itemType="opportunity" itemRef="bca-institution-entrance-process" label={opportunityTitle} saveText="Save this opportunity" savedText="Opportunity saved" className="[&>button]:min-h-7 [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-2 [&>button]:py-0 [&>button]:font-serif [&>button]:text-[#176b5d] [&>button]:hover:bg-[#eff7f3]" /></div>
            <Link href={returnHref} className="mt-3 inline-flex min-h-9 items-center gap-2 font-serif text-sm text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42]"><ArrowLeft aria-hidden className="h-4 w-4" />Return to exams and scholarships</Link>
          </section>
        </aside>
      </div>

      <p className="mt-6 flex items-center gap-3 font-serif text-base text-[#547267]"><Leaf aria-hidden className="h-6 w-6 shrink-0 text-[#4f9a81]" /><span>A more confident next step.</span><span aria-hidden className="hidden h-px flex-1 bg-[#cfded4] sm:block" /></p>
    </section>
    <QuietLandscape />
  </main>;
}
