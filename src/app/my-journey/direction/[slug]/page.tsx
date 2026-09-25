import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  GraduationCap,
  Heart,
  Lightbulb,
  MessageCircle,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { StartingPointShell } from "@/components/starting-point-shell";
import { SaveButton } from "@/components/save-button";
import { FACTOR_LABELS, scoreField } from "@/recommendation/engine";
import { getCareers, getCourses, getField, getPathways } from "@/services/catalog";
import { getExplorationState, getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";

const fieldArtwork: Record<string, string> = {
  technology: "/images/field-technology.png",
  engineering: "/images/field-engineering.png",
  healthcare: "/images/field-healthcare.png",
  business: "/images/field-business.png",
};

const routeTone: Record<string, { label: string; icon: typeof GraduationCap; color: string }> = {
  academic: { label: "Degree route", icon: GraduationCap, color: "bg-[#f1edff] text-[#6650bd]" },
  diploma: { label: "Diploma route", icon: BookOpen, color: "bg-[#eaf6ef] text-[#2f8060]" },
  vocational: { label: "Skill-first route", icon: Wrench, color: "bg-[#edf5fc] text-[#3478b9]" },
  professional: { label: "Professional route", icon: BriefcaseBusiness, color: "bg-[#fff6e4] text-[#9b7419]" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const field = await getField((await params).slug);
  return { title: field?.name ?? "Direction" };
}

function imageFor(fieldSlug: string) {
  return fieldArtwork[fieldSlug] ?? "/images/possibilities-landscape.png";
}

function RelevantRoutes({ routes, fieldCourses, fieldSlug }: {
  routes: Awaited<ReturnType<typeof getPathways>>;
  fieldCourses: Awaited<ReturnType<typeof getCourses>>;
  fieldSlug: string;
}) {
  if (!routes.length) {
    return <section className="mt-5 rounded-xl border border-[#dfe7e5] bg-white p-5" aria-labelledby="routes-heading">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef5f2] text-[#3b7a63]"><RouteIcon aria-hidden className="h-5 w-5" /></span>
        <div>
          <h2 id="routes-heading" className="text-base font-semibold text-[#24463a]">Possible ways forward</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#687a73]">We don’t yet have a stage-specific route mapped for this direction. Browse related courses or the wider route catalogue while this area is being mapped.</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {fieldCourses.length ? <Link href={`/courses?field=${encodeURIComponent(fieldSlug)}`} className="text-sm font-semibold text-[#28775f] underline decoration-[#a9cdbb] underline-offset-4">Browse related courses <ArrowRight aria-hidden className="inline h-4 w-4" /></Link> : null}
            <Link href="/my-journey/routes" className="text-sm font-semibold text-[#28775f] underline decoration-[#a9cdbb] underline-offset-4">Browse routes <ArrowRight aria-hidden className="inline h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>;
  }

  return <section className="mt-5" aria-labelledby="routes-heading">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#6650bd]">Ways to get there</p><h2 id="routes-heading" className="mt-1 text-xl font-semibold tracking-[-.03em] text-[#173b31]">Possible routes to explore</h2><p className="mt-1 text-xs text-[#77857f]">These routes begin after your current stage and connect to this direction.</p></div>
      <Link href="/my-journey/routes" className="hidden items-center gap-1 text-sm font-semibold text-[#28775f] underline decoration-[#a9cdbb] underline-offset-4 sm:inline-flex">Compare routes<ArrowRight aria-hidden className="h-4 w-4" /></Link>
    </div>
    <div className="mt-3 grid gap-3 lg:grid-cols-3">
      {routes.map((pathway) => {
        const tone = routeTone[pathway.routeType] ?? routeTone.academic;
        const Icon = tone.icon;
        const includedCourses = (pathway.courseSlugs ?? []).map((slug) => fieldCourses.find((course) => course.slug === slug)).filter((course): course is (typeof fieldCourses)[number] => Boolean(course)).slice(0, 2);
        return <article key={pathway.slug} className="flex min-w-0 flex-col rounded-xl border border-[#e0e7e6] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(19,50,41,.5)]">
          <div className="flex items-start gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone.color}`}><Icon aria-hidden className="h-[18px] w-[18px]" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[.08em] text-[#71817a]">{tone.label} · after {pathway.entryStage === "class10" ? "Class 10" : "Class 12"}</p><h3 className="mt-1 text-sm font-semibold leading-snug text-[#29463b]">{pathway.title}</h3></div></div>
          <p className="mt-3 flex-1 text-xs leading-relaxed text-[#65766f]">{pathway.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#71817a]">{pathway.typicalDuration ? <span className="inline-flex items-center gap-1 rounded-full bg-[#f5f7f6] px-2 py-1"><Clock3 aria-hidden className="h-3 w-3" />{pathway.typicalDuration}</span> : null}{includedCourses.map((course) => <span key={course.slug} className="rounded-full bg-[#f5f7f6] px-2 py-1">{course.name}</span>)}</div>
          <Link href={`/pathways/${pathway.slug}`} className="mt-4 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#cddbd6] bg-[#f9fcfa] px-3 text-xs font-semibold text-[#31765e] transition hover:bg-[#edf7f1]">Explore this route <ChevronRight aria-hidden className="h-3.5 w-3.5" /></Link>
        </article>;
      })}
    </div>
    <Link href="/my-journey/routes" className="mt-3 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-[#28775f] underline decoration-[#a9cdbb] underline-offset-4 sm:hidden">Compare routes<ArrowRight aria-hidden className="h-4 w-4" /></Link>
  </section>;
}

export default async function DirectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [field, selected, state, user] = await Promise.all([getField(slug), getExplorationState(), getSessionState(), getCurrentUser()]);
  if (!field || !selected || selected.directionSlug !== slug) redirect("/my-journey/direction");
  if (!state || state.status !== "completed") redirect("/reflection");

  const [careers, fieldCourses, allStageRoutes] = await Promise.all([getCareers(field.slug), getCourses({ fieldSlug: field.slug }), getPathways({ stage: state.stage })]);
  const suggestion = scoreField(field, state.snapshot);
  const personalizedReasons = suggestion.reasons.slice(0, 3);
  const cautions = suggestion.cautions.slice(0, 3);
  const fieldCourseSlugs = new Set(fieldCourses.map((course) => course.slug));
  // Include only stage-eligible routes directly tagged to the field or linked to
  // at least one course that is itself tagged to this field.
  const routes = allStageRoutes.filter((pathway) => pathway.fieldSlug === field.slug || (pathway.courseSlugs ?? []).some((slug) => fieldCourseSlugs.has(slug))).slice(0, 3);
  const careersToShow = careers.slice(0, 4);
  const coursesHref = `/courses?field=${encodeURIComponent(field.slug)}`;

  return <StartingPointShell currentStep="direction" stage={state.stage} studentName={user?.name ?? null} studentEmail={user?.email ?? null} signedIn={Boolean(user)}>
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-[#74827d]"><Link href="/my-journey/direction" className="font-medium text-[#3d755e] underline decoration-[#b4cebf] underline-offset-2">Possibility map</Link><span aria-hidden>/</span><span aria-current="page" className="truncate">{field.name}</span></nav>

    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#6650bd]">Exploring a possibility</p><h1 className="mt-1.5 text-[clamp(1.9rem,3vw,2.55rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[#17372e]">{field.name}</h1><p className="mt-1.5 text-sm text-[#687874]">Understand what this could involve before deciding whether it is for you.</p></div>
      <div className="flex flex-wrap items-center gap-3"><span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[#e8f4ef] px-3 text-[11px] font-medium text-[#39715a]"><ShieldCheck aria-hidden className="h-3.5 w-3.5" />Possibility to explore · not a final label</span><SaveButton itemType="field" itemRef={field.slug} label={field.name} saveText="Save this direction" savedText="Direction saved" className="items-start" /></div>
    </header>

    <section className="relative mt-4 grid min-h-[174px] overflow-hidden rounded-xl border border-[#e1e8e7] bg-[#f1f8f6] sm:min-h-[190px] sm:grid-cols-[1.06fr_.94fr]" aria-label={`Introduction to ${field.name}`}>
      <div className="relative z-10 flex flex-col justify-center px-5 py-5 sm:px-6"><h2 className="max-w-[34ch] text-lg font-semibold leading-snug text-[#215443]">{field.tagline ?? `Explore what ${field.name.toLowerCase()} can include`}</h2><p className="mt-2 max-w-[64ch] text-xs leading-relaxed text-[#5e7169] sm:text-sm">{field.overview}</p><p className="mt-2 flex items-start gap-1.5 text-[11px] font-medium leading-relaxed text-[#526a61]"><CircleHelp aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />This is a possibility to understand, not a decision you have to make.</p></div>
      <div className="absolute inset-y-0 right-0 w-full sm:w-[51%]"><Image src={imageFor(field.slug)} alt={`${field.name} illustration`} fill priority sizes="(max-width: 640px) 100vw, 48vw" className="object-cover object-center" /><div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#f1f8f6] via-[#f1f8f6dd] to-transparent sm:w-[35%]" /></div>
    </section>

    <section className="mt-3 grid gap-3 rounded-xl border border-[#e2e8e6] bg-white p-4 sm:grid-cols-3 sm:p-0" aria-label="Why this possibility is shown">
      <div className="sm:p-4"><div className="flex items-center gap-2"><h2 className="text-xs font-semibold text-[#314b40]">Why are you seeing this?</h2><span className="rounded-full bg-[#e8f4ef] px-2 py-0.5 text-[9px] font-medium text-[#4b7961]">Because you told us</span></div><div className="mt-2 space-y-1.5">{personalizedReasons.length ? personalizedReasons.map((reason) => <p key={`${reason.factor}-${reason.detail}`} className="text-[11px] leading-relaxed text-[#66766f]">{reason.detail}</p>) : <p className="text-[11px] leading-relaxed text-[#66766f]">Your answers do not point strongly to this direction yet. It is included as an option to explore—not as a prediction.</p>}</div></div>
      <div className="border-t border-[#e6ecea] pt-3 sm:border-l sm:border-t-0 sm:px-4 sm:py-4"><div className="flex items-center gap-2"><h2 className="text-xs font-semibold text-[#314b40]">So we adjusted</h2><span className="rounded-full bg-[#edf3fb] px-2 py-0.5 text-[9px] font-medium text-[#4c6c91]">Your context</span></div><div className="mt-2 flex flex-wrap gap-1.5">{personalizedReasons.length ? [...new Set(personalizedReasons.map((reason) => FACTOR_LABELS[reason.factor]))].map((label) => <span key={label} className="rounded-full bg-[#edf5f1] px-2 py-1 text-[10px] text-[#527063]">{label}</span>) : <span className="text-[11px] text-[#66766f]">No answer-based adjustments yet</span>}<span className="rounded-full bg-[#edf5f1] px-2 py-1 text-[10px] text-[#527063]">Routes after {state.stage === "class10" ? "Class 10" : "Class 12"}</span>{state.snapshot.locationPref ? <span className="rounded-full bg-[#edf5f1] px-2 py-1 text-[10px] text-[#527063]">Location preference considered</span> : null}</div><Link href="/reflection" className="mt-2 inline-flex min-h-7 items-center gap-1 text-[10px] font-semibold text-[#426f5a] underline decoration-[#b4cebf] underline-offset-2">Review your answers<ArrowUpRight aria-hidden className="h-3 w-3" /></Link></div>
      <div className="border-t border-[#e6ecea] pt-3 sm:border-l sm:border-t-0 sm:px-4 sm:py-4"><h2 className="text-xs font-semibold text-[#314b40]">What could change this view?</h2><p className="mt-2 text-[11px] leading-relaxed text-[#66766f]">New interests, experiences or goals can open other possibilities. You can update any answer and revisit this direction later; nothing here is fixed.</p><Link href="/reflection" className="mt-2 inline-flex min-h-7 items-center gap-1 text-[10px] font-semibold text-[#426f5a] underline decoration-[#b4cebf] underline-offset-2">Edit an answer<ArrowUpRight aria-hidden className="h-3 w-3" /></Link></div>
    </section>

    <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="More about this direction">
      <InfoPanel icon={<RouteIcon className="h-4 w-4" />} title="What people may do" items={(field.whatPeopleDo ?? []).slice(0, 4)} tone="lavender" />
      <InfoPanel icon={<BookOpen className="h-4 w-4" />} title="What you might learn" items={(field.usefulSubjects ?? []).slice(0, 4)} tone="mint" />
      <InfoPanel icon={<Heart className="h-4 w-4" />} title="You might enjoy this if…" items={(field.skills ?? []).slice(0, 3)} tone="blue" intro="These are useful skills in the field, not requirements you must already meet." />
      <InfoPanel icon={<Lightbulb className="h-4 w-4" />} title="Worth thinking about" items={cautions.length ? cautions.slice(0, 3) : (field.challenges ?? []).slice(0, 3)} tone="butter" />
    </section>

    {careersToShow.length ? <section className="mt-4 rounded-xl border border-[#dfe8e5] bg-[#f4faf7] p-4" aria-labelledby="careers-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="careers-heading" className="text-sm font-semibold text-[#29483b]">Where could this lead?</h2><p className="mt-1 text-[11px] text-[#6e7e77]">Examples from the career catalogue; each role has its own route and requirements.</p></div><Link href={`/explore/${field.slug}#careers`} className="inline-flex items-center gap-1 text-xs font-semibold text-[#39775d] underline decoration-[#b4cebf] underline-offset-2">See careers<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></div><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{careersToShow.map((career, index) => <Link key={career.slug} href={`/careers/${career.slug}`} className="flex min-w-0 gap-2.5 rounded-lg border border-[#e7eeeb] bg-white p-3 transition hover:border-[#b8d5c7]"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${index % 2 ? "bg-[#eaf6ef] text-[#2f8060]" : "bg-[#edf2fb] text-[#4673ab]"}`}><BriefcaseBusiness aria-hidden className="h-4 w-4" /></span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-[#344d42]">{career.title}</span><span className="mt-1 line-clamp-2 block text-[10px] leading-relaxed text-[#728078]">{career.summary}</span></span></Link>)}</div></section> : null}

    <RelevantRoutes routes={routes} fieldCourses={fieldCourses} fieldSlug={field.slug} />

    <section className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#dce8e4] bg-[#eff8f4] p-3 sm:gap-3 sm:px-4" aria-label="Choose what to explore next">
      <h2 className="mr-auto flex items-center gap-2 text-sm font-semibold text-[#315343]"><Sparkles aria-hidden className="h-4 w-4" />What would you like to explore next?</h2>
      <Link href="/my-journey/routes" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#168260] px-3 text-xs font-semibold text-white transition hover:bg-[#106f52]">Explore routes<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link>
      <Link href={coursesHref} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#d8e1df] bg-white px-3 text-xs font-medium text-[#405a4e] transition hover:bg-[#f8fbf9]"><BookOpen aria-hidden className="h-3.5 w-3.5" />Look at courses</Link>
      <Link href="/mentor" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#405a4e] transition hover:bg-white"><MessageCircle aria-hidden className="h-3.5 w-3.5" />Ask Mentor</Link>
      <Link href={`/compare?type=field&a=${encodeURIComponent(field.slug)}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#405a4e] transition hover:bg-white">Compare another possibility<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link>
      <Link href="/my-journey/direction" className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#405a4e] transition hover:bg-white">Return to possibility map</Link>
    </section>
    <p className="mt-3 flex items-center gap-1.5 text-[10px] leading-relaxed text-[#80908b]"><ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0" />Information is general guidance. Check course and institution sources for current requirements.</p>
  </StartingPointShell>;
}

function InfoPanel({ icon, title, items, tone, intro }: { icon: React.ReactNode; title: string; items: string[]; tone: "mint" | "lavender" | "blue" | "butter"; intro?: string }) {
  const surfaces = { mint: "bg-[#eff8f4]", lavender: "bg-[#f6f3fc]", blue: "bg-[#eff6fc]", butter: "bg-[#fff9eb]" };
  const icons = { mint: "bg-[#dff1e8] text-[#268368]", lavender: "bg-[#ebe5fa] text-[#7359ca]", blue: "bg-[#e0eef9] text-[#3477ba]", butter: "bg-[#fff0c7] text-[#a88013]" };
  return <section className={`min-w-0 rounded-xl border border-white p-3.5 ${surfaces[tone]}`}><h2 className="flex items-center gap-2 text-xs font-semibold text-[#324c41]"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${icons[tone]}`}>{icon}</span>{title}</h2>{intro ? <p className="mt-2 text-[10px] leading-relaxed text-[#697972]">{intro}</p> : null}<ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-[#596b63]">{items.length ? items.map((item) => <li key={item} className="flex gap-1.5"><CheckCircle2 aria-hidden className="mt-0.5 h-3 w-3 shrink-0 text-[#43866b]" /><span>{item}</span></li>) : <li>More details will be added as this area is mapped.</li>}</ul></section>;
}
