import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  Bookmark,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  ClipboardList,
  Clock3,
  GraduationCap,
  Leaf,
  Monitor,
  Plus,
  Route as RouteIcon,
  Sprout,
  UserRound,
  UsersRound,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { findQuestion } from "@/data/counselling";
import { getCareers, getCourses, getField, getInstitutions, getPathways } from "@/services/catalog";
import { getExplorationHistory, getExplorationState, getSessionState, labelFor } from "@/services/profile";
import { listPlans, listSaved } from "@/services/student";

export const dynamic = "force-dynamic";
export const metadata = { title: "My guidance · CareerBridge" };

type SessionState = NonNullable<Awaited<ReturnType<typeof getSessionState>>>;
type HistoryRecord = Awaited<ReturnType<typeof getExplorationHistory>>[number];
type SavedRows = Awaited<ReturnType<typeof listSaved>>;
type PlanRows = Awaited<ReturnType<typeof listPlans>>;
type Field = NonNullable<Awaited<ReturnType<typeof getField>>>;
type RelatedRefs = { careers: Set<string>; pathways: Set<string>; courses: Set<string>; institutions: Set<string> };
type DirectionEntry = { field: Field; record?: HistoryRecord; savedDirection: boolean; current: boolean };
type DirectionCardData = DirectionEntry & { savedSummary: string; related: RelatedRefs };

const directionIcons: Record<string, LucideIcon> = {
  technology: Monitor,
  government: UsersRound,
  "social-sciences": UsersRound,
  healthcare: Building2,
  "agriculture-environment": Leaf,
};

const stageLabels = { class10: "Class 10", class12: "Class 12" } as const;
const stageDetails: Record<string, string> = { studying: "currently studying", completed: "course completed", awaiting_results: "waiting for results" };
const savedTypeLabels: Record<string, string> = {
  field: "direction",
  career: "career",
  course: "course",
  institution: "institution",
  pathway: "route",
  scholarship: "scholarship",
  exam: "exam",
  opportunity: "opportunity",
};

function getAnswerLabel(state: SessionState, key: string, kind?: "subject" | "interest" | "strength" | "goal" | "value") {
  const value = state.answers[key]?.values?.[0];
  if (!value) return null;
  const question = findQuestion(key);
  return question?.options?.find((option) => option.value === value)?.label ?? (kind ? labelFor(kind, value) : value.replace(/-/g, " "));
}

function locationLabel(record?: HistoryRecord) {
  const path = record?.lastLocation;
  if (!path) return null;
  const section = path.replace(`/guidance/direction/${encodeURIComponent(record.directionSlug)}`, "");
  if (!section) return "Direction overview";
  if (section.endsWith("/practical-checks")) return "Practical checks";
  if (section.endsWith("/exams-scholarships")) return "Exams and scholarships";
  if (section.endsWith("/application")) return "Application and requirements";
  if (/\/institutions\/[^/]+$/.test(section)) return "Institution details";
  if (section.includes("/institutions")) return "Institutions";
  if (/\/courses\/[^/]+$/.test(section)) return "Course details";
  if (section.endsWith("/courses")) return "Courses in this route";
  if (/\/routes\/[^/]+$/.test(section)) return "Route details";
  if (section.endsWith("/routes")) return "Routes";
  return "Direction overview";
}

