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
const stageDetails: Record<string, string> = { studying: "currently studying", completed: "course completed", awaiting_results: "waiting for results", deciding: "taking some time to decide what comes next" };
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
    <div className="relative z-10 flex items-start gap-3"><span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/85 text-[#145c57]"><DirectionIcon slug={entry.field.slug} className="h-6 w-6" /></span><div className="min-w-0"><h3 className="font-serif text-lg leading-tight text-[var(--cb-ink-strong)]">{entry.field.name}</h3><span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[14px] font-medium ${badgeClass}`}><span aria-hidden className={`h-1.5 w-1.5 rounded-full ${entry.current ? "bg-[#218a48]" : "bg-[#c28b16]"}`} />{status}</span><p className="mt-1.5 max-w-[290px] text-sm leading-snug text-[var(--cb-ink)]">{entry.savedSummary}</p><Link href={safeResumeHref(entry.field.slug, entry.record)} className="mt-3 inline-flex min-h-9 min-w-[150px] items-center justify-center gap-2 rounded-lg bg-[var(--cb-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cb-primary-hover)]">Resume<ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div>
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

  return <main className="min-h-[calc(100dvh-62px)] bg-[var(--cb-canvas)] px-5 pb-8 pt-5 text-[var(--cb-ink-strong)] sm:px-8 lg:px-12">
    <section className="mx-auto max-w-[700px] lg:hidden">
      <header><p className="text-sm font-medium text-[var(--cb-ink)]">My Guidance</p><h1 className="mt-2 font-sans text-[clamp(2.25rem,8vw,3rem)] font-bold leading-[1.05] tracking-[-.04em] text-[var(--cb-ink-strong)]">Your next steps</h1><p className="mt-2 font-sans text-[1.2rem] leading-snug text-[var(--cb-muted)]">A place to explore possibilities at your own pace.</p><p className="mt-3 font-sans text-[1rem] leading-[1.4] text-[var(--cb-muted)]">You can explore more than one direction and come back whenever you’re ready.</p></header>

      <section className="mt-5 rounded-xl border border-[#e1eae6] bg-[var(--cb-surface-soft)] px-4 py-4 shadow-[0_4px_16px_-16px_rgba(40,69,60,.45)]" aria-labelledby="mobile-starting-point-title"><div className="flex items-start gap-3"><span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#dff4eb] text-[var(--cb-primary)]"><UserRound className="h-9 w-9" strokeWidth={1.7} /></span><div className="min-w-0 flex-1"><h2 id="mobile-starting-point-title" className="font-sans text-[1.2rem] font-semibold leading-tight text-[var(--cb-ink-strong)]">Your starting point</h2>{mobileSignals.length ? <ul className="mt-2 space-y-2">{mobileSignals.map((signal, index) => <li key={signal} className="flex items-center gap-2.5 text-sm leading-snug text-[var(--cb-muted)]"><span aria-hidden className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${index ? "bg-[#f1ebff] text-[#6750a4]" : "bg-[#e7f4eb] text-[#477a57]"}`}>{index ? <BookOpen className="h-4 w-4" /> : <Sprout className="h-4 w-4" />}</span>{signal}</li>)}</ul> : <p className="mt-2 text-sm leading-snug text-[var(--cb-muted)]">Your starting point can change as you explore.</p>}<Link href="/guidance/review" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[var(--cb-primary)]">Review your profile<ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div></section>

      {primaryEntry ? <article className="mt-3 rounded-xl border border-[var(--cb-line)] bg-white p-4 shadow-[0_4px_18px_-18px_rgba(40,69,60,.5)]"><div className="flex items-start gap-3"><span aria-hidden className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-full bg-[#dff4eb] text-[var(--cb-primary)]"><DirectionIcon slug={primaryEntry.field.slug} className="h-9 w-9" /></span><div className="min-w-0 flex-1"><h2 className="font-sans text-[1.2rem] font-bold leading-tight text-[var(--cb-ink-strong)]">{primaryEntry.field.name}</h2><span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e4f5ed] px-3 py-1 text-sm text-[var(--cb-primary)]">{primaryEntry.current ? <span aria-hidden className="h-3 w-3 rounded-full bg-[#218a48]" /> : <Bookmark aria-hidden className="h-4 w-4 fill-[#1c6b53] text-[#1c6b53]" />}{primaryEntry.current ? "In progress" : "Saved"}</span><p className="mt-2 text-sm leading-snug text-[var(--cb-muted)]">Pick up where you left off, or switch whenever you like.</p></div><Link href="/guidance/explorations" aria-label={`View My Explorations for ${primaryEntry.field.name}`} className="grid h-9 w-8 shrink-0 place-items-center rounded-md text-lg font-bold text-[#657383] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">⋮</Link></div><Link href={resumeHref} className="mt-4 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--cb-primary)] px-4 text-center font-sans text-base font-semibold text-white transition hover:bg-[#15573f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Continue exploring {primaryEntry.field.name}<ArrowRight aria-hidden className="h-5 w-5" /></Link></article> : <article className="mt-3 rounded-xl border border-[var(--cb-line)] bg-white p-4"><h2 className="font-sans text-[1.2rem] font-bold text-[var(--cb-ink-strong)]">Explore possibilities</h2><p className="mt-2 text-sm text-[var(--cb-muted)]">Choose a direction to begin. You can look at more than one.</p><Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--cb-primary)] px-4 text-center font-semibold text-white">See possibilities<ArrowRight aria-hidden className="h-5 w-5" /></Link></article>}

      <Link href="/guidance/possibilities" className="mt-3 flex min-h-[64px] items-center justify-between gap-3 rounded-xl bg-[#eaf8f3] px-4 font-sans text-base font-semibold text-[var(--cb-ink-strong)] transition hover:bg-[#e0f3eb]"><span className="inline-flex items-center gap-3"><Plus aria-hidden className="h-9 w-9 rounded-full border-2 border-[#126b5b] p-1.5" />Explore another possibility</span><ArrowRight aria-hidden className="h-6 w-6 shrink-0" /></Link>
      <Link href="/guidance/explorations" className="mt-3 flex min-h-[62px] items-center justify-between gap-3 rounded-xl border border-[var(--cb-line)] bg-white px-4 font-sans text-base font-semibold text-[var(--cb-ink-strong)] transition hover:bg-[var(--cb-surface-soft)]"><span className="inline-flex items-center gap-3"><BookOpen aria-hidden className="h-10 w-10 rounded-full bg-[#f1ebff] p-2 text-[#6750a4]" />My Explorations</span><ArrowRight aria-hidden className="h-6 w-6 shrink-0 text-[var(--cb-muted)]" /></Link>
      <div className="mt-3 flex items-start gap-3 rounded-xl bg-[#f2efff] px-4 py-4 text-[#31265f]"><Info aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-[#6750a4]" /><p className="text-sm leading-relaxed"><span className="font-semibold">You’re in control:</span><br />your profile and saved directions can be revisited.</p></div>
    </section>

    <section className="mx-auto hidden max-w-[1380px] lg:block">
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--cb-line)] pb-6">
        <div className="max-w-[760px]">
          <p className="text-sm font-semibold uppercase tracking-[.12em] text-[var(--cb-primary)]">My Guidance</p>
          <h1 className="mt-2 font-serif text-[clamp(2.6rem,4.4vw,4.2rem)] leading-[1.02] tracking-[-.05em] text-[var(--cb-ink-strong)]">Pick up where you left off.</h1>
          <p className="mt-3 max-w-[62ch] text-[1.05rem] leading-relaxed text-[var(--cb-muted)]">Your profile is a starting point. Continue an exploration, review your notes, or look at a different possibility whenever you’re ready.</p>
        </div>
        <Link href="/guidance/possibilities" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--cb-line-strong)] bg-[var(--cb-surface)] px-4 text-[15px] font-semibold text-[var(--cb-primary)] transition hover:bg-[var(--cb-surface-soft)]"><ArrowLeftRight aria-hidden className="h-4 w-4" />Switch exploration</Link>
      </header>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,.75fr)]">
        <section aria-labelledby="continue-heading" className="relative overflow-hidden border-l-4 border-[var(--cb-secondary-soft)] bg-[var(--cb-surface)] px-6 py-6 shadow-[0_14px_45px_-38px_rgba(23,43,58,.45)] sm:px-8 sm:py-8">
          <p className="text-sm font-semibold uppercase tracking-[.12em] text-[var(--cb-muted)]">{primaryEntry ? (primaryEntry.current ? "Active exploration" : "Saved exploration") : "Start exploring"}</p>
          <h2 id="continue-heading" className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.7rem)] leading-tight tracking-[-.035em] text-[var(--cb-ink-strong)]">{primaryEntry ? primaryEntry.field.name : "Find a direction that interests you"}</h2>
          {primaryEntry ? <>
            <p className="mt-3 max-w-[60ch] text-[1.05rem] leading-relaxed text-[var(--cb-ink)]">{primaryEntry.field.tagline || "Explore what this direction involves and see whether it feels worth learning more about."}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[var(--cb-line)] pt-4 text-[15px]">
              <div><span className="block text-sm text-[var(--cb-muted)]">Last opened</span><span className="mt-1 block font-medium text-[var(--cb-ink-strong)]">{lastLocation ?? "Direction overview"}</span></div>
              <div><span className="block text-sm text-[var(--cb-muted)]">Activity</span><span className="mt-1 block font-medium text-[var(--cb-ink-strong)]">{activityLabel(lastActivity)}</span></div>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${primaryEntry.current ? "bg-[#e7f3eb] text-[#286443]" : "bg-[#fff3d9] text-[#775918]"}`}><span aria-hidden className={`h-2 w-2 rounded-full ${primaryEntry.current ? "bg-[#328152]" : "bg-[#b47b17]"}`} />{primaryEntry.current ? "In progress" : "Saved for later"}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href={resumeHref} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[var(--cb-primary)] px-6 text-base font-semibold text-white transition hover:bg-[var(--cb-primary-hover)]">Resume {primaryEntry.field.name}<ArrowRight aria-hidden className="h-5 w-5" /></Link>
              <Link href="/guidance/explorations" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-[var(--cb-primary)] underline decoration-[var(--cb-line-strong)] underline-offset-4 hover:text-[var(--cb-ink-strong)]">View my explorations<BookOpen aria-hidden className="h-4 w-4" /></Link>
            </div>
          </> : <>
            <p className="mt-3 max-w-[60ch] text-[1.05rem] leading-relaxed text-[var(--cb-ink)]">There’s no direction to resume yet. Start with a possibility that interests you; you can explore more than one and change direction later.</p>
            <Link href="/guidance/possibilities" className="mt-6 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[var(--cb-primary)] px-6 text-base font-semibold text-white transition hover:bg-[var(--cb-primary-hover)]">Explore possibilities<ArrowRight aria-hidden className="h-5 w-5" /></Link>
          </>}
        </section>

        <section aria-labelledby="profile-reminder-heading" className="border-t-2 border-[var(--cb-line-strong)] bg-[var(--cb-surface-soft)] px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase tracking-[.1em] text-[var(--cb-muted)]">Your context</p><h2 id="profile-reminder-heading" className="mt-2 font-serif text-[1.65rem] leading-tight text-[var(--cb-ink-strong)]">Your profile</h2><p className="mt-2 text-base leading-relaxed text-[var(--cb-ink)]">These details help frame what you explore. They are not a score or a fixed label.</p></div>
            <Link href="/guidance/review" className="shrink-0 text-[15px] font-semibold text-[var(--cb-primary)] underline decoration-[var(--cb-line-strong)] underline-offset-4">Edit</Link>
          </div>
          <dl className="mt-5 divide-y divide-[var(--cb-line)] border-y border-[var(--cb-line)]">
            <div className="py-3"><dt className="text-sm text-[var(--cb-muted)]">Study stage</dt><dd className="mt-1 text-base font-medium text-[var(--cb-ink-strong)]">{stage}{stageDetail ? ` · ${stageDetail}` : ""}</dd></div>
            {interestLabels.length ? <div className="py-3"><dt className="text-sm text-[var(--cb-muted)]">Interests</dt><dd className="mt-1 text-base font-medium text-[var(--cb-ink-strong)]">{interestLabels.join(" · ")}</dd></div> : null}
            {preference ? <div className="py-3"><dt className="text-sm text-[var(--cb-muted)]">Preference</dt><dd className="mt-1 text-base font-medium text-[var(--cb-ink-strong)]">{preference}</dd></div> : null}
          </dl>
          <Link href="/guidance/review" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-[var(--cb-primary)] underline decoration-[var(--cb-line-strong)] underline-offset-4">Review your profile<ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </section>
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
        <section aria-labelledby="explorations-heading" className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--cb-line)] pb-3"><div><p className="text-sm font-semibold uppercase tracking-[.1em] text-[var(--cb-primary)]">Keep looking around</p><h2 id="explorations-heading" className="mt-1 font-serif text-[1.9rem] text-[var(--cb-ink-strong)]">Your explorations</h2><p className="mt-1 text-base text-[var(--cb-muted)]">Each direction keeps its own notes and progress.</p></div><Link href="/guidance/explorations" className="inline-flex min-h-10 items-center gap-1 text-[15px] font-semibold text-[var(--cb-primary)] underline decoration-[var(--cb-line-strong)] underline-offset-4">View history<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
          {visibleExplorations.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{visibleExplorations.map((entry) => <ExplorationCard key={entry.field.slug} entry={entry} />)}</div> : <div className="mt-4 border-l-2 border-[var(--cb-line-strong)] bg-[var(--cb-surface)] px-5 py-5"><p className="text-base text-[var(--cb-ink)]">Your explorations will appear here as you choose directions to revisit.</p><Link href="/guidance/possibilities" className="mt-3 inline-flex min-h-10 items-center gap-2 text-[15px] font-semibold text-[var(--cb-primary)] underline underline-offset-4">Explore possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}
          <Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--cb-line-strong)] bg-[var(--cb-surface)] px-4 text-[15px] font-semibold text-[var(--cb-primary)] transition hover:bg-[var(--cb-surface-soft)]">Explore another possibility<ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </section>

        <section aria-labelledby="next-checks-heading" className="min-w-0 border-t-2 border-[var(--cb-secondary-soft)] bg-[var(--cb-surface)] px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.1em] text-[var(--cb-muted)]">Optional practical steps</p><h2 id="next-checks-heading" className="mt-1 font-serif text-[1.8rem] leading-tight text-[var(--cb-ink-strong)]">Next checks</h2><p className="mt-2 text-base leading-relaxed text-[var(--cb-ink)]">A few things to check when you’re ready—there’s no need to finish everything at once.</p></div><Link href="/guidance/action-plan" className="shrink-0 text-[15px] font-semibold text-[var(--cb-primary)] underline decoration-[var(--cb-line-strong)] underline-offset-4">All steps</Link></div>
          {openChecks.length ? <ol className="mt-4 divide-y divide-[var(--cb-line)] border-y border-[var(--cb-line)]">{openChecks.map(({ plan, item }, index) => <li key={item.id} className="flex items-start gap-4 py-4"><span className="mt-0.5 font-serif text-xl text-[var(--cb-secondary)]">0{index + 1}</span><div className="min-w-0 flex-1"><h3 className="text-base font-semibold leading-snug text-[var(--cb-ink-strong)]">{item.label}</h3><p className="mt-1 text-sm text-[var(--cb-muted)]">{plan.title}</p><Link href={planHref(plan)} className="mt-2 inline-flex min-h-9 items-center gap-1 text-[15px] font-semibold text-[var(--cb-primary)] underline decoration-[var(--cb-line-strong)] underline-offset-4">Open checklist<ArrowRight aria-hidden className="h-4 w-4" /></Link></div></li>)}</ol> : hasSavedChecks ? <div className="mt-4 border-y border-[var(--cb-line)] py-4"><p className="text-base font-medium text-[var(--cb-success)]">Your saved checks are marked checked.</p><Link href="/guidance/action-plan" className="mt-2 inline-flex min-h-9 items-center gap-2 text-[15px] font-semibold text-[var(--cb-primary)] underline underline-offset-4">Review your checklist<ArrowRight aria-hidden className="h-4 w-4" /></Link><span className="sr-only">{checkedCount} checked items.</span></div> : <div className="mt-4 border-y border-[var(--cb-line)] py-4"><p className="text-base text-[var(--cb-muted)]">No next checks have been saved yet.</p><Link href={user ? "/guidance/action-plan" : "/sign-in?next=%2Fguidance%2Faction-plan"} className="mt-2 inline-flex min-h-9 items-center gap-2 text-[15px] font-semibold text-[var(--cb-primary)] underline underline-offset-4">{user ? "Open your action plan" : "Sign in to save next checks"}<ArrowRight aria-hidden className="h-4 w-4" /></Link></div>}
        </section>
      </div>

      <p className="mt-6 border-t border-[var(--cb-line)] pt-4 text-base text-[var(--cb-muted)]">You can change direction without losing your saved work.</p>
    </section>
  </main>;
}

function CompassIcon() {
  return <RouteIcon aria-hidden className="h-5 w-5" />;
}
