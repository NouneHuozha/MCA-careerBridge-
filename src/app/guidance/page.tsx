import Link from "next/link";
import { redirect } from "next/navigation";
import {
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
  Route as RouteIcon,
  Sprout,
  UserRound,
  UsersRound,
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

  return <main className="min-h-[calc(100dvh-62px)] px-5 pb-10 pt-6 text-[#26312c] sm:px-8 sm:pt-8 lg:px-12">
    <section className="cb-home mx-auto w-full">
      <header className="cb-home-header">
        <div>
          <p className="cb-home-kicker">My Guidance · after counselling</p>
          <h1>{primaryEntry ? "Your next step is yours to choose." : "A thoughtful place to begin."}</h1>
          <p className="cb-home-intro">{primaryEntry ? "Pick up where you left off, or take a fresh look around. Your profile is a guide—not a decision." : "Explore a few possibilities, learn what fits, and take your time deciding what comes next."}</p>
        </div>
        <aside className="cb-home-header-note" aria-label="Counselling status">
          <span className="cb-home-header-note-icon" aria-hidden="true"><Check className="h-4 w-4" /></span>
          <span className="cb-home-header-note-copy"><strong>Counselling complete</strong><span>Your guidance is here when you need it.</span></span>
        </aside>
      </header>

      <section aria-label={primaryEntry ? "Current exploration" : "Start exploring"} className="cb-home-hero">
        <div className="cb-home-hero-copy">
          <p className="cb-home-kicker">{primaryEntry ? "Your current direction" : "A good place to start"}</p>
          {primaryEntry ? <>
            <h2>{primaryEntry.field.name}</h2>
            <p className="cb-home-intro">{lastLocation ? `Last time, you were exploring ${lastLocation.toLowerCase()}.` : "You can explore this direction without committing to it."} Return whenever you’re ready.</p>
            <span className="cb-home-status"><span aria-hidden className="cb-home-status-dot" />{primaryEntry.current ? "Active exploration" : "Saved exploration"}</span>
            <p className="mt-3 flex items-center gap-2 text-sm text-[#617168]"><Clock3 aria-hidden className="h-4 w-4" />Last active {activityLabel(lastActivity)}</p>
            <div className="cb-home-actions">
              <Link href={resumeHref} className="cb-home-primary">Continue exploring <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              <Link href="/guidance/possibilities" className="cb-home-secondary">Explore another possibility</Link>
            </div>
          </> : <>
            <h2>There’s no single right place to start.</h2>
            <p className="cb-home-intro">A possibility map can help you browse. You can explore more than one direction and change your mind later.</p>
            <div className="cb-home-actions">
              <Link href="/guidance/possibilities" className="cb-home-primary">Explore possibilities <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              <Link href="/guidance/review" className="cb-home-secondary">Review your profile</Link>
            </div>
          </>}
        </div>
        <div className="cb-home-art" aria-hidden="true">
          <span className="cb-home-art-disc">{primaryEntry ? <DirectionIcon slug={primaryEntry.field.slug} className="h-16 w-16" /> : <CompassIcon />}</span>
          <span className="cb-home-art-label">{primaryEntry ? "Your direction, your pace" : "Explore without pressure"}</span>
        </div>
      </section>

      <div className="cb-home-supporting">
        <section aria-labelledby="next-checks-heading" className="cb-home-card">
          <div className="cb-home-card-heading">
            <div><h2 id="next-checks-heading">A small next step</h2><p>Practical checks are here when they’re useful—not a commitment.</p></div>
            <Link href={user ? "/guidance/action-plan" : "/sign-in?next=%2Fguidance%2Faction-plan"} className="cb-home-inline-link">{user ? "View plan" : "Sign in for plan"} <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
          {openChecks.length ? <ol className="cb-home-checks">{openChecks.slice(0, 2).map(({ plan, item }, index) => <li key={item.id} className="cb-home-check">
            <span aria-hidden className="cb-home-check-number">{index + 1}</span>
            <div className="min-w-0"><p className="cb-home-check-title">{item.label}</p><p className="cb-home-check-detail">{plan.title}</p></div>
            <Link href={planHref(plan)} className="cb-home-inline-link">Open <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </li>)}</ol> : <div className="cb-home-empty">
            {hasSavedChecks ? <><p className="m-0 flex items-center gap-2 font-medium text-[#386957]"><Check aria-hidden className="h-4 w-4" />Your saved checks are marked checked.</p><span className="sr-only">{checkedCount} checked items.</span></> : <p className="m-0">No next steps saved yet. You can add a checklist when you open a direction, course, or institution.</p>}
          </div>}
        </section>

        <section aria-labelledby="profile-reminder-heading" className="cb-home-card">
          <div className="cb-home-card-heading"><div><h2 id="profile-reminder-heading">Your starting point</h2><p>Your profile can guide suggestions. It never chooses for you.</p></div><span className="cb-home-profile-icon" aria-hidden><UserRound className="h-5 w-5" /></span></div>
          <ul className="cb-home-profile-list">
            <li className="cb-home-profile-item"><span className="cb-home-profile-icon" aria-hidden><GraduationCap className="h-5 w-5" /></span><span>Study stage · {stage}</span></li>
            {mobileSignals.map((signal, index) => <li key={signal} className="cb-home-profile-item"><span className="cb-home-profile-icon" aria-hidden>{index === 0 ? <BookOpen className="h-5 w-5" /> : <Sprout className="h-5 w-5" />}</span><span>{signal}</span></li>)}
          </ul>
          <Link href="/guidance/review" className="cb-home-inline-link mt-4">Review your profile <ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </section>
      </div>

      <section aria-labelledby="explorations-heading" className="cb-home-card cb-home-explorations">
        <div className="cb-home-card-heading"><div><h2 id="explorations-heading">Your explorations</h2><p>Return to a direction you’ve opened or saved.</p></div><Link href="/guidance/explorations" className="cb-home-inline-link">See all <ArrowRight aria-hidden className="h-4 w-4" /></Link></div>
        {visibleExplorations.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{visibleExplorations.map((entry) => <ExplorationCard key={entry.field.slug} entry={entry} />)}</div> : <div className="cb-home-empty">Your directions will appear here as you explore. You can begin with <Link href="/guidance/possibilities" className="font-semibold text-[#286b61] underline underline-offset-4">a possibility</Link> whenever you’re ready.</div>}
      </section>

      <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-[#68756d]">You can explore more than one direction and change course later. Your saved work stays available as you go.</p>
    </section>
  </main>;
}

function CompassIcon() {
  return <RouteIcon aria-hidden className="h-5 w-5" />;
}