function safeResumeHref(slug: string, record?: HistoryRecord) {
  const base = `/guidance/direction/${encodeURIComponent(slug)}`;
  const path = record?.lastLocation;
  return path && (path === base || path.startsWith(`${base}/`)) && !/[?#\\]/.test(path) ? path : base;
}

function statusClass(status: string) {
  return status === "done" ? "bg-[#dff1e4] text-[#317747]" : "bg-[#eef0ef] text-[#5d6761]";
}

function matchesSaved(item: SavedRows[number], slug: string, related: RelatedRefs) {
  if (item.itemType === "field") return item.itemRef === slug;
  if (item.itemType === "career") return related.careers.has(item.itemRef);
  if (item.itemType === "pathway") return related.pathways.has(item.itemRef);
  if (item.itemType === "course") return related.courses.has(item.itemRef);
  if (item.itemType === "institution") return related.institutions.has(item.itemRef);
  return false;
}

function planForDirection(plan: PlanRows[number]["plan"], slug: string, related: RelatedRefs) {
  if (plan.focusType === "field") return plan.focusRef === slug;
  if (plan.focusType === "career") return related.careers.has(plan.focusRef);
  if (plan.focusType === "pathway") return related.pathways.has(plan.focusRef);
  if (plan.focusType === "course") return related.courses.has(plan.focusRef);
  if (plan.focusType === "institution") return related.institutions.has(plan.focusRef);
  return false;
}

async function getDirectionCardData(entry: DirectionEntry, saved: SavedRows): Promise<DirectionCardData> {
  const [careers, pathways, courses, institutions] = await Promise.all([
    getCareers(entry.field.slug),
    getPathways({ fieldSlug: entry.field.slug }),
    getCourses({ fieldSlug: entry.field.slug }),
    getInstitutions({ fieldSlug: entry.field.slug }),
  ]);
  const related: RelatedRefs = {
    careers: new Set(careers.map((career) => career.slug)),
    pathways: new Set(pathways.map((pathway) => pathway.slug)),
    courses: new Set([...courses.map((course) => course.slug), ...pathways.flatMap((pathway) => pathway.courseSlugs ?? [])]),
    institutions: new Set(institutions.map((institution) => institution.code)),
  };
  const counts = new Map<string, number>();
  for (const item of saved.filter((candidate) => matchesSaved(candidate, entry.field.slug, related))) {
    const label = savedTypeLabels[item.itemType] ?? "item";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const savedSummary = counts.size
    ? `Saved ${[...counts].map(([label, count]) => `${count} ${label}${count === 1 ? "" : "s"}`).join(" and ")}`
    : "No saved items in this direction yet";
  return { ...entry, savedSummary, related };
}

function priorityScore(entry: DirectionEntry, plan: PlanRows[number]["plan"], relatedBySlug: Map<string, RelatedRefs>, primarySlug: string | null) {
  const relevant = planForDirection(plan, entry.field.slug, relatedBySlug.get(entry.field.slug) ?? { careers: new Set(), pathways: new Set(), courses: new Set(), institutions: new Set() });
  if (!relevant) return Number.POSITIVE_INFINITY;
  return entry.field.slug === primarySlug ? 0 : 1;
}

function planHref(plan: PlanRows[number]["plan"]) {
  const focus = `${plan.focusType}:${plan.focusRef}`;
  return `/guidance/action-plan?focus=${encodeURIComponent(focus)}`;
}

function activityLabel(value?: string | null) {
  if (!value) return "No recent activity recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent activity recorded";
  const days = Math.floor(Math.max(0, Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

function DirectionIcon({ slug, className = "h-7 w-7" }: { slug: string; className?: string }) {
  const Icon = directionIcons[slug] ?? BriefcaseBusiness;
  return <Icon aria-hidden className={className} strokeWidth={1.6} />;
}

function ExplorationCard({ entry }: { entry: DirectionCardData }) {
  const status = entry.current ? "Active exploration" : entry.record ? "Saved exploration" : "Saved direction";
  const badgeClass = entry.current ? "bg-[#dff1e4] text-[#27713d]" : "bg-[#fff0cb] text-[#806315]";
  return <article className={`relative overflow-hidden rounded-xl border px-4 py-4 ${entry.current ? "border-[#dbe8dd] bg-[#f0f6f1]" : "border-[#e8e4d7] bg-[#fbf8ec]"}`}>
    <div aria-hidden className="absolute inset-y-0 right-0 w-[42%] overflow-hidden"><span className="absolute -bottom-5 right-2 h-20 w-28 rotate-[-12deg] rounded-[60%] bg-[#dbe8dc]" /><span className="absolute -bottom-6 right-12 h-20 w-24 rotate-[10deg] rounded-[60%] bg-[#c8ddd0]" /><span className="absolute bottom-3 right-4 text-[#729e8c]"><Sprout className="h-8 w-8" /></span></div>
    <div className="relative z-10 flex items-start gap-3"><span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/85 text-[#145c57]"><DirectionIcon slug={entry.field.slug} className="h-6 w-6" /></span><div className="min-w-0"><h3 className="font-serif text-lg leading-tight text-[#173344]">{entry.field.name}</h3><span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${badgeClass}`}><span aria-hidden className={`h-1.5 w-1.5 rounded-full ${entry.current ? "bg-[#218a48]" : "bg-[#c28b16]"}`} />{status}</span><p className="mt-1.5 max-w-[290px] text-xs leading-snug text-[#68756d]">{entry.savedSummary}</p><Link href={safeResumeHref(entry.field.slug, entry.record)} className="mt-3 inline-flex min-h-9 min-w-[150px] items-center justify-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white transition hover:bg-[#064a49]">Resume<ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div>
  </article>;
}

export default async function MyGuidanceOverviewPage() {
  const [sessionState, user, active, history] = await Promise.all([
    getSessionState(),
    getCurrentUser(),
    getExplorationState(),
    getExplorationHistory(),
  ]);
  if (!sessionState) redirect("/start");
  if (sessionState.status !== "completed") redirect("/counselling");

  const [saved, plans] = await Promise.all([
    user ? listSaved(user.id).catch((): SavedRows => []) : Promise.resolve([] as SavedRows),
    user ? listPlans(user.id).catch((): PlanRows => []) : Promise.resolve([] as PlanRows),
  ]);

  const recordMap = new Map<string, HistoryRecord>();
  for (const record of history) recordMap.set(record.directionSlug, record);
  if (active) {
    const previous = recordMap.get(active.directionSlug);
    recordMap.set(active.directionSlug, {
      directionSlug: active.directionSlug,
      selectedAt: active.selectedAt,
      lastLocation: previous?.lastLocation ?? null,
      lastMeaningfulAt: previous?.lastMeaningfulAt ?? null,
      completedSteps: active.completedSteps,
    });
  }

  const savedFieldDates = new Map<string, Date>();
  for (const item of saved.filter((candidate) => candidate.itemType === "field")) {
    if (!recordMap.has(item.itemRef)) savedFieldDates.set(item.itemRef, item.createdAt);
  }
  const candidateSlugs = [...new Set([...recordMap.keys(), ...savedFieldDates.keys()])];
  const fields = await Promise.all(candidateSlugs.map((slug) => getField(slug)));
  const fieldsBySlug = new Map(fields.filter((field): field is Field => Boolean(field)).map((field) => [field.slug, field]));
  const entries: DirectionEntry[] = candidateSlugs
    .flatMap((slug) => {
      const field = fieldsBySlug.get(slug);
      return field ? [{ field, record: recordMap.get(slug), savedDirection: savedFieldDates.has(slug), current: active?.directionSlug === slug }] : [];
    })
    .sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      const aDate = new Date(a.record?.lastMeaningfulAt ?? a.record?.selectedAt ?? savedFieldDates.get(a.field.slug) ?? 0).getTime();
      const bDate = new Date(b.record?.lastMeaningfulAt ?? b.record?.selectedAt ?? savedFieldDates.get(b.field.slug) ?? 0).getTime();
      return bDate - aDate;
    });
  const visibleExplorations = await Promise.all(entries.slice(0, 2).map((entry) => getDirectionCardData(entry, saved)));
  const primaryEntry = visibleExplorations.find((entry) => entry.current) ?? visibleExplorations[0] ?? null;
  const primarySlug = primaryEntry?.field.slug ?? null;

  const relatedBySlug = new Map(visibleExplorations.map((entry) => [entry.field.slug, entry.related]));
  const prioritizedPlans = plans
    .map((item) => ({ ...item, priority: Math.min(...visibleExplorations.map((entry) => priorityScore(entry, item.plan, relatedBySlug, primarySlug)), Number.POSITIVE_INFINITY) }))
    .sort((a, b) => a.priority - b.priority || b.plan.updatedAt.getTime() - a.plan.updatedAt.getTime());
  const openChecks = prioritizedPlans.flatMap(({ plan, items }) => items
    .filter((item) => item.status !== "done")
    .map((item) => ({ plan, item, status: "todo" as const }))).slice(0, 3);
  const checkedCount = plans.flatMap(({ items }) => items).filter((item) => item.status === "done").length;
  const hasSavedChecks = plans.some(({ items }) => items.length > 0);

  const stage = stageLabels[sessionState.stage];
  const stageDetail = stageDetails[sessionState.stageDetail ?? ""];
  const interestQuestion = findQuestion("interests");
  const interestLabels = (sessionState.answers.interests?.values ?? []).map((value) => interestQuestion?.options?.find((option) => option.value === value)?.label ?? labelFor("interest", value)).slice(0, 2);
  const preference = getAnswerLabel(sessionState, "work_style") ?? getAnswerLabel(sessionState, "location_pref");
  const mobileSignals = [
    interestLabels[0] ?? getAnswerLabel(sessionState, "subjects_enjoy", "subject") ?? getAnswerLabel(sessionState, "strengths", "strength"),
    getAnswerLabel(sessionState, "goals", "goal") ?? getAnswerLabel(sessionState, "values", "value") ?? preference,
  ].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index).slice(0, 2);
  const resumeHref = primaryEntry ? safeResumeHref(primaryEntry.field.slug, primaryEntry.record) : "/guidance/possibilities";
  const lastLocation = primaryEntry ? locationLabel(primaryEntry.record) : null;
  const lastActivity = primaryEntry?.record?.lastMeaningfulAt ?? primaryEntry?.record?.selectedAt ?? null;

  return <main className="min-h-[calc(100dvh-62px)] bg-[#fcfcfa] px-5 pb-8 pt-5 text-[#26312c] sm:px-8 lg:px-12">
    <section className="mx-auto max-w-[700px] lg:hidden">
      <header><p className="text-sm font-medium text-[#68756d]">My Guidance</p><h1 className="mt-2 font-sans text-[clamp(2.25rem,8vw,3rem)] font-bold leading-[1.05] tracking-[-.04em] text-[#103a37]">Your next steps</h1><p className="mt-2 font-sans text-[1.2rem] leading-snug text-[#6c7688]">A place to explore possibilities at your own pace.</p><p className="mt-3 font-sans text-[1rem] leading-[1.4] text-[#6c7688]">You can explore more than one direction and come back whenever you’re ready.</p></header>

      <section className="mt-5 rounded-xl border border-[#e1eae6] bg-[#f3fbf7] px-4 py-4 shadow-[0_4px_16px_-16px_rgba(40,69,60,.45)]" aria-labelledby="mobile-starting-point-title"><div className="flex items-start gap-3"><span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#dff4eb] text-[#075a58]"><UserRound className="h-9 w-9" strokeWidth={1.7} /></span><div className="min-w-0 flex-1"><h2 id="mobile-starting-point-title" className="font-sans text-[1.2rem] font-semibold leading-tight text-[#103a37]">Your starting point</h2>{mobileSignals.length ? <ul className="mt-2 space-y-2">{mobileSignals.map((signal, index) => <li key={signal} className="flex items-center gap-2.5 text-sm leading-snug text-[#68758a]"><span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${index ? "bg-[#f1ebff] text-[#6750a4]" : "bg-[#e7f4eb] text-[#477a57]"}`}>{index ? <BookOpen className="h-4 w-4" /> : <Sprout className="h-4 w-4" />}</span>{signal}</li>)}</ul> : <p className="mt-2 text-sm leading-snug text-[#68758a]">Your starting point can change as you explore.</p>}<Link href="/guidance/review" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#075a58]">Review your profile<ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div></section>

      {primaryEntry ? <article className="mt-3 rounded-xl border border-[#e6e8e2] bg-white p-4 shadow-[0_4px_18px_-18px_rgba(40,69,60,.5)]"><div className="flex items-start gap-3"><span aria-hidden className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[#dff4eb] text-[#075a58]"><DirectionIcon slug={primaryEntry.field.slug} className="h-9 w-9" /></span><div className="min-w-0 flex-1"><h2 className="font-sans text-[1.2rem] font-bold leading-tight text-[#103a37]">{primaryEntry.field.name}</h2><span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e4f5ed] px-3 py-1 text-sm text-[#286b61]">{primaryEntry.current ? <span aria-hidden className="h-3 w-3 rounded-full bg-[#218a48]" /> : <Bookmark aria-hidden className="h-4 w-4 fill-[#1c6b53] text-[#1c6b53]" />}{primaryEntry.current ? "In progress" : "Saved"}</span><p className="mt-2 text-sm leading-snug text-[#6c7688]">Pick up where you left off, or switch whenever you like.</p></div><Link href="/guidance/explorations" aria-label={`View My Explorations for ${primaryEntry.field.name}`} className="grid h-9 w-8 shrink-0 place-items-center rounded-md text-lg font-bold text-[#657383] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">⋮</Link></div><Link href={resumeHref} className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[#1c684f] px-4 text-center font-sans text-base font-semibold text-white transition hover:bg-[#15573f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Continue exploring {primaryEntry.field.name}<ArrowRight aria-hidden className="h-5 w-5" /></Link></article> : <article className="mt-3 rounded-xl border border-[#e6e8e2] bg-white p-4"><h2 className="font-sans text-[1.2rem] font-bold text-[#103a37]">Explore possibilities</h2><p className="mt-2 text-sm text-[#6c7688]">Choose a direction to begin. You can look at more than one.</p><Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#1c684f] px-4 text-center font-semibold text-white">See possibilities<ArrowRight aria-hidden className="h-5 w-5" /></Link></article>}

      <Link href="/guidance/possibilities" className="mt-3 flex min-h-[64px] items-center justify-between gap-3 rounded-xl bg-[#eaf8f3] px-4 font-sans text-base font-semibold text-[#103a37] transition hover:bg-[#e0f3eb]"><span className="inline-flex items-center gap-3"><Plus aria-hidden className="h-9 w-9 rounded-full border-2 border-[#126b5b] p-1.5" />Explore another possibility</span><ArrowRight aria-hidden className="h-6 w-6 shrink-0" /></Link>
      <Link href="/guidance/explorations" className="mt-3 flex min-h-[62px] items-center justify-between gap-3 rounded-xl border border-[#e6e8e2] bg-white px-4 font-sans text-base font-semibold text-[#103a37] transition hover:bg-[#f8faf8]"><span className="inline-flex items-center gap-3"><BookOpen aria-hidden className="h-10 w-10 rounded-full bg-[#f1ebff] p-2 text-[#6750a4]" />My Explorations</span><ArrowRight aria-hidden className="h-6 w-6 shrink-0 text-[#6c7688]" /></Link>
      <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#f2efff] px-4 py-4 text-[#31265f]"><Info aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-[#6750a4]" /><p className="text-sm leading-relaxed"><span className="font-semibold">You’re in control:</span><br />your profile and saved directions can be revisited.</p></div>
    </section>

    <section className="mx-auto hidden max-w-[1380px] lg:block">
    <header className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-[800px]"><h1 className="font-serif text-[clamp(2.3rem,4vw,3.6rem)] leading-[1.03] tracking-[-.045em] text-[#102c43]">Welcome back.</h1><p className="mt-2 font-serif text-[1.15rem] leading-[1.4] text-[#4d5d55]">Your guidance space keeps your profile, saved explorations, and next checks together.</p></div><div className="flex flex-wrap items-center gap-3"><span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e8f2ec] px-4 text-sm text-[#355e53]"><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#176b62]"><UsersRound className="h-4 w-4" /></span>Profile confirmed</span><Link href="/guidance/possibilities" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#075a58] px-5 text-sm font-semibold text-white transition hover:bg-[#064a49]"><ArrowLeftRight aria-hidden className="h-4 w-4" />Switch exploration</Link></div></header>

    <div className="mt-5 grid items-start gap-4 xl:grid-cols-[1.2fr_.9fr]">
      <section aria-labelledby="continue-heading" className="relative min-h-[292px] overflow-hidden rounded-xl border border-[#dbe8dd] bg-[#f0f6f1] p-5 sm:p-6"><h2 id="continue-heading" className="font-serif text-[1.55rem] leading-tight text-[#173344]">Continue where you left off</h2>{primaryEntry ? <div className="mt-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,.8fr)] md:items-center"><div className="relative z-10"><div className="flex items-center gap-4"><span aria-hidden className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[#dcebe3] text-[#145c57]"><DirectionIcon slug={primaryEntry.field.slug} className="h-9 w-9" /></span><div className="min-w-0"><h3 className="font-serif text-[1.65rem] leading-tight text-[#173344]">{primaryEntry.field.name}</h3><span className={`mt-1.5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${primaryEntry.current ? "bg-[#dff1e4] text-[#27713d]" : "bg-[#fff0cb] text-[#806315]"}`}><span aria-hidden className={`h-2 w-2 rounded-full ${primaryEntry.current ? "bg-[#218a48]" : "bg-[#c28b16]"}`} />{primaryEntry.current ? "Active exploration" : "Saved exploration"}</span></div></div><div className="mt-4 border-t border-[#dce6de] pt-3"><p className="flex items-center gap-2 font-serif text-[1rem] text-[#496059]"><Clock3 aria-hidden className="h-4 w-4 text-[#176b62]" />Last opened</p><p className="mt-1 pl-6 font-serif text-[1rem] text-[#263b37]">{lastLocation ?? "Direction overview"}</p><p className="mt-1 pl-6 text-xs text-[#778078]">Activity: <time dateTime={lastActivity ?? undefined}>{activityLabel(lastActivity)}</time></p></div><Link href={resumeHref} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#075a58] px-5 font-serif text-[1.05rem] font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#064a49] sm:w-auto">Resume {primaryEntry.field.name}<ArrowRight aria-hidden className="h-4 w-4" /></Link></div><div aria-hidden className="relative hidden h-[190px] overflow-hidden md:block"><span className="absolute -bottom-12 left-0 h-40 w-[120%] rotate-[-9deg] rounded-[55%] bg-[#d1e4d8]" /><span className="absolute -bottom-16 left-12 h-40 w-[110%] rotate-[8deg] rounded-[55%] bg-[#bcd8cb]" /><span className="absolute bottom-7 left-5 h-20 w-[95%] rotate-[-4deg] rounded-[55%] bg-[#a8cdbd]" /><span className="absolute bottom-6 right-8 text-[#3d8b75]"><Sprout className="h-14 w-14" /></span><span className="absolute bottom-0 left-1/3 text-[#317a68]"><Sprout className="h-12 w-12" /></span></div></div> : <div className="mt-6 max-w-xl"><p className="text-sm leading-relaxed text-[#66736b]">There is no direction to resume yet. Choose a possibility to begin exploring.</p><Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#075a58] px-5 text-sm font-semibold text-white">Explore possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}</section>

      <section aria-labelledby="next-checks-heading" className="rounded-xl border border-[#e2e5df] bg-[#fffefa] p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h2 id="next-checks-heading" className="font-serif text-[1.55rem] leading-tight text-[#173344]">Next checks</h2><Link href="/guidance/action-plan" className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">View all<ArrowRight aria-hidden className="h-4 w-4" /></Link></div><p className="mt-1 text-sm leading-relaxed text-[#69756d]">A few things to check before you decide what to do next.</p>{openChecks.length ? <ol className="mt-3 divide-y divide-[#e9ebe5] rounded-lg border border-[#eceee8]">{openChecks.map(({ plan, item }, index) => <li key={item.id} className="grid grid-cols-[30px_38px_minmax(0,1fr)] items-center gap-2 px-3 py-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7f2ec] text-xs font-semibold text-[#286b61]">{index + 1}</span><span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-[#e7f2ec] text-[#176b62]"><ClipboardList className="h-4 w-4" /></span><div className="min-w-0"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-serif text-sm leading-tight text-[#263b37]">{item.label}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] ${statusClass("todo")}`}>To check</span></div><p className="mt-1 truncate text-xs text-[#7a827c]">{plan.title}</p><Link href={planHref(plan)} className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">Open checklist<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></div></li>)}</ol> : hasSavedChecks ? <div className="mt-4 rounded-lg bg-[#f1f7f1] px-4 py-5"><p className="flex items-center gap-2 text-sm font-medium text-[#3a6b50]"><Check aria-hidden className="h-4 w-4" />Your saved checks are marked checked.</p><Link href="/guidance/action-plan" className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">Review your checklist<ArrowRight aria-hidden className="h-4 w-4" /></Link><span className="sr-only">{checkedCount} checked items.</span></div> : <div className="mt-4 rounded-lg bg-[#f7f8f4] px-4 py-5"><p className="text-sm text-[#66736b]">No next checks have been saved yet.</p><Link href={user ? "/guidance/action-plan" : "/sign-in?next=%2Fguidance%2Faction-plan"} className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">{user ? "Open your action plan" : "Sign in to save next checks"}<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}</section>
    </div>

    <div className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(310px,.75fr)]"><div className="space-y-3"><section aria-labelledby="explorations-heading" className="rounded-xl border border-[#e2e5df] bg-[#fffefa] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="explorations-heading" className="font-serif text-[1.55rem] text-[#173344]">Your explorations</h2><p className="mt-1 text-sm text-[#69756d]">Your saved explorations, each keeping its own notes and progress.</p></div><Link href="/guidance/explorations" className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">History<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>{visibleExplorations.length ? <div className="mt-3 grid gap-3 md:grid-cols-2">{visibleExplorations.map((entry) => <ExplorationCard key={entry.field.slug} entry={entry} />)}</div> : <div className="mt-3 rounded-lg bg-[#f7f8f4] px-4 py-5"><p className="text-sm text-[#66736b]">Your explorations will appear here as you choose directions to revisit.</p><Link href="/guidance/possibilities" className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">Explore possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}</section><section className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e2e5df] bg-[#fffefa] px-5 py-4"><div className="flex items-center gap-3"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><CompassIcon /></span><div><h2 className="font-serif text-lg text-[#173344]">Explore another possibility</h2><p className="text-sm text-[#69756d]">You can look at a different interest area at any time.</p></div></div><Link href="/guidance/possibilities" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61] transition hover:bg-[#f1f7f3]">Explore<ArrowRight aria-hidden className="h-4 w-4" /></Link></section></div>

      <section aria-labelledby="profile-reminder-heading" className="rounded-xl border border-[#e2e5df] bg-[#fffefa] p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div><h2 id="profile-reminder-heading" className="font-serif text-[1.55rem] text-[#173344]">Your profile</h2><p className="mt-1 text-sm leading-relaxed text-[#69756d]">This is the information we use to suggest relevant options.</p></div><Link href="/guidance/review" className="shrink-0 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">Review later</Link></div><dl className="mt-4 space-y-3"> <div className="flex items-center gap-3"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f2ec] text-[#176b62]"><GraduationCap className="h-4 w-4" /></span><div><dt className="font-serif text-sm text-[#263b37]">Study stage</dt><dd className="m-0 text-xs text-[#727c75]">{stage}{stageDetail ? ` · ${stageDetail}` : ""}</dd></div></div>{interestLabels.length ? <div className="flex items-center gap-3"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f2ec] text-[#176b62]"><Monitor className="h-4 w-4" /></span><div><dt className="font-serif text-sm text-[#263b37]">Interests</dt><dd className="m-0 text-xs text-[#727c75]">{interestLabels.join(" · ")}</dd></div></div> : null}{preference ? <div className="flex items-center gap-3"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f2ec] text-[#176b62]"><Sprout className="h-4 w-4" /></span><div><dt className="font-serif text-sm text-[#263b37]">Preference</dt><dd className="m-0 text-xs text-[#727c75]">{preference}</dd></div></div> : null}</dl><Link href="/guidance/review" className="mt-5 flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61] transition hover:bg-[#f1f7f3]">Review profile<ArrowRight aria-hidden className="h-4 w-4" /></Link></section>
    </div>

    <div className="relative mt-4 flex min-h-[58px] items-center gap-3 overflow-hidden rounded-lg bg-[#e3efeb] px-5 py-3"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d1e6dc] text-[#176b62]"><Sprout className="h-5 w-5" /></span><p className="relative z-10 font-serif text-[1rem] text-[#344b43]">You can change direction without losing your saved work.</p><span aria-hidden className="absolute -bottom-8 right-10 h-16 w-64 rounded-[55%] bg-[#c8ddd2]" /><span aria-hidden className="absolute bottom-0 right-1/3 h-10 w-28 rounded-t-full border-4 border-[#9ebfb2] border-b-0 opacity-60" /></div>
  </section></main>;
}

function CompassIcon() {
  return <RouteIcon aria-hidden className="h-5 w-5" />;
}
